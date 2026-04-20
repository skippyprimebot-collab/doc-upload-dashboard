import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  try {
    // Check if table exists and count documents
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'documents'
      )
    `);
    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      return NextResponse.json({
        tableExists: false,
        message: 'Documents table does not exist'
      });
    }

    const countResult = await query('SELECT COUNT(*) as count FROM documents');
    const count = parseInt(countResult.rows[0].count);

    const docsResult = await query('SELECT id, filename, original_name FROM documents LIMIT 5');

    return NextResponse.json({
      tableExists: true,
      count,
      documents: docsResult.rows
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Database check failed: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}