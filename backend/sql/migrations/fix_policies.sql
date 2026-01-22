-- Allow authenticated users (e.g. Admins) to view Inquiries and Marketers
-- Currently, data is saved but cannot be viewed because RLS blocks SELECT.

-- Inquiries
drop policy if exists "Authenticated Read Inquiries" on public.inquiries;
create policy "Authenticated Read Inquiries" on public.inquiries for select using (auth.role() = 'authenticated');

-- Marketers
drop policy if exists "Authenticated Read Marketers" on public.marketers;
create policy "Authenticated Read Marketers" on public.marketers for select using (auth.role() = 'authenticated');
