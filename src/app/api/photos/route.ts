import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { put, del } from '@vercel/blob';

export async function GET(request: NextRequest) {
  const weekId = request.nextUrl.searchParams.get('weekId');
  if (!weekId) return NextResponse.json({ error: 'weekId required' }, { status: 400 });

  const sql = getDb();
  const photos = await sql`SELECT * FROM week_photos WHERE week_id = ${weekId} ORDER BY created_at ASC`;
  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const weekId = formData.get('weekId') as string;
  const caption = formData.get('caption') as string || '';
  const file = formData.get('photo') as File;

  if (!weekId || !file) {
    return NextResponse.json({ error: 'weekId and photo are required' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(`week-${weekId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });

  const sql = getDb();
  const result = await sql`
    INSERT INTO week_photos (week_id, filename, caption)
    VALUES (${weekId}, ${blob.url}, ${caption || null})
    RETURNING id
  `;

  return NextResponse.json({ id: result[0].id, filename: blob.url }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing photo ID' }, { status: 400 });

  const sql = getDb();
  const photo = await sql`SELECT * FROM week_photos WHERE id = ${body.id}`;
  if (!photo[0]) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

  // Delete from Vercel Blob
  try {
    await del(photo[0].filename);
  } catch {
    // Blob may already be deleted
  }

  await sql`DELETE FROM week_photos WHERE id = ${body.id}`;

  return NextResponse.json({ success: true });
}
