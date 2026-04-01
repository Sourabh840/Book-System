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
        c.title as content_title,
        AVG(pe.scroll_depth)::INTEGER as avg_scroll_depth,
        COUNT(*) as total_visits,
        SUM(CASE WHEN pe.completed THEN 1 ELSE 0 END) as completions
      FROM progress_events pe
      LEFT JOIN content c ON pe.content_id = c.id
      WHERE pe.user_id = $1
      GROUP BY c.title
      ORDER BY avg_scroll_depth DESC
    `, [session.userId.toString()]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}