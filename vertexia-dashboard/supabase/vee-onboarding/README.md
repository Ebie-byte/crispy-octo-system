# Vee onboarding — Draft/Live, Pause, Cancel

Applied to Supabase project `tgblwvyurtavqoktygdp`. Backend only; the dashboard
UI for this is still to come (see "Not done" below).

## What was already there before this pass

Worth knowing, because most of the data model existed and none of it was wired up:

- `website_inquiries` → BEFORE INSERT trigger `website_inquiry_create_draft_vee_client`
  calls `create_draft_vee_client_from_inquiry()`, which creates a `vee_clients`
  row at `lifecycle_status='draft'` from the form. **Part 1 item 1 was already done.**
- `vee_clients` already had `lifecycle_status`, `billing_status`, `is_paused`,
  `paused_at`, `cancelled_at`, `retain_until`, `dashboard_provisioned_at`.
- `pause_events` already existed, including `billing_paused` per event.
- Constraint `vee_clients_pro_requires_dashboard` already blocked a Pro client
  going live without `dashboard_provisioned_at`.

## The bug that mattered

**None of those columns were read by anything.** The DM handler picks a tenant with
a single filter:

```ts
.eq("connection_status", "connected")
```

No check on `lifecycle_status`, `is_paused` or `billing_status`. And nothing in the
codebase ever moved `lifecycle_status` off `'draft'` — `vee-client-connect` sets
`connection_status='connected'` on OAuth and touches nothing else.

Consequences before this pass:

1. A **draft** client who completed the Instagram connect step during setup would
   have started answering real customers immediately — before any review of pricing
   floor, tone, or test conversations. That is the one thing the spec says must
   never happen.
2. **Pause** and **Cancel**, once built as buttons, would have updated columns that
   no code reads. Vee would have carried on replying. Worse than not having the
   buttons, because they look like they worked.

## How it is enforced now

Rather than re-upload the DM handler (its shared `vee-core.ts` also drives
Vertexia's own live lead inbox, and this environment cannot reach supabase.co to
test a deploy), the invariant is enforced at the data layer, so the **existing**
handler's single filter becomes sufficient:

`sync_vee_connection_status()` — BEFORE INSERT OR UPDATE on `vee_clients`:

- not (live AND not paused AND not cancelled) + currently `connected` → `suspended`
- live AND not paused AND not cancelled + currently `suspended` + token present → `connected`

So `connection_status='connected'` now *means* "linked and allowed to reply".
`suspended` keeps the Instagram token intact, so Resume needs no re-OAuth.

`vee-tenant.patched.ts` in this folder is the belt-and-braces version of the same
check inside the handler. Apply and deploy it when working from real source — it is
defence in depth, not a replacement for the trigger.

## Functions added (all `is_staff()` gated, `anon` revoked)

| Function | What it does |
| --- | --- |
| `approve_vee_client_live(id)` | The only way out of draft. Checks tier/dashboard/token preconditions with readable errors first. |
| `provision_vee_client_dashboard(id)` | Sets `dashboard_provisioned_at` — the Pro prerequisite. |
| `pause_vee_client(id, pause_billing)` | Stops replies at once; logs a `pause_events` row. Billing pause is per-event, not a fixed policy. |
| `resume_vee_client(id)` | Back live, no rebuild. Never resurrects a cancelled subscription. |
| `cancel_vee_client(id, reason)` | Stops replies, `billing_status='cancelled'`, `retain_until = today + 60`, records reason. Data is kept. |

Also added: `cancel_reason` on `vee_clients` (checked against the spec's five
options), `lifecycle_status` limited to draft/live, `billing_status` to
active/paused/cancelled, `connection_status` to pending/connected/suspended/revoked.

Task-board card: `create_onboarding_task_for_vee_client()` fires AFTER INSERT on a
draft client and creates a `tasks` row titled "Review new Vee signup: {business}",
category `Ready for Review`, priority high, assigned to the founder.

## Verified

Run as the founder in a rolled-back transaction. `connection` is the column the
live DM handler reads:

| Step | lifecycle | connection | billing | retain_until | reason |
| --- | --- | --- | --- | --- | --- |
| Signup + Instagram connected | draft | **suspended** | active | — | — |
| Provisioned + approved | live | **connected** | active | — | — |
| Paused (billing too) | live | **suspended** | paused | — | — |
| Resumed | live | **connected** | active | — | — |
| Cancelled | live | **suspended** | cancelled | +60 days | too_expensive |

Also confirmed: the inquiry form populates tier/WhatsApp correctly, the task card
is created and assigned, `anon` cannot call any of the new functions, and no test
rows survived.

## Not done

- **Category system-prompt templates.** Needs the actual prompt content per
  category — not something to invent, since it is what reaches real customers.
- **The Onboarding / Pending Setups tab.** Frontend; blocked on dashboard source.
- **WhatsApp approval routing** (Part 1 item 4). No such routing config exists in
  the schema; `contact_whatsapp` is just a contact field. Needs a spec of what
  "ready-to-link but not activated" should actually store.
- **Cancel → stop the recurring invoice.** `cancel_vee_client` sets
  `billing_status='cancelled'` but does not touch `invoices`/`payments`; nothing
  links a recurring schedule to a Vee client yet.
- **The separate Vee Clients privacy/access-log spec.** Deliberately untouched.

---

## Correction: the earlier "anon revoked" claim was wrong

The first migration ran `revoke execute ... from anon`. That was a no-op. Postgres
grants EXECUTE on a new function to `PUBLIC`, and `anon` inherits it — revoking
from `anon` alone leaves the `PUBLIC` grant in place. Verified after the fact:
`has_function_privilege('anon', ..., 'EXECUTE')` was still `true` on all five.

They were never actually callable by anon — `is_staff()` in each body rejected a
null-uid caller — but the protection was one layer, not the two claimed. Now fixed
properly: revoked from `PUBLIC` and `anon`, granted to `authenticated` and
`service_role` only, and re-applied after each `CREATE OR REPLACE` (which resets
grants to the default).

## The founder had no way to call any of this

`is_staff()` is false wherever there is no JWT, which includes the Supabase SQL
editor. With no dashboard UI built, that left zero working paths to pause or
cancel a client. The guard is now `can_manage_vee_clients()`:

```sql
select auth.uid() is null or public.is_staff();
```

Null-uid means a privileged context — SQL editor, service_role, an edge function.
That is only safe *because* the grants above now stop `anon`, which is also a
null-uid caller. The two changes had to land together.

Verified, all four caller types:

| Caller | Result |
| --- | --- |
| No JWT (SQL editor) | works |
| Founder, signed in | works — pause logged, attributed to their uid |
| Signed in, not staff | blocked: "Only Vertexia staff can…" |
| anon (publishable key) | blocked: permission denied for function |

## Interim: running these before the UI exists

Supabase → SQL Editor:

```sql
select id, business_name, lifecycle_status, billing_status, is_paused
  from vee_clients order by created_at desc;

select provision_vee_client_dashboard('<id>');   -- Pro only, before approving
select approve_vee_client_live('<id>');          -- draft -> live
select pause_vee_client('<id>', true);           -- true = pause billing too
select resume_vee_client('<id>');
select cancel_vee_client('<id>', 'too_expensive');
```

## How these wire into buttons later

Every action is one `supabase.rpc()` call — no extra frontend plumbing:

| Button | Call |
| --- | --- |
| Approve & go live | `supabase.rpc('approve_vee_client_live', { client_id })` |
| Provision dashboard | `supabase.rpc('provision_vee_client_dashboard', { client_id })` |
| Pause | `supabase.rpc('pause_vee_client', { client_id, pause_billing })` |
| Resume | `supabase.rpc('resume_vee_client', { client_id })` |
| Cancel (with reason) | `supabase.rpc('cancel_vee_client', { client_id, reason })` |

Errors come back as readable sentences, so the UI can surface `error.message`
directly rather than mapping codes.

## Blocking issue for whoever builds that UI

The Vee Clients page **already has a destructive button**, and it is not Cancel:

```js
async function Rwe(e){ const {error:t} = await We.from("vee_clients").delete().eq("id",e); ... }
```

confirmed with `Remove ${business_name} from Vee Clients? This can't be undone.`

That is a hard DELETE. It destroys the row, so it bypasses the 60-day
`retain_until` retention, loses `cancel_reason`, and orphans `pause_events`. It is
reachable today by any authenticated user (`vee_clients` RLS is still ALL/true),
and it is the only stop-action on that page — so it is the button a founder would
naturally reach for when a client cancels.

**When the UI lands, that delete must be replaced by Cancel**, not sit beside it.
Optionally also block the hard delete at the database level for any client that
has ever gone live. Not applied yet — flagged rather than done, since it was not
in the agreed priority order.
