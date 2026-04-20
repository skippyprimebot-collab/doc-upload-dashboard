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

    // Fetch the file from blob storage
    const response = await fetch(document.blob_url);
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch file from storage' },
        { status: 500 }
      );
    }

    const blob = await response.blob();

    // Return the file with appropriate headers for download
    return new Response(blob, {
      headers: {
        'Content-Type': document.mime_type,
        'Content-Disposition': `attachment; filename="${document.original_name}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
