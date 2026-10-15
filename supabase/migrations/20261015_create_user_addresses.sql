-- ==============================================================================
-- THE HANDMADE VENDOR - USER ADDRESSES TABLE WITH TAGS
-- Migration: 20261015_create_user_addresses.sql
-- ==============================================================================

-- Drop previous table if exists to start clean and prevent policy duplicate errors
drop table if exists public.user_addresses cascade;

create table public.user_addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  street text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  country_code text,
  state_code text,
  tag text not null default 'Home' check (tag in ('Default', 'Home', 'Others')),
  is_default boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_user_addresses_user_id on public.user_addresses(user_id);

alter table public.user_addresses enable row level security;

-- Policies for authenticated patrons
drop policy if exists "Allow users to view own addresses" on public.user_addresses;
create policy "Allow users to view own addresses"
  on public.user_addresses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Allow users to insert own addresses" on public.user_addresses;
create policy "Allow users to insert own addresses"
  on public.user_addresses
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Allow users to update own addresses" on public.user_addresses;
create policy "Allow users to update own addresses"
  on public.user_addresses
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Allow users to delete own addresses" on public.user_addresses;
create policy "Allow users to delete own addresses"
  on public.user_addresses
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant all on public.user_addresses to authenticated;
