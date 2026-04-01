import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { user_id, content_id, scroll_depth } = await req.json();
    const completed = scroll_depth >= 90;

    await pool.query(
      `INSERT INTO progress_events (user_id, content_id, scroll_depth, completed)
       VALUES ($1, $2, $3, $4)`,
      [user_id, content_id, scroll_depth, completed]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}