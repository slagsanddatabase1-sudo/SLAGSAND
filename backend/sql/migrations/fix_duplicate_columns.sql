-- FIX SCRIPT: MERGE AND DROP 'MOBILE'
-- The error "column 'contact' already exists" means we have BOTH 'mobile' and 'contact'.
-- But 'mobile' has a NOT NULL constraint causing inserts to fail.
-- We must drop 'mobile', but first save its data to 'contact'.

DO $$
BEGIN
    -- 1. For 'inquiries' table
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='inquiries' AND column_name='mobile') THEN
        -- Copy data from mobile to contact if contact is empty
        UPDATE public.inquiries SET contact = mobile WHERE contact IS NULL;
        -- Now drop mobile
        ALTER TABLE public.inquiries DROP COLUMN mobile;
    END IF;

    -- 2. For 'marketers' table (same logic)
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='marketers' AND column_name='mobile') THEN
        UPDATE public.marketers SET contact = mobile WHERE contact IS NULL;
        ALTER TABLE public.marketers DROP COLUMN mobile;
    END IF;
END $$;

-- 3. Reload Config to update schema cache
NOTIFY pgrst, 'reload config';
