import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createDocument } from '@/lib/db';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('Upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    console.log('Uploading to Vercel Blob...');
    let blob;
    try {
      blob = await put(uniqueFilename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      console.log('Blob upload successful:', blob.url);
    } catch (blobError) {
      console.error('Blob upload failed:', blobError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload to storage: ' + (blobError instanceof Error ? blobError.message : String(blobError)) },
        { status: 500 }
      );
    }

    // Save metadata to database
    console.log('Saving to database...');
    let document;
    try {
      document = await createDocument(
        uniqueFilename,
        file.name,
        file.type || 'application/octet-stream',
        file.size,
        blob.url,
        undefined
      );
      console.log('Database save successful:', document);
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      // Try to delete the blob since DB save failed
      try {
        const { del } = await import('@vercel/blob');
        await del(uniqueFilename, { token: process.env.BLOB_READ_WRITE_TOKEN });
        console.log('Rolled back blob upload');
      } catch (delError) {
        console.error('Failed to rollback blob:', delError);
      }
      return NextResponse.json(
        { success: false, error: 'Failed to save to database: ' + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Upload error details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}