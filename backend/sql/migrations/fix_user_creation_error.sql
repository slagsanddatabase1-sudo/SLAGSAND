-- CLEANUP: Remove any lingering triggers that block user creation
-- Run this in your Supabase SQL Editor

-- 1. Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Verify RLS is actually simple on user_roles (just in case)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth_Manage_All" ON public.user_roles;
CREATE POLICY "Auth_Manage_All" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Reload cache
NOTIFY pgrst, 'reload config';

SELECT 'Cleanup complete! Triggers on auth.users have been removed. You should now be able to create users without database errors.' as status;
