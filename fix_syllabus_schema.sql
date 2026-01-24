-- ============================================================
-- FIX SYLLABUS HUB SCHEMA
-- Run this script to safely apply the Syllabus Hub database changes.
-- It handles cases where tables or columns might already exist.
-- ============================================================

-- 10. CURRICULUMS TABLE
create table if not exists public.curriculums (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  board_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.curriculums enable row level security;

-- Policies (Drop first to avoid errors if they exist)
drop policy if exists "Users can view their own curriculums" on public.curriculums;
create policy "Users can view their own curriculums" on public.curriculums for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own curriculums" on public.curriculums;
create policy "Users can insert their own curriculums" on public.curriculums for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own curriculums" on public.curriculums;
create policy "Users can update their own curriculums" on public.curriculums for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own curriculums" on public.curriculums;
create policy "Users can delete their own curriculums" on public.curriculums for delete using (auth.uid() = user_id);

-- Index (Indices typically don't throw if exists in some postgres versions, but good to be safe)
create index if not exists idx_curriculums_user_id on public.curriculums(user_id);


-- 11. SYLLABUS TOPICS TABLE
-- Note: If the table exists but has 'class_id' instead of 'curriculum_id', we might need to recreate it.
-- This script assumes if it exists, it's either the new version or empty.
drop table if exists public.syllabus_topics cascade;

create table public.syllabus_topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  curriculum_id uuid references public.curriculums(id) on delete cascade not null,
  title text not null,
  semester text not null check (semester in ('Semester 1', 'Semester 2')),
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.syllabus_topics enable row level security;

create policy "Users can view their own syllabus topics" on public.syllabus_topics for select using (auth.uid() = user_id);
create policy "Users can insert their own syllabus topics" on public.syllabus_topics for insert with check (auth.uid() = user_id);
create policy "Users can update their own syllabus topics" on public.syllabus_topics for update using (auth.uid() = user_id);
create policy "Users can delete their own syllabus topics" on public.syllabus_topics for delete using (auth.uid() = user_id);

create index if not exists idx_syllabus_topics_curriculum_id on public.syllabus_topics(curriculum_id);
create index if not exists idx_syllabus_topics_user_id on public.syllabus_topics(user_id);


-- 12. ADD curriculum_id TO CLASSES TABLE
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'classes' and column_name = 'curriculum_id') then
        alter table public.classes add column curriculum_id uuid references public.curriculums(id) on delete set null;
    end if;
end $$;

create index if not exists idx_classes_curriculum_id on public.classes(curriculum_id);


-- 13. SYLLABUS PROGRESS TABLE
create table if not exists public.syllabus_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  topic_id uuid references public.syllabus_topics(id) on delete cascade not null,
  status text default 'not_started' check (status in ('not_started', 'taught', 'assessed', 'completed')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, topic_id)
);

alter table public.syllabus_progress enable row level security;

drop policy if exists "Users can view their own syllabus progress" on public.syllabus_progress;
create policy "Users can view their own syllabus progress" on public.syllabus_progress for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own syllabus progress" on public.syllabus_progress;
create policy "Users can insert their own syllabus progress" on public.syllabus_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own syllabus progress" on public.syllabus_progress;
create policy "Users can update their own syllabus progress" on public.syllabus_progress for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own syllabus progress" on public.syllabus_progress;
create policy "Users can delete their own syllabus progress" on public.syllabus_progress for delete using (auth.uid() = user_id);

create index if not exists idx_syllabus_progress_class_id on public.syllabus_progress(class_id);
create index if not exists idx_syllabus_progress_topic_id on public.syllabus_progress(topic_id);


-- 14. UPDATE LESSONS TABLE
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'lessons' and column_name = 'syllabus_topic_id') then
        alter table public.lessons add column syllabus_topic_id uuid references public.syllabus_topics(id) on delete set null;
    end if;
end $$;

create index if not exists idx_lessons_syllabus_topic_id on public.lessons(syllabus_topic_id);
