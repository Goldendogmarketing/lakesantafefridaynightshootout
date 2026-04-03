import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

function recalculatePlacements(weekId: number) {
  const db = getDb();
  const results = db.prepare(
    'SELECT id FROM results WHERE week_id = ? ORDER BY total_weight DESC, big_bass_weight DESC'
  ).all(weekId) as { id: number }[];

  const update = db.prepare('UPDATE results SET placement = ? WHERE id = ?');
  const transaction = db.transaction(() => {
    results.forEach((r, i) => {
      update.run(i + 1, r.id);
    });
  });
  transaction();
}

export async function GET(request: NextRequest) {
  const weekId = request.nextUrl.searchParams.get('weekId');
  const db = getDb();

  if (weekId) {
    const results = db.prepare(
      'SELECT * FROM results WHERE week_id = ? ORDER BY placement ASC, total_weight DESC'
    ).all(weekId);
    return NextResponse.json(results);
  }

  const results = db.prepare('SELECT * FROM results ORDER BY week_id DESC, placement ASC').all();
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { week_id, team_name, angler1, angler2, total_weight, num_fish, big_bass_weight } = body;

  if (!week_id || !team_name || !angler1 || !angler2) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (num_fish < 0 || num_fish > 5) {
    return NextResponse.json({ error: 'Number of fish must be between 0 and 5' }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO results (week_id, team_name, angler1, angler2, total_weight, num_fish, big_bass_weight, placement) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
  ).run(week_id, team_name, angler1, angler2, total_weight || 0, num_fish || 0, big_bass_weight || null);

  recalculatePlacements(week_id);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, week_id, team_name, angler1, angler2, total_weight, num_fish, big_bass_weight } = body;

  if (!id) return NextResponse.json({ error: 'Missing result ID' }, { status: 400 });

  const db = getDb();
  db.prepare(
    'UPDATE results SET team_name = ?, angler1 = ?, angler2 = ?, total_weight = ?, num_fish = ?, big_bass_weight = ? WHERE id = ?'
  ).run(team_name, angler1, angler2, total_weight || 0, num_fish || 0, big_bass_weight || null, id);

  // Get the week_id for this result to recalculate
  const weekId = week_id || (db.prepare('SELECT week_id FROM results WHERE id = ?').get(id) as { week_id: number })?.week_id;
  if (weekId) recalculatePlacements(weekId);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing result ID' }, { status: 400 });

  const db = getDb();
  // Get week_id before deleting
  const row = db.prepare('SELECT week_id FROM results WHERE id = ?').get(body.id) as { week_id: number } | undefined;
  db.prepare('DELETE FROM results WHERE id = ?').run(body.id);

  if (row) recalculatePlacements(row.week_id);

  return NextResponse.json({ success: true });
}
