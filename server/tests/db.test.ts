import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../src/db/connection.js';

describe('Database Layer Verification', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    // In-memory test database
    db = getDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  test('Schema initialization creates all required tables', () => {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all() as Array<{ name: string }>;

    const tableNames = tables.map(t => t.name);
    assert.ok(tableNames.includes('profile'), 'profile table should exist');
    assert.ok(tableNames.includes('notes'), 'notes table should exist');
    assert.ok(tableNames.includes('note_audio'), 'note_audio table should exist');
    assert.ok(tableNames.includes('tasks'), 'tasks table should exist');
    assert.ok(tableNames.includes('habits'), 'habits table should exist');
    assert.ok(tableNames.includes('habit_logs'), 'habit_logs table should exist');
    assert.ok(tableNames.includes('expenses'), 'expenses table should exist');
  });

  test('Default user profile is pre-seeded with Bengali and Sophia Mode', () => {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get() as Record<string, unknown>;
    assert.ok(profile);
    assert.equal(profile.name, 'Hasan');
    assert.equal(profile.language, 'bn');
    assert.equal(profile.theme, 'sophia');
    assert.equal(profile.mascot_enabled, 1);
  });

  test('Foreign key cascade deletes audio attachment when parent note is deleted', () => {
    // Insert note
    db.prepare(`
      INSERT INTO notes (id, title, content, tags)
      VALUES (?, ?, ?, ?)
    `).run('note-1', 'Meeting Note', 'Discussion about goals', '["work"]');

    // Insert audio memo attached to note
    db.prepare(`
      INSERT INTO note_audio (id, note_id, filename, filepath, duration_seconds)
      VALUES (?, ?, ?, ?, ?)
    `).run('audio-1', 'note-1', 'memo1.webm', '/uploads/audio/memo1.webm', 14.5);

    // Verify audio exists
    const audioBefore = db.prepare('SELECT * FROM note_audio WHERE id = ?').get('audio-1');
    assert.ok(audioBefore, 'Audio record should exist');

    // Delete parent note
    db.prepare('DELETE FROM notes WHERE id = ?').run('note-1');

    // Verify audio record was automatically cascade-deleted
    const audioAfter = db.prepare('SELECT * FROM note_audio WHERE id = ?').get('audio-1');
    assert.equal(audioAfter, undefined, 'Audio attachment must be deleted on cascade');
  });

  test('Unique constraint prevents duplicate habit log on same day', () => {
    db.prepare(`
      INSERT INTO habits (id, title, frequency)
      VALUES (?, ?, ?)
    `).run('habit-1', 'Read Quran', 'daily');

    db.prepare(`
      INSERT INTO habit_logs (id, habit_id, completed_date)
      VALUES (?, ?, ?)
    `).run('log-1', 'habit-1', '2026-10-10');

    // Second insert for same date should throw UNIQUE constraint failed
    assert.throws(() => {
      db.prepare(`
        INSERT INTO habit_logs (id, habit_id, completed_date)
        VALUES (?, ?, ?)
      `).run('log-2', 'habit-1', '2026-10-10');
    }, /UNIQUE constraint failed/);
  });
});
