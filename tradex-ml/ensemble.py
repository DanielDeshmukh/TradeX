"""
TradeX Ensemble Model
Combines PPO and SMA crossover signals with weighted voting.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from feature_engineering import engineer_features, load_config

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

DEFAULT_WEIGHTS = {
    "ppo": 0.6,
    "sma_crossover": 0.4,
}

DEFAULT_SMA_WINDOWS = {"fast": 20, "slow": 50}


class SMAStrategy:
    def __init__(self, fast_period: int = 20, slow_period: int = 50):
        self.fast_period = fast_period
        self.slow_period = slow_period

    def generate_signals(self, df: pd.DataFrame) -> list:
        signals = []
        close = df["close"].values

        for i in range(len(close)):
            if i < self.slow_period:
                signals.append("hold")
                continue

            fast_ma = np.mean(close[i - self.fast_period : i])
            slow_ma = np.mean(close[i - self.slow_period : i])

            if fast_ma > slow_ma:
                signals.append("buy")
            elif fast_ma < slow_ma:
                signals.append("sell")
            else:
                signals.append("hold")

        return signals


class EnsembleModel:
    def __init__(self, ppo_model_path: str = None, weights: dict = None, sma_params: dict = None):
        self.weights = weights or DEFAULT_WEIGHTS
        self.ppo_model = None
        self.sma = SMAStrategy(**(sma_params or DEFAULT_SMA_WINDOWS))

        if ppo_model_path:
            try:
                from stable_baselines3 import PPO
                self.ppo_model = PPO.load(ppo_model_path)
                log.info(f"PPO model loaded from {ppo_model_path}")
            except ImportError:
                log.warning("stable-baselines3 not installed, PPO signals disabled")
            except Exception as e:
                log.error(f"Failed to load PPO model: {e}")

        self.feature_columns = None

    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        config = load_config()
        df = engineer_features(df, config=config)
        exclude = {"timestamp", "label", "risk_label"}
        self.feature_columns = [
            c for c in df.columns
            if c not in exclude and df[c].dtype in [np.float64, np.float32, np.int64]
        ]
        last_row = df.iloc[-1:]
        obs = np.array([[last_row[c].values[0] for c in self.feature_columns]], dtype=np.float32)
        return np.nan_to_num(obs, nan=0.0)

    def get_ppo_signal(self, df: pd.DataFrame) -> dict:
        if self.ppo_model is None:
            return {"signal": "hold", "confidence": 0.0}

        try:
            obs = self._prepare_features(df)
            action, confidence = self.ppo_model.predict(obs, deterministic=True)
            signal_map = {0: "buy", 1: "hold", 2: "sell"}
            return {
                "signal": signal_map[int(action)],
                "confidence": float(confidence) if confidence is not None else 0.0,
            }
        except Exception as e:
            log.error(f"PPO prediction failed: {e}")
            return {"signal": "hold", "confidence": 0.0}

    def get_sma_signal(self, df: pd.DataFrame) -> dict:
        signals = self.sma.generate_signals(df)
        last_signal = signals[-1] if signals else "hold"
        return {"signal": last_signal, "confidence": 0.5}

    def combine_signals(self, ppo: dict, sma: dict) -> dict:
        signal_scores = {"buy": 1, "hold": 0, "sell": -1}

        ppo_score = signal_scores[ppo["signal"]] * self.weights["ppo"] * ppo["confidence"]
        sma_score = signal_scores[sma["signal"]] * self.weights["sma_crossover"]

        total_score = ppo_score + sma_score

        if total_score > 0.2:
            signal = "buy"
        elif total_score < -0.2:
            signal = "sell"
        else:
            signal = "hold"

        confidence = min(abs(total_score), 1.0)

        return {
            "signal": signal,
            "confidence": confidence,
            "components": {
                "ppo": ppo,
                "sma": sma,
            },
            "scores": {
                "ppo_score": ppo_score,
                "sma_score": sma_score,
                "total_score": total_score,
            },
        }

    def predict(self, df: pd.DataFrame) -> dict:
        ppo = self.get_ppo_signal(df)
        sma = self.get_sma_signal(df)
        ensemble = self.combine_signals(ppo, sma)

        ensemble["timestamp"] = datetime.utcnow().isoformat()
        ensemble["model_version"] = "ensemble_v1"

        return ensemble

    def predict_batch(self, data_dict: dict) -> list:
        results = []
        for security_id, df in data_dict.items():
            try:
                result = self.predict(df)
                result["security_id"] = security_id
                results.append(result)
            except Exception as e:
                log.error(f"Ensemble prediction failed for {security_id}: {e}")
        return results


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="TradeX Ensemble Model")
    parser.add_argument("--ppo-model", type=str, default=None, help="Path to trained PPO model")
    parser.add_argument("--data", type=str, required=True, help="Path to OHLCV CSV")
    parser.add_argument("--output", type=str, default="signals/ensemble_latest.json")
    parser.add_argument("--ppo-weight", type=float, default=0.6)
    parser.add_argument("--sma-weight", type=float, default=0.4)
    args = parser.parse_args()

    ensemble = EnsembleModel(
        ppo_model_path=args.ppo_model,
        weights={"ppo": args.ppo_weight, "sma_crossover": args.sma_weight},
    )

    df = pd.read_csv(args.data, index_col=0).T
    col_names = df.iloc[:, 0].tolist()
    data = df.iloc[:, 1:].T
    data.columns = col_names
    for c in ["open", "high", "low", "close", "volume"]:
        if c in data.columns:
            data[c] = pd.to_numeric(data[c], errors="coerce")
    data = data.reset_index(drop=True)

    result = ensemble.predict(data)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(result, f, indent=2, default=str)

    log.info(f"Ensemble signal: {json.dumps(result, indent=2, default=str)}")
