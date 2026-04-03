import { neon } from '@neondatabase/serverless';
import { hashSync } from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT, phone TEXT NOT NULL,
      emergency_contact_name TEXT, emergency_contact_phone TEXT, team_partner_name TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS waivers (
      id SERIAL PRIMARY KEY, participant_id INTEGER NOT NULL REFERENCES participants(id),
      waiver_text TEXT NOT NULL,
      p1_name TEXT NOT NULL, p1_phone TEXT NOT NULL, p1_signature_data TEXT NOT NULL,
      p1_signature_type TEXT NOT NULL CHECK(p1_signature_type IN ('draw', 'type')),
      p2_name TEXT, p2_phone TEXT, p2_signature_data TEXT,
      p2_signature_type TEXT CHECK(p2_signature_type IN ('draw', 'type') OR p2_signature_type IS NULL),
      guardian_name TEXT, guardian_relationship TEXT, guardian_signature_data TEXT,
      guardian_signature_type TEXT CHECK(guardian_signature_type IN ('draw', 'type') OR guardian_signature_type IS NULL),
      signed_at TIMESTAMP NOT NULL DEFAULT NOW(), ip_address TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tournament_weeks (
      id SERIAL PRIMARY KEY, week_number INTEGER NOT NULL, date TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'Lake Santa Fe', notes TEXT,
      is_upcoming BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY, week_id INTEGER NOT NULL REFERENCES tournament_weeks(id),
      team_name TEXT NOT NULL, angler1 TEXT NOT NULL, angler2 TEXT NOT NULL,
      total_weight REAL NOT NULL DEFAULT 0, num_fish INTEGER NOT NULL DEFAULT 0,
      big_bass_weight REAL, placement INTEGER
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS week_photos (
      id SERIAL PRIMARY KEY, week_id INTEGER NOT NULL REFERENCES tournament_weeks(id),
      filename TEXT NOT NULL, caption TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tournament_settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  // Create admin user
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const hash = hashSync(password, 12);

  const existing = await sql`SELECT id FROM admin_users WHERE username = ${username}`;
  if (existing.length > 0) {
    await sql`UPDATE admin_users SET password_hash = ${hash} WHERE username = ${username}`;
    console.log(`Admin user "${username}" password updated.`);
  } else {
    await sql`INSERT INTO admin_users (username, password_hash) VALUES (${username}, ${hash})`;
    console.log(`Admin user created: ${username}`);
    console.log(`Password: ${password}`);
  }

  // Seed default settings
  const defaults: Record<string, string> = {
    upcoming_date: '',
    upcoming_time: '6 PM - 9 PM',
    upcoming_location: 'Little Lake Santa Fe Boat Ramp (21B), Melrose, FL',
    upcoming_entry_fee: '$50',
    upcoming_announcement: 'Welcome to the Lake Santa Fe Friday Night Shoot Out!',
  };

  for (const [key, value] of Object.entries(defaults)) {
    await sql`INSERT INTO tournament_settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`;
  }
  console.log('Default settings seeded.');
}

seed().catch(console.error);
