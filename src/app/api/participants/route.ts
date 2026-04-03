import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();
  const participants = await sql`
    SELECT p.*,
      CASE WHEN w.id IS NOT NULL THEN 1 ELSE 0 END as waiver_signed,
      w.id as waiver_id,
      w.signed_at
    FROM participants p
    LEFT JOIN waivers w ON w.participant_id = p.id
    ORDER BY p.created_at DESC
  `;

  return NextResponse.json(participants);
}
