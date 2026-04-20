import { NextResponse } from 'next/server';
import { getDocumentById, deleteDocument } from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Get ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idParam = pathParts[pathParts.length - 1];
    const id = parseInt(idParam, 10);
    
    console.log('Delete request for ID:', id, 'from URL:', request.url);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document ID: ' + idParam },
        { status: 400 }
      );
    }

    const document = await getDocumentById(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found with ID: ' + id },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    await del(document.filename, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Delete from database
    await deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}