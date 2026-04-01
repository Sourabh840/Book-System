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
        we.video_id,
        c.title as content_title,
        SUM(we.watched_seconds) as total_seconds,
        AVG(we.watched_seconds)::INTEGER as avg_seconds,
        COUNT(*) as session_count
      FROM watch_events we
      LEFT JOIN content c ON we.content_id = c.id
      WHERE we.user_id = $1
      GROUP BY we.video_id, c.title
      ORDER BY total_seconds DESC
    `, [session.userId.toString()]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}