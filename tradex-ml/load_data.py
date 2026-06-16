"""Load CSV data into PostgreSQL."""
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

DATA_DIR = Path(__file__).parent / "data" / "data"

# Symbol ID mapping (from fetch_historical.py)
SYMBOL_MAP = {
    "14366": "RELIANCE",
    "17963": "TCS",
    "2277": "INFY",
    "3456": "HDFCBANK",
    "3499": "ICICIBANK",
}


def load_json(symbol: str):
    """Load JSON data for a symbol."""
    json_path = DATA_DIR / f"{symbol}_1min.json"
    if not json_path.exists():
        print(f"JSON not found: {json_path}")
        return []

    with open(json_path) as f:
        data = json.load(f)

    candles = []
    d = data.get("data", {})
    timestamps = d.get("timestamp", [])
    opens = d.get("open", [])
    highs = d.get("high", [])
    lows = d.get("low", [])
    closes = d.get("close", [])
    volumes = d.get("volume", [])

    name = SYMBOL_MAP.get(symbol, symbol)
    count = min(len(timestamps), len(opens), len(highs), len(lows), len(closes), len(volumes))

    for i in range(count):
        ts = timestamps[i]
        if isinstance(ts, (int, float)):
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        else:
            dt = datetime.fromisoformat(str(ts))
        candles.append({
            "security_id": name,
            "timeframe": "1min",
            "timestamp": dt.isoformat(),
            "open": float(opens[i]),
            "high": float(highs[i]),
            "low": float(lows[i]),
            "close": float(closes[i]),
            "volume": int(volumes[i]) if volumes[i] else 0,
        })
    return candles


def main():
    from db import upsert_candles, upsert_master_symbols, db_cursor

    symbols = ["14366", "17963", "2277", "3456", "3499"]

    # Insert master symbols
    masters = []
    for sid, name in SYMBOL_MAP.items():
        masters.append({
            "display_name": name,
            "symbol_name": name,
            "exchange_id": "NSE",
            "instrument": "EQ",
            "underlying_symbol": name,
            "security_id": name,
        })
    n = upsert_master_symbols(masters)
    print(f"Inserted {n} master symbols")

    # Load candle data
    total = 0
    for sid in symbols:
        name = SYMBOL_MAP[sid]
        candles = load_json(sid)
        if candles:
            n = upsert_candles(candles)
            total += n
            print(f"  {name}: {n} candles")
        else:
            print(f"  {name}: no data")

    print(f"Total: {total} candles loaded")

    # Verify
    with db_cursor() as cur:
        cur.execute("SELECT security_id, COUNT(*) as count FROM candles GROUP BY security_id")
        for row in cur.fetchall():
            print(f"  {row['security_id']}: {row['count']}")


if __name__ == "__main__":
    main()
