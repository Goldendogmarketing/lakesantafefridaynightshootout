import { NextResponse } from 'next/server';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  const hasAuthSecret = !!process.env.AUTH_SECRET;
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  // Show first 20 chars of DB URL to verify it's set (hide the rest for security)
  const dbUrlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 30) + '...'
    : 'NOT SET';
  const postgresUrlPreview = process.env.POSTGRES_URL
    ? process.env.POSTGRES_URL.substring(0, 30) + '...'
    : 'NOT SET';

  // Try a simple DB query
  let dbStatus = 'not tested';
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '');
    if (!dbUrl) {
      dbStatus = 'NO DATABASE URL FOUND';
    } else {
      const u = new URL(dbUrl);
      u.searchParams.delete('channel_binding');
      const cleanUrl = u.toString();
      const sql = neon(cleanUrl);
      const result = await sql`SELECT 1 as test`;
      dbStatus = result[0]?.test === 1 ? 'connected OK' : 'unexpected result';
    }
  } catch (e) {
    dbStatus = `ERROR: ${String(e)}`;
  }

  return NextResponse.json({
    env: {
      DATABASE_URL: dbUrlPreview,
      POSTGRES_URL: postgresUrlPreview,
      AUTH_SECRET: hasAuthSecret,
      NEXTAUTH_SECRET: hasNextAuthSecret,
      BLOB_READ_WRITE_TOKEN: hasBlobToken,
    },
    dbStatus,
  });
}
