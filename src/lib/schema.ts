import { neon } from '@neondatabase/serverless';

export async function initializeDatabase() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      team_partner_name TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS waivers (
      id SERIAL PRIMARY KEY,
      participant_id INTEGER NOT NULL REFERENCES participants(id),
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
      signed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ip_address TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tournament_weeks (
      id SERIAL PRIMARY KEY,
      week_number INTEGER NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'Lake Santa Fe',
      notes TEXT,
      is_upcoming BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      week_id INTEGER NOT NULL REFERENCES tournament_weeks(id),
      team_name TEXT NOT NULL,
      angler1 TEXT NOT NULL,
      angler2 TEXT NOT NULL,
      total_weight REAL NOT NULL DEFAULT 0,
      num_fish INTEGER NOT NULL DEFAULT 0,
      big_bass_weight REAL,
      placement INTEGER
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS week_photos (
      id SERIAL PRIMARY KEY,
      week_id INTEGER NOT NULL REFERENCES tournament_weeks(id),
      filename TEXT NOT NULL,
      caption TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tournament_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  // Seed default settings if empty
  const count = await sql`SELECT COUNT(*) as count FROM tournament_settings`;
  if (Number(count[0].count) === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await sql`INSERT INTO tournament_settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`;
    }
  }
}

export const WAIVER_TEXT = `LIABILITY WAIVER & RELEASE
Lake Santa Fe Friday Night Shoot Out • Little Lake Santa Fe Boat Ramp (21B) • Melrose, Florida

ASSUMPTION OF RISK

By signing this waiver, I acknowledge that participation in the Lake Santa Fe Friday Night Shoot Out Bass Tournament involves inherent risks, including but not limited to:

• Drowning, capsizing, or falling overboard
• Collision with other boats, structures, or submerged objects
• Severe weather, lightning, high winds, and rough water conditions
• Equipment failure or malfunction
• Exposure to sun, heat, cold, insects, and wildlife
• Slips, falls, cuts, and other physical injuries
• Any other hazards associated with boating and fishing activities

I understand that these risks can result in serious injury, permanent disability, or death, and I voluntarily choose to participate with full knowledge of these dangers.

RELEASE & WAIVER OF LIABILITY

In consideration of being allowed to participate in the Lake Santa Fe Friday Night Shoot Out, I, on behalf of myself, my heirs, personal representatives, and assigns, hereby release, waive, discharge, and agree not to sue the following parties:

• Tournament Director Nick Foster
• All tournament officials, organizers, volunteers, and staff
• Sponsors, partners, and affiliated organizations
• The owners and operators of the boat ramp and surrounding facilities

from any and all claims, demands, losses, damages, or causes of action — including negligence — arising out of or related to my participation in this tournament, whether on the water or on land.

RULES AGREEMENT

By signing below, I confirm that:

• I have read and understand the Official Tournament Rules
• I agree to follow all tournament rules and accept all penalties for violations
• I will comply with all Florida boating laws, FWC regulations, and U.S. Coast Guard requirements
• I understand that all decisions by tournament officials are final
• I am at least 18 years of age, or my parent/guardian has signed on my behalf

MEDICAL AUTHORIZATION

I authorize tournament officials to seek emergency medical treatment on my behalf if I am unable to do so myself. I accept full financial responsibility for any medical expenses incurred.

INDEMNIFICATION

I agree to indemnify and hold harmless the Tournament Director, officials, and all released parties from any claims, losses, or expenses (including attorney fees) arising from my participation in the tournament or any breach of this agreement.

I HAVE READ THIS WAIVER, UNDERSTAND IT, AND SIGN IT VOLUNTARILY.
I understand that by signing, I am giving up legal rights and remedies.`;

export const DEFAULT_SETTINGS: Record<string, string> = {
  upcoming_date: '',
  upcoming_time: '6 PM - 9 PM',
  upcoming_location: 'Little Lake Santa Fe Boat Ramp (21B), Melrose, FL',
  upcoming_entry_fee: '$50',
  upcoming_announcement: 'Welcome to the Lake Santa Fe Friday Night Shoot Out bass fishing tournament!',
  waiver_text: WAIVER_TEXT,
};
