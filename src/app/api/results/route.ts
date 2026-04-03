import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

async function recalculatePlacements(weekId: number) {
  const sql = getDb();
  const results = await sql`
    SELECT id FROM results WHERE week_id = ${weekId}
    ORDER BY total_weight DESC, big_bass_weight DESC NULLS LAST
  `;
  for (let i = 0; i < results.length; i++) {
    await sql`UPDATE results SET placement = ${i + 1} WHERE id = ${results[i].id}`;
  }
}

export async function GET(request: NextRequest) {
  const weekId = request.nextUrl.searchParams.get('weekId');
  const sql = getDb();

  if (weekId) {
    const results = await sql`
      SELECT * FROM results WHERE week_id = ${weekId}
      ORDER BY placement ASC, total_weight DESC
    `;
    return NextResponse.json(results);
  }

  const results = await sql`SELECT * FROM results ORDER BY week_id DESC, placement ASC`;
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

  const sql = getDb();
  const result = await sql`
    INSERT INTO results (week_id, team_name, angler1, angler2, total_weight, num_fish, big_bass_weight, placement)
    VALUES (${week_id}, ${team_name}, ${angler1}, ${angler2}, ${total_weight || 0}, ${num_fish || 0}, ${big_bass_weight || null}, 0)
    RETURNING id
  `;

  await recalculatePlacements(week_id);

  return NextResponse.json({ id: result[0].id }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, week_id, team_name, angler1, angler2, total_weight, num_fish, big_bass_weight } = body;

  if (!id) return NextResponse.json({ error: 'Missing result ID' }, { status: 400 });

  const sql = getDb();
  await sql`
    UPDATE results SET team_name = ${team_name}, angler1 = ${angler1}, angler2 = ${angler2},
    total_weight = ${total_weight || 0}, num_fish = ${num_fish || 0}, big_bass_weight = ${big_bass_weight || null}
    WHERE id = ${id}
  `;

  const weekIdToUse = week_id || (await sql`SELECT week_id FROM results WHERE id = ${id}`)[0]?.week_id;
  if (weekIdToUse) await recalculatePlacements(weekIdToUse);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing result ID' }, { status: 400 });

  const sql = getDb();
  const row = await sql`SELECT week_id FROM results WHERE id = ${body.id}`;
  await sql`DELETE FROM results WHERE id = ${body.id}`;

  if (row[0]) await recalculatePlacements(row[0].week_id);

  return NextResponse.json({ success: true });
}
