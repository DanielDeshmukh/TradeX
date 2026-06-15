"""
TradeX Data Validator
Checks OHLCV data quality for gaps, duplicates, outliers, and integrity.
"""
import pandas as pd
import numpy as np
import json
import os
import sys
from datetime import datetime, timedelta


def load_candles_from_json(filepath: str) -> pd.DataFrame:
    """Load candles from a local JSON file."""
    with open(filepath) as f:
        raw = json.load(f)

    data = raw.get("data", {})
    if not data:
        return pd.DataFrame()

    first_field = list(data.values())[0]

    if isinstance(first_field, dict):
        records = []
        for ts in data.get("open", {}).keys():
            ts_float = float(ts)
            unit = "ms" if ts_float > 1e10 else "s"
            records.append({
                "timestamp": pd.to_datetime(ts_float, unit=unit),
                "open": float(data.get("open", {}).get(ts, 0)),
                "high": float(data.get("high", {}).get(ts, 0)),
                "low": float(data.get("low", {}).get(ts, 0)),
                "close": float(data.get("close", {}).get(ts, 0)),
                "volume": int(float(data.get("volume", {}).get(ts, 0))),
            })
        return pd.DataFrame(records)

    elif isinstance(first_field, list):
        timestamps = data.get("timestamp", [])
        return pd.DataFrame({
            "timestamp": [pd.to_datetime(float(t), unit="ms" if float(t) > 1e10 else "s") for t in timestamps],
            "open": [float(x) for x in data.get("open", [])],
            "high": [float(x) for x in data.get("high", [])],
            "low": [float(x) for x in data.get("low", [])],
            "close": [float(x) for x in data.get("close", [])],
            "volume": [int(float(x)) for x in data.get("volume", [])],
        })

    return pd.DataFrame()


def validate_candles(df: pd.DataFrame, security_id: str = "unknown") -> dict:
    """Run all validation checks on a candle DataFrame."""
    issues = []

    if df.empty:
        return {"security_id": security_id, "total_candles": 0, "issues": ["No data"]}

    # 1. Check for duplicates
    dupes = df[df.duplicated(subset=["timestamp"], keep=False)]
    if not dupes.empty:
        issues.append(f"{len(dupes)} duplicate timestamps")

    # 2. Check for zero-volume candles
    zero_vol = df[df["volume"] == 0]
    if not zero_vol.empty:
        issues.append(f"{len(zero_vol)} zero-volume candles")

    # 3. Check for gaps in timestamps (expected ~1min intervals during market hours)
    df_sorted = df.sort_values("timestamp").reset_index(drop=True)
    time_diffs = df_sorted["timestamp"].diff().dt.total_seconds()
    gaps = time_diffs[time_diffs > 120]  # More than 2 minutes gap
    if not gaps.empty:
        issues.append(f"{len(gaps)} time gaps (>2min)")

    # 4. Check for outlier price jumps (>20% in single candle)
    pct_change = df_sorted["close"].pct_change().abs()
    outliers = pct_change[pct_change > 0.20]
    if not outliers.empty:
        issues.append(f"{len(outliers)} outlier price moves (>20%)")

    # 5. Check for negative prices
    neg_prices = df[(df["open"] < 0) | (df["high"] < 0) | (df["low"] < 0) | (df["close"] < 0)]
    if not neg_prices.empty:
        issues.append(f"{len(neg_prices)} candles with negative prices")

    # 6. Check high >= low
    bad_hl = df[df["high"] < df["low"]]
    if not bad_hl.empty:
        issues.append(f"{len(bad_hl)} candles where high < low")

    # 7. Check for stale data (same close price repeated >5 times)
    stale = df["close"].rolling(5).apply(lambda x: (x == x.iloc[0]).all(), raw=False).sum()
    if stale > 0:
        issues.append(f"{int(stale)} potential stale data sequences")

    return {
        "security_id": security_id,
        "total_candles": len(df),
        "date_range": f"{df['timestamp'].min()} to {df['timestamp'].max()}",
        "issues": issues if issues else ["All checks passed"],
    }


def validate_local_data(data_dir: str = "data/data") -> list:
    """Validate all local JSON data files."""
    results = []
    if not os.path.exists(data_dir):
        print(f"Directory {data_dir} does not exist.")
        return results

    for filename in os.listdir(data_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(data_dir, filename)
            security_id = filename.split("_")[0]
            df = load_candles_from_json(filepath)
            result = validate_candles(df, security_id)
            results.append(result)
            status = "PASS" if result["issues"] == ["All checks passed"] else "WARN"
            print(f"[{status}] {security_id}: {result['total_candles']} candles — {'; '.join(result['issues'])}")

    return results


if __name__ == "__main__":
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "data/data"
    print(f"\n=== TradeX Data Validator ===\nChecking: {data_dir}\n")
    results = validate_local_data(data_dir)

    total = len(results)
    passed = sum(1 for r in results if r["issues"] == ["All checks passed"])
    print(f"\n=== SUMMARY ===\nTotal: {total} | Passed: {passed} | Issues: {total - passed}")
