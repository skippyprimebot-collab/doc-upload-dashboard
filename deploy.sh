#!/bin/bash

# Deploy script for Vercel Document Dashboard
# This script creates a deployment using Vercel's REST API

PROJECT_NAME="doc-upload-dashboard"
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable is not set"
  echo "Please set it with: export VERCEL_TOKEN=your_token_here"
  exit 1
fi

# Create a deployment
echo "Creating deployment for $PROJECT_NAME..."

# First, check if project exists
PROJECT_RESPONSE=$(curl -s -X GET "https://api.vercel.com/v9/projects/$PROJECT_NAME" \
  -H "Authorization: Bearer $VERCEL_TOKEN")

if echo "$PROJECT_RESPONSE" | grep -q "not found"; then
  echo "Creating new project..."
  PROJECT_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$PROJECT_NAME\"}")
fi

# Create deployment
echo "Deploying..."
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"project\": \"$PROJECT_NAME\",
    \"target\": \"production\",
    \"files\": []
  }")

echo "Deployment response:"
echo "$DEPLOY_RESPONSE" | jq .
