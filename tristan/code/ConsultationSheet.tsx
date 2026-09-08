// The booking bottom-sheet: form, WhatsApp deep link, and the honest
// post-submit state.
//
// User instructions served:
//
//  - "'Book a Consultation' (both instances — hero and final CTA) opens a
//     bottom-sheet modal containing a real form: Full Name; Phone / WhatsApp
//     and Email, side by side; Preferred Branch (dropdown); Preferred Date and
//     Preferred Time, side by side; Notes (optional textarea); 'Confirm
//     Request' button."
//
//  - "On submit: build a WhatsApp deep link with all the form field values
//     inserted into the pre-filled message text, and open it in a new tab.
//     Also show an in-page success state ... as a fallback in case the
//     WhatsApp tab doesn't open."
//
//  - "the booking form should extract all info filled in and send to this
//     number" — every field is carried into the message by buildRequestMessage
//     in tristanConfig, which also holds the number.
//
//  - "use your honest wording instead ('Opening WhatsApp — press send to
//     finish')". Nothing is actually delivered on submit — we hand off to
//     WhatsApp and the person still has to press send there. The copy below
//     says so rather than claiming the request was sent.
//
//  - "Native pickers are fine for v1." Date, time and branch are real native
//     inputs; colorScheme: dark keeps their controls legible on the dark panel.
//
// POSITIONING — deliberate deviation from Framer's component guidance.
//
// Framer asks that code components never use position: fixed, and the first
// version obeyed that: the root filled a canvas Frame that was itself fixed at
// 100% x 100%. That made the sheet's size depend on whatever the parent frame
// resolved to — and it resolved to nothing. Measured in Chromium, the wrapper
// came out height: 0 and the panel collapsed to 70px with 776px of form
// scrolling inside it. That is almost certainly the "the sheet does not work"
// symptom.
//
// So the overlay now pins itself. The root renders inert at 0 x 0 and takes no
// layout space; the scrim and the centring wrapper are position: fixed against
// the viewport. The component is correct regardless of its parent's size, which
// is the property that matters for a modal.
//
// This file is covered by tristan/test/booking-flow.mjs, which drives the real
// component in Chromium: open, fill, submit, assert the wa.me URL carries every
// field, and assert the panel is actually tall enough to use.

import { addPropertyControls, ControlType } from "framer"
import { startTransition, useCallback, useEffect, useId, useRef, useState } from "react"
import type { CSSProperties, FormEvent } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { BRANCHES, buildRequestMessage, buildWhatsAppLink, closeConsultationSheet, getSelectedBranch, setSelectedBranch, tokens, useConsultationSheetOpen } from "https://framer.com/m/tristanConfig-9QrhiB.js"

type Status = "form" | "opened" | "blocked"

interface Fields {
    name: string
    phone: string
    email: string
    branch: string
    date: string
    time: string
    notes: string
}

// Above Framer's own chrome, below nothing.
const LAYER = 2147483000

const EMPTY: Fields = {
    name: "",
    phone: "",
    email: "",
    branch: "",
    date: "",
    time: "",
    notes: "",
}

interface ConsultationSheetProps {
    heading: string
    intro: string
    submitLabel: string
    style?: CSSProperties
}

/**
 * The booking sheet. Place one per page inside a fixed, full-viewport frame.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 */
export default function ConsultationSheet(props: ConsultationSheetProps) {
    const { heading, intro, submitLabel, style } = props

    const open = useConsultationSheetOpen()
    const [fields, setFields] = useState<Fields>(EMPTY)
    const [status, setStatus] = useState<Status>("form")
    const [showErrors, setShowErrors] = useState(false)

    const panelRef = useRef<HTMLDivElement | null>(null)
    const firstFieldRef = useRef<HTMLInputElement | null>(null)
    // Set once a booking has actually been handed off, so the next opening
    // starts blank instead of resurrecting the previous person's details.
    const handedOffRef = useRef(false)

    const rawId = useId()
    const cls = `cs${rawId.replace(/[^a-zA-Z0-9]/g, "")}`

    const nameOk = fields.name.trim().length > 1
    const phoneOk = fields.phone.replace(/[^0-9]/g, "").length >= 7
    const canSubmit = nameOk && phoneOk

    const close = useCallback(() => {
        startTransition(() => {
            closeConsultationSheet()
        })
    }, [])

    // Each time the sheet opens: reset to the form, and adopt whatever branch
    // the Locations list currently has selected. This is the "wire the
    // selection through" behaviour.
    useEffect(() => {
        if (!open) return
        // Read the flag now: the setFields updater below runs during a later
        // render, by which point resetting the ref would already have hidden it.
        const wasHandedOff = handedOffRef.current
        handedOffRef.current = false
        startTransition(() => {
            setStatus("form")
            setShowErrors(false)
            // Closing without submitting keeps what was typed — an accidental
            // dismissal should not cost the visitor their entries. A completed
            // booking clears, so the next one starts clean.
            setFields((prev) =>
                wasHandedOff
                    ? { ...EMPTY, branch: getSelectedBranch() }
                    : { ...prev, branch: getSelectedBranch() }
            )
        })
    }, [open])

    // Escape closes. Tab is trapped inside the panel so focus cannot wander
    // onto the page behind the overlay.
    useEffect(() => {
        if (!open) return
        if (typeof document === "undefined") return

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault()
                close()
                return
            }
            if (event.key !== "Tab") return

            const panel = panelRef.current
            if (!panel) return
            const focusables = panel.querySelectorAll<HTMLElement>(
                'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
            )
            if (focusables.length === 0) return
            const first = focusables[0]
            const last = focusables[focusables.length - 1]
            const active = document.activeElement

            if (event.shiftKey && active === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && active === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [open, close])

    // Lock the page behind the sheet so it does not scroll under the overlay.
    useEffect(() => {
        if (typeof document === "undefined") return
        if (!open) return
        const previous = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = previous
        }
    }, [open])

    // Move focus into the sheet on open.
    useEffect(() => {
        if (!open || status !== "form") return
        if (typeof window === "undefined") return
        const id = window.setTimeout(() => firstFieldRef.current?.focus(), 60)
        return () => window.clearTimeout(id)
    }, [open, status])

    // Field edits are deliberately NOT wrapped in startTransition. Controlled
    // inputs need their value applied urgently; deferring it drops keystrokes
    // under load. The non-urgent updates (open/close, status) are wrapped.
    function setField(key: keyof Fields, value: string) {
        setFields((prev) => ({ ...prev, [key]: value }))
        if (key === "branch") setSelectedBranch(value)
    }

    function openTab(message: string): boolean {
        if (typeof window === "undefined") return false
        const tab = window.open(
            buildWhatsAppLink(message),
            "_blank",
            "noopener,noreferrer"
        )
        return Boolean(tab)
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!canSubmit) {
            startTransition(() => setShowErrors(true))
            return
        }
        const message = buildRequestMessage({
            ...fields,
            branch: fields.branch || getSelectedBranch(),
        })
        // Called synchronously inside the submit handler so the pop-up blocker
        // treats it as user-initiated.
        const opened = openTab(message)
        handedOffRef.current = true
        startTransition(() => setStatus(opened ? "opened" : "blocked"))
    }

    const fallbackHref = buildWhatsAppLink(
        buildRequestMessage({
            ...fields,
            branch: fields.branch || getSelectedBranch(),
        })
    )

    const css = `
.${cls}-scrim{position:fixed;inset:0;z-index:${LAYER};background:rgba(4,5,7,0.72);opacity:0;visibility:hidden;transition:opacity 260ms ease,visibility 0s linear 300ms}
.${cls}-wrap{position:fixed;inset:0;z-index:${LAYER + 1};display:flex;justify-content:center;align-items:flex-end;padding:0;pointer-events:none;visibility:hidden;transition:visibility 0s linear 300ms}
.${cls}-panel{position:relative;box-sizing:border-box;width:100%;max-width:720px;max-height:88vh;overflow-y:auto;pointer-events:auto;background:${tokens.panel};border:1px solid ${tokens.line};border-bottom:none;padding:34px;font-family:${tokens.sans};opacity:0;transform:translateY(28px);transition:transform 360ms cubic-bezier(0.16,1,0.3,1),opacity 240ms ease}
.${cls}-on .${cls}-scrim{opacity:1;visibility:visible;transition:opacity 260ms ease}
.${cls}-on .${cls}-wrap{visibility:visible;transition:visibility 0s}
.${cls}-on .${cls}-panel{opacity:1;transform:none}
.${cls}-field{width:100%;box-sizing:border-box;background:transparent;border:1px solid ${tokens.line};border-radius:0;padding:13px 14px;color:${tokens.text};font-family:${tokens.sans};font-size:14px;font-weight:300;color-scheme:dark;transition:border-color 180ms ease}
.${cls}-field:focus{outline:none;border-color:${tokens.accent}}
.${cls}-field::placeholder{color:${tokens.faint}}
.${cls}-invalid{border-color:#a2543a}
.${cls}-row{display:flex;gap:14px}
.${cls}-row>*{flex:1;min-width:0}
@media (min-width:900px){.${cls}-wrap{align-items:center;padding:32px}.${cls}-panel{border-bottom:1px solid ${tokens.line}}}
@media (max-width:640px){.${cls}-panel{padding:22px;max-height:92vh}.${cls}-row{flex-direction:column;gap:18px}}
@media (prefers-reduced-motion:reduce){.${cls}-panel{transition:opacity 160ms ease;transform:none}}
`

    return (
        <div
            className={open ? `${cls}-on` : undefined}
            style={{
                // Inert: takes no layout space, so the frame this sits in can
                // be any size without affecting the overlay.
                position: "relative",
                width: 0,
                height: 0,
                overflow: "visible",
                ...style,
            }}
        >
            <style>{css}</style>

            <div
                className={`${cls}-scrim`}
                onClick={close}
                style={{ pointerEvents: open ? "auto" : "none" }}
            />

            <div className={`${cls}-wrap`} aria-hidden={!open}>
                <div
                    ref={panelRef}
                    className={`${cls}-panel`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={heading}
                >
                    {status === "form" ? (
                        <FormBody
                            cls={cls}
                            heading={heading}
                            intro={intro}
                            submitLabel={submitLabel}
                            fields={fields}
                            setField={setField}
                            onSubmit={handleSubmit}
                            onClose={close}
                            firstFieldRef={firstFieldRef}
                            showErrors={showErrors}
                            nameOk={nameOk}
                            phoneOk={phoneOk}
                        />
                    ) : (
                        <HandoffBody
                            cls={cls}
                            blocked={status === "blocked"}
                            href={fallbackHref}
                            onDone={close}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

// ── The form ─────────────────────────────────────────────────────────────────

function FormBody(p: {
    cls: string
    heading: string
    intro: string
    submitLabel: string
    fields: Fields
    setField: (key: keyof Fields, value: string) => void
    onSubmit: (event: FormEvent) => void
    onClose: () => void
    firstFieldRef: { current: HTMLInputElement | null }
    showErrors: boolean
    nameOk: boolean
    phoneOk: boolean
}) {
    const invalid = (ok: boolean) =>
        p.showErrors && !ok ? ` ${p.cls}-invalid` : ""

    return (
        <form onSubmit={p.onSubmit} noValidate>
            <Header cls={p.cls} onClose={p.onClose} />

            <h2
                style={{
                    margin: "18px 0 0",
                    fontFamily: tokens.serif,
                    fontWeight: 300,
                    fontSize: "clamp(28px, 6vw, 38px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.005em",
                    color: tokens.text,
                }}
            >
                {p.heading}
            </h2>
            <p
                style={{
                    margin: "10px 0 26px",
                    fontSize: 14,
                    fontWeight: 300,
                    lineHeight: 1.75,
                    color: tokens.dim,
                }}
            >
                {p.intro}
            </p>

            <Field cls={p.cls} label="Full name" required flush>
                <input
                    ref={p.firstFieldRef}
                    className={`${p.cls}-field${invalid(p.nameOk)}`}
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={p.fields.name}
                    onChange={(e) => p.setField("name", e.target.value)}
                />
            </Field>

            <div className={`${p.cls}-row`} style={{ marginTop: 18 }}>
                <Field cls={p.cls} label="Phone / WhatsApp" required flush>
                    <input
                        className={`${p.cls}-field${invalid(p.phoneOk)}`}
                        type="tel"
                        autoComplete="tel"
                        placeholder="082 123 4567"
                        value={p.fields.phone}
                        onChange={(e) => p.setField("phone", e.target.value)}
                    />
                </Field>
                <Field cls={p.cls} label="Email" flush>
                    <input
                        className={`${p.cls}-field`}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={p.fields.email}
                        onChange={(e) => p.setField("email", e.target.value)}
                    />
                </Field>
            </div>

            <div style={{ marginTop: 18 }}>
                <Field cls={p.cls} label="Preferred branch" flush>
                    <select
                        className={`${p.cls}-field`}
                        value={p.fields.branch}
                        onChange={(e) => p.setField("branch", e.target.value)}
                    >
                        {BRANCHES.map((b: string) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className={`${p.cls}-row`} style={{ marginTop: 18 }}>
                <Field cls={p.cls} label="Preferred date" flush>
                    <input
                        className={`${p.cls}-field`}
                        type="date"
                        value={p.fields.date}
                        onChange={(e) => p.setField("date", e.target.value)}
                    />
                </Field>
                <Field cls={p.cls} label="Preferred time" flush>
                    <input
                        className={`${p.cls}-field`}
                        type="time"
                        value={p.fields.time}
                        onChange={(e) => p.setField("time", e.target.value)}
                    />
                </Field>
            </div>

            <div style={{ marginTop: 18 }}>
                <Field cls={p.cls} label="Notes (optional)" flush>
                    <textarea
                        className={`${p.cls}-field`}
                        rows={3}
                        placeholder="Anything Tristan should know first?"
                        value={p.fields.notes}
                        onChange={(e) => p.setField("notes", e.target.value)}
                        style={{ resize: "vertical", minHeight: 84 }}
                    />
                </Field>
            </div>

            {p.showErrors && !(p.nameOk && p.phoneOk) && (
                <p
                    role="alert"
                    style={{
                        margin: "16px 0 0",
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: "#d08b6a",
                    }}
                >
                    Please add your name and a contact number so Tristan can
                    reply.
                </p>
            )}

            <button
                type="submit"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: 56,
                    marginTop: 26,
                    padding: "0 20px",
                    border: "1px solid transparent",
                    borderRadius: 0,
                    background: tokens.text,
                    color: tokens.ink,
                    fontFamily: tokens.sans,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                }}
            >
                {p.submitLabel}
            </button>

            <p
                style={{
                    margin: "14px 0 0",
                    fontSize: 11,
                    lineHeight: 1.65,
                    color: tokens.faint,
                    textAlign: "center",
                }}
            >
                This opens WhatsApp with your details written out. You press
                send.
            </p>
        </form>
    )
}

// ── After submit ─────────────────────────────────────────────────────────────

function HandoffBody(p: {
    cls: string
    blocked: boolean
    href: string
    onDone: () => void
}) {
    return (
        <div>
            <Header cls={p.cls} onClose={p.onDone} />

            <h2
                style={{
                    margin: "18px 0 0",
                    fontFamily: tokens.serif,
                    fontWeight: 300,
                    fontSize: "clamp(28px, 6vw, 38px)",
                    lineHeight: 1.15,
                    color: tokens.text,
                }}
            >
                {p.blocked
                    ? "Open WhatsApp to finish"
                    : "Opening WhatsApp — press send to finish"}
            </h2>

            <p
                style={{
                    margin: "12px 0 0",
                    fontSize: 14,
                    fontWeight: 300,
                    lineHeight: 1.8,
                    color: tokens.dim,
                }}
            >
                {p.blocked
                    ? "Your browser blocked the new tab. Use the button below — your details are already written into the message."
                    : "Your details are written into a WhatsApp message in the new tab. Tristan only receives it once you press send there."}
            </p>

            <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: 56,
                    marginTop: 26,
                    border: `1px solid ${tokens.line}`,
                    background: p.blocked ? tokens.text : "transparent",
                    color: p.blocked ? tokens.ink : tokens.text,
                    fontSize: 11,
                    fontWeight: p.blocked ? 600 : 500,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    boxSizing: "border-box",
                }}
            >
                {p.blocked ? "Open WhatsApp" : "Didn’t open? Try again"}
            </a>

            <button
                type="button"
                onClick={p.onDone}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: 48,
                    marginTop: 12,
                    border: "1px solid transparent",
                    background: "transparent",
                    color: tokens.dim,
                    fontFamily: tokens.sans,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                }}
            >
                Done
            </button>
        </div>
    )
}

// ── Small parts ──────────────────────────────────────────────────────────────

function Header({ cls, onClose }: { cls: string; onClose: () => void }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
            }}
        >
            <span
                style={{
                    fontSize: 10,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: tokens.accent,
                }}
            >
                Book a consultation
            </span>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    padding: 0,
                    border: `1px solid ${tokens.line}`,
                    background: "transparent",
                    color: tokens.dim,
                    cursor: "pointer",
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </div>
    )
}

function Field(p: {
    cls: string
    label: string
    required?: boolean
    flush?: boolean
    children: React.ReactNode
}) {
    return (
        <label style={{ display: "block", marginTop: p.flush ? 0 : 18 }}>
            <span
                style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 10,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: tokens.dim,
                }}
            >
                {p.label}
                {p.required ? (
                    <span style={{ color: tokens.accent }}> *</span>
                ) : null}
            </span>
            {p.children}
        </label>
    )
}

ConsultationSheet.defaultProps = {
    heading: "Book a consultation",
    intro: "Tell me what suits you and I'll confirm on WhatsApp. No obligation, no sales pitch.",
    submitLabel: "Confirm request",
}

addPropertyControls(ConsultationSheet, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Book a consultation",
    },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue:
            "Tell me what suits you and I'll confirm on WhatsApp. No obligation, no sales pitch.",
    },
    submitLabel: {
        type: ControlType.String,
        title: "Submit label",
        defaultValue: "Confirm request",
    },
})
