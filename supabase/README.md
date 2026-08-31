# Vee backend — multi-tenant work in progress

Supabase project `tgblwvyurtavqoktygdp`. This folder is the first time any of the
Vee backend has existed in version control — the original build lived only on a
laptop that has since died, and everything that survived did so because it had
already been deployed to Supabase.

## State as of 2026-08-31

| Piece | Status |
| --- | --- |
| Both migrations in `migrations/` | **Applied to production.** |
| `_shared/vee-tenant.ts` | Written, **not yet deployed.** |
| `instagram-webhook/index.ts` | Written, **not yet deployed.** |
| `_shared/vee-core.ts` | Unchanged, live in Supabase, **not yet in this repo** (see below). |

Nothing here is live yet. The deployed `instagram-webhook` is still the original
single-tenant version, so the Vertexia bot behaves exactly as it always has.

## Why the deploy was deliberately not done unattended

Supabase's deploy replaces *every* file in a function, so shipping the new
webhook means re-uploading `_shared/vee-core.ts` alongside it. That file carries
Vee's live sales prompt, and it is currently the single source of truth for it —
it exists only inside Supabase. Retyping it by hand into a deploy payload risks a
mangled escape sequence silently altering the prompt of the bot that is currently
handling real leads. A silent prose change is much worse than a loud crash.

Deploying also buys nothing until a tenant exists: `vee_clients` has zero rows, so
`findClientByInstagramId` always returns null and every message takes the original
Vertexia path regardless. Zero benefit now, nonzero silent risk — so it waits.

### To deploy (one supervised step)

1. Pull the current `_shared/vee-core.ts` out of Supabase and commit it here, so
   this repo holds the real thing rather than a retyped copy.
2. Deploy `instagram-webhook` with all three files: `index.ts`,
   `_shared/vee-core.ts`, `_shared/vee-tenant.ts`. Keep `verify_jwt: false` — Meta
   calls this endpoint unauthenticated and signs it instead.
3. Smoke test before trusting it:
   - `GET` with a wrong `hub.verify_token` should return **403**, not 500. A 500
     means the new module failed to load.
   - `POST` with no signature should return **403 Invalid signature**.
   - Then send a real DM to the Vertexia account and confirm the reply is
     unchanged.
4. Rollback if needed: redeploy the previous `index.ts` (version 14). It is
   recoverable from Supabase's function version history.

## How multi-tenancy works

All tenants' Instagram events arrive at the **same** webhook URL. They are told
apart by which account *received* the DM:

```
event.recipient.id  ->  vee_clients.instagram_user_id  ->  that client's row
```

- **Match** → use that client's own `instagram_access_token` to reply, and build
  their own system prompt from their structured config.
- **No match** → Vertexia's own account. Original code path, untouched.

Two things that would have broken quietly and are now handled:

- **Conversation collision.** `conversations.instagram_user_id` used to be
  globally unique, so one person DMing two different Vee clients would throw on
  the second business and drop that lead's message. Uniqueness is now per-tenant.
- **Wrong-account replies.** A connected client with a missing access token is
  skipped rather than falling through to Vertexia's token, which would otherwise
  send that business's reply from the wrong Instagram account.

## Why the prompt is built from structured fields

`business_context` alone was a single free-text blob, which is exactly what
produces a generic script with the business name swapped in. Each config column
now drives a distinct prompt section, so the *skeleton* is shared (short DM-length
replies, qualify before quoting, value before price, a hard approval gate) while
the *content* of every section is that client's own.

The negotiation floor is enforced in code (`enforceFloor`), not left to the model
to remember from prose. A quote below the floor is raised to the floor rather than
dropped, so the lead still gets an answer and the owner still sees something real
to approve.

## Still to do

- Deploy the above (see steps).
- Connect a real second Instagram Business account and test end to end — this is
  the only way to prove tenant isolation.
- WhatsApp approval ping for Starter tier: does not exist yet. It was never built
  because Vertexia's own account runs Pro, which approves via the dashboard.
  A proactive WhatsApp notification requires a Meta-approved message template.
