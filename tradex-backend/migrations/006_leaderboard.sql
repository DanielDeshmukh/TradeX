-- Migration 006: Leaderboard Tables
-- Stores user trading performance and achievements

CREATE TABLE IF NOT EXISTS user_trading_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    total_return DECIMAL(10, 2) DEFAULT 0.00,
    win_rate DECIMAL(5, 2) DEFAULT 0.00,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    portfolio_value DECIMAL(15, 2) DEFAULT 0.00,
    last_trade_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

CREATE TABLE IF NOT EXISTS weekly_rankings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    week_start DATE NOT NULL,
    weekly_return DECIMAL(10, 2) DEFAULT 0.00,
    weekly_trades INTEGER DEFAULT 0,
    rank INTEGER,
    UNIQUE(user_id, week_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_trading_stats_user_id ON user_trading_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trading_stats_win_rate ON user_trading_stats(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week ON weekly_rankings(week_start);
