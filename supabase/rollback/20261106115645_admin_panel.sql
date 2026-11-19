-- MANUAL COMPATIBILITY ROLLBACK, NOT A POINT-IN-TIME DATABASE RESTORE.
-- Review against a verified backup and the exact target schema before use.
-- New panel data is copied to a locked archive; edits to existing records
-- and new rows made after the migration are intentionally NOT undone.
-- The public image bucket and its objects are left intact: SQL must not delete
-- Supabase Storage objects. Remove them separately only if explicitly intended.
-- Staff memberships must first be reconciled to the pre-migration admin list:
-- the old policies treat every admin_users member as a full administrator.
begin;
lock table public.admin_users, public."Product", public.orders in access exclusive mode;
do $$
begin
  if exists (select 1 from public.admin_users where role <> 'admin') then
    raise exception 'Resolve staff memberships before rollback: old policies give all admin_users full admin access';
  end if;
  if exists (select 1 from pg_namespace where nspname = 'admin_panel_rollback_20261106115645') then
    raise exception 'Rollback archive already exists; inspect it before proceeding';
  end if;
end;
$$;

create schema admin_panel_rollback_20261106115645;
revoke all on schema admin_panel_rollback_20261106115645 from public, anon, authenticated;
create table admin_panel_rollback_20261106115645.product_metadata as
  select id, stock, category_id, images, is_active from public."Product";
create table admin_panel_rollback_20261106115645.order_metadata as
  select id, tracking_number from public.orders;
create table admin_panel_rollback_20261106115645.memberships as
  select * from public.admin_users;
create table admin_panel_rollback_20261106115645.categories as
  select * from public.product_categories;
create table admin_panel_rollback_20261106115645.settings as
  select * from public.store_settings;
create table admin_panel_rollback_20261106115645.audit_log as
  select * from public.admin_audit_log;
revoke all on all tables in schema admin_panel_rollback_20261106115645 from public, anon, authenticated;

drop trigger audit_product on public."Product";
drop trigger audit_orders on public.orders;
drop trigger validate_store_order_status on public.orders;
drop trigger audit_membership on public.admin_users;
drop trigger audit_category on public.product_categories;
drop trigger audit_store_settings on public.store_settings;
drop policy "Active products are publicly readable" on public."Product";
drop policy "Staff can read inactive products" on public."Product";
create policy "Products are publicly readable" on public."Product"
  for select to anon, authenticated using (true);
drop policy "Administrators read memberships" on public.admin_users;
drop policy "Staff upload product images" on storage.objects;
drop policy "Staff read product images" on storage.objects;
drop policy "Staff delete product images" on storage.objects;

drop function public.admin_set_access(text, text);
drop function public.admin_remove_access(uuid);
drop function public.admin_set_role(uuid, text);
drop function private.admin_set_access(text, text);
drop function private.admin_remove_access(uuid);
drop function private.admin_set_role(uuid, text);
drop function private.audit_store_change();
drop function private.validate_store_order_status();

-- Match the inspected pre-migration grants: no table-level UPDATE or DELETE,
-- and authenticated may update only orders.status. Product DELETE was absent.
revoke update on public.orders from public, anon, authenticated;
revoke update (status, tracking_number) on public.orders from public, anon, authenticated;
grant update (status) on public.orders to authenticated;
revoke delete on public."Product", public.orders from public, anon, authenticated;

alter table public."Product" drop column category_id, drop column stock, drop column images, drop column is_active;
alter table public.orders drop column tracking_number;
alter table public.admin_users drop column role;
drop table public.product_categories, public.store_settings, public.admin_audit_log;
drop function private.has_store_role(text);
commit;
