#!/bin/bash
# Railway Deployment Script for Document Upload Dashboard

set -e

echo "=========================================="
echo "Railway Deployment Script"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway first:"
    echo "  railway login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✓ Railway CLI is installed and authenticated"

# Check if we're in a Railway project
if [ ! -f ".railway/config.json" ] && [ ! -d ".railway" ]; then
    echo ""
    echo "Initializing Railway project..."
    echo "Please follow the prompts to create a new project."
    railway init
fi

echo "✓ Railway project initialized"

# Check if PostgreSQL is added
if ! railway status | grep -q "postgres"; then
    echo ""
    echo "Adding PostgreSQL database..."
    railway add --database postgres
    echo "✓ PostgreSQL database added"
    echo ""
    echo "Waiting for database to be ready..."
    sleep 10
else
    echo "✓ PostgreSQL database already exists"
fi

# Get DATABASE_URL
echo ""
echo "Fetching DATABASE_URL..."
DATABASE_URL=$(railway variables --service postgresql | grep DATABASE_URL | cut -d'=' -f2-)

if [ -z "$DATABASE_URL" ]; then
    echo "Could not fetch DATABASE_URL automatically."
    echo "Please get it from the Railway dashboard and set it manually:"
    echo "  railway variables --set 'DATABASE_URL=your_database_url'"
    exit 1
fi

echo "✓ DATABASE_URL retrieved"

# Set environment variables
echo ""
echo "Setting environment variables..."
railway variables --set "DATABASE_URL=$DATABASE_URL"
railway variables --set "NODE_ENV=production"
railway variables --set "UPLOAD_DIR=/app/uploads"
echo "✓ Environment variables set"

# Deploy
echo ""
echo "=========================================="
echo "Deploying to Railway..."
echo "=========================================="
railway up

# Get the domain
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your app is available at:"
railway domain
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Run database migrations:"
echo "   railway run psql \$DATABASE_URL -f schema.sql"
echo ""
echo "2. Visit your app at the URL above"
echo ""
echo "Note: Files are stored in ephemeral storage."
echo "For production, consider adding a persistent volume or using S3/R2."
echo "=========================================="
