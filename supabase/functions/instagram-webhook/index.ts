import { createClient } from "npm:@supabase/supabase-js@2"
import { logLeadMessageIfNew, runVeeTurn, sendInstagramMessage, verifyMetaSignature } from "./_shared/vee-core.ts"
import { findClientByInstagramId, runClientVeeTurn, type VeeClient } from "./_shared/vee-tenant.ts"

interface InstagramMessagingEvent {
  sender?: { id?: string }
  recipient?: { id?: string }
  timestamp?: number
  message?: { mid?: string; text?: string; is_echo?: boolean }
}

interface WebhookPayload {
  object?: string
  entry?: { id?: string; time?: number; messaging?: InstagramMessagingEvent[] }[]
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Meta's webhook verification handshake — GET with hub.mode/hub.verify_token/hub.challenge
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode")
    const token = url.searchParams.get("hub.verify_token")
    const challenge = url.searchParams.get("hub.challenge")
    if (mode === "subscribe" && token === Deno.env.get("INSTAGRAM_VERIFY_TOKEN")) {
      return new Response(challenge ?? "", { status: 200, headers: { "Content-Type": "text/plain" } })
    }
    return new Response("Forbidden", { status: 403 })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get("x-hub-signature-256") ?? ""
  const appSecret = Deno.env.get("INSTAGRAM_APP_SECRET")!

  const validSignature = await verifyMetaSignature(rawBody, signature, appSecret)
  if (!validSignature) {
    return new Response("Invalid signature", { status: 403 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response("Bad payload", { status: 400 })
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!
  const vertexiaAccessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN")!

  try {
    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        // Skip echoes of our own outbound messages — Meta delivers these too, for multi-device sync
        if (event.message?.is_echo) continue

        const text = event.message?.text
        const senderId = event.sender?.id
        const mid = event.message?.mid
        if (!text || !senderId || !mid) continue

        // Which business received this DM? All tenants' events arrive at this one
        // webhook URL, distinguished only by the recipient account id. No match
        // means it's Vertexia's own account, which keeps its original behaviour.
        const recipientId = event.recipient?.id ?? entry.id
        const client: VeeClient | null = recipientId ? await findClientByInstagramId(supabase, recipientId) : null

        // A connected client with no usable token can't be replied to. Skipping is
        // better than falling through to Vertexia's token, which would send this
        // business's reply from the wrong Instagram account.
        if (client && !client.instagram_access_token) {
          console.error("vee_client has no access token, skipping", { clientId: client.id })
          continue
        }

        const accessToken = client?.instagram_access_token ?? vertexiaAccessToken

        const now = new Date()
        const windowExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

        // Conversations are looked up per tenant: the same person may DM several
        // businesses running Vee, and those must stay separate conversations.
        const conversationLookup = () =>
          supabase.from("conversations").select("id, human_takeover").eq("instagram_user_id", senderId)
        const { data: existing } = client
          ? await conversationLookup().eq("vee_client_id", client.id).maybeSingle()
          : await conversationLookup().is("vee_client_id", null).maybeSingle()

        let conversationId: string
        let humanTakeover = false

        if (existing) {
          conversationId = existing.id
          humanTakeover = existing.human_takeover
          await supabase
            .from("conversations")
            .update({ window_expires_at: windowExpires, updated_at: now.toISOString() })
            .eq("id", conversationId)
        } else {
          // Best-effort profile lookup so the DM Inbox shows a real handle, not just the raw sender ID
          let handle = senderId
          let displayName: string | null = null
          try {
            const profileRes = await fetch(`https://graph.instagram.com/v21.0/${senderId}?fields=name,username&access_token=${accessToken}`)
            const profile = await profileRes.json()
            if (profile.username) handle = profile.username
            if (profile.name) displayName = profile.name
          } catch {
            // Non-critical — fall back to the raw sender ID as the handle
          }

          // If we already reached out to this handle first (outreach DM + mockup sent manually),
          // pull that logged context in so Vee doesn't re-introduce herself or ask redundant questions.
          // This is Vertexia's own outreach flow, so it only applies to Vertexia's account.
          let businessContext: string | null = null
          if (!client) {
            const { data: outreach } = await supabase
              .from("outreach_notes")
              .select("id, business_context")
              .eq("handle", handle.toLowerCase())
              .maybeSingle()
            if (outreach) {
              businessContext = outreach.business_context
              await supabase.from("outreach_notes").delete().eq("id", outreach.id)
            }
          }

          const { data: created, error } = await supabase
            .from("conversations")
            .insert({
              instagram_user_id: senderId,
              vee_client_id: client?.id ?? null,
              handle,
              display_name: displayName,
              business_context: businessContext,
              stage: "new_inquiry",
              is_test: false,
              window_expires_at: windowExpires,
            })
            .select("id")
            .single()
          if (error) throw error
          conversationId = created.id
        }

        // Always log the inbound message, even if a human has taken over — they need to see it in the thread.
        // Meta redelivers webhook events at-least-once, so skip entirely if we've already processed this message id.
        const isNewMessage = await logLeadMessageIfNew(supabase, conversationId, text, mid)
        if (!isNewMessage) continue

        // If a human is already handling this conversation, don't let Vee jump in over them
        if (humanTakeover) continue

        const reply = client
          ? (await runClientVeeTurn(supabase, anthropicKey, conversationId, client)).reply
          : (await runVeeTurn(supabase, anthropicKey, conversationId)).reply

        if (reply) {
          await sendInstagramMessage(accessToken, senderId, reply)
        }
      }
    }
  } catch (err) {
    // Log and still return 200 below — a 500 here would make Meta retry-storm this webhook
    console.error("instagram-webhook processing error", err)
  }

  return new Response("EVENT_RECEIVED", { status: 200 })
})
