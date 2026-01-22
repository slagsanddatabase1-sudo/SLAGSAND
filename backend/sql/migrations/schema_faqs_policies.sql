-- Enable RLS (already enabled but for safety)
alter table public.faqs enable row level security;

-- Drop existing policies if any
drop policy if exists "Public Read FAQs" on public.faqs;
drop policy if exists "Admin Manage FAQs" on public.faqs;

-- Policy for anyone (including guests) to read FAQs
create policy "Public Read FAQs" on public.faqs 
for select using (true);

-- Policy for authenticated users with 'admin' role to manage FAQs
-- Note: This assumes the user's role is stored in user_roles table
create policy "Admin Manage FAQs" on public.faqs
for all 
using (
  exists (
    select 1 from public.user_roles 
    where email = auth.jwt() ->> 'email' 
    and role = 'admin'
  )
);
