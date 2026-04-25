# Learning Companion

An intelligent assistant that helps users learn new concepts, tracking progress and adjusting content dynamically using the Gemini API.

## Features
- **Adaptive Learning:** Tailors lessons based on user's progress level.
- **Progress Tracking:** Saves topics learned and levels up automatically.
- **Accessible & Aesthetic UI:** WCAG 2.1 compliant interface with dark mode and micro-animations.
- **Cloud Ready:** Containerized and configured for Google Cloud Run deployment.

## Local Development

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` inside the `backend` directory and add your Google Gemini API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   PORT=8080
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open `http://localhost:8080` in your browser.

## Running Tests

From the `backend` directory, run:
```bash
npm test
```
*Note: The tests use a mock for the Gemini API, so no real API calls are made during testing.*

## Deployment to Google Cloud

The project includes everything needed to deploy to Google Cloud Run.

### Prerequisites
- [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) installed and authenticated.
- A Google Cloud Project with billing enabled.
- Cloud Run API, Cloud Build API, and Secret Manager API enabled.

### Deployment Steps

1. **Create the Secret in Google Cloud:**
   ```bash
   echo -n "your_real_gemini_api_key" | gcloud secrets create GEMINI_API_KEY --data-file=-
   ```

2. **Grant Secret Access to Compute Service Account:**
   Find your default compute service account (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`) and grant it the `Secret Manager Secret Accessor` role.

3. **Deploy the application:**
   You can deploy directly using the provided script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   *Alternatively, if you're using Cloud Build triggers, the `cloudbuild.yaml` file is ready to use.*

## Architecture
- **Backend:** Node.js, Express.js, SQLite (for local MVP state), `@google/generative-ai`.
- **Frontend:** Vanilla HTML, CSS, JavaScript, `marked.js` for markdown parsing.
