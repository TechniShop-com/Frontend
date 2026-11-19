-- Preserve existing administrators and make access changes effective immediately.
alter table public.admin_users add column role text not null default 'admin'
  check (role in ('admin', 'staff'));

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);
alter table public.product_categories enable row level security;
grant select on public.product_categories to anon, authenticated;
grant insert, update, delete on public.product_categories to authenticated;

create table public.store_settings (
  id boolean primary key default true check (id),
  low_stock_threshold integer not null default 5 check (low_stock_threshold between 0 and 1000)
);
insert into public.store_settings (id) values (true);
alter table public.store_settings enable row level security;
revoke all on public.store_settings from public, anon, authenticated;
grant select, update on public.store_settings to authenticated;

alter table public."Product"
  add column stock integer check (stock is null or stock >= 0),
  add column category_id uuid references public.product_categories(id) on delete set null,
  add column images text[] not null default '{}',
  add column is_active boolean not null default true;
create index product_category_id_idx on public."Product" (category_id);

alter table public.orders add column tracking_number text;
-- Product archival keeps order and cart references intact; orders remain as history.
revoke delete on public."Product", public.orders from public, anon, authenticated;
-- Table and column privileges are additive. Remove any inherited legacy
-- write grants before allowing only the two operational fields.
revoke update on public.orders from public, anon, authenticated;
revoke update (id, user_id, "customerName", email, address, "paymentMethod", "totalPrice", items, status, "createdAt", tracking_number)
  on public.orders from public, anon, authenticated;
grant update (status, tracking_number) on public.orders to authenticated;

-- Historical PAID records remain readable/editable, but store staff cannot
-- manufacture a payment confirmation or invent new fulfilment statuses.
create function private.validate_store_order_status()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null and new.status is distinct from old.status
     and new.status not in ('PENDING', 'PACKED', 'SHIPPED', 'COMPLETED', 'CANCELLED') then
    raise exception 'Invalid order status';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_store_order_status() from public, anon, authenticated;
create trigger validate_store_order_status before update of status on public.orders
  for each row execute function private.validate_store_order_status();

-- Keep audit entries small: no addresses, e-mail addresses, or order contents.
create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name text not null,
  record_id text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from public, anon, authenticated;
grant select on public.admin_audit_log to authenticated;
create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

-- These narrowly scoped private helpers avoid recursive admin_users RLS.
create function private.has_store_role(p_role text default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select private.is_active_account_session()) and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid()) and (p_role is null or a.role = p_role)
  );
$$;
revoke all on function private.has_store_role(text) from public, anon, authenticated;
grant execute on function private.has_store_role(text) to authenticated;

create policy "Administrators read memberships" on public.admin_users
  for select to authenticated using ((select private.has_store_role('admin')));
create policy "Administrators read audit history" on public.admin_audit_log
  for select to authenticated using ((select private.has_store_role('admin')));
create policy "Staff read store settings" on public.store_settings
  for select to authenticated using ((select private.has_store_role()));
create policy "Administrators update store settings" on public.store_settings
  for update to authenticated using ((select private.has_store_role('admin')))
  with check ((select private.has_store_role('admin')));

create policy "Categories are publicly readable" on public.product_categories
  for select to anon, authenticated using (true);
create policy "Staff insert categories" on public.product_categories
  for insert to authenticated with check ((select private.has_store_role()));
create policy "Staff update categories" on public.product_categories
  for update to authenticated using ((select private.has_store_role()))
  with check ((select private.has_store_role()));
create policy "Staff delete categories" on public.product_categories
  for delete to authenticated using ((select private.has_store_role()));

drop policy "Products are publicly readable" on public."Product";
create policy "Active products are publicly readable" on public."Product"
  for select to anon, authenticated using (is_active);
create policy "Staff can read inactive products" on public."Product"
  for select to authenticated using ((select private.has_store_role()));

-- The existing product, order and profile policies use membership in
-- admin_users, which now includes both roles. Only the safe status/shipping
-- columns are writable on orders; customer/order amounts remain immutable.

create function private.audit_store_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  row_data jsonb;
  entity_id text;
begin
  if (select auth.uid()) is null or not (select private.has_store_role()) then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op = 'DELETE' then row_data := to_jsonb(old); else row_data := to_jsonb(new); end if;
  entity_id := coalesce(row_data ->> 'id', row_data ->> 'user_id');
  insert into public.admin_audit_log (actor_id, action, table_name, record_id)
    values ((select auth.uid()), tg_op, tg_table_name, entity_id);
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function private.audit_store_change() from public, anon, authenticated;
create trigger audit_product after insert or update or delete on public."Product"
  for each row execute function private.audit_store_change();
create trigger audit_category after insert or update or delete on public.product_categories
  for each row execute function private.audit_store_change();
create trigger audit_orders after update on public.orders
  for each row execute function private.audit_store_change();
create trigger audit_membership after insert or update or delete on public.admin_users
  for each row execute function private.audit_store_change();
create trigger audit_store_settings after update on public.store_settings
  for each row execute function private.audit_store_change();

-- Use the verified Auth e-mail, never user-editable profile metadata, when
-- selecting an existing account. There is no public write access to roles.
create function private.admin_set_access(p_email text, p_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('technishop_admin_access'));
  if not (select private.has_store_role('admin')) then raise exception 'Access denied' using errcode = '42501'; end if;
  if p_role is null or p_role not in ('admin', 'staff') then raise exception 'Invalid role'; end if;
  select u.id into target_id from auth.users u
    join public.profiles p on p.id = u.id
    where lower(u.email) = lower(trim(p_email)) and not p.is_deleted and u.email_confirmed_at is not null;
  if target_id is null then raise exception 'Active confirmed account not found'; end if;
  if target_id = (select auth.uid()) then raise exception 'Cannot change own access'; end if;
  insert into public.admin_users (user_id, role) values (target_id, p_role)
    on conflict (user_id) do update set role = excluded.role;
end;
$$;
create function private.admin_remove_access(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('technishop_admin_access'));
  if not (select private.has_store_role('admin')) then raise exception 'Access denied' using errcode = '42501'; end if;
  if p_user_id = (select auth.uid()) then raise exception 'Cannot remove own access'; end if;
  delete from public.admin_users where user_id = p_user_id;
  if not found then raise exception 'Access not found'; end if;
end;
$$;
create function private.admin_set_role(p_user_id uuid, p_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('technishop_admin_access'));
  if not (select private.has_store_role('admin')) then raise exception 'Access denied' using errcode = '42501'; end if;
  if p_role is null or p_role not in ('admin', 'staff') then raise exception 'Invalid role'; end if;
  if p_user_id = (select auth.uid()) then raise exception 'Cannot change own access'; end if;
  update public.admin_users set role = p_role where user_id = p_user_id;
  if not found then raise exception 'Access not found'; end if;
end;
$$;
revoke all on function private.admin_set_access(text, text), private.admin_remove_access(uuid), private.admin_set_role(uuid, text) from public, anon, authenticated;
grant execute on function private.admin_set_access(text, text), private.admin_remove_access(uuid), private.admin_set_role(uuid, text) to authenticated;

create function public.admin_set_access(p_email text, p_role text)
returns void language sql security invoker set search_path = '' as $$
  select private.admin_set_access(p_email, p_role);
$$;
create function public.admin_remove_access(p_user_id uuid)
returns void language sql security invoker set search_path = '' as $$
  select private.admin_remove_access(p_user_id);
$$;
create function public.admin_set_role(p_user_id uuid, p_role text)
returns void language sql security invoker set search_path = '' as $$
  select private.admin_set_role(p_user_id, p_role);
$$;
revoke all on function public.admin_set_access(text, text), public.admin_remove_access(uuid), public.admin_set_role(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_access(text, text), public.admin_remove_access(uuid), public.admin_set_role(uuid, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('product-images', 'product-images', true, 5242880,
          array['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
create policy "Staff upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select private.has_store_role()));
create policy "Staff read product images" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and (select private.has_store_role()));
create policy "Staff delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select private.has_store_role()));
