import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { user_id, video_id, content_id, watched_seconds } = await req.json();

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