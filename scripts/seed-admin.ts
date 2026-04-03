import Database from 'better-sqlite3';
import { hashSync } from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/tournament.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Import schema from the main schema file dynamically
const SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  team_partner_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS waivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL,
  waiver_text TEXT NOT NULL,
  p1_name TEXT NOT NULL,
  p1_phone TEXT NOT NULL,
  p1_signature_data TEXT NOT NULL,
  p1_signature_type TEXT NOT NULL CHECK(p1_signature_type IN ('draw', 'type')),
  p2_name TEXT,
  p2_phone TEXT,
  p2_signature_data TEXT,
  p2_signature_type TEXT CHECK(p2_signature_type IN ('draw', 'type') OR p2_signature_type IS NULL),
  guardian_name TEXT,
  guardian_relationship TEXT,
  guardian_signature_data TEXT,
  guardian_signature_type TEXT CHECK(guardian_signature_type IN ('draw', 'type') OR guardian_signature_type IS NULL),
  signed_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);
CREATE TABLE IF NOT EXISTS tournament_weeks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_number INTEGER NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Lake Santa Fe',
  notes TEXT,
  is_upcoming INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  angler1 TEXT NOT NULL,
  angler2 TEXT NOT NULL,
  total_weight REAL NOT NULL DEFAULT 0,
  num_fish INTEGER NOT NULL DEFAULT 0,
  big_bass_weight REAL,
  placement INTEGER,
  FOREIGN KEY (week_id) REFERENCES tournament_weeks(id)
);
CREATE TABLE IF NOT EXISTS week_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (week_id) REFERENCES tournament_weeks(id)
);
CREATE TABLE IF NOT EXISTS tournament_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(SCHEMA);

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

const hash = hashSync(password, 12);

try {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`Admin user created: ${username}`);
  console.log(`Password: ${password}`);
  console.log('\nChange the password in production!');
} catch (e: unknown) {
  if (e instanceof Error && e.message.includes('UNIQUE')) {
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(hash, username);
    console.log(`Admin user "${username}" password updated.`);
  } else {
    throw e;
  }
}

// Seed default settings
const defaults: Record<string, string> = {
  upcoming_date: '',
  upcoming_time: '6 PM - 9 PM',
  upcoming_location: 'Little Lake Santa Fe Boat Ramp (21B), Melrose, FL',
  upcoming_entry_fee: '$50',
  upcoming_announcement: 'Welcome to the Lake Santa Fe Friday Night Shoot Out!',
};

const insert = db.prepare('INSERT OR IGNORE INTO tournament_settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaults)) {
  insert.run(key, value);
}
console.log('Default settings seeded.');

db.close();
