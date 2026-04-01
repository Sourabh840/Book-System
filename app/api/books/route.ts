import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in environment');
    return NextResponse.json({ error: 'Missing DATABASE_URL' }, { status: 500 });
  }

  try {
    const result = await pool.query(`SELECT * FROM books ORDER BY created_at`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET /api/books failed', error);
    return NextResponse.json(
      { error: 'Database query failed', detail: (error as Error).message || String(error) },
      { status: 500 },
    );
  }
}