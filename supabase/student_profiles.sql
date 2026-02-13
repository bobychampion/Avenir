-- Student profiles + schools + report link
-- Safe to re-run (guards on indexes/policies)

create extension if not exists "pgcrypto";

-- reports: add student_id if missing
alter table public.reports add column if not exists student_id uuid null;
create index if not exists reports_student_id_idx on public.reports (student_id);

-- schools table
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text null,
  state text null,
  country text null,
  created_at timestamptz not null default now()
);

create unique index if not exists schools_name_idx on public.schools (lower(name));

-- ensure school columns exist (for older tables)
alter table public.schools add column if not exists city text null;
alter table public.schools add column if not exists state text null;
alter table public.schools add column if not exists country text null;
alter table public.schools add column if not exists created_at timestamptz not null default now();

-- student profiles table
create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text null,
  email text null,
  phone text null,
  avatar_url text null,
  school_id uuid null references public.schools(id),
  school_name text null,
  location text null,
  age int null,
  class_level text null,
  favorite_color text null,
  favorite_food text null,
  hobbies text[] not null default '{}',
  interests text[] not null default '{}',
  guardian_name text null,
  guardian_email text null,
  guardian_phone text null,
  guardian_relationship text null,
  guardian_permission boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- align legacy column names (user_id/student_id -> id)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'user_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'id'
  ) then
    alter table public.student_profiles rename column user_id to id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'student_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'id'
  ) then
    alter table public.student_profiles rename column student_id to id;
  end if;
end
$$;

alter table public.student_profiles add column if not exists first_name text not null default '';
alter table public.student_profiles add column if not exists last_name text null;
alter table public.student_profiles add column if not exists email text null;
alter table public.student_profiles add column if not exists phone text null;
alter table public.student_profiles add column if not exists avatar_url text null;
alter table public.student_profiles add column if not exists school_id uuid null;
alter table public.student_profiles add column if not exists school_name text null;
alter table public.student_profiles add column if not exists location text null;
alter table public.student_profiles add column if not exists age int null;
alter table public.student_profiles add column if not exists class_level text null;
alter table public.student_profiles add column if not exists favorite_color text null;
alter table public.student_profiles add column if not exists favorite_food text null;
alter table public.student_profiles add column if not exists hobbies text[] not null default '{}';
alter table public.student_profiles add column if not exists interests text[] not null default '{}';
alter table public.student_profiles add column if not exists guardian_name text null;
alter table public.student_profiles add column if not exists guardian_email text null;
alter table public.student_profiles add column if not exists guardian_phone text null;
alter table public.student_profiles add column if not exists guardian_relationship text null;
alter table public.student_profiles add column if not exists guardian_permission boolean not null default false;
alter table public.student_profiles add column if not exists created_at timestamptz not null default now();
alter table public.student_profiles add column if not exists updated_at timestamptz not null default now();

alter table public.student_profiles drop constraint if exists student_profiles_pkey;
alter table public.student_profiles add primary key (id);
alter table public.student_profiles drop constraint if exists student_profiles_id_fkey;
alter table public.student_profiles
  add constraint student_profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

alter table public.student_profiles enable row level security;
alter table public.schools enable row level security;

-- policies (guarded)
do $$
begin
  -- resolve profile id column (supports id/user_id/student_id)
  -- pick id first if present, then user_id, then student_id
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_profiles'
      and column_name in ('id', 'user_id', 'student_id')
  ) then
    raise exception 'student_profiles table exists but no id/user_id/student_id column found';
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'student_profiles' and policyname = 'profiles_select_own'
  ) then
    execute format(
      'create policy "profiles_select_own" on public.student_profiles for select using (auth.uid() = %I)',
      coalesce(
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'id'),
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'user_id'),
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'student_id')
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'student_profiles' and policyname = 'profiles_insert_own'
  ) then
    execute format(
      'create policy "profiles_insert_own" on public.student_profiles for insert with check (auth.uid() = %I)',
      coalesce(
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'id'),
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'user_id'),
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'student_id')
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'student_profiles' and policyname = 'profiles_update_own'
  ) then
    execute format(
      'create policy "profiles_update_own" on public.student_profiles for update using (auth.uid() = %I)',
      coalesce(
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'id'),
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'user_id'),
        (select column_name from information_schema.columns where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'student_id')
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'schools' and policyname = 'schools_read_all'
  ) then
    create policy "schools_read_all" on public.schools
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'schools' and policyname = 'schools_insert_all'
  ) then
    create policy "schools_insert_all" on public.schools
      for insert with check (true);
  end if;
end
$$;
