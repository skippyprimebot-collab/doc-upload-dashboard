import { NextResponse } from 'next/server';
import { createDocument } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';

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

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Convert file to buffer and save to filesystem
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(UPLOAD_DIR, uniqueFilename);
    await writeFile(filePath, buffer);

    // Create a relative URL for the file
    const fileUrl = `/api/files/${uniqueFilename}`;

    // Save metadata to database
    const document = await createDocument(
      uniqueFilename,
      file.name,
      file.type,
      file.size,
      fileUrl,
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
