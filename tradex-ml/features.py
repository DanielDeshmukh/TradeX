"""
TradeX Feature Engineering
Compute technical indicators from OHLCV candle data.

Indicators:
- SMA (Simple Moving Average): 10, 20, 50 periods
- EMA (Exponential Moving Average): 12, 26 periods
- RSI (Relative Strength Index): 14 periods
- MACD (Moving Average Convergence Divergence): 12/26/9
- Bollinger Bands: 20 periods, 2 std dev
- ATR (Average True Range): 14 periods
- Volume SMA: 20 periods
- Price change features: returns, log returns

Usage:
    python features.py                    # Process all symbols
    python features.py --symbol RELIANCE  # Process specific symbol
    python features.py --verify           # Verify stored features
"""
import os
import sys
import json
import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger(__name__)

sys.path.insert(0, str(Path(__file__).parent))
from db import fetch_candles_df, get_connection, db_cursor
import psycopg2.extras


def compute_sma(series, period):
    return series.rolling(window=period, min_periods=1).mean()


def compute_ema(series, period):
    return series.ewm(span=period, adjust=False).mean()


def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


def compute_macd(series, fast=12, slow=26, signal=9):
    ema_fast = compute_ema(series, fast)
    ema_slow = compute_ema(series, slow)
    macd_line = ema_fast - ema_slow
    signal_line = compute_ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_bollinger_bands(series, period=20, num_std=2):
    sma = compute_sma(series, period)
    std = series.rolling(window=period, min_periods=1).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    return upper, sma, lower


def compute_atr(high, low, close, period=14):
    tr1 = high - low
    tr2 = (high - close.shift(1)).abs()
    tr3 = (low - close.shift(1)).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    return tr.rolling(window=period, min_periods=1).mean()


def compute_features(df):
    """Compute all technical features for a single symbol DataFrame."""
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"].astype(float)

    features = pd.DataFrame(index=df.index)

    # SMA
    for p in [10, 20, 50]:
        features[f"sma_{p}"] = compute_sma(close, p)

    # EMA
    for p in [12, 26]:
        features[f"ema_{p}"] = compute_ema(close, p)

    # RSI
    features["rsi_14"] = compute_rsi(close, 14)

    # MACD
    macd_line, signal_line, histogram = compute_macd(close)
    features["macd"] = macd_line
    features["macd_signal"] = signal_line
    features["macd_histogram"] = histogram

    # Bollinger Bands
    bb_upper, bb_mid, bb_lower = compute_bollinger_bands(close)
    features["bb_upper"] = bb_upper
    features["bb_mid"] = bb_mid
    features["bb_lower"] = bb_lower
    features["bb_width"] = (bb_upper - bb_lower) / bb_mid

    # ATR
    features["atr_14"] = compute_atr(high, low, close, 14)

    # Volume SMA
    features["volume_sma_20"] = compute_sma(volume, 20)
    features["volume_ratio"] = volume / features["volume_sma_20"].replace(0, np.nan)

    # Price features
    features["return_1"] = close.pct_change(1)
    features["return_5"] = close.pct_change(5)
    features["return_10"] = close.pct_change(10)
    features["log_return_1"] = np.log(close / close.shift(1))

    # High-Low range
    features["hl_range"] = (high - low) / close

    # Close position within range
    features["close_position"] = (close - low) / (high - low).replace(0, np.nan)

    return features


def create_labels(df, forward_periods=5, threshold=0.002):
    """Create buy/sell/hold labels based on future returns."""
    future_return = df["close"].shift(-forward_periods) / df["close"] - 1
    labels = pd.Series("hold", index=df.index)
    labels[future_return > threshold] = "buy"
    labels[future_return < -threshold] = "sell"
    return labels


def store_features(security_id, df, features, labels):
    """Store computed features and labels in PostgreSQL."""
    records = []
    for i in range(len(features)):
        row = features.iloc[i]
        ts = df.iloc[i]["timestamp"]
        feature_dict = row.to_dict()
        feature_dict["label"] = labels.iloc[i]

        # Convert numpy types to Python types for JSON
        clean = {}
        for k, v in feature_dict.items():
            if isinstance(v, (np.floating, float)):
                clean[k] = float(v) if not np.isnan(v) else None
            elif isinstance(v, (np.integer, int)):
                clean[k] = int(v)
            else:
                clean[k] = v
        records.append((security_id, str(ts), json.dumps(clean)))

    with db_cursor() as cur:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO features (security_id, timestamp, feature_data)
               VALUES %s
               ON CONFLICT (security_id, timestamp)
               DO UPDATE SET feature_data = EXCLUDED.feature_data""",
            records,
            page_size=500,
        )
    return len(records)


def process_symbol(symbol, verify=False):
    """Process features for a single symbol."""
    log.info(f"Processing {symbol}...")
    df = fetch_candles_df(symbol, "1min")
    if df.empty:
        log.warning(f"No candle data for {symbol}")
        return 0

    log.info(f"  Loaded {len(df)} candles")
    features = compute_features(df)
    labels = create_labels(df)
    n = store_features(symbol, df, features, labels)
    log.info(f"  Stored {n} feature rows")
    return n


def verify_features():
    """Verify stored features."""
    with db_cursor() as cur:
        cur.execute("""
            SELECT security_id, COUNT(*) as count,
                   MIN(timestamp) as min_time, MAX(timestamp) as max_time
            FROM features
            GROUP BY security_id
            ORDER BY security_id
        """)
        rows = cur.fetchall()

        if not rows:
            log.warning("No features found in database")
            return

        log.info(f"\n{'Symbol':<12} {'Count':<10} {'Min Time':<20} {'Max Time':<20}")
        log.info("-" * 62)
        for row in rows:
            log.info(f"{row['security_id']:<12} {row['count']:<10} {row['min_time']:<20} {row['max_time']:<20}")

        cur.execute("SELECT COUNT(*) FROM features")
        total = cur.fetchone()[0]
        log.info(f"\nTotal feature rows: {total}")


def main():
    parser = argparse.ArgumentParser(description="Compute technical features")
    parser.add_argument("--symbol", help="Process specific symbol only")
    parser.add_argument("--verify", action="store_true", help="Verify stored features")
    args = parser.parse_args()

    if args.verify:
        verify_features()
        return

    symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"]
    if args.symbol:
        symbols = [args.symbol]

    total = 0
    for symbol in symbols:
        n = process_symbol(symbol)
        total += n

    log.info(f"\nTotal features stored: {total}")


if __name__ == "__main__":
    main()
