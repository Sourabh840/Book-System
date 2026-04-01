import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await pool.query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [session.userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get activity stats
    const clicksResult = await pool.query(
      'SELECT COUNT(*) as total_clicks FROM click_events WHERE user_id = $1',
      [session.userId.toString()]
    );

    const watchResult = await pool.query(
      'SELECT COALESCE(SUM(watched_seconds), 0) as total_watch_seconds, COUNT(*) as total_sessions FROM watch_events WHERE user_id = $1',
      [session.userId.toString()]
    );

    const progressResult = await pool.query(
      'SELECT COUNT(*) as completed_count FROM progress_events WHERE user_id = $1 AND completed = true',
      [session.userId.toString()]
    );

    const recentClicks = await pool.query(
      `SELECT ce.button_label, ce.created_at, c.title as content_title 
       FROM click_events ce 
       LEFT JOIN content c ON ce.content_id = c.id 
       WHERE ce.user_id = $1 
       ORDER BY ce.created_at DESC LIMIT 10`,
      [session.userId.toString()]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        joined: user.created_at,
      },
      stats: {
        totalClicks: Number(clicksResult.rows[0].total_clicks),
        totalWatchSeconds: Number(watchResult.rows[0].total_watch_seconds),
        totalSessions: Number(watchResult.rows[0].total_sessions),
        completedLessons: Number(progressResult.rows[0].completed_count),
      },
      recentActivity: recentClicks.rows,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
