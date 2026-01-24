-- ============================================================
-- ADD PARENT_ID TO SYLLABUS TOPICS
-- Description: Adds a parent_id column to support recursive topic hierarchy (Chapter -> Subtopic).
-- ============================================================

do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'syllabus_topics' and column_name = 'parent_id') then
        alter table public.syllabus_topics add column parent_id uuid references public.syllabus_topics(id) on delete cascade;
        create index idx_syllabus_topics_parent_id on public.syllabus_topics(parent_id);
    end if;
end $$;
