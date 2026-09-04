import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../lib/auth"

/**
 * AcceptInvite — where an invited team member sets their own password.
 *
 * This page is PUBLIC on purpose. The invite link carries its own credentials
 * in the URL fragment, and supabase-js exchanges them for a session on load
 * (detectSessionInUrl is on by default). Putting the route behind RequireAuth
 * would race that exchange and bounce the invitee to /login.
 *
 * The founder never passes through here and never sees the link: it is emailed
 * to the member and nowhere else. The password is set from the member's own
 * browser, by the member.
 */

type Phase = "checking" | "ready" | "invalid" | "done"

const INPUT =
  "w-full rounded-lg border border-border bg-panel-hover px-3 py-2 text-white outline-none focus:border-accent-purple"

export default function AcceptInvite() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [phase, setPhase] = useState<Phase>("checking")
  const [linkError, setLinkError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [reveal, setReveal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // An expired or already-used link comes back as an error in the fragment,
    // e.g. #error=access_denied&error_code=otp_expired. Read it before we wait
    // on a session that is never going to arrive.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const failed = hash.get("error_description") ?? hash.get("error")
    if (failed) {
      setLinkError(decodeURIComponent(failed.replace(/\+/g, " ")))
      setPhase("invalid")
      return
    }

    // Subscribe first, then check: the exchange may finish either side of this.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setPhase("ready")
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPhase("ready")
    })

    // Someone opening /accept-invite with no token at all should be told so
    // rather than left on a spinner.
    const giveUp = setTimeout(() => {
      setPhase((p) => (p === "checking" ? "invalid" : p))
    }, 6000)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(giveUp)
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return setError("Password must be at least 8 characters.")
    if (password !== confirm) return setError("Passwords don't match.")

    setSaving(true)
    setError(null)
    const { error: failed } = await updatePassword(password)
    setSaving(false)
    if (failed) return setError(failed)

    // Drop the tokens out of the address bar before we move on.
    window.history.replaceState({}, "", "/accept-invite")
    setPhase("done")
    setTimeout(() => navigate("/", { replace: true }), 1200)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-panel p-8">
        <h1 className="mb-1 text-center text-lg font-bold text-white">Vertexia Web Studios</h1>

        {phase === "checking" && (
          <p className="mt-4 text-center text-sm text-muted">Checking your invite…</p>
        )}

        {phase === "invalid" && (
          <>
            <p className="mb-4 mt-2 text-center text-sm text-muted">
              This invite link isn't valid any more.
            </p>
            <div className="mb-5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {linkError ?? "The link has expired or has already been used."}
            </div>
            <p className="text-center text-xs text-subtle">
              Ask Ebraheem to send you a new invite, then open the newest email.
            </p>
          </>
        )}

        {phase === "done" && (
          <>
            <p className="mt-2 text-center text-sm text-muted">Password set. Signing you in…</p>
          </>
        )}

        {phase === "ready" && (
          <form onSubmit={submit}>
            <p className="mb-6 mt-1 text-center text-sm text-muted">
              Choose a password for your account. Only you will know it.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <label className="mb-3 block text-sm">
              <span className="mb-1 block text-muted">New password</span>
              <div className="relative">
                <input
                  type={reveal ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT + " pr-16"}
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-subtle hover:text-white"
                >
                  {reveal ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="mb-6 block text-sm">
              <span className="mb-1 block text-muted">Confirm password</span>
              <input
                type={reveal ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={INPUT}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Set password and continue"}
            </button>

            <p className="mt-4 text-center text-xs text-subtle">
              At least 8 characters. You can change it later under Profile.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
