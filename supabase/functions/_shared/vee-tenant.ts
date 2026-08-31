import type { SupabaseClient } from "npm:@supabase/supabase-js@2"

/**
 * Multi-tenant Vee: one business, running Vee inside their own Instagram DMs.
 *
 * This module is deliberately separate from vee-core.ts. vee-core carries
 * Vertexia's own hardcoded sales prompt and has been proven against real
 * conversations - it is not edited here, so the Vertexia bot's code path stays
 * exactly as it was. Everything tenant-specific lives in this file.
 */

export interface VoicePersona {
  /** "formal" | "professional" | "warm" | "casual" */
  formality?: string
  /** "brief" | "standard" - how much room a reply may take in a DM */
  length?: string
  emoji?: boolean
  /** Anything the owner wants said about how their Vee should sound. */
  notes?: string
}

export interface Service {
  name: string
  description?: string
  price?: number
  currency?: string
  timeline?: string
}

export interface NegotiationFloor {
  currency?: string
  /** Vee may never quote below this, no matter how the conversation goes. */
  hard_floor_amount?: number
  /** Ceiling on any discount Vee offers, as a percentage of list price. */
  max_discount_percent?: number
  /** Vee holds list price until the lead has pushed back this many times. */
  discount_unlocks_after_pushbacks?: number
}

export interface VeeClient {
  id: string
  business_name: string
  tier: string
  contact_whatsapp: string | null
  business_context: string | null
  instagram_user_id: string | null
  instagram_username: string | null
  instagram_access_token: string | null
  connection_status: string
  voice_persona: VoicePersona
  services_offered: Service[]
  negotiation_floor: NegotiationFloor
  qualifying_questions: string[]
  escalation_rules: string[]
  disclosure_policy: "always" | "if_asked" | "never_volunteer"
  proof_points: string[]
}

export const VEE_CLIENT_COLUMNS =
  "id, business_name, tier, contact_whatsapp, business_context, instagram_user_id, " +
  "instagram_username, instagram_access_token, connection_status, voice_persona, " +
  "services_offered, negotiation_floor, qualifying_questions, escalation_rules, " +
  "disclosure_policy, proof_points"

/** Looks up the business that RECEIVED a DM. Returns null for Vertexia's own account. */
export async function findClientByInstagramId(
  supabase: SupabaseClient,
  instagramUserId: string
): Promise<VeeClient | null> {
  const { data, error } = await supabase
    .from("vee_clients")
    .select(VEE_CLIENT_COLUMNS)
    .eq("instagram_user_id", instagramUserId)
    .eq("connection_status", "connected")
    .maybeSingle()
  if (error) throw error
  return (data as VeeClient) ?? null
}

function formatMoney(amount: number | undefined, currency: string | undefined): string {
  if (amount === undefined || amount === null) return "price on request"
  const symbol = currency === "ZAR" ? "R" : currency === "USD" ? "$" : `${currency ?? ""} `
  return `${symbol}${amount.toLocaleString("en-US")}`
}

function describeTone(voice: VoicePersona): string {
  const parts: string[] = []

  switch (voice.formality) {
    case "formal":
      parts.push("Formal and precise. No slang, no contractions where they can be avoided.")
      break
    case "casual":
      parts.push("Casual and friendly, the way a small owner-run business actually texts. Contractions are fine.")
      break
    case "warm":
      parts.push("Warm and personable, but still clearly professional.")
      break
    default:
      parts.push("Professional and confident, warm without being casual.")
  }

  parts.push(
    voice.length === "standard"
      ? "Keep replies to two or three sentences - never a paragraph."
      : "Keep every reply to one or two sentences. This is a DM, not an email."
  )

  parts.push(
    voice.emoji
      ? "Occasional emoji are fine where they land naturally. Never more than one per message."
      : "No emoji."
  )

  if (voice.notes?.trim()) parts.push(voice.notes.trim())

  return parts.map((p) => `- ${p}`).join("\n")
}

function describeDisclosure(policy: VeeClient["disclosure_policy"], businessName: string): string {
  switch (policy) {
    case "always":
      return `Say plainly, early in a new conversation, that you are an AI assistant answering on behalf of ${businessName}. Never imply you are a person.`
    case "never_volunteer":
      return `Do not raise the subject of being an AI. If someone directly and sincerely asks whether they are speaking to a bot or an AI, answer honestly - never deny it.`
    default:
      return `Do not volunteer that you are an AI, but if someone directly asks, say so honestly and without hedging. Never deny being an AI.`
  }
}

function describeNegotiation(floor: NegotiationFloor, currency: string): string {
  const lines: string[] = []
  const unlocks = floor.discount_unlocks_after_pushbacks ?? 2

  lines.push(
    `Never discount on a lead's first objection to price. Reframe on what the work includes and what it achieves for them.`
  )

  if (floor.max_discount_percent && floor.max_discount_percent > 0) {
    lines.push(
      `Only after the lead has pushed back on price ${unlocks} time${unlocks === 1 ? "" : "s"} may you offer a discount, ` +
        `and never more than ${floor.max_discount_percent}% off the listed price. Never lead with the maximum - ` +
        `ease into a modest concession, framed as a one-time exception rather than a standing offer.`
    )
  } else {
    lines.push(
      `Prices are fixed. Do not offer a discount at any point, however many times the lead pushes back. ` +
        `Hold the line politely by explaining value, not by moving the number.`
    )
  }

  if (floor.hard_floor_amount) {
    lines.push(
      `There is an absolute floor of ${formatMoney(floor.hard_floor_amount, currency)}. ` +
        `Never name, hint at, or agree to any figure below it - decline the work instead, politely, ` +
        `explaining briefly what the price reflects.`
    )
  }

  lines.push(
    `Never invent urgency or scarcity ("only two slots left", a countdown) unless it is factually true at the time.`
  )

  return lines.map((l) => `- ${l}`).join("\n")
}

/**
 * Builds this client's own system prompt.
 *
 * The section STRUCTURE is shared across clients on purpose - it encodes what
 * actually works in a DM sales conversation (short messages, qualify before
 * quoting, value before price, a hard approval gate on quotes). The CONTENT of
 * every section comes from that client's own config, so two clients using Vee
 * do not sound alike.
 */
export function buildClientSystemPrompt(client: VeeClient): string {
  const currency = client.negotiation_floor?.currency ?? "ZAR"

  const services = (client.services_offered ?? []).length
    ? client.services_offered
        .map((s) => {
          const bits = [formatMoney(s.price, s.currency ?? currency)]
          if (s.timeline) bits.push(s.timeline)
          return `- **${s.name}** - ${bits.join(", ")}.${s.description ? ` ${s.description}` : ""}`
        })
        .join("\n")
    : "- (No services configured yet. Do not invent any. Ask what the lead needs and tell them someone will confirm details shortly.)"

  const qualifying = (client.qualifying_questions ?? []).length
    ? client.qualifying_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")
    : "1. What exactly they need\n2. Roughly when they need it"

  const escalation = (client.escalation_rules ?? []).length
    ? client.escalation_rules.map((r) => `- ${r}`).join("\n")
    : "- The lead is angry, or is raising a complaint about work already delivered\n- The request falls outside anything listed above"

  const proof = (client.proof_points ?? []).length
    ? `\n## Real work you may reference\n\nMention these only where genuinely relevant. Never embellish them, and never invent others.\n\n${client.proof_points
        .map((p) => `- ${p}`)
        .join("\n")}\n`
    : ""

  const context = client.business_context?.trim()
    ? `\n## About the business\n\n${client.business_context.trim()}\n`
    : ""

  return `# Vee - Instagram DM assistant for ${client.business_name}

## Identity

You are Vee, answering Instagram DMs on behalf of **${client.business_name}**. You
speak as a capable member of their team - not as a third party, and never as a
representative of any agency or platform. The business is "we"; you never refer
to ${client.business_name} in the third person to their own customers.

${describeDisclosure(client.disclosure_policy, client.business_name)}
${context}
## How you sound

${describeTone(client.voice_persona ?? {})}

Write like a real business replying on their phone. Say one thing well, then let
the customer respond. If a point needs more room, split it across two short
messages rather than sending one long one.

## What ${client.business_name} offers

Never invent a service, a price, or a timeline that is not listed here. If
someone asks about something not on this list, say you will check and come back
to them rather than guessing.

${services}

## What to establish before quoting

Work through these naturally, as a conversation rather than an interrogation.
Skip anything the customer has already told you, and mirror their own words back
when you confirm what you have understood - it shows you were listening.

${qualifying}

Build agreement on what they actually need before any number comes up. A price
lands very differently once someone has already said out loud what the problem is
costing them.

## Price and negotiation

${describeNegotiation(client.negotiation_floor ?? {}, currency)}

## Drafting a quote - and the approval gate

Once you know what they need and roughly when, call draft_quote. Do not call it
on a hunch, and do not quote a firm total in the conversation before you call it.

**A drafted quote is never sent to the customer automatically.** It goes to
${client.business_name} for approval first, every time, without exception. So when
you call draft_quote, tell the customer a quote is being put together and will
come through shortly - never tell them it is confirmed, agreed, booked, or on its
way, and never promise a date or a total that has not been approved yet.

## When to stop and hand over to a human

Stop replying and hand the conversation over if any of these come up:

${escalation}

To hand over, say plainly that you are passing this to the team and someone will
come back to them - then stop. Do not keep negotiating past that point.
${proof}`
}

export const DRAFT_QUOTE_TOOL = {
  name: "draft_quote",
  description:
    "Call this once you know what the customer needs and roughly when they need it, and are ready to put a price to it. " +
    "This drafts a quote for the business owner to approve - it does NOT send anything to the customer. " +
    "Only quote services that appear in the configured service list.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "One sentence on what the customer needs." },
      service_name: { type: "string", description: "Must match one of the configured services." },
      amount: { type: "number", description: "The total being quoted, in the business's currency." },
      timeline: { type: "string", description: "When the work would be delivered, e.g. '2 weeks'." },
      key_requirements: { type: "array", items: { type: "string" } },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
    },
    required: ["summary", "service_name", "amount", "key_requirements", "confidence"],
  },
}

/**
 * The negotiation floor is enforced here, in code, rather than trusted to the
 * model to remember correctly from a paragraph of prose. A quote below the floor
 * is raised to the floor rather than dropped, so the lead still gets a real
 * answer and the owner still sees something to approve.
 */
export function enforceFloor(amount: number, floor: NegotiationFloor): { amount: number; clamped: boolean } {
  const hardFloor = floor?.hard_floor_amount
  if (typeof hardFloor === "number" && amount < hardFloor) {
    return { amount: hardFloor, clamped: true }
  }
  return { amount, clamped: false }
}

export interface TenantTurnResult {
  reply: string
  quoteDrafted: boolean
  floorClamped: boolean
}

/**
 * Runs one turn of a tenant's Vee. Mirrors runVeeTurn in vee-core.ts, but builds
 * the system prompt from the client's own config and drafts quotes against their
 * own services rather than Vertexia's packages table.
 */
export async function runClientVeeTurn(
  supabase: SupabaseClient,
  anthropicKey: string,
  conversationId: string,
  client: VeeClient
): Promise<TenantTurnResult> {
  const { data: history } = await supabase
    .from("messages")
    .select("sender, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  const claudeMessages = (history ?? []).map((m: { sender: string; content: string }) => ({
    role: m.sender === "lead" ? "user" : "assistant",
    content: m.content,
  }))

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system: buildClientSystemPrompt(client),
      tools: [DRAFT_QUOTE_TOOL],
      messages: claudeMessages,
    }),
  })
  const claudeData = await claudeRes.json()
  if (!claudeRes.ok) throw new Error(claudeData.error?.message ?? "Claude API error")

  const textBlock = claudeData.content?.find((b: { type: string }) => b.type === "text")
  const toolBlock = claudeData.content?.find((b: { type: string }) => b.type === "tool_use")

  let quoteDrafted = false
  let floorClamped = false
  let botReply = textBlock?.text ?? ""

  if (toolBlock?.name === "draft_quote") {
    const input = toolBlock.input as {
      summary: string
      service_name: string
      amount: number
      timeline?: string
      key_requirements: string[]
    }

    const floor = client.negotiation_floor ?? {}
    const { amount, clamped } = enforceFloor(Number(input.amount), floor)
    floorClamped = clamped

    await supabase.from("proposals").insert({
      conversation_id: conversationId,
      vee_client_id: client.id,
      title: `${client.business_name} - ${input.service_name}`,
      status: "draft",
      amount,
      currency: floor.currency ?? "ZAR",
      timeline: input.timeline ?? null,
      scope: input.key_requirements ?? [],
    })
    await supabase.from("conversations").update({ stage: "awaiting_approval" }).eq("id", conversationId)
    quoteDrafted = true

    if (!botReply) {
      botReply = "Thank you - that gives me what I need. Let me put a quote together and come back to you shortly."
    }
  }

  if (botReply) {
    await supabase.from("messages").insert({ conversation_id: conversationId, sender: "bot", content: botReply })
  }

  return { reply: botReply, quoteDrafted, floorClamped }
}
