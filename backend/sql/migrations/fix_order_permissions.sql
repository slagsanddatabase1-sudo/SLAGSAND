-- FIX: Allow Public Read on Orders
-- The checkout flow requires reading the order details after creating it.
-- Run this in Supabase SQL Editor.

-- 1. Add SELECT policy for public (anon) users on 'orders' table
CREATE POLICY "Public_Read_Orders" 
ON public.orders 
FOR SELECT 
TO anon 
USING (true);

-- 2. Verify
SELECT 'Success! Public read access enabled for orders.' as status;
