-- Migration: Create user_notification_preferences table
-- Run: psql -U postgres -d tradex -f tradex-backend/migrations/003_user_notification_preferences.sql

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    price_alerts_enabled BOOLEAN DEFAULT TRUE,
    volume_alerts_enabled BOOLEAN DEFAULT TRUE,
    signal_change_alerts_enabled BOOLEAN DEFAULT TRUE,
    price_threshold DECIMAL(5,2) DEFAULT 2.00,
    volume_threshold INTEGER DEFAULT 50,
    signal_change_threshold INTEGER DEFAULT 10,
    email_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON user_notification_preferences(user_id);

-- Insert defaults for existing demo user
INSERT INTO user_notification_preferences (user_id)
VALUES ('demo-user')
ON CONFLICT (user_id) DO NOTHING;
