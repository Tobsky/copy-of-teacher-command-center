-- ============================================================
-- 9. EXAM BOARDS TABLE
-- ============================================================

create table public.exam_boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  max_score integer default 100,
  boundaries jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exam_boards enable row level security;

create policy "Users can view their own exam boards"
on public.exam_boards for select
using (auth.uid() = user_id);

create policy "Users can insert their own exam boards"
on public.exam_boards for insert
with check (auth.uid() = user_id);

create policy "Users can update their own exam boards"
on public.exam_boards for update
using (auth.uid() = user_id);

create policy "Users can delete their own exam boards"
on public.exam_boards for delete
using (auth.uid() = user_id);

-- Index for faster lookups
create index idx_exam_boards_user_id on public.exam_boards(user_id);
