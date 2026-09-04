# Team member invites — pass 1

Lets the four team members sign in with their own passwords, without opening up
anything that matters.

**This folder is a delivery vehicle, not the app.** The dashboard is a separate
Vite project whose Vercel deployment has no Git remote linked, so it could not
be patched directly from here. `APPLY.md` has the edits; the files under `src/`
are new and drop straight in.

## What shipped

| Layer | Status |
| --- | --- |
| Founder identity + auth linkage | **Applied** to Supabase |
| Founder-only RLS on settings, pricing, job titles | **Applied**, and tested both directions |
| `invite-team-member` edge function | **Deployed** |
| Resend sending domain | **Created**, pending your DNS |
| Frontend changes | **In this folder**, to apply by hand |

## The flow

1. Founder opens the Team tab and clicks **Send invite** on a member.
2. The edge function checks the caller is the founder, mints a single-use link,
   and emails it via Resend. **The link is never returned to the founder** — if
   it were, the founder could consume it and set the member's password, which is
   the one thing this flow exists to prevent.
3. The member lands on `/accept-invite`, sets a password, and is signed in.
4. They log in at `/login` from then on.

## What a team member cannot do

Enforced in the database, not the UI — hiding a tab in React protects nothing
while the publishable key sits in the public bundle:

- change their own job title, department, email or phone
- change anyone else's
- read or write business settings, or any pricing
- add or delete team members
- make themselves the founder

What they *can* do: set their own password, change their display name and photo.

## Not in this pass

Department-based tab visibility, and the full RLS rewrite across the other 24
tables. See `supabase/README.md` for exactly what is still open.
