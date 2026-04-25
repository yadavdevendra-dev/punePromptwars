#!/bin/bash
set -e

# Configuration variables
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="learning-companion"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Deploying $SERVICE_NAME to Google Cloud Run in project $PROJECT_ID..."

# Step 1: Ensure Secret Manager has the API key
if ! gcloud secrets describe GEMINI_API_KEY --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "Secret GEMINI_API_KEY not found. Please create it first:"
    echo "echo -n 'your_api_key' | gcloud secrets create GEMINI_API_KEY --data-file=- --project=$PROJECT_ID"
    exit 1
fi

# Step 2: Build the image using Cloud Build
echo "Building the container image..."
gcloud builds submit --tag $IMAGE_NAME

# Step 3: Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"

echo "Deployment complete!"
