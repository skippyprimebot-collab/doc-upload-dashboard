import { NextResponse } from 'next/server';
import { getDocuments } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  try {
    const documents = await getDocuments();
    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
