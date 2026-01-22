-- COMPREHENSIVE FIX FOR PERMISSIONS
-- This script resets policies to ensure:
-- 1. Anyone (Public) can INSERT into inquiry/marketer forms.
-- 2. Authenticated users (Admins) can VIEW/DELETE data.

-- Enable RLS (Ensure it is on)
alter table public.inquiries enable row level security;
alter table public.marketers enable row level security;
alter table public.orders enable row level security;

-- ==========================================
-- 1. INQUIRIES (Contact Us, Free Sample)
-- ==========================================

-- Allow Public Insert
drop policy if exists "Public Insert Inquiries" on public.inquiries;
create policy "Public Insert Inquiries" on public.inquiries for insert with check (true);

-- Allow Authenticated Select (View)
drop policy if exists "Authenticated Read Inquiries" on public.inquiries;
create policy "Authenticated Read Inquiries" on public.inquiries for select using (auth.role() = 'authenticated');

-- Allow Authenticated Delete
drop policy if exists "Authenticated Delete Inquiries" on public.inquiries;
create policy "Authenticated Delete Inquiries" on public.inquiries for delete using (auth.role() = 'authenticated');


-- ==========================================
-- 2. MARKETERS (Become a Marketer)
-- ==========================================

-- Allow Public Insert
drop policy if exists "Public Insert Marketers" on public.marketers;
create policy "Public Insert Marketers" on public.marketers for insert with check (true);

-- Allow Authenticated Select (View)
drop policy if exists "Authenticated Read Marketers" on public.marketers;
create policy "Authenticated Read Marketers" on public.marketers for select using (auth.role() = 'authenticated');

-- Allow Authenticated Update (Approve/Reject)
drop policy if exists "Authenticated Update Marketers" on public.marketers;
create policy "Authenticated Update Marketers" on public.marketers for update using (auth.role() = 'authenticated');


-- ==========================================
-- 3. ORDERS (Ensure orders work too)
-- ==========================================

-- Allow Public Insert
drop policy if exists "Public Insert Orders" on public.orders;
create policy "Public Insert Orders" on public.orders for insert with check (true);

-- Allow Authenticated Select
drop policy if exists "Authenticated Read Orders" on public.orders;
create policy "Authenticated Read Orders" on public.orders for select using (auth.role() = 'authenticated');

-- Allow Authenticated Delete
drop policy if exists "Authenticated Delete Orders" on public.orders;
create policy "Authenticated Delete Orders" on public.orders for delete using (auth.role() = 'authenticated');
