# Podcast Website — Full Starter (Client + Server)

This package contains a more complete starter for the Podcast Website with many features implemented:
- React frontend (Vite + Tailwind)
- Firebase Auth integration (placeholders) — Email/Password + Google sign-in (configure via VITE_FIREBASE_* env vars)
- Express backend with:
  - GET /api/podcasts
  - GET /api/podcasts/:id
  - POST /api/upload (stores files locally to server/uploads)
  - GET/POST /api/episodes/:episodeId/comments
  - POST /api/progress (save playback progress per-session)
  - GET /api/rss/:podcastId (generates RSS XML)
- Upload UI (protected by Firebase auth)
- Comments, playback progress (localStorage + server), subscriptions (localStorage)
- RSS generation for each podcast

## How to run locally

### Server
```bash
cd server
npm install
npm run start
```
Server will run (default port 5173). Uploaded files are stored in `server/uploads`. RSS feeds are at `http://localhost:5173/api/rss/:podcastId`.

### Client
```bash
cd client
npm install
# create .env file from .env.example and fill VITE_FIREBASE_* values if you want Firebase auth
npm run dev
```
Vite dev server will start. To proxy API requests to the server during development, set up Vite proxy in vite.config.js or run client on a different port and access server on port 5173.

## Firebase
This starter expects Firebase config via VITE_FIREBASE_* env vars. If you configure those, Auth context will initialize Firebase and auth flows will work.
If not configured, auth methods will throw and the app will still allow browsing and uploads to local server (upload requires being "logged in" — for demo it checks auth and will block if not set).

## Notes about features
Implemented:
- Listing, search, podcast details, episodes with audio player
- Comments (server-side in-memory)
- Upload flow (stores files to server/uploads and creates episode)
- RSS endpoint
- Firebase auth integration scaffolding (client) — you must add config for it to be functional

Not fully implemented (but scaffolded and documented):
- Firestore/Storage integration (instead, server stores files locally)
- Email notifications
- Real user-based subscriptions stored on server/DB (currently in localStorage)

## Next steps I can perform for you (pick any):
- Hook uploads to Firebase Storage & metadata to Firestore
- Replace server-side in-memory storage with Firestore integration + Cloud Functions
- Add email notifications (with nodemailer or Firebase Functions + SendGrid)
- Implement playback resume per-user in Firestore
- Polish UI (dark mode, animations) and add tests

