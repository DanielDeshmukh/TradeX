-- Migration 007: Learning System Tables
-- Stores course progress, quiz results, and certificates

CREATE TABLE IF NOT EXISTS course_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    chapter_id VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    quiz_id VARCHAR(50) NOT NULL,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    attempted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id, quiz_id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    certificate_url TEXT,
    issued_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    path_name VARCHAR(100) NOT NULL,
    courses JSONB DEFAULT '[]',
    current_course_index INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, path_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
