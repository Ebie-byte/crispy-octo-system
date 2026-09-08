// Demo notice for the HR approval round.
//
// User instruction served: "my client wants a demo to show his hr so it can be
// approved then he will send his images and correct detials for this."
//
// The page currently carries placeholder images AND invented figures — the
// years, client count, certification line and prices were written to match the
// original mockup, not supplied by Tristan. If this link gets forwarded inside
// Planet Fitness without that being obvious, someone could reasonably treat
// those numbers as claims Tristan is making. This bar makes the draft status
// travel with the link.
//
// TO REMOVE BEFORE LAUNCH: select the instance on the canvas and switch
// "Show banner" off. One toggle, no code change, nothing left behind.
//
// Deliberately styled OUTSIDE the site palette — amber on near-black — so it
// reads as scaffolding rather than part of the design.
//
// Dismissal is in-memory only, on purpose. It is not remembered across reloads:
// anyone opening the link fresh sees the notice, which is the entire point of
// it. Persisting the dismissal would quietly defeat that.

import { addPropertyControls, ControlType } from "framer"
import { useState } from "react"
import type { CSSProperties } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { tokens } from "https://framer.com/m/tristanConfig-9QrhiB.js"

// Just under ConsultationSheet's layer, so an open booking sheet covers this.
const LAYER = 2147482900

interface DemoBannerProps {
    enabled: boolean
    message: string
    dismissible: boolean
    style?: CSSProperties
}

/**
 * A fixed notice bar marking the page as an unapproved draft.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 40
 * @framerIntrinsicHeight 40
 */
export default function DemoBanner(props: DemoBannerProps) {
    const { enabled, message, dismissible, style } = props
    const [hidden, setHidden] = useState(false)

    if (!enabled || hidden) {
        // Still render an inert node so the canvas keeps a selectable layer.
        return (
            <div
                style={{
                    position: "relative",
                    width: 0,
                    height: 0,
                    overflow: "visible",
                    ...style,
                }}
            />
        )
    }

    return (
        <div
            style={{
                position: "relative",
                width: 0,
                height: 0,
                overflow: "visible",
                ...style,
            }}
        >
            <div
                role="status"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: LAYER,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    minHeight: 38,
                    padding: "9px 44px 9px 16px",
                    background: "#1a1206",
                    borderBottom: "1px solid #6b4a1e",
                    color: "#e0a758",
                    fontFamily: tokens.sans,
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    letterSpacing: "0.06em",
                    textAlign: "center",
                }}
            >
                <span>{message}</span>

                {dismissible && (
                    <button
                        type="button"
                        onClick={() => setHidden(true)}
                        aria-label="Dismiss notice"
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: 10,
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 26,
                            height: 26,
                            padding: 0,
                            border: "1px solid rgba(224,167,88,0.35)",
                            background: "transparent",
                            color: "#e0a758",
                            cursor: "pointer",
                        }}
                    >
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

DemoBanner.defaultProps = {
    enabled: true,
    message:
        "DEMO — placeholder photos, and sample figures not yet confirmed by Tristan. Not approved for use.",
    dismissible: true,
}

addPropertyControls(DemoBanner, {
    enabled: {
        type: ControlType.Boolean,
        title: "Show banner",
        enabledTitle: "Demo",
        disabledTitle: "Live",
        defaultValue: true,
    },
    message: {
        type: ControlType.String,
        title: "Message",
        displayTextArea: true,
        defaultValue:
            "DEMO — placeholder photos, and sample figures not yet confirmed by Tristan. Not approved for use.",
    },
    dismissible: {
        type: ControlType.Boolean,
        title: "Dismissable",
        defaultValue: true,
    },
})
