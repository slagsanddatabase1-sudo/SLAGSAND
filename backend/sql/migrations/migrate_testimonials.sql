-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Read Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin Manage Testimonials" ON public.testimonials;

-- Policy for public read
CREATE POLICY "Public Read Testimonials" ON public.testimonials 
FOR SELECT USING (true);

-- Policy for admin manage
CREATE POLICY "Admin Manage Testimonials" ON public.testimonials
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  )
);

-- Add priority column to testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;

-- Assign initial priorities
WITH ordered_t AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM public.testimonials
)
UPDATE public.testimonials
SET priority = ordered_t.row_num
FROM ordered_t
WHERE public.testimonials.id = ordered_t.id;
