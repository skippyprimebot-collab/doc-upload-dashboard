import { Pool, QueryResult, QueryResultRow } from 'pg';
import { Document } from './types';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database schema
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size BIGINT NOT NULL,
        blob_url TEXT NOT NULL,
        thumbnail_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC)
    `);
  } finally {
    client.release();
  }
}

// Initialize on module load
initDb().catch(console.error);

export async function query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function createDocument(
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  blobUrl: string,
  thumbnailUrl?: string | undefined
): Promise<Document> {
  console.log('DB: Creating document:', { filename, originalName, mimeType, size });
  try {
    const result = await query<Document>(
      `INSERT INTO documents (filename, original_name, mime_type, size, blob_url, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [filename, originalName, mimeType, size, blobUrl, thumbnailUrl]
    );
    console.log('DB: Insert result:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('DB: Insert failed:', error);
    throw error;
  }
}

export async function getDocuments(): Promise<Document[]> {
  const result = await query<Document>(
    `SELECT * FROM documents ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getDocumentById(id: number): Promise<Document | null> {
  const result = await query<Document>(
    `SELECT * FROM documents WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function deleteDocument(id: number): Promise<void> {
  await query(`DELETE FROM documents WHERE id = $1`, [id]);
}
