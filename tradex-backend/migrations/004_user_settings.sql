-- Migration 004: User Settings Table
-- Stores user preferences for theme, notifications, currency, and profile data

CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    theme VARCHAR(50) DEFAULT 'tradex',
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    language VARCHAR(20) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    default_timeframe VARCHAR(20) DEFAULT '1D',
    chart_type VARCHAR(20) DEFAULT 'candlestick',
    show_volume BOOLEAN DEFAULT true,
    show_signals BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Profile data table for user profile information
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
