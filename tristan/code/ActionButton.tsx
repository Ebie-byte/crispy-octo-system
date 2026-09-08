// Every interactive button on the site.
//
// User instructions served:
//
//  - "The standalone 'WhatsApp' / 'WhatsApp Tristan Directly' buttons (not the
//     consultation form) should skip the form entirely and open the same
//     WhatsApp number directly with just a short, generic pre-filled greeting."
//
//  - "go with the small code component importing config.ts, I want the
//     single-editable-number requirement actually met, not compromised for
//     canvas convenience."
//
//     That is why the WhatsApp buttons are this component and not plain Framer
//     link layers. A canvas link would hard-code the number into the link
//     field, giving a second place to edit and breaking the one-line promise.
//     Here the number is read from tristanConfig at render time.
//
//  - "'Book a Consultation' (both instances — hero and final CTA) opens a
//     bottom-sheet modal". Those instances use action="book", which flips the
//     shared store that ConsultationSheet listens to. No canvas wiring needed,
//     so the two triggers stay in sync automatically.
//
//  - "i cant interact or click the buttons i need to see if it goes to his
//     whatsapp and all the info" — the WhatsApp action is now a real <a href>
//     built at render time rather than a scripted window.open. A plain link
//     cannot be eaten by a pop-up blocker, works inside the Framer preview
//     iframe, and supports long-press / right-click / "open in new tab". Only
//     the booking sheet still needs JS, because its link is assembled from
//     live form values at submit time.
//
// Hover and focus are done with a real stylesheet keyed to a useId class
// rather than React state: no re-render per pointer move, and it keeps the
// component free of the state updates Framer asks to be wrapped in
// startTransition.

import { addPropertyControls, ControlType } from "framer"
import { useId } from "react"
import type { CSSProperties } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { GENERIC_GREETING, buildWhatsAppLink, openConsultationSheet, tokens } from "https://framer.com/m/tristanConfig-9QrhiB.js"
// @ts-ignore — as above.
import TristanIcon from "https://framer.com/m/TristanIcon-FhSJ0F.js"

interface ActionButtonProps {
    label: string
    action: "book" | "whatsapp" | "link"
    href: string
    variant: "filled" | "outline"
    showIcon: boolean
    minHeight: number
    style?: CSSProperties
}

/**
 * A single call-to-action.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 320
 * @framerIntrinsicHeight 56
 */
export default function ActionButton(props: ActionButtonProps) {
    const { label, action, href, variant, showIcon, minHeight, style } = props

    const rawId = useId()
    const cls = `tb${rawId.replace(/[^a-zA-Z0-9]/g, "")}`

    const filled = variant === "filled"
    const base: CSSProperties = {
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        height: "100%",
        minHeight,
        padding: "0 16px",
        margin: 0,
        border: filled ? "1px solid transparent" : `1px solid ${tokens.line}`,
        borderRadius: 0,
        background: filled ? tokens.text : "transparent",
        color: filled ? tokens.ink : tokens.text,
        fontFamily: tokens.sans,
        fontSize: 11,
        fontWeight: filled ? 600 : 500,
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        textAlign: "center",
        textDecoration: "none",
        cursor: "pointer",
        transition:
            "background-color 200ms ease, border-color 200ms ease, color 200ms ease",
        WebkitTapHighlightColor: "transparent",
        ...style,
    }

    // Hover: the filled button warms down a touch, the outline lifts its
    // border to the accent. Both stay well inside the palette.
    const hoverCss = filled
        ? `.${cls}:hover{background:${tokens.platinum} !important}`
        : `.${cls}:hover{border-color:${tokens.accent} !important;background:rgba(63,123,196,0.08) !important}`

    const focusCss = `.${cls}:focus-visible{outline:2px solid ${tokens.accent};outline-offset:2px}`

    const icon = showIcon ? (
        <TristanIcon
            name="whatsapp"
            size={16}
            color={filled ? tokens.ink : tokens.text}
        />
    ) : null

    const inner = (
        <>
            {icon}
            <span>{label}</span>
        </>
    )

    // Both link-shaped actions render an anchor. "whatsapp" builds its own
    // href from the shared number so there is still only one place to edit it.
    if (action === "link" || action === "whatsapp") {
        const target =
            action === "whatsapp"
                ? buildWhatsAppLink(GENERIC_GREETING)
                : href || undefined

        return (
            <>
                <style>{hoverCss + focusCss}</style>
                <a
                    className={cls}
                    href={target}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={base}
                >
                    {inner}
                </a>
            </>
        )
    }

    return (
        <>
            <style>{hoverCss + focusCss}</style>
            <button
                className={cls}
                type="button"
                onClick={() => openConsultationSheet()}
                style={base}
            >
                {inner}
            </button>
        </>
    )
}

ActionButton.defaultProps = {
    label: "Book a consultation",
    action: "book" as const,
    href: "",
    variant: "outline" as const,
    showIcon: false,
    minHeight: 56,
}

addPropertyControls(ActionButton, {
    label: {
        type: ControlType.String,
        title: "Label",
        defaultValue: "Book a consultation",
    },
    action: {
        type: ControlType.Enum,
        title: "Action",
        options: ["book", "whatsapp", "link"],
        optionTitles: ["Open booking sheet", "WhatsApp directly", "Open a URL"],
        defaultValue: "book",
    },
    href: {
        type: ControlType.String,
        title: "URL",
        placeholder: "https://…",
        defaultValue: "",
        hidden: (p: Partial<ActionButtonProps>) => p.action !== "link",
    },
    variant: {
        type: ControlType.Enum,
        title: "Style",
        options: ["filled", "outline"],
        optionTitles: ["Filled", "Outline"],
        defaultValue: "outline",
    },
    showIcon: {
        type: ControlType.Boolean,
        title: "WhatsApp mark",
        defaultValue: false,
    },
    minHeight: {
        type: ControlType.Number,
        title: "Min height",
        min: 32,
        max: 96,
        step: 1,
        unit: "px",
        defaultValue: 56,
    },
})
