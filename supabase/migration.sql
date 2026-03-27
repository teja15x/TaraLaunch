-- Career Agent Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Assessments table
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  game_type text not null check (game_type in ('scenario_quest', 'pattern_master', 'story_weaver')),
  responses jsonb not null default '[]'::jsonb,
  extracted_traits jsonb not null default '{}'::jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.assessments enable row level security;

create policy "Users can view own assessments" on public.assessments
  for select using (auth.uid() = user_id);
create policy "Users can insert own assessments" on public.assessments
  for insert with check (auth.uid() = user_id);
create policy "Users can update own assessments" on public.assessments
  for update using (auth.uid() = user_id);

-- Career matches table
create table public.career_matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  career_title text not null,
  match_score integer not null,
  trait_alignment jsonb not null default '{}'::jsonb,
  description text,
  growth_outlook text,
  salary_range text,
  required_skills text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.career_matches enable row level security;

create policy "Users can view own career matches" on public.career_matches
  for select using (auth.uid() = user_id);
create policy "Users can insert own career matches" on public.career_matches
  for insert with check (auth.uid() = user_id);

-- Chat history table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_messages enable row level security;

create policy "Users can view own messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_assessments_user_id on public.assessments(user_id);
create index idx_career_matches_user_id on public.career_matches(user_id);
create index idx_chat_messages_user_id on public.chat_messages(user_id);
create index idx_assessments_game_type on public.assessments(game_type);
