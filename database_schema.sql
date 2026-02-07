-- ============================================================
-- TEACHER COMMAND CENTER - Complete Database Schema (Consolidated)
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

create index idx_attendance_student_id on public.attendance(student_id);
create index idx_attendance_class_id on public.attendance(class_id);
create index idx_attendance_date on public.attendance(date);

-- ============================================================
-- 6. SNIPPETS TABLE
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
-- 8. LESSONS TABLE
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

create index idx_lessons_date on public.lessons(date);
create index idx_lessons_class_id on public.lessons(class_id);

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

create index idx_exam_boards_user_id on public.exam_boards(user_id);

-- ============================================================
-- 10. CURRICULUMS TABLE (Master Templates)
-- ============================================================
create table public.curriculums (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  board_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.curriculums enable row level security;

create policy "Users can view their own curriculums"
on public.curriculums for select
using (auth.uid() = user_id);

create policy "Users can insert their own curriculums"
on public.curriculums for insert
with check (auth.uid() = user_id);

create policy "Users can update their own curriculums"
on public.curriculums for update
using (auth.uid() = user_id);

create policy "Users can delete their own curriculums"
on public.curriculums for delete
using (auth.uid() = user_id);

create index idx_curriculums_user_id on public.curriculums(user_id);

-- ============================================================
-- 11. SYLLABUS TOPICS TABLE (Linked to Curriculums)
-- ============================================================
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

create policy "Users can view their own syllabus topics"
on public.syllabus_topics for select
using (auth.uid() = user_id);

create policy "Users can insert their own syllabus topics"
on public.syllabus_topics for insert
with check (auth.uid() = user_id);

create policy "Users can update their own syllabus topics"
on public.syllabus_topics for update
using (auth.uid() = user_id);

create policy "Users can delete their own syllabus topics"
on public.syllabus_topics for delete
using (auth.uid() = user_id);

create index idx_syllabus_topics_curriculum_id on public.syllabus_topics(curriculum_id);
create index idx_syllabus_topics_user_id on public.syllabus_topics(user_id);

-- ============================================================
-- 12. ADD curriculum_id TO CLASSES TABLE
-- ============================================================
alter table public.classes add column curriculum_id uuid references public.curriculums(id) on delete set null;
create index idx_classes_curriculum_id on public.classes(curriculum_id);

-- ============================================================
-- 13. SYLLABUS PROGRESS TABLE (Class-Specific Mastery)
-- ============================================================
create table public.syllabus_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  topic_id uuid references public.syllabus_topics(id) on delete cascade not null,
  status text default 'not_started' check (status in ('not_started', 'taught', 'assessed', 'completed')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, topic_id)
);

alter table public.syllabus_progress enable row level security;

create policy "Users can view their own syllabus progress"
on public.syllabus_progress for select
using (auth.uid() = user_id);

create policy "Users can insert their own syllabus progress"
on public.syllabus_progress for insert
with check (auth.uid() = user_id);

create policy "Users can update their own syllabus progress"
on public.syllabus_progress for update
using (auth.uid() = user_id);

create policy "Users can delete their own syllabus progress"
on public.syllabus_progress for delete
using (auth.uid() = user_id);

create index idx_syllabus_progress_class_id on public.syllabus_progress(class_id);
create index idx_syllabus_progress_topic_id on public.syllabus_progress(topic_id);

-- ============================================================
-- 14. UPDATE LESSONS TABLE - Add syllabus_topic_id
-- ============================================================
alter table public.lessons add column syllabus_topic_id uuid references public.syllabus_topics(id) on delete set null;
create index idx_lessons_syllabus_topic_id on public.lessons(syllabus_topic_id);
-- ============================================================
-- 15. ACADEMIC SESSIONS TABLE
-- ============================================================
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

-- Unique constraint for active session
create index idx_academic_sessions_user_active on public.academic_sessions(user_id) where (is_active = true);

-- Add session_id to classes table
alter table public.classes 
add column session_id uuid references public.academic_sessions(id) on delete cascade;

create index idx_classes_session_id on public.classes(session_id);

-- ============================================================
-- 16. SYLLABUS HIERARCHY (Add parent_id)
-- ============================================================
-- Adds a parent_id column to support recursive topic hierarchy (Chapter -> Subtopic).
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'syllabus_topics' and column_name = 'parent_id') then
        alter table public.syllabus_topics add column parent_id uuid references public.syllabus_topics(id) on delete cascade;
        create index idx_syllabus_topics_parent_id on public.syllabus_topics(parent_id);
    end if;
end $$;

-- ============================================================
-- 17. UTILITY FUNCTIONS
-- ============================================================
-- Email existence check for sign-up
CREATE OR REPLACE FUNCTION public.email_exists(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth -- Secure execution context
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_check
  );
END;
$$;

-- Grant permission so anyone (including logged out users) can check if email exists
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;
