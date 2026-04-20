# Document Upload Dashboard

A Next.js 14 application with TypeScript and Tailwind CSS for uploading and managing documents using Vercel Blob Storage and Vercel Postgres.

## Features

- Drag-and-drop file upload
- Document list with file type icons
- Image preview functionality
- Download documents
- Responsive design with shadcn/ui components

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in Vercel:
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token
- `POSTGRES_URL` - Vercel Postgres connection string

3. Run database migrations:
```bash
# Connect to your Vercel Postgres database and run the schema.sql file
```

4. Deploy to Vercel:
```bash
vercel --prod
```

## API Endpoints

- `POST /api/upload` - Upload files
- `GET /api/documents` - List all documents
- `GET /api/documents/[id]` - Get single document metadata
- `GET /api/documents/[id]/download` - Download file

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vercel Blob Storage
- Vercel Postgres
