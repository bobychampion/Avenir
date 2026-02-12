# Avenir MVP

A local-first career discovery platform for JSS & SSS students.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- React Router
- Zustand
- Dexie (IndexedDB local cache)
- Supabase (reports sync, optional)

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
- Config editing stays local in IndexedDB (no backend).
- Reports are stored locally and synced to Supabase when configured.
- Students are anonymous; sessions are stored on this device only.

## Supabase (Reports Sync)
This MVP syncs reports to Supabase so teachers/parents can access results across devices.

### Environment variables
Set these in your Vercel project (or `.env.local` for dev):
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```
If you only have the legacy anon key, use:
```
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### SQL schema (run in Supabase SQL editor)
```sql
create table if not exists public.reports (
  id text primary key,
  session_id text not null,
  report_code text not null,
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists reports_report_code_idx on public.reports (report_code);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

create policy \"reports_read_all\" on public.reports
for select using (true);

create policy \"reports_insert_all\" on public.reports
for insert with check (true);

create policy \"reports_update_all\" on public.reports
for update using (true);
```

Notes:
- These policies are open for MVP. Tighten them once auth is enabled.
- Upserts require the `update` policy above.

## Supabase (Config Data - Full Migration)
To store questions, options, traits, clusters, and version snapshots in Supabase, create the tables below.

### SQL schema (run in Supabase SQL editor)
```sql
create table if not exists public.traits (
  id text primary key,
  label text not null,
  description text not null
);

create table if not exists public.clusters (
  id text primary key,
  label text not null,
  description text not null,
  track_bias text[] not null default '{}',
  trait_weights jsonb not null default '{}'::jsonb,
  trait_thresholds jsonb not null default '{}'::jsonb,
  subjects text[] not null default '{}',
  skills text[] not null default '{}',
  what_they_do text[] not null default '{}',
  next_steps text[] not null default '{}'
);

create table if not exists public.questions (
  id text primary key,
  mode text not null,
  type text not null,
  prompt text not null,
  tags text[] not null default '{}',
  branch_level int not null default 0,
  parent_question_id text null,
  status text not null,
  track text null,
  illustration_url text null
);

create table if not exists public.options (
  id text primary key,
  question_id text not null references public.questions(id) on delete cascade,
  label text not null,
  image_url text null,
  score_map jsonb not null default '{}'::jsonb,
  next_question_id text null,
  disengaged boolean not null default false
);

create index if not exists options_question_id_idx on public.options (question_id);

create table if not exists public.drafts (
  id text primary key,
  name text not null,
  updated_at timestamptz not null default now(),
  draft_json jsonb not null
);

create table if not exists public.config_versions (
  id text primary key,
  version text not null,
  status text not null,
  published_at timestamptz null,
  config_json jsonb not null
);

create table if not exists public.pathway_progress (
  id uuid primary key default gen_random_uuid(),
  report_code text not null,
  cluster_id text not null,
  tasks jsonb not null default '{}'::jsonb,
  reflection text not null default '',
  updated_at timestamptz not null default now()
);

create unique index if not exists pathway_progress_report_cluster_idx
  on public.pathway_progress (report_code, cluster_id);

alter table public.traits enable row level security;
alter table public.clusters enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.drafts enable row level security;
alter table public.config_versions enable row level security;
alter table public.pathway_progress enable row level security;

create policy "traits_read_all" on public.traits
for select using (true);
create policy "traits_insert_all" on public.traits
for insert with check (true);
create policy "traits_update_all" on public.traits
for update using (true);
create policy "traits_delete_all" on public.traits
for delete using (true);

create policy "clusters_read_all" on public.clusters
for select using (true);
create policy "clusters_insert_all" on public.clusters
for insert with check (true);
create policy "clusters_update_all" on public.clusters
for update using (true);
create policy "clusters_delete_all" on public.clusters
for delete using (true);

create policy "questions_read_all" on public.questions
for select using (true);
create policy "questions_insert_all" on public.questions
for insert with check (true);
create policy "questions_update_all" on public.questions
for update using (true);
create policy "questions_delete_all" on public.questions
for delete using (true);

create policy "options_read_all" on public.options
for select using (true);
create policy "options_insert_all" on public.options
for insert with check (true);
create policy "options_update_all" on public.options
for update using (true);
create policy "options_delete_all" on public.options
for delete using (true);

create policy "drafts_read_all" on public.drafts
for select using (true);
create policy "drafts_insert_all" on public.drafts
for insert with check (true);
create policy "drafts_update_all" on public.drafts
for update using (true);
create policy "drafts_delete_all" on public.drafts
for delete using (true);

create policy "config_versions_read_all" on public.config_versions
for select using (true);
create policy "config_versions_insert_all" on public.config_versions
for insert with check (true);
create policy "config_versions_update_all" on public.config_versions
for update using (true);
create policy "config_versions_delete_all" on public.config_versions
for delete using (true);

create policy "pathway_progress_read_all" on public.pathway_progress
for select using (true);
create policy "pathway_progress_insert_all" on public.pathway_progress
for insert with check (true);
create policy "pathway_progress_update_all" on public.pathway_progress
for update using (true);
create policy "pathway_progress_delete_all" on public.pathway_progress
for delete using (true);
```

Notes:
- These policies are open for MVP. Tighten them once auth is enabled.
- If you already have local data, export JSON, then re-import after Supabase tables are ready.

## Question Illustrations (Stock Images)
The admin question editor uses stock image URLs for question illustrations and image-select options.

### Notes
- The seed config ships with teen-friendly, free stock images sourced from Pexels.
- Use royalty-free sources with clear licenses (e.g., Pexels or Unsplash) when replacing URLs.
- For `image_select` questions, each option should include an `image_url`.
