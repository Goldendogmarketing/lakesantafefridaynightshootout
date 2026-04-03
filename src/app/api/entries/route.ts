import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const weekId = request.nextUrl.searchParams.get('weekId');
  if (!weekId) return NextResponse.json({ error: 'weekId required' }, { status: 400 });

  const sql = getDb();
  const entries = await sql`
    SELECT we.*, p.full_name, p.phone, p.team_partner_name,
      CASE WHEN w.id IS NOT NULL THEN 1 ELSE 0 END as waiver_signed
    FROM week_entries we
    JOIN participants p ON p.id = we.participant_id
    LEFT JOIN waivers w ON w.participant_id = p.id
    WHERE we.week_id = ${weekId}
    ORDER BY we.created_at ASC
  `;

  const totalBoats = entries.length;
  const totalPaid = entries.filter(e => e.paid).length;
  const totalUnpaid = totalBoats - totalPaid;
  const totalPot = entries
    .filter(e => e.paid)
    .reduce((sum, e) => sum + (Number(e.payment_amount) || 50), 0);

  return NextResponse.json({
    entries,
    stats: { totalBoats, totalPaid, totalUnpaid, totalPot },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { participant_id, week_id, boat_number, notes } = body;

  if (!participant_id || !week_id) {
    return NextResponse.json({ error: 'participant_id and week_id are required' }, { status: 400 });
  }

  const sql = getDb();
  try {
    const result = await sql`
      INSERT INTO week_entries (participant_id, week_id, boat_number, notes, signup_source)
      VALUES (${participant_id}, ${week_id}, ${boat_number || null}, ${notes || null}, 'admin')
      RETURNING id
    `;
    return NextResponse.json({ id: result[0].id }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('unique')) {
      return NextResponse.json({ error: 'This participant is already entered for this week' }, { status: 409 });
    }
    throw e;
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, paid, boat_number, payment_amount, notes } = body;

  if (!id) return NextResponse.json({ error: 'Missing entry ID' }, { status: 400 });

  const sql = getDb();

  if (paid !== undefined) {
    await sql`UPDATE week_entries SET paid = ${paid} WHERE id = ${id}`;
  }
  if (boat_number !== undefined) {
    await sql`UPDATE week_entries SET boat_number = ${boat_number} WHERE id = ${id}`;
  }
  if (payment_amount !== undefined) {
    await sql`UPDATE week_entries SET payment_amount = ${payment_amount} WHERE id = ${id}`;
  }
  if (notes !== undefined) {
    await sql`UPDATE week_entries SET notes = ${notes} WHERE id = ${id}`;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing entry ID' }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM week_entries WHERE id = ${body.id}`;

  return NextResponse.json({ success: true });
}
