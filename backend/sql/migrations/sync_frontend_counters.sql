-- Decisive fix for counters schema mismatch
-- Drop and recreate the table to ensure 'key' and 'value' columns exist

DROP TABLE IF EXISTS public.counters CASCADE;

CREATE TABLE public.counters (
  key text PRIMARY KEY,
  value integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sync frontend values
INSERT INTO public.counters (key, value)
VALUES 
  ('total_customers', 250),
  ('orders_delivered', 15000),
  ('pincodes_served', 110),
  ('marketers_onboarded', 75);

-- Reinstate RLS for the new table
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Counters" ON public.counters;
CREATE POLICY "Public Read Counters" ON public.counters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Counters" ON public.counters;
CREATE POLICY "Admin Manage Counters" ON public.counters
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  )
);
