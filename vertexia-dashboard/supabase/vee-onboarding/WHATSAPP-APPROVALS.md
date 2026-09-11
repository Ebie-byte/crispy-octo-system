# WhatsApp approval routing — database layer

Applied. Provider-agnostic: `wa_message_id` holds whatever id the provider
returns, so the send and callback functions can be written against Meta Cloud
API without this table changing.

Quick-reply buttons, not free-text intent parsing. The button press settles what
the client meant; the only free text is the replacement wording after Edit, and
that lands in a known slot rather than being interpreted.

## `vee_approval_requests`

| Column | Note |
| --- | --- |
| `vee_client_id` | cascade delete with the client |
| `conversation_id` | which DM thread |
| `proposal_id` | **nullable** — most approvals are ordinary replies, not quotes |
| `draft_message` | what Vee wants to send |
| `to_whatsapp` | snapshot at send time, so changing the client's number later does not rewrite history |
| `status` | pending / sent / awaiting_edit / approved / edited / declined / expired / failed |
| `wa_message_id` | provider id, to correlate the button callback |
| `edited_message` | their replacement wording |
| `edit_requested_at` | opens the 15-minute edit slot |
| `expires_at` | **Instagram's** 24h window, not WhatsApp's — copy from `conversations.window_expires_at` |

RLS uses `is_staff()`, deliberately **not** `can_manage_vee_clients()`. A row
policy is reachable directly by anon over PostgREST, and anon is a null-uid
caller — the null-uid allowance is only safe inside a SECURITY DEFINER function
whose EXECUTE grant we control.

## Functions

`create_vee_approval_request(client, draft, conversation?, proposal?, expires_at?)`
refuses if the client has no WhatsApp number, or is not live / is paused /
is cancelled — Vee should not be drafting for them at all in those states.

`mark_vee_approval_sent(id, wa_message_id)` · `expire_stale_vee_approvals()`

`record_vee_approval_response(id, action, text?)` — action is
`approve` | `decline` | `edit` | `edit_text`.

### Read `.status` on the returned row, don't just catch errors

Two outcomes are part of the normal flow and are **returned, not raised**:

| You asked | You got back | Meaning |
| --- | --- | --- |
| `approve` | `expired` | the Instagram window closed while it sat |
| `edit_text` | `sent` | the 15-minute edit slot had lapsed; Approve still works |

This was a real bug in the first cut: those paths tried to `UPDATE` and then
`raise exception`, and the raise rolls back the update in the same transaction.
The state change never persisted, so requests stuck in `awaiting_edit` forever.
Genuine misuse (unknown action, missing row, already settled, empty text) still
raises, because there is nothing sensible to persist.

Verified: expired persists as `expired`; a lapsed edit persists as `sent` and
can then still be approved; double-settle, unknown action and drafting for a
paused client are all refused.

## Still to build

1. **Send** — edge function: render the approved template, POST to Meta Cloud
   API, then `mark_vee_approval_sent`.
2. **Callback** — edge function receiving the button press, calling
   `record_vee_approval_response`. Reuse `verifyMetaSignature` from
   `_shared/vee-core.ts`; it is the same X-Hub-Signature-256 scheme as the
   Instagram webhook.

Both are blocked on real-world setup, not code:

- **A dedicated phone number** for the sending identity. A number already on the
  normal WhatsApp or WhatsApp Business *app* cannot be used with Cloud API.
  Recipients are unaffected.
- **An approved message template** carrying the Approve/Edit quick-reply buttons.
  Messaging the client first is business-initiated, so it falls outside the free
  24-hour service window. Structure is fixed once approved; only variables change.
