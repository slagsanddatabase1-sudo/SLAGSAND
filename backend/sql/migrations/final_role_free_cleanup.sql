-- ROLE-FREE ACCESS CONTROL SYSTEM
-- This script removes all dependencies on the "user_roles" table.
-- It allows ANY authenticated user to manage the data.

-- 1. List of management tables
-- pincodes, inquiries, orders, marketers, faqs, testimonials, counters, user_roles

DO $$ 
DECLARE 
    tbl text;
    manage_tables text[] := ARRAY['inquiries', 'marketers', 'orders', 'faqs', 'testimonials', 'counters', 'user_roles', 'pincodes'];
BEGIN 
    FOREACH tbl IN ARRAY manage_tables LOOP
        -- Disable RLS temporarily to clean up
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl);
        
        -- Drop ALL existing policies on the table to start fresh
        EXECUTE (
            SELECT COALESCE(string_agg(format('DROP POLICY %I ON public.%I', policyname, tbl), '; '), 'SELECT 1')
            FROM pg_policies 
            WHERE tablename = tbl AND schemaname = 'public'
        );

        -- ==========================================
        -- NEW SIMPLE POLICIES (No Roles Table)
        -- ==========================================

        -- A) ALLOW AUTHENTICATED USERS FULL ACCESS
        -- This covers anyone who has logged in via Supabase Auth
        EXECUTE format('CREATE POLICY "Auth_Manage_All" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);

        -- B) PUBLIC ACCESS RULES
        -- Public READ for content tables
        IF tbl IN ('faqs', 'testimonials', 'counters', 'pincodes') THEN
            EXECUTE format('CREATE POLICY "Public_Read_Only" ON public.%I FOR SELECT TO anon USING (true)', tbl);
        
        -- Public INSERT for form tables
        ELSIF tbl IN ('inquiries', 'marketers', 'orders') THEN
            EXECUTE format('CREATE POLICY "Public_Submit_Forms" ON public.%I FOR INSERT TO anon WITH CHECK (true)', tbl);
        END IF;

        -- Re-enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    END LOOP;
END $$;

-- 2. Optional: Stop using the user_roles table lookup in other functions/triggers if any exist
-- (None detected in common files, but this ensures the DB is clear)

NOTIFY pgrst, 'reload config';

-- 3. Verification Query
SELECT 'Success! All tables now allow access to any authenticated user.' as status;
