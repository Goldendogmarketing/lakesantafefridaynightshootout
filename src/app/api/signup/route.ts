import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, phone, partner_name, week_id } = body;

    if (!full_name?.trim() || !phone?.trim() || !week_id) {
      return NextResponse.json({ error: 'Name, phone, and tournament week are required' }, { status: 400 });
    }

    const sql = getDb();

    // Verify week exists
    const weeks = await sql`SELECT * FROM tournament_weeks WHERE id = ${week_id}`;
    if (!weeks[0]) {
      return NextResponse.json({ error: 'Invalid tournament week' }, { status: 400 });
    }

    // Find or create participant by phone
    const normalized = normalizePhone(phone);
    const existing = await sql`SELECT id FROM participants WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', '') = ${normalized}`;

    let participantId: number;
    if (existing[0]) {
      participantId = existing[0].id;
      // Update partner name if provided
      if (partner_name?.trim()) {
        await sql`UPDATE participants SET team_partner_name = ${partner_name.trim()} WHERE id = ${participantId}`;
      }
    } else {
      const result = await sql`
        INSERT INTO participants (full_name, phone, team_partner_name)
        VALUES (${full_name.trim()}, ${phone.trim()}, ${partner_name?.trim() || null})
        RETURNING id
      `;
      participantId = result[0].id;
    }

    // Check for existing entry
    const existingEntry = await sql`SELECT id FROM week_entries WHERE participant_id = ${participantId} AND week_id = ${week_id}`;
    if (existingEntry[0]) {
      return NextResponse.json({ error: 'You are already signed up for this week!' }, { status: 409 });
    }

    // Create entry
    const entry = await sql`
      INSERT INTO week_entries (participant_id, week_id, paid, signup_source)
      VALUES (${participantId}, ${week_id}, false, 'online')
      RETURNING id
    `;

    // Check waiver status
    const waiver = await sql`SELECT id FROM waivers WHERE participant_id = ${participantId}`;

    return NextResponse.json({
      success: true,
      participantId,
      entryId: entry[0].id,
      hasWaiver: waiver.length > 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
