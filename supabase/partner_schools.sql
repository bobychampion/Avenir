-- Partner schools table + open MVP policies
create table if not exists public.partner_schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text null,
  created_at timestamptz not null default now()
);

create index if not exists partner_schools_created_at_idx on public.partner_schools (created_at desc);

alter table public.partner_schools enable row level security;

create policy "partner_schools_read_all" on public.partner_schools
for select using (true);

create policy "partner_schools_insert_all" on public.partner_schools
for insert with check (true);

create policy "partner_schools_update_all" on public.partner_schools
for update using (true);

create policy "partner_schools_delete_all" on public.partner_schools
for delete using (true);
