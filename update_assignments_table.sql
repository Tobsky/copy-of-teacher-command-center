-- Add category and weight columns to assignments table
ALTER TABLE public.assignments ADD COLUMN category text;
ALTER TABLE public.assignments ADD COLUMN weight text;
