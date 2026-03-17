# QTEC Knowledge Brain

Enterprise managed RAG proof of concept for QTEC, built with Next.js 15, Vertex AI Search grounding, and a Thai-first UI.

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`

By default the app runs in `MOCK_MODE=true`, so the APIs and UI work without a live Vertex AI Search data store.

## Main routes

- `/` main chat interface
- `/dashboard` system status view
- `/unauthorized` fallback screen
- `/api/auth/whoami`
- `/api/ask`
- `/api/health`
- `/api/search/debug`
