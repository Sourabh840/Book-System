import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        ce.button_label,
        c.title as content_title,
        COUNT(*) as click_count
      FROM click_events ce
      LEFT JOIN content c ON ce.content_id = c.id
      GROUP BY ce.button_label, c.title
      ORDER BY click_count DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}