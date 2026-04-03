import { neon } from '@neondatabase/serverless';

function cleanDbUrl(url: string): string {
  const u = new URL(url);
  u.searchParams.delete('channel_binding');
  return u.toString();
}

export function getDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(cleanDbUrl(dbUrl));
}
