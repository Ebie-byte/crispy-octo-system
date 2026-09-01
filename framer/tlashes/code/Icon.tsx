// Instructions: every stroke icon on the T Lashes homepage — the hero feature
// column (lash, leaf, diamond), the four-step booking bar, the About stats row,
// the footer contact rows and the button arrows. One component, one enum prop,
// so all iconography on the page stays a single consistent line weight.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties, ReactNode } from "react"

type IconName =
    | "lash"
    | "leaf"
    | "diamond"
    | "calendar"
    | "clock"
    | "heart"
    | "phone"
    | "instagram"
    | "pin"
    | "star"
    | "shield"
    | "award"
    | "arrowRight"
    | "sparkle"

interface IconProps {
    name: IconName
    size: number
    color: string
    strokeWidth: number
    style?: CSSProperties
}

// Each icon is drawn on a 24x24 grid so weights and optical sizes match.
const PATHS: Record<IconName, ReactNode> = {
    // A closed lash line — the brand mark. Lid sweep plus radiating lashes.
    lash: (
        <>
            <path d="M2.5 12.4c4.6 5.6 14.4 5.6 19 0" />
            <path d="M4.6 14.6 3 18.2" />
            <path d="M8 16.3 7.1 20.1" />
            <path d="M12 16.9V21" />
            <path d="M16 16.3l.9 3.8" />
            <path d="M19.4 14.6 21 18.2" />
        </>
    ),
    leaf: (
        <>
            <path d="M20.5 3.5c1 8.4-3.2 14.2-9.2 14.2a5 5 0 0 1-5-5c0-6 5.8-10.2 14.2-9.2Z" />
            <path d="M11 18.5c0-4.2 1.8-7.6 5.2-10.4" />
        </>
    ),
    diamond: (
        <>
            <path d="M6.2 3h11.6l3.7 6.1L12 21 2.5 9.1Z" />
            <path d="M2.5 9.1h19" />
            <path d="M9.2 3 7.4 9.1 12 21l4.6-11.9L14.8 3" />
        </>
    ),
    calendar: (
        <>
            <rect x="3.2" y="5" width="17.6" height="16" rx="2.6" />
            <path d="M3.2 10h17.6" />
            <path d="M8.2 3v4" />
            <path d="M15.8 3v4" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6.8V12l3.4 2.2" />
        </>
    ),
    heart: (
        <path d="M12 20.3s-7.7-4.6-7.7-9.8a4.4 4.4 0 0 1 7.7-2.9 4.4 4.4 0 0 1 7.7 2.9c0 5.2-7.7 9.8-7.7 9.8Z" />
    ),
    phone: (
        <path d="M15.6 21c-6 0-12.6-6.6-12.6-12.6 0-1 .3-1.8 1-2.4l1.6-1.6c.5-.5 1.2-.5 1.7 0l2.7 2.7c.5.5.5 1.2 0 1.7L8.5 9.9a13.8 13.8 0 0 0 5.6 5.6l1.1-1.5c.5-.5 1.2-.5 1.7 0l2.7 2.7c.5.5.5 1.2 0 1.7L18 20c-.6.7-1.4 1-2.4 1Z" />
    ),
    instagram: (
        <>
            <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
            <circle cx="12" cy="12" r="4.1" />
            <circle cx="17.1" cy="6.9" r="1" fill="currentColor" stroke="none" />
        </>
    ),
    pin: (
        <>
            <path d="M12 21.5s7-6.1 7-11.1a7 7 0 1 0-14 0c0 5 7 11.1 7 11.1Z" />
            <circle cx="12" cy="10.2" r="2.7" />
        </>
    ),
    star: (
        <path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9Z" />
    ),
    shield: (
        <>
            <path d="M12 21.4c4.7-1.9 7-5.4 7-10.4V5.9l-7-2.9-7 2.9V11c0 5 2.3 8.5 7 10.4Z" />
            <path d="m9 11.8 2.1 2.1 4-4.2" />
        </>
    ),
    award: (
        <>
            <circle cx="12" cy="9.2" r="6.2" />
            <path d="m8.4 14.6-1.5 6.3 5.1-2.7 5.1 2.7-1.5-6.3" />
        </>
    ),
    arrowRight: (
        <>
            <path d="M4.5 12h15" />
            <path d="m13.6 6.1 5.9 5.9-5.9 5.9" />
        </>
    ),
    sparkle: (
        <path d="M12 2.8c.8 5 3.4 7.6 8.4 8.4-5 .8-7.6 3.4-8.4 8.4-.8-5-3.4-7.6-8.4-8.4 5-.8 7.6-3.4 8.4-8.4Z" />
    ),
}

/**
 * ICON
 *
 * @framerIntrinsicWidth 24
 * @framerIntrinsicHeight 24
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Icon(props: IconProps) {
    const { name, size, color, strokeWidth, style } = props

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                ...style,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                style={{ display: "block", color }}
            >
                {PATHS[name] ?? PATHS.sparkle}
            </svg>
        </div>
    )
}

Icon.defaultProps = {
    name: "lash" as IconName,
    size: 20,
    color: "#C08A63",
    strokeWidth: 1.3,
}

addPropertyControls(Icon, {
    name: {
        type: ControlType.Enum,
        title: "Icon",
        defaultValue: "lash",
        options: [
            "lash",
            "leaf",
            "diamond",
            "calendar",
            "clock",
            "heart",
            "phone",
            "instagram",
            "pin",
            "star",
            "shield",
            "award",
            "arrowRight",
            "sparkle",
        ],
        optionTitles: [
            "Lash",
            "Leaf",
            "Diamond",
            "Calendar",
            "Clock",
            "Heart",
            "Phone",
            "Instagram",
            "Pin",
            "Star",
            "Shield",
            "Award",
            "Arrow Right",
            "Sparkle",
        ],
    },
    size: {
        type: ControlType.Number,
        title: "Size",
        defaultValue: 20,
        min: 8,
        max: 96,
        step: 1,
        unit: "px",
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#C08A63",
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Weight",
        defaultValue: 1.3,
        min: 0.5,
        max: 3,
        step: 0.1,
    },
})
