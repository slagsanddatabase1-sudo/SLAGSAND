-- NUCLEAR FIX for "infinite recursion detected in policy"
-- This script will forcefully clear ALL policies on user_roles and set safe defaults.

-- 1. Disable RLS to break the loop immediately
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Drop EVERY policy on the table (dynamically)
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.user_roles', pol.policyname);
    END LOOP;
END $$;

-- 3. Create NEW safe policies (Strictly Non-Recursive)
-- Anyone can read the roles (required for frontend login checks)
CREATE POLICY "Allow_Public_Read_v2" 
ON public.user_roles 
FOR SELECT 
USING (true);

-- Only authenticated users (like you) can perform other actions
CREATE POLICY "Allow_Auth_All_v2" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Force Refresh Cache
NOTIFY pgrst, 'reload config';

-- 6. VERIFY: This query should now work without error
SELECT * FROM public.user_roles LIMIT 1;
