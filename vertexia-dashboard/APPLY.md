# Applying the invite flow to the dashboard source

These are surgical edits to the `vertexia-dashboard` Vite app. That project has
no Git remote linked to its Vercel deployment, so this repo could not patch it
directly — apply these by hand, then deploy as you normally do.

Anchors below are described by **what the code looks like**, not by file path,
because these edits were derived from the production bundle rather than source.
Every anchor is quoted from your shipped build, so search for the quoted text.

The three new files live under `src/` in this folder:

| New file | Copy to |
| --- | --- |
| `src/pages/AcceptInvite.tsx` | wherever `Login` lives |
| `src/lib/access.tsx` | wherever the Supabase client lives |
| `src/components/InviteTeamMemberButton.tsx` | your components folder |

Fix the two imports at the top of each to match your actual paths
(`../lib/supabase`, `../lib/auth`).

---

## 1. Replace the "my team member" lookup

**Find** the function that currently reads (minified as `GP`):

```ts
const { data: { user } } = await supabase.auth.getUser()
const email = user?.email
if (!email) return null
const { data } = await supabase.from("team_members").select("*").eq("email", email).maybeSingle()
return data
```

**Replace** every use of it with `getMyTeamMember` exported from `lib/access.tsx`.

Why: it matched on `email`, but Supabase lower-cases auth emails while
`team_members.email` did not. `Dale4Feltman@gmail.com` would never have matched,
so Dale's profile would have silently resolved to nothing. The stored addresses
are now normalised **and** the lookup prefers `auth_user_id`, so both halves of
the bug are closed.

---

## 2. Hide Settings from the sidebar

**Find** the nav array beginning:

```ts
[{ to: "/", label: "Dashboard", icon: …, end: true }, { to: "/projects", …
```

**Add** a flag to the Settings entry only:

```ts
{ to: "/settings", label: "Settings", icon: SettingsIcon, founderOnly: true },
```

**In the sidebar component** (the one calling `useAuth()` and querying
`["my-team-member"]`), filter before rendering:

```tsx
import { useIsFounder } from "../lib/access"
// …
const { isFounder } = useIsFounder()
const visibleNav = NAV_ITEMS.filter((item) => !item.founderOnly || isFounder)
```

Then map over `visibleNav` instead of the raw array.

---

## 3. Router: guard /settings, publish /accept-invite

**Find** the route table containing `<Route path="/login" element={<Login/>} />`.

**Add** the invite route beside the other public ones — it must sit **outside**
the auth guard, because the invite link establishes its own session and the
guard would race that exchange and bounce to `/login`:

```tsx
<Route path="/accept-invite" element={<AcceptInvite />} />
```

**Move** the settings route behind the founder guard:

```tsx
import { FounderOnlyRoute } from "./lib/access"
// …
<Route element={<FounderOnlyRoute />}>
  <Route path="/settings" element={<Settings />} />
</Route>
```

Leave every other route exactly as it is. Department gating is the next pass.

---

## 4. Profile page: drop the business cards for non-founders

**Find** the Profile page, which renders four cards in a grid:

```tsx
<ProfileCard /> <ApiCreditsCard /> <ChangePasswordCard /> <PackagesCards />
```

The 2nd links to Anthropic billing and the 4th is the **full pricing editor** —
website packages and Vee pricing. Neither belongs to a team member.

```tsx
const { isFounder } = useIsFounder()
// …
<ProfileCard />
{isFounder && <ApiCreditsCard />}
<ChangePasswordCard />
{isFounder && <PackagesCards />}
```

Also drop the subtitle's second clause for non-founders — "and the packages Vee
quotes from" is meaningless once those cards are gone.

---

## 5. Profile card: role becomes read-only

**Find**, inside the profile card, the save mutation:

```ts
mutationFn: () => updateTeamMember(row.id, { name, role })
```

**Change** it to send the title only when the founder is editing:

```ts
mutationFn: () => updateTeamMember(row.id, isFounder ? { name, role } : { name })
```

**And** replace the Role `<input>` with static text for non-founders:

```tsx
{isFounder ? (
  <Field label="Role">
    <input value={role} onChange={(e) => setRole(e.target.value)} className={INPUT} />
  </Field>
) : (
  <Field label="Role">
    <div className={INPUT + " opacity-60"}>{row.role ?? "—"}</div>
    <p className="mt-1 text-xs text-subtle">Your role is set by the founder.</p>
  </Field>
)}
```

This is cosmetic only. The database reverts any change to `role`, `departments`,
`email`, `phone`, `is_founder`, `invited_at` and `activated_at` from a
non-founder regardless of what the UI sends — see the trigger in
`supabase/migrations/`. The UI change exists so the field doesn't look editable
and then silently refuse.

---

## 6. Team tab: the invite control

**Find** the Team page and, on each member card, render:

```tsx
import InviteTeamMemberButton, { inviteStatus } from "../components/InviteTeamMemberButton"
// …
const { isFounder } = useIsFounder()
const status = inviteStatus(member)
// …
<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.tone}`}>
  {status.label}
</span>
{isFounder && <InviteTeamMemberButton member={member} />}
```

Make sure the Team query selects the new columns (`select("*")` already does).

---

## Before the first invite will actually send

Confirmed sender: **`team@send.vertexiawebstudios.co.za`**. That address is now
the built-in default in the edge function, so there is **no `INVITE_FROM` secret
to set** — it only needs setting if you later want a different address.

### 1. DNS — three records at domains.co.za — done

Zone is `vertexiawebstudios.co.za`, managed at domains.co.za. **This panel wants
the full hostname in the Host field, domain suffix included** — its own existing
rows are stored that way (`www.vertexiawebstudios.co.za`, not `www`), unlike some
registrars that append the suffix for you.

| # | Type | Host / Name | Value | Priority |
| --- | --- | --- | --- | --- |
| 1 | TXT | `resend._domainkey.send.vertexiawebstudios.co.za` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8uK10smc1cPwoI59KzczAFLUIug7pGP6lVWQZfl5bsY7XRPN8/N4wDtH3yPYjT2HDTnurwNs5hy5GnS/ER0D/Z+gf0iNSgMSmfgai4fh6aylum4Jf4Ho3+r+XVvc+2Feijz4UCjLAk8xTdkZWz6TakKoXzpMKPMGZ+rZ2yLYG7wIDAQAB` | — |
| 2 | MX | `send.send.vertexiawebstudios.co.za` | `feedback-smtp.eu-west-1.amazonses.com` | `10` |
| 3 | TXT | `send.send.vertexiawebstudios.co.za` | `v=spf1 include:amazonses.com ~all` | — |

`send.send` is not a typo. The Resend domain is `send.vertexiawebstudios.co.za`
and its return-path lives at `send.` of that, so relative to the root zone the
host really is `send.send`.

All three are live in the domains.co.za zone as of this pass. Notes for anyone
redoing this on a different registrar:

- The DKIM value starts at `p=` with no `v=DKIM1; k=rsa;` prefix. Paste it
  verbatim; do not add the prefix and do not wrap it in quotes.
- Record 3 sits on the **subdomain**, so it cannot collide with any SPF record
  on `vertexiawebstudios.co.za` itself — confirmed against the live zone, which
  carries no MX or TXT on the root at all (just two `A` records and the `www`
  CNAME to Framer).
- Some registrars want the host *relative* (suffix omitted, auto-appended);
  domains.co.za wants it *full*, as above. Check which your panel expects
  before pasting these verbatim — its own existing rows tell you.

### 2. Verify in Resend — in progress

Verification was triggered from here; status was `pending` on all three records
immediately after (normal — DNS propagation, not a failure). Domain ID
`dc23c376-8b3f-46bd-b914-3674d120dddb`. Ask Claude to re-check, or Resend →
Domains → `send.vertexiawebstudios.co.za`.

### 3. Supabase redirect allow-list — done

Added under Authentication → URL Configuration → Redirect URLs:

```
https://vertexia-dashboard.vercel.app/accept-invite
```

Without this the invite link bounces rather than landing on the set-password
page.

### 4. Leaked-password protection — blocked on plan, substitute applied

Authentication → Sign In / Providers → Attack Protection → "Prevent use of
leaked passwords" is **Pro plan and above**; this project is on Free, so it
cannot be turned on as things stand.

Applied instead: Authentication → Sign In / Providers → Email → **Minimum
password length raised from 6 to 8**. `/accept-invite` already refused
anything under 8 characters client-side; the server-side floor was still 6,
so that gap is now closed even without the HaveIBeenPwned check. Revisit
leaked-password protection itself if the project ever moves to Pro.
