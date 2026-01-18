-- Create lessons table
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

-- Enable RLS
alter table public.lessons enable row level security;

-- Create policies
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
