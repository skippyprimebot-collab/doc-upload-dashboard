# Document Upload Dashboard - Railway Deployment Guide

## Overview

The project has been configured for Railway deployment. Since Railway CLI requires interactive authentication, I'll provide you with the manual deployment steps.

## What Was Changed

1. **Database**: Switched from `@vercel/postgres` to standard `pg` (node-postgres)
2. **File Storage**: Switched from Vercel Blob to local filesystem storage (`/app/uploads`)
3. **Docker**: Created `Dockerfile.railway` with uploads directory setup
4. **Config**: Added `railway.toml` for deployment configuration
5. **API Routes**: Updated to use filesystem for file storage

## Manual Deployment Steps

### Step 1: Go to Railway Dashboard
1. Visit https://railway.app/dashboard
2. Sign in with your account

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If not connected, connect your GitHub account
4. Select the repository containing this project

### Step 3: Add PostgreSQL Database
1. In your project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Wait for the database to provision (usually takes ~1 minute)

### Step 4: Configure Environment Variables
1. Go to your app service (not the database)
2. Click the **"Variables"** tab
3. Add the following variables:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | Copy from PostgreSQL service | Click "Add Reference" → Select your PostgreSQL service → Select `DATABASE_URL` |
| `NODE_ENV` | `production` | Enter manually |
| `UPLOAD_DIR` | `/app/uploads` | Enter manually |

### Step 5: Deploy
1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** in the dashboard to trigger manually

### Step 6: Run Database Migrations
After the first deployment, you need to create the database tables:

**Option A: Using Railway CLI (if logged in)**
```bash
cd /root/.openclaw/workspace/vercel-doc-dashboard/my-app
railway run psql $DATABASE_URL -f schema.sql
```

**Option B: Using Railway Dashboard**
1. Go to your PostgreSQL service
2. Click **"Query"** tab
3. Run the following SQL:

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

### Step 7: Get Your URL
1. Go to your app service
2. Click **"Settings"** tab
3. Under **"Public Networking"**, you'll see your deployment URL
4. Or click **"Generate Domain"** to create a custom domain

## Important Notes

### File Storage Limitations
- Files are stored in the container's filesystem at `/app/uploads`
- Railway's filesystem is **ephemeral** - files will be lost on redeploy
- For production use, consider:
  - **Railway Volume** (persistent storage): Add in dashboard → Volumes
  - **AWS S3** or **Cloudflare R2** (recommended for scalability)
  - **Backblaze B2** (cost-effective)

### To Add a Persistent Volume (Optional)
1. In Railway dashboard, go to your app service
2. Click **"Volumes"** tab
3. Click **"New Volume"**
4. Set mount path to `/app/uploads`
5. Set size (e.g., 1GB)

### Health Check
The app includes a health check endpoint at `/api/health`

## Files Modified/Created

- `package.json` - Added `pg` dependency, removed Vercel-specific packages
- `src/lib/db.ts` - Updated to use standard PostgreSQL
- `src/app/api/upload/route.ts` - Uses filesystem storage
- `src/app/api/documents/[id]/download/route.ts` - Serves files from filesystem
- `src/app/api/files/[filename]/route.ts` - New route for serving files
- `src/app/api/health/route.ts` - Health check endpoint
- `Dockerfile.railway` - Railway-specific Dockerfile
- `railway.toml` - Railway deployment config
- `next.config.mjs` - Updated for standalone output

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Ensure `DATABASE_URL` is properly referenced from the PostgreSQL service

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly
- Check that the PostgreSQL service is running (green status)

### Files Not Persisting
- This is expected behavior - Railway's filesystem is ephemeral
- Add a Volume or use external storage (S3/R2)

## Support

For Railway-specific issues:
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
