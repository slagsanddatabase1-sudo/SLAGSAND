-- Safely Update Testimonials Table
DO $$ 
BEGIN
    -- Drop role if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='role') THEN
        ALTER TABLE public.testimonials DROP COLUMN role;
    END IF;

    -- Rename name to client_name if name exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='name') THEN
        ALTER TABLE public.testimonials RENAME COLUMN name TO client_name;
    END IF;

    -- Rename message to content if message exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='message') THEN
        ALTER TABLE public.testimonials RENAME COLUMN message TO content;
    END IF;

    -- Ensure client_name exists (in case table was empty/different)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='client_name') THEN
        ALTER TABLE public.testimonials ADD COLUMN client_name text;
    END IF;

    -- Ensure content exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='content') THEN
        ALTER TABLE public.testimonials ADD COLUMN content text;
    END IF;
END $$;

-- Add RLS or update if needed
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Testimonials" ON public.testimonials;
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);

-- Seed with 10 high-quality testimonials
INSERT INTO public.testimonials (client_name, content)
VALUES 
    ('Rahul Deshmukh', 'Best quality slag sand in Nagpur. Saved us 20% on construction costs for our recent project.'),
    ('Rajesh Patel', 'Impressive volume advantage. 1 ton of slag sand definitely covers more area than traditional river sand.'),
    ('Manoj Tiwari', 'Consistent quality and timely delivery. Slag Wala has become our most trusted material partner.'),
    ('S.K. Associates', 'The finish on the plastering work is incredibly smooth. Much better workability than crushed sand (M-Sand).'),
    ('Green Build Tech', 'Eco-friendly and cost-effective. A perfect combination for modern, sustainable builders.'),
    ('Vikas Infrastructure', 'We have been using their slag sand for 2 years now. Zero issues and consistently high durability.'),
    ('Prateek Kumar', 'Excellent bonding strength in concrete. We are very satisfied with the test results and final structure.'),
    ('Gupta Builders', 'Reliable supply even during peak monsoon seasons. Highly dependable service and support.'),
    ('Ramesh Construction', 'Lighter weight makes it much easier for our laborers to handle and transport on-site.'),
    ('Anita Sharma', 'Great customer service and technical support. They really know their product and help with mix designs.')
ON CONFLICT DO NOTHING;
