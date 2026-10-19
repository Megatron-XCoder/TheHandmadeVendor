-- ==============================================================================
-- THE HANDMADE VENDOR - SECURE PASSWORD RESET RPC FUNCTION
-- Migration: 20261019_create_password_reset_rpc.sql
-- ==============================================================================

-- 1. Ensure pgcrypto extension is available in extensions schema
create extension if not exists pgcrypto with schema extensions;

-- 2. Create the secure password reset function with SECURITY DEFINER privileges
create or replace function public.reset_user_password(
  user_email text,
  new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  target_user_id uuid;
begin
  -- Search for user in auth.users by email (case-insensitive and trimmed)
  select id into target_user_id
  from auth.users
  where lower(trim(email)) = lower(trim(user_email));

  -- If no matching patron account is found, return false
  if target_user_id is null then
    return false;
  end if;

  -- Update auth.users with the new bcrypt-encrypted password and timestamp
  update auth.users
  set
    encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf', 10)),
    updated_at = now()
  where id = target_user_id;

  return true;
end;
$$;

-- 3. Grant execution permissions to public client roles
grant execute on function public.reset_user_password(text, text) to anon;
grant execute on function public.reset_user_password(text, text) to authenticated;
grant execute on function public.reset_user_password(text, text) to service_role;
