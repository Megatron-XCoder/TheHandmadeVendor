-- ==============================================================================
-- ADD COUNTRY AND MONOGRAM_INITIALS TO PUBLIC.PROFILES
-- Migration: 20261020_add_country_and_monogram_to_profiles.sql
-- ==============================================================================

alter table public.profiles
  add column if not exists country text default '',
  add column if not exists monogram_initials text default '';

-- Update the handle_new_user trigger to populate country and monogram_initials on sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, email, country, monogram_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'country', ''),
    coalesce(new.raw_user_meta_data->>'monogram_initials', '')
  )
  on conflict (id) do update
  set
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    email = coalesce(excluded.email, public.profiles.email),
    country = coalesce(excluded.country, public.profiles.country),
    monogram_initials = coalesce(excluded.monogram_initials, public.profiles.monogram_initials),
    updated_at = now();
  return new;
end;
$$;
