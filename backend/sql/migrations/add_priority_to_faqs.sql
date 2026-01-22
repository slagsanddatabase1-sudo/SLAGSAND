-- Add priority column to faqs table
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;

-- Assign initial priorities based on creation date to preserve existing order
-- This works even if 'id' is a UUID
WITH ordered_faqs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM public.faqs
)
UPDATE public.faqs
SET priority = ordered_faqs.row_num
FROM ordered_faqs
WHERE public.faqs.id = ordered_faqs.id;
