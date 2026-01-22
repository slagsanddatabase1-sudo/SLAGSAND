-- FIX SCRIPT: RENAME 'MOBILE' TO 'CONTACT'
-- The database seems to have a 'mobile' column that is NOT NULL, but the code sends 'contact'.
-- This script aligns the database with the codebase.

DO $$
BEGIN
    -- 1. Rename 'mobile' to 'contact' in 'inquiries' table
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='inquiries' AND column_name='mobile') THEN
        ALTER TABLE public.inquiries RENAME COLUMN "mobile" TO "contact";
    END IF;

    -- 2. Rename 'mobile' to 'contact' in 'marketers' table (just in case)
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='marketers' AND column_name='mobile') THEN
        ALTER TABLE public.marketers RENAME COLUMN "mobile" TO "contact";
    END IF;
END $$;

-- 3. Reload PostgREST Cache
NOTIFY pgrst, 'reload config';
