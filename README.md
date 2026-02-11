# Avenir MVP

A local-first career discovery platform for JSS & SSS students.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- React Router
- Zustand
- Dexie (IndexedDB)

## Getting Started
```bash
npm install
npm run dev
```

## Roles & Routes
- `/student` - onboarding -> assessment -> results
- `/admin` - login -> question bank -> branching -> publish -> simulator
- `/teacher` - list reports
- `/parent` - enter report code or browse local reports
- `/counselor` - read-only report list

## Admin Login (Local)
- First visit to `/admin/login` prompts you to set an admin password (stored as a hash in IndexedDB).
- After setup, use the same password to log in.

## Seed Data
- 12 JSS questions and 13 SSS questions with adaptive branches
- 9 trait dimensions and 17 clusters (JSS + SSS)
- 1 published config version (`v1`)

## Import / Export
- Export the current published config from `/admin/import-export`
- Import a config JSON file and publish it when ready

## Notes
- All data persists locally in IndexedDB (no backend).
- Students are anonymous; sessions and reports are stored on this device only.

## AI Question Illustrations (Local Storage + Free Image Gen)
The admin question editor can generate a free illustration and store it **locally** in IndexedDB as a data URL.

### How it works
- Image generation is proxied through a Vercel serverless function (to avoid CORS).
- The serverless function calls Hugging Face Inference API (free tier).
- The frontend saves the generated image locally inside the question record as a data URL.

### Notes
- Hugging Face requires a token. Store it as a **server** environment variable in Vercel.
- Large images increase local storage size. Use sparingly for MVP.

### Required (Vercel + Hugging Face token)
1. Deploy this repo to Vercel (the `api/` folder becomes serverless functions).
2. In Vercel → Project Settings → Environment Variables, add:
```
HF_TOKEN=your_huggingface_token
HF_MODEL=black-forest-labs/FLUX.1-schnell
```
3. In the browser, the app will call `/api/image-proxy` automatically.

### Local development
- Option A (recommended): use `vercel dev` so `/api/image-proxy` runs locally.
- Option B: set a full URL to your deployed function:
```
VITE_IMAGE_PROXY_URL=https://your-app.vercel.app/api/image-proxy
```

### Health check
You can verify the serverless function is configured by hitting:
```
/api/health
```
It returns `{ ok, hasToken, model }`.
