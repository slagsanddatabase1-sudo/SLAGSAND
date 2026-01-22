-- SIMPLIFICATION FIX: Remove Role-Based RLS and allow all authenticated users Full Access
-- Run this in your Supabase SQL Editor

-- 1. Tables to open up for Authenticated users
-- We will apply this to inquiries, marketers, orders, faqs, testimonials, counters, user_roles, and pincodes

DO $$ 
DECLARE 
    tbl text;
    admin_tables text[] := ARRAY['inquiries', 'marketers', 'orders', 'faqs', 'testimonials', 'counters', 'user_roles', 'pincodes'];
BEGIN 
    FOREACH tbl IN ARRAY admin_tables LOOP
        -- Disable RLS temporarily to clear policies
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl);
        
        -- Drop ALL existing policies on the table
        EXECUTE (
            SELECT string_agg(format('DROP POLICY %I ON public.%I', policyname, tbl), '; ')
            FROM pg_policies 
            WHERE tablename = tbl AND schemaname = 'public'
        );

        -- Create a simple policy: Authenticated users can do EVERYTHING
        EXECUTE format('CREATE POLICY "Auth_Full_Access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);

        -- Special case: Public needs to READ Some tables and INSERT into others
        IF tbl IN ('faqs', 'testimonials', 'counters', 'pincodes') THEN
            EXECUTE format('CREATE POLICY "Public_Read" ON public.%I FOR SELECT TO anon USING (true)', tbl);
        ELSIF tbl IN ('inquiries', 'marketers', 'orders') THEN
            EXECUTE format('CREATE POLICY "Public_Insert" ON public.%I FOR INSERT TO anon WITH CHECK (true)', tbl);
        END IF;

        -- Re-enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    END LOOP;
END $$;

-- 2. Reload PostgREST Cache
NOTIFY pgrst, 'reload config';

-- 3. Verification
-- Now any logged-in user will bypass role checks at the database level.
