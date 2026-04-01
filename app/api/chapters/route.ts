import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get('bookId');
  const result = await pool.query(
    `SELECT * FROM chapters WHERE book_id = $1 ORDER BY order_index`,
    [bookId]
  );
  return NextResponse.json(result.rows);
}