-- Account data and orders remain in place. Keep the last deactivation time even
-- after restoration so previously issued sessions cannot regain access.
alter table public.profiles
  add column is_deleted boolean not null default false,
  add column deleted_at timestamptz,
  add column sessions_valid_after timestamptz,
  add column restoration_started_at timestamptz,
  add column deactivation_completed_at timestamptz;

-- Table-level INSERT/UPDATE would include the new security-sensitive columns.
revoke insert, update on public.profiles from authenticated;
grant insert (id, name, email, "avatarUrl", "createdAt", "updatedAt") on public.profiles to authenticated;
grant update (id, name, email, "avatarUrl", "createdAt", "updatedAt") on public.profiles to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- Even a privileged manual restore cannot revive sessions established while
-- the account was being deactivated.
create function private.record_account_restoration()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_deleted and not new.is_deleted then
    new.sessions_valid_after := clock_timestamp();
  end if;
  return new;
end;
$$;
revoke all on function private.record_account_restoration() from public, anon, authenticated;
create trigger profiles_record_account_restoration
  before update of is_deleted on public.profiles
  for each row execute function private.record_account_restoration();

-- A SECURITY DEFINER is necessary to check auth.sessions without exposing the
-- session table to clients. Arguments come only from the verified request JWT.
create function private.is_active_account_session()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.sessions s
    left join public.profiles p on p.id = s.user_id
    where s.user_id = (select auth.uid())
      and s.id::text = (select auth.jwt() ->> 'session_id')
      and coalesce(p.is_deleted, false) = false
      and (p.deleted_at is null or s.created_at > p.deleted_at)
      and (p.sessions_valid_after is null or s.created_at > p.sessions_valid_after)
  );
$$;
revoke all on function private.is_active_account_session() from public, anon, authenticated;
grant execute on function private.is_active_account_session() to authenticated;

-- Restrictive policies combine with, rather than replace, existing ownership
-- and admin policies. Anonymous product browsing remains unchanged.
create policy "Active account session required" on public.profiles as restrictive
  for all to authenticated using ((select private.is_active_account_session()))
  with check ((select private.is_active_account_session()));
create policy "Active account session required" on public.orders as restrictive
  for all to authenticated using ((select private.is_active_account_session()))
  with check ((select private.is_active_account_session()));
create policy "Active account session required" on public.cart_items as restrictive
  for all to authenticated using ((select private.is_active_account_session()))
  with check ((select private.is_active_account_session()));
create policy "Active account session required" on public.admin_users as restrictive
  for all to authenticated using ((select private.is_active_account_session()))
  with check ((select private.is_active_account_session()));
create policy "Active account session required" on public."Product" as restrictive
  for all to authenticated using ((select private.is_active_account_session()))
  with check ((select private.is_active_account_session()));

-- Only the trusted Edge Function may mark a verified caller as deactivated.
create function public.begin_account_deactivation(p_user_id uuid, p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from auth.sessions s
    left join public.profiles p on p.id = s.user_id
    where s.id = p_session_id and s.user_id = p_user_id
      and not coalesce(p.is_deleted, false)
      and (p.deleted_at is null or s.created_at > p.deleted_at)
      and (p.sessions_valid_after is null or s.created_at > p.sessions_valid_after)
  ) then
    raise exception 'Session is no longer active';
  end if;
  update public.profiles
  set is_deleted = true, deleted_at = clock_timestamp(), deactivation_completed_at = null,
      restoration_started_at = null
  where id = p_user_id and not is_deleted;
  if not found then
    raise exception 'Active profile not found';
  end if;
end;
$$;
revoke all on function public.begin_account_deactivation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.begin_account_deactivation(uuid, uuid) to service_role;

create function public.complete_account_deactivation(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set deactivation_completed_at = clock_timestamp()
  where id = p_user_id and is_deleted and deactivation_completed_at is null;
  if not found then
    raise exception 'Pending deactivation not found';
  end if;
end;
$$;
revoke all on function public.complete_account_deactivation(uuid) from public, anon, authenticated;
grant execute on function public.complete_account_deactivation(uuid) to service_role;
