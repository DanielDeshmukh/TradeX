"""
TradeX Signal Generation
Generate trading signals using the trained model and store them in PostgreSQL.

Usage:
    python signals.py                    # Generate signals for all symbols
    python signals.py --symbol RELIANCE  # Generate for specific symbol
    python signals.py --latest           # Show latest signals
"""
import os
import sys
import json
import pickle
import argparse
import logging
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger(__name__)

sys.path.insert(0, str(Path(__file__).parent))
from db import (
    get_connection, db_cursor, fetch_candles_df,
    upsert_signals, fetch_latest_signals,
)
from features import compute_features

MODEL_DIR = Path(__file__).parent / "models"
FEATURE_COLS = [
    "sma_10", "sma_20", "sma_50",
    "ema_12", "ema_26",
    "rsi_14",
    "macd", "macd_signal", "macd_histogram",
    "bb_upper", "bb_mid", "bb_lower", "bb_width",
    "atr_14",
    "volume_sma_20", "volume_ratio",
    "return_1", "return_5", "return_10", "log_return_1",
    "hl_range", "close_position",
]


def load_latest_model(symbol="all"):
    """Load the most recently trained model."""
    if not MODEL_DIR.exists():
        log.error("No models directory found. Run train_model.py first.")
        return None

    pattern = f"model_{symbol}_*.pkl"
    model_files = sorted(MODEL_DIR.glob(pattern), key=lambda f: f.stat().st_mtime, reverse=True)

    if not model_files:
        log.error(f"No model found for symbol: {symbol}")
        return None

    model_path = model_files[0]
    log.info(f"Loading model: {model_path.name}")

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    return model


def generate_signal(model, features_row):
    """Generate a single signal from feature row."""
    X = np.nan_to_num(features_row.reshape(1, -1), nan=0.0, posinf=0.0, neginf=0.0)
    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    classes = model.classes_

    confidence = float(max(probabilities))

    return {
        "signal": prediction,
        "confidence": confidence,
        "probabilities": {cls: float(prob) for cls, prob in zip(classes, probabilities)},
    }


def generate_signals_for_symbol(symbol, model):
    """Generate signals for all candles of a symbol using batch prediction."""
    df = fetch_candles_df(symbol, "1min")
    if df.empty:
        log.warning(f"No candle data for {symbol}")
        return []

    features = compute_features(df)
    feature_values = features[FEATURE_COLS].values
    feature_values = np.nan_to_num(feature_values, nan=0.0, posinf=0.0, neginf=0.0)

    predictions = model.predict(feature_values)
    probabilities = model.predict_proba(feature_values)
    confidences = np.max(probabilities, axis=1)

    signals = []
    model_version = f"rf_{datetime.now().strftime('%Y%m%d')}"
    for i in range(len(predictions)):
        signals.append({
            "security_id": symbol,
            "signal": predictions[i],
            "confidence": float(confidences[i]),
            "model_version": model_version,
        })

    return signals


def store_signals(signals):
    """Store generated signals in PostgreSQL."""
    if not signals:
        return 0

    with db_cursor() as cur:
        values = [(s["security_id"], s["signal"], s["confidence"], s["model_version"])
                  for s in signals]
        from psycopg2.extras import execute_values
        execute_values(
            cur,
            """INSERT INTO trading_signals (security_id, signal, confidence, model_version)
               VALUES %s""",
            values,
            page_size=500,
        )
    return len(signals)


def show_latest_signals():
    """Display latest signals for all symbols."""
    signals = fetch_latest_signals()
    if not signals:
        log.info("No signals found in database")
        return

    log.info(f"\n{'Symbol':<12} {'Signal':<8} {'Confidence':<12} {'Model':<20} {'Time'}")
    log.info("-" * 72)
    for s in signals:
        log.info(
            f"{s['security_id']:<12} {s['signal']:<8} {s['confidence']:.2%}      "
            f"{s['model_version']:<20} {s['created_at']}"
        )


def main():
    parser = argparse.ArgumentParser(description="Generate trading signals")
    parser.add_argument("--symbol", help="Generate for specific symbol")
    parser.add_argument("--latest", action="store_true", help="Show latest signals")
    args = parser.parse_args()

    if args.latest:
        show_latest_signals()
        return

    model = load_latest_model("all")
    if model is None:
        sys.exit(1)

    symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"]
    if args.symbol:
        symbols = [args.symbol]

    total = 0

    # Generate and store for each symbol
    for symbol in symbols:
        log.info(f"Generating signals for {symbol}...")
        signals = generate_signals_for_symbol(symbol, model)
        if signals:
            n = store_signals(signals)
            total += n
            log.info(f"  Stored {n} signals")

    log.info(f"\nTotal signals generated: {total}")
    show_latest_signals()


if __name__ == "__main__":
    main()
