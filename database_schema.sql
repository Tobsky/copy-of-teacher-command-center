-- ============================================================
-- TEACHER COMMAND CENTER - Complete Database Schema
-- ============================================================
-- Run this entire script in your Supabase SQL Editor to set up
-- all tables, RLS policies, and indexes for the application.
-- ============================================================

-- ============================================================
-- 1. CLASSES TABLE
-- ============================================================
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  section text not null,
  schedule text default 'TBA',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.classes enable row level security;

create policy "Users can view their own classes"
on public.classes for select
using (auth.uid() = user_id);

create policy "Users can insert their own classes"
on public.classes for insert
with check (auth.uid() = user_id);

create policy "Users can update their own classes"
on public.classes for update
using (auth.uid() = user_id);

create policy "Users can delete their own classes"
on public.classes for delete
using (auth.uid() = user_id);

-- ============================================================
-- 2. STUDENTS TABLE
-- ============================================================
create table public.students (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.students enable row level security;

create policy "Users can view their own students"
on public.students for select
using (auth.uid() = user_id);

create policy "Users can insert their own students"
on public.students for insert
with check (auth.uid() = user_id);

create policy "Users can update their own students"
on public.students for update
using (auth.uid() = user_id);

create policy "Users can delete their own students"
on public.students for delete
using (auth.uid() = user_id);

-- Index for faster class lookups
create index idx_students_class_id on public.students(class_id);

-- ============================================================
-- 3. ASSIGNMENTS TABLE
-- ============================================================
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  title text not null,
  max_points integer default 100,
  date date not null,
  completed boolean default false,
  category text,
  weight text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.assignments enable row level security;

create policy "Users can view their own assignments"
on public.assignments for select
using (auth.uid() = user_id);

create policy "Users can insert their own assignments"
on public.assignments for insert
with check (auth.uid() = user_id);

create policy "Users can update their own assignments"
on public.assignments for update
using (auth.uid() = user_id);

create policy "Users can delete their own assignments"
on public.assignments for delete
using (auth.uid() = user_id);

-- Index for faster class lookups
create index idx_assignments_class_id on public.assignments(class_id);

-- ============================================================
-- 4. GRADES TABLE
-- ============================================================
create table public.grades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  student_id uuid references public.students(id) on delete cascade not null,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  score numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one grade per student per assignment
  unique(student_id, assignment_id)
);

alter table public.grades enable row level security;

create policy "Users can view their own grades"
on public.grades for select
using (auth.uid() = user_id);

create policy "Users can insert their own grades"
on public.grades for insert
with check (auth.uid() = user_id);

create policy "Users can update their own grades"
on public.grades for update
using (auth.uid() = user_id);

create policy "Users can delete their own grades"
on public.grades for delete
using (auth.uid() = user_id);

-- Index for faster lookups
create index idx_grades_student_id on public.grades(student_id);
create index idx_grades_assignment_id on public.grades(assignment_id);

-- ============================================================
-- 5. ATTENDANCE TABLE
-- ============================================================
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one attendance record per student per class per date
  unique(student_id, date, class_id)
);

alter table public.attendance enable row level security;

create policy "Users can view their own attendance"
on public.attendance for select
using (auth.uid() = user_id);

create policy "Users can insert their own attendance"
on public.attendance for insert
with check (auth.uid() = user_id);

create policy "Users can update their own attendance"
on public.attendance for update
using (auth.uid() = user_id);

create policy "Users can delete their own attendance"
on public.attendance for delete
using (auth.uid() = user_id);

-- Index for faster lookups
create index idx_attendance_student_id on public.attendance(student_id);
create index idx_attendance_class_id on public.attendance(class_id);
create index idx_attendance_date on public.attendance(date);

-- ============================================================
-- 6. SNIPPETS TABLE (Code Snippet Bank)
-- ============================================================
create table public.snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  language text not null,
  code text not null,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.snippets enable row level security;

create policy "Users can view their own snippets"
on public.snippets for select
using (auth.uid() = user_id);

create policy "Users can insert their own snippets"
on public.snippets for insert
with check (auth.uid() = user_id);

create policy "Users can update their own snippets"
on public.snippets for update
using (auth.uid() = user_id);

create policy "Users can delete their own snippets"
on public.snippets for delete
using (auth.uid() = user_id);

-- ============================================================
-- 7. TODOS TABLE
-- ============================================================
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.todos enable row level security;

create policy "Users can view their own todos"
on public.todos for select
using (auth.uid() = user_id);

create policy "Users can insert their own todos"
on public.todos for insert
with check (auth.uid() = user_id);

create policy "Users can update their own todos"
on public.todos for update
using (auth.uid() = user_id);

create policy "Users can delete their own todos"
on public.todos for delete
using (auth.uid() = user_id);

-- ============================================================
-- 8. LESSONS TABLE (Lesson Planner)
-- ============================================================
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  date date not null,
  content text,
  resources jsonb default '[]'::jsonb,
  class_id uuid references public.classes(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lessons enable row level security;

create policy "Users can view their own lessons"
on public.lessons for select
using (auth.uid() = user_id);

create policy "Users can insert their own lessons"
on public.lessons for insert
with check (auth.uid() = user_id);

create policy "Users can update their own lessons"
on public.lessons for update
using (auth.uid() = user_id);

create policy "Users can delete their own lessons"
on public.lessons for delete
using (auth.uid() = user_id);

-- Index for faster date lookups
create index idx_lessons_date on public.lessons(date);
create index idx_lessons_class_id on public.lessons(class_id);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
