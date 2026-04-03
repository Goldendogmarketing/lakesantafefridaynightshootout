import { neon } from '@neondatabase/serverless';

export function getDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Remove channel_binding parameter which can cause issues with serverless driver
  const cleanUrl = dbUrl.replace(/[?&]channel_binding=[^&]*/g, '').replace(/\?&/, '?');
  const sql = neon(cleanUrl);
  return sql;
}
