# TradeX Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Python 3.8+ with pip

## Quick Start

### 1. Install PostgreSQL
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql
```

### 2. Create Database
```bash
psql -U postgres -c "CREATE DATABASE tradex;"
```

### 3. Configure Environment
```bash
cd tradex-ml
cp .env.example .env  # Or create manually
```

Edit `.env` file:
```
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=tradex
PG_USER=postgres
PG_PASSWORD=your_password_here
```

### 4. Initialize Schema
```bash
psql -U postgres -d tradex -f schema.sql
```

Or use Python:
```python
from db import init_db
init_db()
```

### 5. Load Data
```bash
# Load all 5 symbols
python load_data.py

# Load specific symbol
python load_data.py --symbol 14366

# List available symbols
python load_data.py --list

# Verify loaded data
python load_data.py --verify
```

### 6. Test Connection
```bash
python -c "from db import init_db; init_db(); print('DB OK')"
```

## Available Data
- 14366 (1min candles)
- 17963 (1min candles)
- 2277 (1min candles)
- 3456 (1min candles)
- 3499 (1min candles)

## Database Tables

### candles
- OHLCV data for all symbols
- Indexed by security_id, timeframe, timestamp
- Unique constraint on (security_id, timeframe, timestamp)

### master_symbols
- Symbol metadata (name, exchange, instrument type)
- Indexed by security_id

### trading_signals
- AI-generated buy/sell/hold signals
- Indexed by security_id, created_at

### signal_accuracy
- Signal performance tracking
- Links to trading_signals via signal_id

### features
- Computed technical indicators (JSONB)
- Indexed by security_id, timestamp

## Troubleshooting

### Connection refused
- Ensure PostgreSQL is running
- Check PG_HOST and PG_PORT in .env

### Authentication failed
- Verify PG_USER and PG_PASSWORD
- Check pg_hba.conf for local authentication

### Schema already exists
- Safe to run schema.sql multiple times (uses IF NOT EXISTS)

### Data not loading
- Check CSV files exist in data/data/
- Verify file format matches expected columns
