import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const weeks = await sql`SELECT * FROM tournament_weeks ORDER BY date DESC`;
  return NextResponse.json(weeks);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { week_number, date, location, notes } = body;

  if (!week_number || !date) {
    return NextResponse.json({ error: 'Week number and date are required' }, { status: 400 });
  }

  const sql = getDb();
  const result = await sql`
    INSERT INTO tournament_weeks (week_number, date, location, notes)
    VALUES (${week_number}, ${date}, ${location || 'Lake Santa Fe'}, ${notes || null})
    RETURNING id
  `;

  return NextResponse.json({ id: result[0].id }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, week_number, date, location, notes, is_upcoming } = body;

  if (!id) return NextResponse.json({ error: 'Missing week ID' }, { status: 400 });

  const sql = getDb();
  await sql`
    UPDATE tournament_weeks SET week_number = ${week_number}, date = ${date},
    location = ${location}, notes = ${notes}, is_upcoming = ${is_upcoming ? true : false}
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing week ID' }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM week_photos WHERE week_id = ${body.id}`;
  await sql`DELETE FROM results WHERE week_id = ${body.id}`;
  await sql`DELETE FROM tournament_weeks WHERE id = ${body.id}`;

  return NextResponse.json({ success: true });
}
