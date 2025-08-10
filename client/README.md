# Client (React + Vite + Tailwind)

## Setup
1. Copy `.env.example` to `.env` and fill in VITE_FIREBASE_* with your Firebase project config.
2. Install deps: `npm install`
3. Run dev: `npm run dev`

## Notable files
- `src/lib/Auth.jsx` - Firebase Auth context (email/password + Google). Uses VITE env vars.
- `src/pages/Upload.jsx` - Upload UI (sends to `/api/upload` on server).
- `src/pages/Podcast.jsx` - Shows episodes and comments; saves playback progress to localStorage and posts to server `/api/progress`.

If you don't configure Firebase, auth functions will throw an error and the app will still work for browsing and upload to local server.
