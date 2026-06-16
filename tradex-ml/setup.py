"""
TradeX Database Setup Script
Initialize PostgreSQL database and load data.

Usage:
    python setup.py              # Full setup (init + load + verify)
    python setup.py --init       # Initialize schema only
    python setup.py --load       # Load data only
    python setup.py --verify     # Verify data only
    python setup.py --test       # Test database connection
"""
import os
import sys
import argparse
import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger(__name__)


def test_connection():
    """Test database connection."""
    try:
        from db import get_connection
        conn = get_connection()
        conn.close()
        log.info("Database connection successful")
        return True
    except Exception as e:
        log.error(f"Database connection failed: {e}")
        log.error("Check PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD in .env")
        return False


def init_schema():
    """Initialize database schema."""
    try:
        from db import init_db
        init_db()
        log.info("Schema initialized successfully")
        return True
    except Exception as e:
        log.error(f"Schema initialization failed: {e}")
        return False


def load_data():
    """Load CSV data into database."""
    try:
        from load_data import load_all_data, get_available_symbols
        symbols = get_available_symbols()
        if not symbols:
            log.warning("No CSV files found in data/data/")
            return False
        load_all_data()
        return True
    except Exception as e:
        log.error(f"Data loading failed: {e}")
        return False


def verify_data():
    """Verify loaded data."""
    try:
        from load_data import verify_data as verify
        verify()
        return True
    except Exception as e:
        log.error(f"Verification failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="TradeX Database Setup")
    parser.add_argument("--init", action="store_true", help="Initialize schema only")
    parser.add_argument("--load", action="store_true", help="Load data only")
    parser.add_argument("--verify", action="store_true", help="Verify data only")
    parser.add_argument("--test", action="store_true", help="Test connection only")
    args = parser.parse_args()

    # Test connection first
    if not test_connection():
        sys.exit(1)

    if args.test:
        return

    if args.init:
        init_schema()
        return

    if args.load:
        load_data()
        return

    if args.verify:
        verify_data()
        return

    # Full setup
    log.info("Starting full database setup...")
    if not init_schema():
        sys.exit(1)
    if not load_data():
        sys.exit(1)
    verify_data()
    log.info("Database setup complete!")


if __name__ == "__main__":
    main()
