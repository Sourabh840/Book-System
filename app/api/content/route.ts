import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const chapterId = req.nextUrl.searchParams.get('chapterId');
  const contentId = req.nextUrl.searchParams.get('contentId');

  if (contentId) {
    const result = await pool.query(`SELECT * FROM content WHERE id = $1`, [contentId]);
    return NextResponse.json(result.rows[0]);
  }

  const result = await pool.query(
    `SELECT * FROM content WHERE chapter_id = $1 ORDER BY order_index`,
    [chapterId]
  );
  return NextResponse.json(result.rows);
}