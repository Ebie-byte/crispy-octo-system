// Icon set for Tristan's portfolio.
//
// User instruction served: the Qualifications section is "Three items in a row
// or stacked list, each with a small icon", plus the WhatsApp mark on the
// outlined "WHATSAPP TRISTAN DIRECTLY" button.
//
// This exists as a code component rather than canvas <SVG> nodes because the
// Framer MCP's XML writer silently drops nodes created from an svg="..."
// attribute — see framer/README.md in the repo. Every icon on the page is
// therefore drawn here and inserted as a ComponentInstance.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { tokens } from "https://framer.com/m/tristanConfig-9QrhiB.js"

type IconName = "shield" | "dumbbell" | "flame" | "whatsapp" | "check" | "close"

interface TristanIconProps {
    name: IconName
    size: number
    color: string
    strokeWidth: number
    style?: CSSProperties
}

// Each entry is one or more subpaths; they are split on " M" and drawn as
// separate <path> elements so joins and caps stay clean.
const STROKE_PATHS: Record<Exclude<IconName, "whatsapp">, string> = {
    // Certification shield with a tick.
    shield: "M12 3.2 19 6v5.1c0 4.3-2.8 7.6-7 9.7-4.2-2.1-7-5.4-7-9.7V6l7-2.8Z M9 11.7l2.1 2.1 4-4.2",
    // Dumbbell: two end weights, two collars, one bar.
    dumbbell: "M4 9.5v5 M7 7.5v9 M17 7.5v9 M20 9.5v5 M7 12h10",
    // Flame.
    flame: "M12 3.5c2.6 3 4.2 5.2 4.2 7.6a4.2 4.2 0 0 1-8.4 0c0-1 .3-1.9.8-2.8.7 1 1.4 1.5 2.2 1.6-.4-2 .3-4.2 1.2-6.4Z",
    check: "M5 12.5l4.5 4.5L19 7.5",
    close: "M6 6l12 12 M18 6L6 18",
}

// WhatsApp is a filled glyph rather than a stroke, so it is kept separate.
const WHATSAPP_PATH =
    "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.23-8.24Zm-3.2 4.3c-.15 0-.4.06-.6.28-.21.22-.8.78-.8 1.9s.82 2.21.94 2.36c.11.15 1.6 2.44 3.87 3.42.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.44-.06 1.34-.55 1.53-1.08.19-.53.19-.98.13-1.08-.05-.09-.2-.15-.42-.26-.22-.11-1.34-.66-1.55-.74-.2-.07-.35-.11-.5.12-.15.22-.58.73-.71.88-.13.15-.26.17-.48.06-.22-.12-.95-.35-1.8-1.12a6.8 6.8 0 0 1-1.25-1.55c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.08-.15.04-.28-.02-.39-.05-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.42Z"

/**
 * A single icon from the site's set.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 26
 * @framerIntrinsicHeight 26
 */
export default function TristanIcon(props: TristanIconProps) {
    const { name, size, color, strokeWidth, style } = props
    const isFilled = name === "whatsapp"

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: size,
                height: size,
                ...style,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
            >
                {isFilled ? (
                    <path d={WHATSAPP_PATH} fill={color} />
                ) : (
                    STROKE_PATHS[name].split(" M").map((segment, index) => (
                        <path
                            key={index}
                            d={index === 0 ? segment : `M${segment}`}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    ))
                )}
            </svg>
        </div>
    )
}

TristanIcon.defaultProps = {
    name: "shield" as IconName,
    size: 26,
    color: tokens.accent,
    strokeWidth: 1.25,
}

addPropertyControls(TristanIcon, {
    name: {
        type: ControlType.Enum,
        title: "Icon",
        options: ["shield", "dumbbell", "flame", "whatsapp", "check", "close"],
        optionTitles: [
            "Shield (certified)",
            "Dumbbell (strength)",
            "Flame (fat loss)",
            "WhatsApp",
            "Check",
            "Close",
        ],
        defaultValue: "shield",
    },
    size: {
        type: ControlType.Number,
        title: "Size",
        min: 8,
        max: 96,
        step: 1,
        unit: "px",
        defaultValue: 26,
    },
    color: {
        type: ControlType.Color,
        title: "Colour",
        defaultValue: tokens.accent,
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Stroke",
        min: 0.5,
        max: 3,
        step: 0.05,
        defaultValue: 1.25,
    },
})
