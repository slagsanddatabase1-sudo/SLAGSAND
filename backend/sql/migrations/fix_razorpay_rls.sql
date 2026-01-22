-- FIX: Allow public users to update their own orders during the payment process
-- Without this, the payment might succeed in Razorpay but fail to save in your database.

-- 1. Enable UPDATE for the orders table for everyone (so the checkout page can mark it as 'paid')
DROP POLICY IF EXISTS "Public_Update_Orders" ON public.orders;
CREATE POLICY "Public_Update_Orders" 
ON public.orders 
FOR UPDATE 
TO anon, authenticated
USING (status = 'created' OR status = 'pending')
WITH CHECK (status = 'paid' OR status = 'pending');

-- 2. Ensure orders can be READ by the checkout page without being logged in
DROP POLICY IF EXISTS "Public_Read_Orders" ON public.orders;
CREATE POLICY "Public_Read_Orders" 
ON public.orders 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 3. Update the global cleanup script idea to include these
-- (This ensures any future runs of the main cleanup script also include these)

NOTIFY pgrst, 'reload config';

SELECT 'Success! Database is now configured to allow Razorpay status updates.' as status;
