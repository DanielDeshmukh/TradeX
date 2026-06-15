"""
TradeX Signal Engine
Generates real-time buy/sell/hold signals from trained models.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from feature_engineering import add_all_features

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class SignalEngine:
    """Generates trading signals from a trained PPO model."""

    def __init__(self, model_path: str):
        try:
            from stable_baselines3 import PPO
            self.model = PPO.load(model_path)
            log.info(f"Model loaded from {model_path}")
        except ImportError:
            raise ImportError("stable-baselines3 required: pip install stable-baselines3")

        self.feature_columns = None

    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Convert raw OHLCV to feature vector."""
        df = add_all_features(df)

        exclude = {"timestamp", "label_5m", "label_15m", "label_30m"}
        self.feature_columns = [
            c for c in df.columns
            if c not in exclude and df[c].dtype in [np.float64, np.float32, np.int64]
        ]

        last_row = df.iloc[-1:]
        obs = np.array([[last_row[c].values[0] for c in self.feature_columns]], dtype=np.float32)
        return np.nan_to_num(obs, nan=0.0)

    def generate_signal(self, df: pd.DataFrame) -> dict:
        """Generate a single signal from latest data."""
        obs = self.prepare_features(df)
        action, confidence = self.model.predict(obs, deterministic=True)

        signal_map = {0: "buy", 1: "hold", 2: "sell"}
        signal = signal_map[int(action)]

        return {
            "signal": signal,
            "confidence": float(confidence) if confidence is not None else 0.0,
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "ppo_baseline_v1",
        }

    def generate_batch_signals(self, data_dict: dict) -> list:
        """Generate signals for multiple securities."""
        signals = []
        for security_id, df in data_dict.items():
            try:
                sig = self.generate_signal(df)
                sig["security_id"] = security_id
                signals.append(sig)
            except Exception as e:
                log.error(f"Signal generation failed for {security_id}: {e}")
        return signals


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate TradeX Signals")
    parser.add_argument("--model", type=str, required=True, help="Path to trained model")
    parser.add_argument("--data", type=str, required=True, help="Path to OHLCV CSV")
    parser.add_argument("--output", type=str, default="signals/latest.json")
    args = parser.parse_args()

    engine = SignalEngine(args.model)
    df = pd.read_csv(args.data)
    signal = engine.generate_signal(df)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(signal, f, indent=2)

    log.info(f"Signal: {json.dumps(signal, indent=2)}")
