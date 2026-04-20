import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createDocument } from '@/lib/db';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: 'public',
    });

    // Save metadata to database
    const document = await createDocument(
      uniqueFilename,
      file.name,
      file.type,
      file.size,
      blob.url,
      undefined // thumbnail_url - can be added later
    );

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}