import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import type { WeekPhoto } from '@/types';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(request: NextRequest) {
  const weekId = request.nextUrl.searchParams.get('weekId');
  if (!weekId) return NextResponse.json({ error: 'weekId required' }, { status: 400 });

  const db = getDb();
  const photos = db.prepare('SELECT * FROM week_photos WHERE week_id = ? ORDER BY created_at ASC').all(weekId);
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

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 });
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
  }

  // Ensure upload directory exists
  const weekDir = path.join(UPLOAD_DIR, `week-${weekId}`);
  if (!existsSync(weekDir)) {
    await mkdir(weekDir, { recursive: true });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filepath = path.join(weekDir, filename);

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Save to database
  const db = getDb();
  const relativePath = `/uploads/week-${weekId}/${filename}`;
  const result = db.prepare(
    'INSERT INTO week_photos (week_id, filename, caption) VALUES (?, ?, ?)'
  ).run(weekId, relativePath, caption || null);

  return NextResponse.json({ id: result.lastInsertRowid, filename: relativePath }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing photo ID' }, { status: 400 });

  const db = getDb();
  const photo = db.prepare('SELECT * FROM week_photos WHERE id = ?').get(body.id) as WeekPhoto | undefined;
  if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

  // Delete file from disk
  const filepath = path.join(process.cwd(), 'public', photo.filename);
  try {
    await unlink(filepath);
  } catch {
    // File may already be deleted, continue
  }

  db.prepare('DELETE FROM week_photos WHERE id = ?').run(body.id);

  return NextResponse.json({ success: true });
}
