export const SCHEMA_SQL = `-- Hasan Life Guide Database Schema (SQLite)

-- Profile & Global Settings
CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT 'Hasan',
    avatar_url TEXT DEFAULT '',
    language TEXT NOT NULL DEFAULT 'bn', -- 'bn' | 'ar' | 'en'
    theme TEXT NOT NULL DEFAULT 'sophia', -- 'dark' | 'light' | 'sophia'
    gemini_api_key TEXT DEFAULT '',
    mascot_enabled INTEGER NOT NULL DEFAULT 1,
    mascot_muted INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Notes Table (Rich Text / Markdown)
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]', -- JSON string array
    is_pinned INTEGER NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#1E293B',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Note Audio Attachments (Voice Memos)
CREATE TABLE IF NOT EXISTS note_audio (
    id TEXT PRIMARY KEY,
    note_id TEXT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    duration_seconds REAL DEFAULT 0,
    file_size_bytes INTEGER DEFAULT 0,
    transcription TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high'
    category TEXT DEFAULT 'general',
    due_date TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily' | 'weekly'
    target_count INTEGER NOT NULL DEFAULT 1,
    color TEXT DEFAULT '#38BDF8',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Habit Logs Table
CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    completed_date TEXT NOT NULL, -- YYYY-MM-DD
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completed_date)
);

-- Expenses & Financial Health
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense', -- 'expense' | 'income'
    category TEXT NOT NULL DEFAULT 'other',
    currency TEXT NOT NULL DEFAULT 'BDT',
    date TEXT NOT NULL, -- YYYY-MM-DD
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
`;
