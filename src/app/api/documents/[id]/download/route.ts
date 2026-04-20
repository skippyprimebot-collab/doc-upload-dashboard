import { NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const document = await getDocumentById(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Redirect to the Blob URL for download
    return NextResponse.redirect(document.blob_url);
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download document' },
      { status: 500 }
    );
  }
}