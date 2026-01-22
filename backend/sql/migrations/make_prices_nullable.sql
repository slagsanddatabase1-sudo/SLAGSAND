-- Migration: Make legacy pricing columns nullable
-- Date: 2025-12-27
-- Purpose: Allow pincodes without explicit ton/brass/foot prices (using final_price instead)

ALTER TABLE public.pincodes 
ALTER COLUMN price_ton DROP NOT NULL,
ALTER COLUMN price_brass DROP NOT NULL,
ALTER COLUMN price_foot DROP NOT NULL;

-- Set default to 0 for these columns if they are null
ALTER TABLE public.pincodes
ALTER COLUMN price_ton SET DEFAULT 0,
ALTER COLUMN price_brass SET DEFAULT 0,
ALTER COLUMN price_foot SET DEFAULT 0;
