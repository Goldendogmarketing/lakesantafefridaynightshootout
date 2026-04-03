import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const weeks = db.prepare('SELECT * FROM tournament_weeks ORDER BY date DESC').all();
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

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO tournament_weeks (week_number, date, location, notes) VALUES (?, ?, ?, ?)'
  ).run(week_number, date, location || 'Lake Santa Fe', notes || null);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, week_number, date, location, notes, is_upcoming } = body;

  if (!id) return NextResponse.json({ error: 'Missing week ID' }, { status: 400 });

  const db = getDb();
  db.prepare(
    'UPDATE tournament_weeks SET week_number = ?, date = ?, location = ?, notes = ?, is_upcoming = ? WHERE id = ?'
  ).run(week_number, date, location, notes, is_upcoming ? 1 : 0, id);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing week ID' }, { status: 400 });

  const db = getDb();
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM week_photos WHERE week_id = ?').run(body.id);
    db.prepare('DELETE FROM results WHERE week_id = ?').run(body.id);
    db.prepare('DELETE FROM tournament_weeks WHERE id = ?').run(body.id);
  });
  transaction();

  return NextResponse.json({ success: true });
}
