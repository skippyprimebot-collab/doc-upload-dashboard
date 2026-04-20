# Document Upload Dashboard - Deployment Guide

## Project Overview

A Next.js 14 document upload dashboard with:
- Drag-and-drop file upload
- Vercel Blob Storage for files
- Vercel Postgres for metadata
- shadcn/ui components
- TypeScript & Tailwind CSS

## Quick Deploy Options

### Option 1: Vercel Dashboard (Recommended)

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/doc-upload-dashboard.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables:**
   In Vercel Dashboard → Project Settings → Environment Variables:
   
   | Variable | Value |
   |----------|-------|
   | `BLOB_READ_WRITE_TOKEN` | From Vercel Blob Storage |
   | `POSTGRES_URL` | From Vercel Postgres |

4. **Deploy:**
   Click "Deploy" - Vercel will build and deploy automatically

### Option 2: Vercel CLI (Requires Login)

```bash
# Install Vercel CLI
npm i -g vercel

# Login (opens browser)
vercel login

# Deploy
vercel --prod
```

### Option 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/doc-upload-dashboard)

## Database Setup

1. **Create Vercel Postgres database:**
   - Go to Vercel Dashboard → Storage → Create Database → Postgres
   - Choose region closest to your users
   - Copy connection string

2. **Run migrations:**
   Connect to your database and run:
   ```sql
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
   );

   CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
   ```

## Vercel Blob Storage Setup

1. Go to Vercel Dashboard → Storage → Create Database → Blob
2. Copy the `BLOB_READ_WRITE_TOKEN`
3. Add to environment variables

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a file |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/[id]` | Get document metadata |
| GET | `/api/documents/[id]/download` | Download file |

## Features

- ✅ Drag-and-drop file upload
- ✅ Document list with file type icons
- ✅ Image preview in modal
- ✅ Download functionality
- ✅ Responsive design
- ✅ File type detection (PDF, Images, Documents)
- ✅ File size formatting

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vercel Blob Storage
- Vercel Postgres
- Lucide React icons
