import { sql } from '@vercel/postgres';
import { Document } from './types';

export async function createDocument(
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  blobUrl: string,
  thumbnailUrl?: string | undefined
): Promise<Document> {
  const result = await sql<Document>`
    INSERT INTO documents (filename, original_name, mime_type, size, blob_url, thumbnail_url)
    VALUES (${filename}, ${originalName}, ${mimeType}, ${size}, ${blobUrl}, ${thumbnailUrl})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getDocuments(): Promise<Document[]> {
  const result = await sql<Document>`
    SELECT * FROM documents
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function getDocumentById(id: number): Promise<Document | null> {
  const result = await sql<Document>`
    SELECT * FROM documents
    WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function deleteDocument(id: number): Promise<void> {
  await sql`DELETE FROM documents WHERE id = ${id}`;
}
