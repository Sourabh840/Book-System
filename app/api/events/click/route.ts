import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { user_id, button_label, content_id } = await req.json();

    if (!user_id || !button_label || !content_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO click_events (user_id, button_label, content_id)
       VALUES ($1, $2, $3)`,
      [user_id, button_label, content_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}