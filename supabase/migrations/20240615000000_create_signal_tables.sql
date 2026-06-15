-- TradeX Signal Engine Tables
-- Migration: 20240615000000_create_signal_tables.sql

-- Trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    security_id TEXT NOT NULL,
    signal TEXT NOT NULL CHECK (signal IN ('buy', 'sell', 'hold')),
    confidence FLOAT DEFAULT 0.0,
    model_version TEXT DEFAULT 'ppo_baseline_v1',
    features_used JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_security ON trading_signals(security_id);
CREATE INDEX IF NOT EXISTS idx_signals_created ON trading_signals(created_at DESC);

ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read signals" ON trading_signals
    FOR SELECT USING (true);

CREATE POLICY "System can insert signals" ON trading_signals
    FOR INSERT WITH CHECK (true);

-- Signal accuracy tracking
CREATE TABLE IF NOT EXISTS signal_accuracy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_id UUID REFERENCES trading_signals(id),
    security_id TEXT NOT NULL,
    signal TEXT NOT NULL,
    confidence FLOAT,
    actual_return FLOAT,
    was_correct BOOLEAN,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accuracy_security ON signal_accuracy(security_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_evaluated ON signal_accuracy(evaluated_at DESC);

ALTER TABLE signal_accuracy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read accuracy" ON signal_accuracy
    FOR SELECT USING (true);

CREATE POLICY "System can insert accuracy" ON signal_accuracy
    FOR INSERT WITH CHECK (true);
