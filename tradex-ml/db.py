"""
TradeX PostgreSQL Database Module
Local PostgreSQL connection for ML data pipeline.
"""
import os
import json
import logging
from contextlib import contextmanager
from typing import Optional, List, Dict, Any

import psycopg2
import psycopg2.extras
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger(__name__)

DB_CONFIG = {
    "host": os.getenv("PG_HOST", "localhost"),
    "port": int(os.getenv("PG_PORT", "5432")),
    "dbname": os.getenv("PG_DATABASE", "tradex"),
    "user": os.getenv("PG_USER", "postgres"),
    "password": os.getenv("PG_PASSWORD", ""),
}


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


@contextmanager
def db_cursor(cursor_factory=psycopg2.extras.RealDictCursor):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=cursor_factory) as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with open(os.path.join(os.path.dirname(__file__), "schema.sql"), "r") as f:
        schema = f.read()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(schema)
        conn.commit()
        log.info("Database schema initialized")
    finally:
        conn.close()


def upsert_candles(candles: List[Dict[str, Any]], batch_size: int = 1000) -> int:
    total = 0
    with db_cursor() as cur:
        for i in range(0, len(candles), batch_size):
            batch = candles[i:i + batch_size]
            values = [
                (c["security_id"], c["timeframe"], c["timestamp"],
                 c["open"], c["high"], c["low"], c["close"], c["volume"])
                for c in batch
            ]
            psycopg2.extras.execute_values(
                cur,
                """INSERT INTO candles (security_id, timeframe, timestamp, open, high, low, close, volume)
                   VALUES %s
                   ON CONFLICT (security_id, timeframe, timestamp)
                   DO UPDATE SET open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low,
                                close=EXCLUDED.close, volume=EXCLUDED.volume""",
                values,
                page_size=batch_size,
            )
            total += len(batch)
    return total


def count_candles(security_id: str, timeframe: str = "1min",
                  start: str = None, end: str = None) -> int:
    with db_cursor() as cur:
        query = "SELECT COUNT(*) FROM candles WHERE security_id=%s AND timeframe=%s"
        params = [security_id, timeframe]
        if start:
            query += " AND timestamp >= %s"
            params.append(start)
        if end:
            query += " AND timestamp <= %s"
            params.append(end)
        cur.execute(query, params)
        return cur.fetchone()[0]


def fetch_candles_df(security_id: str, timeframe: str = "1min",
                     start: str = None, end: str = None) -> pd.DataFrame:
    with db_cursor() as cur:
        query = "SELECT * FROM candles WHERE security_id=%s AND timeframe=%s"
        params = [security_id, timeframe]
        if start:
            query += " AND timestamp >= %s"
            params.append(start)
        if end:
            query += " AND timestamp <= %s"
            params.append(end)
        query += " ORDER BY timestamp"
        cur.execute(query, params)
        rows = cur.fetchall()
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame([dict(r) for r in rows])


def upsert_signals(signals: List[Dict[str, Any]]) -> int:
    with db_cursor() as cur:
        values = [(s["security_id"], s["signal"], s["confidence"],
                   s.get("model_version", "ppo_baseline_v1"))
                  for s in signals]
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO trading_signals (security_id, signal, confidence, model_version)
               VALUES %s""",
            values,
        )
    return len(signals)


def fetch_latest_signals(security_ids: Optional[List[str]] = None) -> List[Dict]:
    with db_cursor() as cur:
        if security_ids:
            query = """SELECT DISTINCT ON (security_id) *
                       FROM trading_signals
                       WHERE security_id = ANY(%s)
                       ORDER BY security_id, created_at DESC"""
            cur.execute(query, [security_ids])
        else:
            query = """SELECT DISTINCT ON (security_id) *
                       FROM trading_signals
                       ORDER BY security_id, created_at DESC"""
            cur.execute(query)
        return [dict(r) for r in cur.fetchall()]


def track_signal_accuracy(signal_id: str, security_id: str, signal: str,
                          confidence: float, actual_return: float) -> Dict:
    was_correct = ((signal == "buy" and actual_return > 0) or
                   (signal == "sell" and actual_return < 0) or
                   (signal == "hold" and abs(actual_return) < 0.01))
    with db_cursor() as cur:
        cur.execute(
            """INSERT INTO signal_accuracy (signal_id, security_id, signal, confidence, actual_return, was_correct)
               VALUES (%s, %s, %s, %s, %s, %s)
               RETURNING id""",
            (signal_id, security_id, signal, confidence, actual_return, was_correct),
        )
        return {"id": cur.fetchone()[0], "was_correct": was_correct}


def upsert_master_symbols(symbols: List[Dict[str, Any]]) -> int:
    with db_cursor() as cur:
        values = [(s["display_name"], s["symbol_name"], s["exchange_id"],
                   s["instrument"], s["underlying_symbol"], s["security_id"])
                  for s in symbols]
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO master_symbols (display_name, symbol_name, exchange_id, instrument, underlying_symbol, security_id)
               VALUES %s
               ON CONFLICT (security_id) DO UPDATE SET
                   display_name=EXCLUDED.display_name, symbol_name=EXCLUDED.symbol_name""",
            values,
        )
    return len(values)


def fetch_master_symbols() -> pd.DataFrame:
    with db_cursor() as cur:
        cur.execute("SELECT * FROM master_symbols ORDER BY display_name")
        rows = cur.fetchall()
    return pd.DataFrame([dict(r) for r in rows]) if rows else pd.DataFrame()
