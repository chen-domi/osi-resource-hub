-- Create profiles table linked to Supabase auth users
create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  name         text        not null,
  email        text        not null,
  organizations jsonb       not null default '[]'::jsonb,
  current_org  text        not null default '',
  is_osi_admin boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
