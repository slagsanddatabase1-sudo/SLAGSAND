-- Enable RLS for counters
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Read Counters" ON public.counters;
DROP POLICY IF EXISTS "Admin Manage Counters" ON public.counters;

-- Policy for public read
CREATE POLICY "Public Read Counters" ON public.counters 
FOR SELECT USING (true);

-- Policy for admin to update values
CREATE POLICY "Admin Manage Counters" ON public.counters
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  )
);
