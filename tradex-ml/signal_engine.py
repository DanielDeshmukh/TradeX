"""
TradeX Signal Engine
Generates real-time buy/sell/hold signals from trained models.
Supports Supabase storage, periodic generation, and accuracy tracking.
"""
import os
import sys
import json
import logging
import time
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from feature_engineering import engineer_features, load_config
from tradex_env import TradeXEnv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# SQL for Supabase migration
SIGNALS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    security_id TEXT NOT NULL,
    signal TEXT NOT NULL CHECK (signal IN ('buy', 'sell', 'hold')),
    confidence FLOAT DEFAULT 0.0,
    model_version TEXT DEFAULT 'ppo_baseline_v1',
    features_used JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_security ON trading_signals(security_id);
CREATE INDEX IF NOT EXISTS idx_signals_created ON trading_signals(created_at DESC);

ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read signals" ON trading_signals
    FOR SELECT USING (true);

CREATE POLICY "System can insert signals" ON trading_signals
    FOR INSERT WITH CHECK (true);
"""

SIGNAL_HISTORY_SQL = """
CREATE TABLE IF NOT EXISTS signal_accuracy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_id UUID REFERENCES trading_signals(id),
    security_id TEXT NOT NULL,
    signal TEXT NOT NULL,
    confidence FLOAT,
    actual_return FLOAT,
    was_correct BOOLEAN,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accuracy_security ON signal_accuracy(security_id);
"""


class SignalEngine:
    """Generates trading signals from a trained PPO model."""

    def __init__(self, model_path: str, config: dict = None):
        try:
            from stable_baselines3 import PPO
            self.model = PPO.load(model_path)
            log.info(f"Model loaded from {model_path}")
        except ImportError:
            raise ImportError("stable-baselines3 required: pip install stable-baselines3")

        self.config = config or load_config()
        self.feature_columns = None

    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        df = engineer_features(df, config=self.config)
        exclude = {"timestamp", "label", "risk_label"}
        self.feature_columns = [
            c for c in df.columns
            if c not in exclude and df[c].dtype in [np.float64, np.float32, np.int64]
        ]
        last_row = df.iloc[-1:]
        obs = np.array([[last_row[c].values[0] for c in self.feature_columns]], dtype=np.float32)
        return np.nan_to_num(obs, nan=0.0)

    def generate_signal(self, df: pd.DataFrame) -> dict:
        obs = self.prepare_features(df)
        action, confidence = self.model.predict(obs, deterministic=True)
        signal_map = {0: "buy", 1: "hold", 2: "sell"}
        signal = signal_map[int(action)]

        return {
            "signal": signal,
            "confidence": float(confidence) if confidence is not None else 0.0,
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "ppo_baseline_v1",
            "security_id": None,
        }

    def generate_batch_signals(self, data_dict: dict) -> list:
        signals = []
        for security_id, df in data_dict.items():
            try:
                sig = self.generate_signal(df)
                sig["security_id"] = security_id
                signals.append(sig)
            except Exception as e:
                log.error(f"Signal generation failed for {security_id}: {e}")
        return signals

    def save_to_supabase(self, signals: list, supabase_client=None) -> list:
        from db import upsert_signals
        saved = []
        for sig in signals:
            try:
                upsert_signals([sig])
                saved.append(sig)
            except Exception as e:
                log.error(f"Failed to save signal: {e}")
        return saved

    def track_accuracy(self, signal_id: str, security_id: str, signal: str,
                       confidence: float, actual_return: float,
                       supabase_client=None) -> dict:
        from db import track_signal_accuracy as db_track
        was_correct = (signal == "buy" and actual_return > 0) or \
                      (signal == "sell" and actual_return < 0) or \
                      (signal == "hold" and abs(actual_return) < 0.01)
        try:
            return db_track(signal_id, security_id, signal, confidence, actual_return)
        except Exception as e:
            log.error(f"Failed to track accuracy: {e}")
            return {"was_correct": was_correct}


class PeriodicSignalGenerator:
    """Runs signal generation on a schedule during market hours."""

    def __init__(self, engine: SignalEngine, supabase_client=None, interval_minutes: int = 5):
        self.engine = engine
        self.supabase = supabase_client
        self.interval = interval_minutes
        self.is_running = False

    def is_market_hours(self) -> bool:
        now = datetime.utcnow()
        hour = now.hour
        return 3 <= hour <= 9  # IST 9:15 to 15:30 ≈ UTC 3:45 to 9:45

    def run_once(self, data_dict: dict) -> list:
        signals = self.engine.generate_batch_signals(data_dict)
        if self.supabase:
            self.engine.save_to_supabase(signals, self.supabase)
        log.info(f"Generated {len(signals)} signals")
        return signals

    def start(self, data_dict: dict):
        self.is_running = True
        log.info(f"Starting periodic signal generation (every {self.interval}min)")
        while self.is_running:
            if self.is_market_hours():
                self.run_once(data_dict)
            else:
                log.info("Outside market hours, skipping")
            time.sleep(self.interval * 60)

    def stop(self):
        self.is_running = False
        log.info("Stopped periodic signal generation")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate TradeX Signals")
    parser.add_argument("--model", type=str, required=True, help="Path to trained model")
    parser.add_argument("--data", type=str, required=True, help="Path to OHLCV CSV")
    parser.add_argument("--output", type=str, default="signals/latest.json")
    args = parser.parse_args()

    engine = SignalEngine(args.model)

    df = pd.read_csv(args.data, index_col=0).T
    col_names = df.iloc[:, 0].tolist()
    data = df.iloc[:, 1:].T
    data.columns = col_names
    for c in ["open", "high", "low", "close", "volume"]:
        if c in data.columns:
            data[c] = pd.to_numeric(data[c], errors="coerce")
    data = data.reset_index(drop=True)

    signal = engine.generate_signal(data)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(signal, f, indent=2)

    log.info(f"Signal: {json.dumps(signal, indent=2)}")
