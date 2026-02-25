-- 1. CLEANUP REPAIR: Remove the problematic random default and ensure ID sync
-- This fixes the foreign key violation by ensuring we use Auth IDs instead of random ones.
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        -- Remove any default that generates random values (which was causing FK failures)
        EXECUTE 'ALTER TABLE public.user_roles ALTER COLUMN id DROP DEFAULT';
    END IF;
END $$;

-- 2. Improved function to handle new auth users - NOW INCLUDES THE ID
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (id, email, role, status)
  VALUES (new.id, new.email, 'staff', 'active')
  ON CONFLICT (email) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Initial sync for existing users: Use IDs from auth.users
INSERT INTO public.user_roles (id, email, role, status)
SELECT id, email, 'staff', 'active'
FROM auth.users
WHERE email NOT IN (SELECT email FROM public.user_roles)
AND email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- 5. FORCE CONFIRM ALL USERS (Removes "Email not confirmed" error for current users)
-- Note: 'confirmed_at' is a generated column in many Supabase versions, so we only update 'email_confirmed_at'
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE email_confirmed_at IS NULL;