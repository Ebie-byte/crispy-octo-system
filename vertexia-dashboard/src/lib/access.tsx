import { useQuery } from "@tanstack/react-query"
import { Navigate, Outlet } from "react-router-dom"
import { supabase } from "./supabase"

/**
 * access — who is signed in, and what that entitles them to.
 *
 * PASS 1 SCOPE. The only distinction drawn here is founder vs. everyone else.
 * Department-based tab visibility is deliberately NOT in this file yet; it is
 * the next piece of work. When it lands it belongs here, beside useIsFounder,
 * so there stays exactly one place that answers "may this person see this".
 *
 * These hooks are a CONVENIENCE, NOT A CONTROL. Anything they hide is still
 * reachable over the REST API with the publishable key, which ships in the
 * bundle. The real enforcement for settings, pricing and job titles lives in
 * RLS policies and the team_members column-guard trigger. Never rely on this
 * file alone to protect something that matters.
 */

export type TeamMember = {
  id: string
  name: string
  role: string | null
  email: string | null
  photo_url: string | null
  phone: string | null
  departments: string[]
  auth_user_id: string | null
  is_founder: boolean
  invited_at: string | null
  activated_at: string | null
}

/**
 * Resolve the signed-in user to their team_members row.
 *
 * Prefers auth_user_id, which is now populated and is the durable link. Falls
 * back to a case-insensitive email match so a row that has not been linked yet
 * still resolves (team_members.email used to be stored with mixed case).
 */
export async function getMyTeamMember(): Promise<TeamMember | null> {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return null

  const { data: byId } = await supabase
    .from("team_members")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (byId) return byId as TeamMember

  if (!user.email) return null
  const { data: byEmail } = await supabase
    .from("team_members")
    .select("*")
    .ilike("email", user.email)
    .maybeSingle()
  return (byEmail as TeamMember) ?? null
}

export function useCurrentMember() {
  return useQuery({
    queryKey: ["my-team-member"],
    queryFn: getMyTeamMember,
    staleTime: 60_000,
  })
}

/**
 * Fails closed. While the row is loading, and for any session we cannot resolve
 * to a team_members row at all, isFounder is false.
 */
export function useIsFounder() {
  const query = useCurrentMember()
  return {
    isFounder: query.data?.is_founder === true,
    loading: query.isLoading,
    member: query.data ?? null,
  }
}

/** Route wrapper for pages only the founder may open. */
export function FounderOnlyRoute() {
  const { isFounder, loading } = useIsFounder()
  if (loading) {
    return <div className="flex h-full items-center justify-center p-12 text-sm text-muted">Loading…</div>
  }
  return isFounder ? <Outlet /> : <Navigate to="/" replace />
}
