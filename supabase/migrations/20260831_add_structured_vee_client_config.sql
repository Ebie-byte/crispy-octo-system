-- APPLIED to project tgblwvyurtavqoktygdp on 2026-08-31.
--
-- Structured per-client config so each client's Vee gets a genuinely tailored
-- system prompt rather than Vertexia's own script with the name swapped in.
-- Each column maps to one distinct section of the generated prompt.
-- Purely additive; connection_status is deliberately untouched because the
-- dashboard's Draft -> Approved-Awaiting-IG-Connection -> Live pipeline owns it.

alter table public.vee_clients
  -- How this client's Vee should sound: {formality, length, emoji, notes}
  add column if not exists voice_persona jsonb not null default '{}'::jsonb,

  -- What they sell: [{name, description, price, currency, timeline}]
  add column if not exists services_offered jsonb not null default '[]'::jsonb,

  -- Enforced negotiation limits, not prose the model might paraphrase loosely:
  -- {currency, list_price_source, max_discount_percent,
  --  discount_unlocks_after_pushbacks, hard_floor_amount}
  add column if not exists negotiation_floor jsonb not null default '{}'::jsonb,

  -- Ordered list of what Vee must establish before drafting a quote
  add column if not exists qualifying_questions jsonb not null default '[]'::jsonb,

  -- Conditions that should flag human_takeover instead of letting Vee continue
  add column if not exists escalation_rules jsonb not null default '[]'::jsonb,

  -- How Vee handles "are you a bot?" for this client
  add column if not exists disclosure_policy text not null default 'if_asked',

  -- Real past work Vee may reference. Never fabricated.
  add column if not exists proof_points jsonb not null default '[]'::jsonb;

alter table public.vee_clients
  drop constraint if exists vee_clients_disclosure_policy_check;

alter table public.vee_clients
  add constraint vee_clients_disclosure_policy_check
  check (disclosure_policy in ('always', 'if_asked', 'never_volunteer'));

-- Multi-tenant routing looks clients up by the Instagram account that RECEIVED
-- the DM, on every inbound webhook event, so this lookup must be indexed and
-- must never match two rows.
create unique index if not exists vee_clients_instagram_user_id_key
  on public.vee_clients (instagram_user_id)
  where instagram_user_id is not null;
