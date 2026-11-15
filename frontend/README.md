# CyberShield AI — Frontend

This folder contains the complete React + Vite frontend: pages, components, contexts, client services, Firebase client initialization, styling, and public assets.

## Run
```bash
npm install
npm run dev
```

The frontend expects the API backend to be available at `/api/...` when backend features are used.


## Backend integration

The frontend no longer imports `@google/genai` and never receives `GEMINI_API_KEY`. Gemini requests are sent to the backend through `/api/scan` and `/api/chat`.

For local development:
1. Start the backend on port 4000 with `GEMINI_API_KEY` configured in the backend `.env`.
2. Start the frontend with `npm run dev`.
3. Vite proxies `/api` requests to `http://localhost:4000`.

For a separate production API host, set `VITE_API_URL` in the frontend environment.

## Authentication

The frontend uses the CyberShield backend for registration and login. It does not store passwords and does not contain a Gemini API key.

Set `VITE_API_URL` in `.env` when the backend is hosted separately. For local development, leave it blank and use the configured API URL/proxy setup.
