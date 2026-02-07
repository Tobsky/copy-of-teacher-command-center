-- 1. Create academic_sessions table
create table public.academic_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null, -- e.g. "2023-2024"
  type text not null check (type in ('semester', 'trimester')), -- 'semester' (2 terms) or 'trimester' (3 terms)
  start_date date,
  end_date date,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.academic_sessions enable row level security;

create policy "Users can view their own sessions"
on public.academic_sessions for select
using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
on public.academic_sessions for insert
with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
on public.academic_sessions for update
using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
on public.academic_sessions for delete
using (auth.uid() = user_id);

-- 3. Add unique constraint so only one session is active per user (handled via application logic mostly, but good index)
create index idx_academic_sessions_user_active on public.academic_sessions(user_id) where (is_active = true);

-- 4. Add session_id to classes table
alter table public.classes 
add column session_id uuid references public.academic_sessions(id) on delete cascade;

-- 5. Index for faster lookups
create index idx_classes_session_id on public.classes(session_id);
