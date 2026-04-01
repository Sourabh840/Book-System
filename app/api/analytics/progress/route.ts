import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.title as content_title,
        AVG(pe.scroll_depth)::INTEGER as avg_scroll_depth,
        COUNT(*) as total_visits,
        SUM(CASE WHEN pe.completed THEN 1 ELSE 0 END) as completions
      FROM progress_events pe
      LEFT JOIN content c ON pe.content_id = c.id
      GROUP BY c.title
      ORDER BY avg_scroll_depth DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}