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

    console.log('File received:', file.name, 'Size:', file.size);

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    console.log('Uploading to Vercel Blob...');
    const blob = await put(uniqueFilename, file, {
      access: 'public',
    });
    console.log('Blob upload successful:', blob.url);

    // Save metadata to database
    console.log('Saving to database...');
    const document = await createDocument(
      uniqueFilename,
      file.name,
      file.type,
      file.size,
      blob.url,
      undefined
    );
    console.log('Database save successful:', document);

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