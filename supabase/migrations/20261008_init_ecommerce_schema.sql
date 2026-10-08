-- ==============================================================================
-- THE HANDMADE VENDOR - POSTGRESQL E-COMMERCE DATABASE SCHEMA
-- Migration: 20261008_init_ecommerce_schema.sql
-- ==============================================================================

-- 1. PROFILES TABLE & AUTOMATIC USER TRIGGER
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for Profiles
create policy "Allow users to view own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Allow users to update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Allow users to insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Automatic Profile Creation Trigger on auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email
  )
  on conflict (id) do update
  set
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    email = coalesce(excluded.email, public.profiles.email),
    updated_at = now();
  return new;
end;
$$;

-- Drop existing trigger if present and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CART ITEMS (CROSS-DEVICE PERSISTENCE)
-- ------------------------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  title text not null,
  price numeric(10,2) not null,
  quantity integer not null default 1 check (quantity > 0),
  image text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_user_cart_product unique (user_id, product_id)
);

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);

alter table public.cart_items enable row level security;

create policy "Allow users to manage own cart items"
  on public.cart_items
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- 3. WISHLIST ITEMS (CROSS-DEVICE PERSISTENCE)
-- ------------------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  title text not null,
  price numeric(10,2) not null,
  image text,
  created_at timestamptz default now() not null,
  constraint unique_user_wishlist_product unique (user_id, product_id)
);

create index if not exists idx_wishlist_items_user_id on public.wishlist_items(user_id);

alter table public.wishlist_items enable row level security;

create policy "Allow users to manage own wishlist items"
  on public.wishlist_items
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- 4. BESPOKE ORDERS & ORDER ITEMS
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb,
  total_amount numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  status text not null default 'Processing' check (status in ('Processing', 'Artisan Crafting', 'Quality Inspection', 'Dispatched', 'Delivered', 'Cancelled')),
  payment_status text not null default 'Paid',
  tracking_number text,
  atelier_notes text,
  estimated_delivery date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_customer_email on public.orders(customer_email);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

alter table public.orders enable row level security;

create policy "Allow users to view own orders"
  on public.orders
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id or
    customer_email = (select auth.jwt()->>'email')
  );

create policy "Allow users to create orders"
  on public.orders
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id or user_id is null
  );

-- Also allow anonymous guest order creation if needed
create policy "Allow anonymous order creation"
  on public.orders
  for insert
  to anon
  with check (user_id is null);


-- 5. ORDER ITEMS
-- ------------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text not null,
  title text not null,
  price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  image text,
  created_at timestamptz default now() not null
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "Allow users to view order items for their orders"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = public.order_items.order_id
      and (o.user_id = (select auth.uid()) or o.customer_email = (select auth.jwt()->>'email'))
    )
  );

create policy "Allow insert on order items"
  on public.order_items
  for insert
  to authenticated, anon
  with check (true);


-- 6. PERMISSIONS & GRANTS
-- ------------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant all on public.cart_items to authenticated;
grant all on public.wishlist_items to authenticated;
grant select, insert on public.orders to authenticated, anon;
grant select, insert on public.order_items to authenticated, anon;
