export interface Document {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  blob_url: string;
  thumbnail_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents?: Document[];
  error?: string;
}
