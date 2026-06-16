"""
TradeX Data Loader
Load existing CSV data into PostgreSQL database.

Usage:
    python load_data.py                    # Load all symbols
    python load_data.py --symbol 14366     # Load specific symbol
    python load_data.py --verify           # Verify data after loading
"""
import os
import sys
import argparse
import logging
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data" / "data"


def get_available_symbols():
    """Get list of available symbols from CSV files."""
    symbols = []
    if DATA_DIR.exists():
        for f in DATA_DIR.glob("*_1min.csv"):
            symbol = f.stem.replace("_1min", "")
            symbols.append(symbol)
    return sorted(symbols)


def load_symbol_data(symbol: str) -> pd.DataFrame:
    """Load CSV data for a specific symbol."""
    csv_path = DATA_DIR / f"{symbol}_1min.csv"
    if not csv_path.exists():
        log.error(f"CSV file not found: {csv_path}")
        return pd.DataFrame()

    try:
        df = pd.read_csv(csv_path, index_col=0).T
        cols = df.iloc[0].tolist()
        data = df.iloc[1:].T
        data.columns = cols

        # Convert numeric columns
        for c in ["open", "high", "low", "close", "volume"]:
            data[c] = pd.to_numeric(data[c], errors="coerce")

        data = data.reset_index(drop=True)
        data["security_id"] = symbol
        data["timeframe"] = "1min"

        # Ensure timestamp column exists
        if "timestamp" not in data.columns:
            log.error(f"No timestamp column in {csv_path}")
            return pd.DataFrame()

        log.info(f"Loaded {len(data)} candles for symbol {symbol}")
        return data
    except Exception as e:
        log.error(f"Error loading {csv_path}: {e}")
        return pd.DataFrame()


def load_all_data():
    """Load all available symbol data."""
    symbols = get_available_symbols()
    if not symbols:
        log.warning("No data files found in data/data/")
        return

    log.info(f"Found {len(symbols)} symbols: {', '.join(symbols)}")

    from db import upsert_candles

    total_loaded = 0
    for symbol in symbols:
        df = load_symbol_data(symbol)
        if df.empty:
            continue

        candles = df[["security_id", "timeframe", "timestamp", "open", "high", "low", "close", "volume"]].to_dict("records")
        n = upsert_candles(candles)
        total_loaded += n
        log.info(f"  {symbol}: {n} candles inserted")

    log.info(f"Total: {total_loaded} candles loaded")


def verify_data():
    """Verify loaded data in database."""
    from db import db_cursor

    with db_cursor() as cur:
        # Count candles per symbol
        cur.execute("""
            SELECT security_id, COUNT(*) as count,
                   MIN(timestamp) as min_time,
                   MAX(timestamp) as max_time
            FROM candles
            GROUP BY security_id
            ORDER BY security_id
        """)
        rows = cur.fetchall()

        if not rows:
            log.warning("No data found in candles table")
            return

        log.info(f"\n{'Symbol':<12} {'Count':<10} {'Min Time':<20} {'Max Time':<20}")
        log.info("-" * 62)
        for row in rows:
            log.info(f"{row['security_id']:<12} {row['count']:<10} {row['min_time']:<20} {row['max_time']:<20}")

        # Total count
        cur.execute("SELECT COUNT(*) FROM candles")
        total = cur.fetchone()[0]
        log.info(f"\nTotal candles: {total}")


def main():
    parser = argparse.ArgumentParser(description="Load data into PostgreSQL")
    parser.add_argument("--symbol", help="Load specific symbol only")
    parser.add_argument("--verify", action="store_true", help="Verify data after loading")
    parser.add_argument("--list", action="store_true", help="List available symbols")
    args = parser.parse_args()

    if args.list:
        symbols = get_available_symbols()
        print(f"Available symbols: {', '.join(symbols)}")
        return

    # Test database connection first
    try:
        from db import get_connection
        conn = get_connection()
        conn.close()
        log.info("Database connection successful")
    except Exception as e:
        log.error(f"Database connection failed: {e}")
        log.error("Make sure PostgreSQL is running and PG_PASSWORD is set in .env")
        sys.exit(1)

    if args.symbol:
        df = load_symbol_data(args.symbol)
        if not df.empty:
            from db import upsert_candles
            candles = df[["security_id", "timeframe", "timestamp", "open", "high", "low", "close", "volume"]].to_dict("records")
            n = upsert_candles(candles)
            log.info(f"Loaded {n} candles for {args.symbol}")
    else:
        load_all_data()

    if args.verify:
        verify_data()


if __name__ == "__main__":
    main()
