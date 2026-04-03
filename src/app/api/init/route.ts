import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/schema';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
