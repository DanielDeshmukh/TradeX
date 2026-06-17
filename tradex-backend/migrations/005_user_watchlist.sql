-- Migration 005: User Watchlist Table
-- Stores user's saved symbols for quick access

CREATE TABLE IF NOT EXISTS user_watchlist (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    security_id VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    symbol_name VARCHAR(100),
    exchange_id VARCHAR(20),
    instrument VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, security_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_security_id ON user_watchlist(security_id);
