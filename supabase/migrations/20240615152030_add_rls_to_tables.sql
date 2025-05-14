-- Migration: Add Row Level Security (RLS) to meetings and meeting_categories tables
-- Created: 2024-06-15 15:20:30 UTC
-- Description: Enables RLS on all tables and creates policies for CRUD operations

-- enable row level security on meetings table
alter table public.meetings enable row level security;

-- create policies for meetings table
-- select policy for authenticated users
create policy "Authenticated users can view their own meetings" on public.meetings
    for select
    to authenticated
    using (auth.uid() = user_id);

-- select policy for anonymous users
create policy "Anonymous users cannot view any meetings" on public.meetings
    for select
    to anon
    using (false);

-- insert policy for authenticated users
create policy "Authenticated users can insert their own meetings" on public.meetings
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- insert policy for anonymous users
create policy "Anonymous users cannot insert meetings" on public.meetings
    for insert
    to anon
    with check (false);

-- update policy for authenticated users
create policy "Authenticated users can update their own meetings" on public.meetings
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- update policy for anonymous users
create policy "Anonymous users cannot update meetings" on public.meetings
    for update
    to anon
    using (false);

-- delete policy for authenticated users
create policy "Authenticated users can delete their own meetings" on public.meetings
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- delete policy for anonymous users
create policy "Anonymous users cannot delete meetings" on public.meetings
    for delete
    to anon
    using (false);

-- enable row level security on meeting_categories table
alter table public.meeting_categories enable row level security;

-- assuming meeting_categories are global and don't have user_id
-- create policies for meeting_categories table
-- select policy for authenticated users
create policy "Authenticated users can view all meeting categories" on public.meeting_categories
    for select
    to authenticated
    using (true);

-- select policy for anonymous users
create policy "Anonymous users can view all meeting categories" on public.meeting_categories
    for select
    to anon
    using (true);

-- insert policy for authenticated users
create policy "Authenticated users can insert meeting categories" on public.meeting_categories
    for insert
    to authenticated
    with check (true);

-- insert policy for anonymous users
create policy "Anonymous users cannot insert meeting categories" on public.meeting_categories
    for insert
    to anon
    with check (false);

-- update policy for authenticated users
create policy "Authenticated users can update meeting categories" on public.meeting_categories
    for update
    to authenticated
    using (true)
    with check (true);

-- update policy for anonymous users
create policy "Anonymous users cannot update meeting categories" on public.meeting_categories
    for update
    to anon
    using (false);

-- delete policy for authenticated users
create policy "Authenticated users can delete meeting categories" on public.meeting_categories
    for delete
    to authenticated
    using (true);

-- delete policy for anonymous users
create policy "Anonymous users cannot delete meeting categories" on public.meeting_categories
    for delete
    to anon
    using (false); 