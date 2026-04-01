import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fallback variable for backwards compatibility if needed, but primarily auth tokens
    const user_id = session.userId.toString();
    
    const { button_label, content_id } = await req.json();

    if (!button_label || !content_id) {
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