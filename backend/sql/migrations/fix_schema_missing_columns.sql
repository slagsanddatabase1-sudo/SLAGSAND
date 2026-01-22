-- FIX SCRIPT: ADD MISSING COLUMNS
-- It seems the tables were created with an old schema and 'details' or 'location' columns are missing.

-- 1. Add 'details' to inquiries if it doesn't exist
alter table public.inquiries 
add column if not exists details jsonb;

-- 2. Add 'location' to marketers if it doesn't exist (just in case)
alter table public.marketers 
add column if not exists location text;

-- 3. Add 'experience' to marketers if it doesn't exist
alter table public.marketers 
add column if not exists experience text;

-- 4. Reload PostgREST Cache (Crucial for the error "Could not find ... in schema cache")
NOTIFY pgrst, 'reload config';
