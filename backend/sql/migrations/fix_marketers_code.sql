-- FIX SCRIPT: MARKETERS 'CODE' COLUMN
-- The 'marketers' table has a 'code' column that is currently NOT NULL.
-- The frontend does not generate this code, causing the error: "null value in column 'code' ... violates not-null constraint".
-- We will make this column NULLABLE and add a default generator just in case.

-- 1. Remove NOT NULL constraint
ALTER TABLE public.marketers ALTER COLUMN code DROP NOT NULL;

-- 2. Optional: Add a default value (random string) if we want it to auto-generate
ALTER TABLE public.marketers ALTER COLUMN code SET DEFAULT substr(md5(random()::text), 0, 8);

-- 3. Reload PostgREST Cache
NOTIFY pgrst, 'reload config';
