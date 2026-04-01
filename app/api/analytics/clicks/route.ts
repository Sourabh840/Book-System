import { NextResponse } from 'next/server';
import pool from '@/lib/db';

import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT 
        ce.button_label,
        c.title as content_title,
        COUNT(*) as click_count
      FROM click_events ce
      LEFT JOIN content c ON ce.content_id = c.id
      WHERE ce.user_id = $1
      GROUP BY ce.button_label, c.title
      ORDER BY click_count DESC
    `, [session.userId.toString()]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}