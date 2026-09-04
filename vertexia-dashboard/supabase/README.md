# Backend changes — already applied to project `tgblwvyurtavqoktygdp`

Nothing in here needs running. It is a record of what changed and why, so the
next person (or the next pass) can see the reasoning without re-deriving it.

Pull the real thing with the Supabase CLI:

```bash
supabase link --project-ref tgblwvyurtavqoktygdp
supabase db pull                                   # the four migrations below
supabase functions download invite-team-member     # the invite function
```

## Migrations

| Version | Name | What it does |
| --- | --- | --- |
| `20260904073816` | `founder_identity_and_auth_link` | Adds `team_members.is_founder`; backfills `auth_user_id` (it existed but had never been populated); adds a trigger that links an auth user to their team row on creation; adds `is_founder()`; revokes `anon` EXECUTE on `is_founder()` and `is_staff()`. |
| `20260904081544` | `founder_only_settings_pricing_and_titles` | The lockdown. Founder-only writes on `settings`, `packages`, `international_pricing`, `services`. On `team_members`: read for all staff, update only your own row, insert/delete founder-only — plus a `BEFORE UPDATE` trigger that reverts founder-controlled columns. |
| `20260904084333` | `team_member_invite_status` | Adds `invited_at` / `activated_at`; stamps activation on first sign-in; extends the column guard to cover both. |
| `20260904085105` | `normalise_team_member_emails` | Lower-cases stored addresses and adds a unique index on `lower(email)`. |

## Why a trigger and not just RLS

An RLS policy's `WITH CHECK` cannot see the **old** row, so it can gate *which
rows* you may update but not *which columns*. `guard_team_member_columns()`
fills that gap: for a non-founder it copies `role`, `email`, `departments`,
`phone`, `auth_user_id`, `is_founder`, `invited_at`, `activated_at` and
`created_at` back from `OLD`, leaving only `name` and `photo_url` writable.

It returns early when `auth.uid()` is null — that is `service_role`, `postgres`,
or an internal `SECURITY DEFINER` trigger. There is no browser caller in that
branch, because RLS already bars `anon` from updating the table at all.

## What is deliberately still open

Every other table remains `authenticated → ALL → USING (true)`. Any signed-in
team member can still read and write `invoices`, `payments`, `clients`,
`projects`, `conversations`, `messages` and `vee_clients` straight over the REST
API. That is the scope of the **next** pass, not an oversight.

Two specific things to carry into it:

- `vee_clients.instagram_access_token` is readable by any authenticated user.
  Column-level `REVOKE` would break the founder too (same Postgres role), so
  this wants the token moved to its own table or into Vault.
- `settings` has a `public` SELECT policy — the login page reads `logo_url`
  before anyone signs in, so the row is world-readable, `daily_revenue_goal` and
  `whatsapp_number` included. A narrow branding view would close it.
