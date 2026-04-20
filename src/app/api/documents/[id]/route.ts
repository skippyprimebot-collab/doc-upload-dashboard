import { NextResponse } from 'next/server';
import { getDocumentById, deleteDocument } from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}