import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../config/index.js';
import { SCHEMA_SQL } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: DatabaseSync | null = null;

export function getDatabase(customPath?: string): DatabaseSync {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || CONFIG.DB_PATH;
  
  // Ensure target folder exists if path is not memory
  if (dbPath !== ':memory:') {
    const parentDir = path.dirname(dbPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Set performance and integrity pragmas
  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  }

  // Load and apply schema
  db.exec(SCHEMA_SQL);

  // Seed default profile if not exists
  const checkProfile = db.prepare('SELECT id FROM profile WHERE id = 1').get();
  if (!checkProfile) {
    db.prepare(`
      INSERT INTO profile (id, name, avatar_url, language, theme, gemini_api_key, mascot_enabled, mascot_muted)
      VALUES (1, 'Hasan', '', 'bn', 'sophia', '', 1, 0)
    `).run();
  }

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
