# Admin panel deployment notes

The admin panel requires `migrations/20261106115645_admin_panel.sql`. The migration in this repository is **not applied to the hosted project by adding the file**. Review the target project's current schema, grants, policies, storage configuration and migration history, then apply the migration through the project's normal deployment process after approval. Test it on an isolated Supabase instance first. Do not put service-role keys, database passwords or tokens in the repository or browser.

Existing rows in `admin_users` become administrators when the migration is applied. Each person must use their own confirmed Supabase Auth account. An administrator can grant or revoke panel access in the panel. To bootstrap the first administrator if the target database has no `admin_users` row, a trusted database operator can run the following in the SQL editor after the migration, substituting the confirmed account's actual address and checking that exactly one row was returned:

```sql
insert into public.admin_users (user_id, role)
select u.id, 'admin'
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) = lower('confirmed-account@example.com')
  and u.email_confirmed_at is not null
  and not p.is_deleted
on conflict (user_id) do update set role = 'admin'
returning user_id, role;
```

The SQL editor uses privileged database access; do not expose it or a service-role key to panel users. Panel access is checked using the current membership and active session. Revoking access takes effect on subsequent database requests. A user cannot change or revoke their own role through the panel.

Run the repeatable isolated migration and permissions checks with:

```sh
npm ci
node supabase/tests/admin-panel.mjs
```

These checks use PGlite and simulated Auth and Storage tables. They test the migration and PostgreSQL permission rules without contacting hosted services; they are not an end-to-end test of Supabase Auth, PostgREST, Storage or the browser. Run the full application and authorization tests against an isolated Supabase stack before deployment.

## Operational limitations

- Existing product stock is unknown (`NULL`) until a staff member enters it; do not treat it as zero or assume an actual quantity. The storefront blocks purchase of a product while its stock is unknown, so populate stock before enabling the updated storefront. The low-stock threshold defaults to five and is editable by an administrator.
- Checkout does not atomically reserve or decrement stock. Concurrent orders can oversell, and staff must reconcile inventory manually. A server-controlled checkout and explicit cancellation/restocking rules are required before relying on these quantities for order acceptance.
- Checkout currently accepts order totals and item data from the client. It must not be treated as a trusted pricing or payment system.
- The store does not verify payments. Staff cannot set an order to `PAID` via the panel/API; historical `PAID` records remain readable. A payment integration must verify provider events server-side before asserting payment.
- The audit log records supported product, category, order, membership and settings changes after this migration, not historical actions or every Storage operation. It does not store order contents or customer addresses.
