#!/bin/bash

# Google Cloud Run deployment script for AZ-1 Chatbot
set -e

PROJECT_ID="az-1-chatbot"
SERVICE_NAME="az1-chatbot"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Starting deployment to Google Cloud Run..."

# Build and tag the image for linux/amd64 platform
echo "📦 Building Docker image..."
docker build --platform linux/amd64 -t $IMAGE_NAME .

# Push to Google Container Registry
echo "📤 Pushing image to GCR..."
docker push $IMAGE_NAME

# Deploy to Cloud Run with secrets from Secret Manager
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-secrets "EMBED_API_KEY=EMBED_API_KEY:latest" \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300 \
  --project $PROJECT_ID

echo "✅ Deployment complete!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "🌍 Service URL: $SERVICE_URL"

echo "📝 Next steps:"
echo "1. Update your embed script URLs to point to: $SERVICE_URL/embed.js"
echo "2. Add your domain to the ALLOWED_ORIGINS in the embed stream API"
echo "3. Generate and distribute proper API keys to customers" 