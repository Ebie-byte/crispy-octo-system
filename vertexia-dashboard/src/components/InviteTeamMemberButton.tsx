import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"
import type { TeamMember } from "../lib/access"

/**
 * InviteTeamMemberButton — founder-only control on the Team tab.
 *
 * Calls the invite-team-member edge function, which mints a single-use link and
 * emails it to the member. The link is deliberately NOT returned to us: if the
 * founder could read it, the founder could consume it and set the member's
 * password, which is the thing this whole flow exists to prevent.
 *
 * Render this only when useIsFounder().isFounder is true. That is presentation;
 * the function itself re-checks the caller server-side and refuses anyone else.
 */

/** functions.invoke hides the JSON body on non-2xx. Dig the real message out. */
async function readInvokeError(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.json()
      if (body?.error) return String(body.error)
    } catch {
      /* fall through to the generic message */
    }
  }
  return (error as Error)?.message ?? "Could not send the invite."
}

export function inviteStatus(member: TeamMember): { label: string; tone: string } {
  if (member.is_founder) return { label: "Owner", tone: "bg-accent-purple/15 text-accent-purple" }
  if (member.activated_at) return { label: "Active", tone: "bg-emerald-500/15 text-emerald-400" }
  if (member.invited_at) return { label: "Invite sent", tone: "bg-amber-500/15 text-amber-400" }
  return { label: "No account", tone: "bg-subtle/20 text-subtle" }
}

export default function InviteTeamMemberButton({ member }: { member: TeamMember }) {
  const queryClient = useQueryClient()
  const [note, setNote] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const send = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("invite-team-member", {
        body: { team_member_id: member.id },
      })
      if (error) throw new Error(await readInvokeError(error))
      if (data?.error) throw new Error(String(data.error))
      return data
    },
    onSuccess: () => {
      setFailed(false)
      setNote(`Invite emailed to ${member.email}`)
      queryClient.invalidateQueries({ queryKey: ["team-members"] })
      setTimeout(() => setNote(null), 6000)
    },
    onError: (e: Error) => {
      setFailed(true)
      setNote(e.message)
    },
  })

  if (member.is_founder) return null

  const resend = Boolean(member.invited_at)
  const done = Boolean(member.activated_at)

  return (
    <div className="mt-3">
      {!done && (
        <button
          onClick={() => send.mutate()}
          disabled={send.isPending || !member.email}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-white disabled:opacity-50"
        >
          {send.isPending ? "Sending…" : resend ? "Resend invite" : "Send invite"}
        </button>
      )}

      {!member.email && (
        <p className="mt-1 text-xs text-subtle">Add an email address before inviting.</p>
      )}

      {note && (
        <p className={`mt-2 text-xs ${failed ? "text-red-400" : "text-emerald-400"}`}>{note}</p>
      )}
    </div>
  )
}
