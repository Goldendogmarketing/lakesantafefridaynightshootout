import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA, DEFAULT_SETTINGS } from './schema';

const DB_PATH = process.env.DATABASE_PATH || './data/tournament.db';

function createDatabase(): Database.Database {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  // Seed default settings if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM tournament_settings').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO tournament_settings (key, value) VALUES (?, ?)');
    const seedSettings = db.transaction(() => {
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        insert.run(key, value);
      }
    });
    seedSettings();
  }

  return db;
}

// Cache the database instance to survive Next.js hot reloads
const globalForDb = globalThis as unknown as { __db?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__db) {
    globalForDb.__db = createDatabase();
  }
  return globalForDb.__db;
}
