-- TradeX PostgreSQL Schema
-- Run: psql -U postgres -d tradex -f schema.sql

CREATE TABLE IF NOT EXISTS candles (
    id SERIAL PRIMARY KEY,
    security_id TEXT NOT NULL,
    timeframe TEXT NOT NULL DEFAULT '1min',
    timestamp TIMESTAMPTZ NOT NULL,
    open DOUBLE PRECISION,
    high DOUBLE PRECISION,
    low DOUBLE PRECISION,
    close DOUBLE PRECISION,
    volume BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (security_id, timeframe, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_candles_security ON candles(security_id);
CREATE INDEX IF NOT EXISTS idx_candles_time ON candles(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_candles_security_time ON candles(security_id, timeframe, timestamp);

CREATE TABLE IF NOT EXISTS master_symbols (
    id SERIAL PRIMARY KEY,
    display_name TEXT,
    symbol_name TEXT,
    exchange_id TEXT,
    instrument TEXT,
    underlying_symbol TEXT,
    security_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symbols_security ON master_symbols(security_id);

CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    security_id TEXT NOT NULL,
    signal TEXT NOT NULL CHECK (signal IN ('buy', 'sell', 'hold')),
    confidence DOUBLE PRECISION DEFAULT 0.0,
    model_version TEXT DEFAULT 'ppo_baseline_v1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_security ON trading_signals(security_id);
CREATE INDEX IF NOT EXISTS idx_signals_time ON trading_signals(created_at DESC);

CREATE TABLE IF NOT EXISTS signal_accuracy (
    id SERIAL PRIMARY KEY,
    signal_id INTEGER REFERENCES trading_signals(id),
    security_id TEXT NOT NULL,
    signal TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    actual_return DOUBLE PRECISION,
    was_correct BOOLEAN,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accuracy_security ON signal_accuracy(security_id);

CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    security_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    feature_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (security_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_features_security ON features(security_id);
