-- Remove the unique constraint from the pincode column
ALTER TABLE public.pincodes DROP CONSTRAINT IF EXISTS pincodes_pincode_key;

-- Also drop the unique index if it exists explicitly (usually created by the constraint)
DROP INDEX IF EXISTS pincodes_pincode_key;
