"""
TradeX Model Training
Train a Random Forest classifier on technical features to predict buy/sell/hold signals.

Usage:
    python train_model.py                    # Train on all symbols
    python train_model.py --symbol RELIANCE  # Train on specific symbol
    python train_model.py --evaluate         # Run evaluation metrics
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
from db import get_connection, db_cursor

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


def load_features(symbol=None):
    """Load features and labels from PostgreSQL."""
    with db_cursor() as cur:
        if symbol:
            cur.execute(
                "SELECT feature_data FROM features WHERE security_id=%s ORDER BY timestamp",
                (symbol,),
            )
        else:
            cur.execute("SELECT feature_data FROM features ORDER BY security_id, timestamp")
        rows = cur.fetchall()

    if not rows:
        log.error("No features found in database")
        return None, None

    records = [r["feature_data"] if isinstance(r["feature_data"], dict) else json.loads(r["feature_data"]) for r in rows]
    df = pd.DataFrame(records)

    labels = df["label"].values
    features = df[FEATURE_COLS].values

    # Handle NaN/Inf
    features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)

    return features, labels


def train_model(features, labels, symbol="all"):
    """Train Random Forest classifier."""
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score

    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )

    log.info(f"Training set: {len(X_train)} samples")
    log.info(f"Test set: {len(X_test)} samples")
    log.info(f"Label distribution (train): {dict(zip(*np.unique(y_train, return_counts=True)))}")

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    log.info(f"\nModel Accuracy: {accuracy:.4f}")
    log.info(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

    # Feature importance
    importances = model.feature_importances_
    feature_importance = sorted(
        zip(FEATURE_COLS, importances), key=lambda x: x[1], reverse=True
    )
    log.info("Top 10 features:")
    for name, imp in feature_importance[:10]:
        log.info(f"  {name}: {imp:.4f}")

    return model, accuracy, y_test, y_pred


def save_model(model, symbol, accuracy):
    """Save trained model to disk."""
    MODEL_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"model_{symbol}_{timestamp}.pkl"
    filepath = MODEL_DIR / filename

    with open(filepath, "wb") as f:
        pickle.dump(model, f)

    # Save metadata
    meta = {
        "symbol": symbol,
        "accuracy": float(accuracy),
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "feature_cols": FEATURE_COLS,
        "trained_at": timestamp,
        "filename": filename,
    }
    meta_path = MODEL_DIR / f"model_{symbol}_{timestamp}_meta.json"
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    log.info(f"Model saved: {filepath}")
    return filepath


def evaluate(features, labels, model):
    """Evaluate model and return metrics."""
    from sklearn.metrics import classification_report, confusion_matrix

    y_pred = model.predict(features)
    accuracy = (y_pred == labels).mean()

    report = classification_report(labels, y_pred, output_dict=True)
    cm = confusion_matrix(labels, y_pred, labels=["buy", "hold", "sell"])

    return {
        "accuracy": float(accuracy),
        "report": report,
        "confusion_matrix": cm.tolist(),
    }


def main():
    parser = argparse.ArgumentParser(description="Train trading signal model")
    parser.add_argument("--symbol", help="Train on specific symbol only")
    parser.add_argument("--evaluate", action="store_true", help="Run evaluation")
    args = parser.parse_args()

    features, labels = load_features(args.symbol)
    if features is None:
        sys.exit(1)

    symbol = args.symbol or "all"
    model, accuracy, _, _ = train_model(features, labels, symbol)
    save_model(model, symbol, accuracy)

    if args.evaluate:
        metrics = evaluate(features, labels, model)
        log.info(f"\nEvaluation Metrics:")
        log.info(f"  Accuracy: {metrics['accuracy']:.4f}")
        log.info(f"  Confusion Matrix: {metrics['confusion_matrix']}")


if __name__ == "__main__":
    main()
