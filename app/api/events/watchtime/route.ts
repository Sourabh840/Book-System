import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user_id = session.userId.toString();

    const { video_id, content_id, watched_seconds } = await req.json();

    await pool.query(
      `INSERT INTO watch_events (user_id, video_id, content_id, watched_seconds)
       VALUES ($1, $2, $3, $4)`,
      [user_id, video_id, content_id, watched_seconds]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watch time error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}