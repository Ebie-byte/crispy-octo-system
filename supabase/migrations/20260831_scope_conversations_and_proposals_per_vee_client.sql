-- APPLIED to project tgblwvyurtavqoktygdp on 2026-08-31.
--
-- conversations.instagram_user_id was globally unique. Under multi-tenancy that
-- is a live bug: one person DMing two different Vee clients would violate the
-- constraint on the second business, the webhook would throw, and that lead's
-- message would be silently dropped. Uniqueness must be per-tenant instead.
--
-- NULLS NOT DISTINCT keeps Vertexia's own conversations (vee_client_id IS NULL)
-- deduping exactly as they do today - without it, NULL != NULL and the existing
-- dedup would quietly stop working.
--
-- The partial WHERE keeps test conversations (created by vee-chat with no
-- instagram_user_id) out of the index entirely, so many of them can coexist.

alter table public.conversations
  drop constraint if exists conversations_instagram_user_id_key;

create unique index if not exists conversations_tenant_ig_user_key
  on public.conversations (vee_client_id, instagram_user_id) nulls not distinct
  where instagram_user_id is not null;

-- Let a Vee Pro client's dashboard filter quotes to their own business without
-- joining through conversations on every query.
alter table public.proposals
  add column if not exists vee_client_id uuid references public.vee_clients (id) on delete set null;

create index if not exists proposals_vee_client_id_idx
  on public.proposals (vee_client_id);

alter table public.conversations
  drop constraint if exists conversations_vee_client_id_fkey;

alter table public.conversations
  add constraint conversations_vee_client_id_fkey
  foreign key (vee_client_id) references public.vee_clients (id) on delete cascade;
