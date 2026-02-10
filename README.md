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
