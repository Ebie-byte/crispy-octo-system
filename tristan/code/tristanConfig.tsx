// Shared configuration and cross-component state for Tristan's portfolio site.
//
// User instructions this file serves:
//  - "the WhatsApp number is a placeholder for now — build it as a single,
//     easily editable value (a variable/constant) so it's a one-line change
//     once Tristan's real number is confirmed, not something buried in
//     multiple places." Followed up with: "go with the small code component
//     importing config.ts, I want the single-editable-number requirement
//     actually met, not compromised for canvas convenience."
//  - "0721482950 the booking form should extract all info filled in and send
//     to this number" -> set below, converted to international format.
//  - "Should selecting a branch in the Locations section pre-fill the
//     Preferred Branch dropdown in the booking form?" -> Yes, wire it through.
//  - "use your honest wording instead ('Opening WhatsApp — press send to
//     finish')" for the post-submit state.
//
// This is primarily a shared module and intentionally uses named exports;
// every other code file on the site imports from here. It also default-exports
// a small status badge, because Framer only issues a module URL to a code file
// that exports a component — without it, nothing else could import this file.

import { addPropertyControls, ControlType } from "framer"
import { useSyncExternalStore } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// THE ONLY PLACE THE WHATSAPP NUMBER LIVES. CHANGE THIS ONE LINE.
//
// Full international format, digits only: country code + number.
// No "+", no spaces, no dashes, and drop the leading 0 of the local part.
// Tristan's number is 072 148 2950 -> 27 + 721482950 -> "27721482950".
//
// Typed as string rather than left to literal inference, so the placeholder
// check below stays a real runtime check instead of a compile-time tautology.
// ─────────────────────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER: string = "27721482950"

/** True while the shipped placeholder is still in place. */
export const WHATSAPP_NUMBER_IS_PLACEHOLDER = WHATSAPP_NUMBER === "27000000000"

/** Sent by the standalone WhatsApp buttons, which skip the form entirely. */
export const GENERIC_GREETING =
    "Hi Tristan, I'm interested in joining Planet Fitness!"

export const BRANCHES = ["Durbanville", "De Waterkant", "Plattekloof"] as const
export type Branch = (typeof BRANCHES)[number]
export const DEFAULT_BRANCH: Branch = "Durbanville"

/** Caption shown against each branch in the Locations list. */
export const BRANCH_CAPTIONS: Record<Branch, string> = {
    Durbanville: "My home branch",
    "De Waterkant": "Tuesdays & Thursdays",
    Plattekloof: "By request",
}

export interface ConsultationRequest {
    name: string
    phone: string
    email: string
    branch: string
    date: string
    time: string
    notes: string
}

export function buildWhatsAppLink(message: string): string {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Formats a booking request into the pre-filled WhatsApp message body.
 * Every field the person filled in is carried through; the optional ones are
 * omitted rather than sent blank, so Tristan never gets "Email:" on its own.
 */
export function buildRequestMessage(r: ConsultationRequest): string {
    const lines = [
        "Hi Tristan, I'd like to book a consultation.",
        "",
        `Name: ${r.name}`,
        `Phone / WhatsApp: ${r.phone}`,
    ]
    if (r.email.trim()) lines.push(`Email: ${r.email.trim()}`)
    lines.push(`Preferred branch: ${r.branch}`)
    if (r.date.trim()) lines.push(`Preferred date: ${r.date.trim()}`)
    if (r.time.trim()) lines.push(`Preferred time: ${r.time.trim()}`)
    if (r.notes.trim()) lines.push("", `Notes: ${r.notes.trim()}`)
    return lines.join("\n")
}

/**
 * Opens WhatsApp in a new tab. MUST be called synchronously from a real click
 * handler — pop-up blockers swallow deferred window.open calls. Returns false
 * when the tab was blocked so the caller can offer a fallback link.
 *
 * Note this only hands off to WhatsApp. It cannot know whether the person then
 * pressed send, which is why the success copy says "press send to finish"
 * rather than claiming the request was delivered.
 */
export function openWhatsApp(message: string): boolean {
    if (typeof window === "undefined") return false
    const tab = window.open(
        buildWhatsAppLink(message),
        "_blank",
        "noopener,noreferrer"
    )
    return Boolean(tab)
}

// ─────────────────────────────────────────────────────────────────────────────
// Cross-component state.
//
// Framer resolves imports between code files to the same module instance, so
// these stores are shared by every component importing them. That is what lets
// the Locations list on the page pre-fill the branch inside the booking sheet,
// and lets a button anywhere open that sheet, without the two having to be
// nested inside one another on the canvas.
// ─────────────────────────────────────────────────────────────────────────────

function createStore<T>(initial: T) {
    let value = initial
    const listeners = new Set<() => void>()
    return {
        get: () => value,
        set: (next: T) => {
            if (Object.is(next, value)) return
            value = next
            listeners.forEach((listener) => listener())
        },
        subscribe: (listener: () => void) => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
    }
}

const branchStore = createStore<Branch>(DEFAULT_BRANCH)
const sheetStore = createStore<boolean>(false)

export const getSelectedBranch = branchStore.get
export const setSelectedBranch = branchStore.set

export function useSelectedBranch(): Branch {
    return useSyncExternalStore(
        branchStore.subscribe,
        branchStore.get,
        () => DEFAULT_BRANCH
    )
}

export const openConsultationSheet = () => sheetStore.set(true)
export const closeConsultationSheet = () => sheetStore.set(false)

export function useConsultationSheetOpen(): boolean {
    return useSyncExternalStore(
        sheetStore.subscribe,
        sheetStore.get,
        () => false
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens, mirrored from the project's colour styles so code components
// render identically to the canvas layers around them. Keep in sync with the
// Framer colour styles /Ink /Hairline /Bone /Dim /Faint /Accent /Platinum.
// ─────────────────────────────────────────────────────────────────────────────

export const tokens = {
    ink: "#08090b",
    panel: "#0e1013",
    line: "#232730",
    text: "#f2f0eb",
    dim: "#8c8f96",
    faint: "#4d5158",
    accent: "#3f7bc4",
    platinum: "#c9cdd4",
    sans: '"Inter", "Inter Placeholder", system-ui, -apple-system, sans-serif',
    serif: '"Cormorant Garamond", "Cormorant Garamond Placeholder", Georgia, serif',
}

/**
 * Editor-side status badge. Shows at a glance which number the site is wired
 * to. Drop it on a design page during handoff; it is not meant for the live
 * site.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 320
 * @framerIntrinsicHeight 76
 */
export default function ConfigStatus(props: { style?: React.CSSProperties }) {
    const ok = !WHATSAPP_NUMBER_IS_PLACEHOLDER
    return (
        <div
            style={{
                position: "relative",
                boxSizing: "border-box",
                padding: 16,
                border: `1px solid ${ok ? tokens.line : "#7a4a24"}`,
                background: ok ? tokens.panel : "#1a1108",
                fontFamily: tokens.sans,
                ...props.style,
            }}
        >
            <div
                style={{
                    fontSize: 10,
                    letterSpacing: 2.5,
                    textTransform: "uppercase",
                    color: ok ? tokens.accent : "#d08b45",
                    marginBottom: 8,
                }}
            >
                {ok ? "WhatsApp number set" : "Placeholder number"}
            </div>
            <div style={{ fontSize: 13, color: tokens.text, fontWeight: 500 }}>
                +{WHATSAPP_NUMBER}
            </div>
            {!ok && (
                <div
                    style={{
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: tokens.dim,
                        marginTop: 6,
                    }}
                >
                    Edit WHATSAPP_NUMBER in tristanConfig.tsx — one line, used
                    everywhere.
                </div>
            )}
        </div>
    )
}

addPropertyControls(ConfigStatus, {})
