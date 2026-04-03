import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const participants = await sql`
    SELECT p.*,
      CASE WHEN w.id IS NOT NULL THEN 1 ELSE 0 END as waiver_signed,
      w.id as waiver_id
    FROM participants p
    LEFT JOIN waivers w ON w.participant_id = p.id
    WHERE p.id = ${id}
  `;

  if (!participants[0]) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
  }

  const weekHistory = await sql`
    SELECT we.*, tw.week_number, tw.date, tw.location
    FROM week_entries we
    JOIN tournament_weeks tw ON tw.id = we.week_id
    WHERE we.participant_id = ${id}
    ORDER BY tw.date DESC
  `;

  return NextResponse.json({
    participant: participants[0],
    weekHistory,
  });
}
