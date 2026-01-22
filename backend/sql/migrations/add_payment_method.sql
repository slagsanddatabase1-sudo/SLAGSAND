-- Migration: Add payment_method column to orders table
-- Date: 2025-12-26
-- Purpose: Fix schema error where payment_method column is missing

-- Add payment_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'online';

-- Add comment for documentation
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: online or cod (cash on delivery)';
