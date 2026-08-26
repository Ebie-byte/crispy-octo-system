// Cibón Bakehouse line-icon set.
// A single Icon component exposing every stroke icon used across the
// homepage: hero feature column, the service bar, the menu card badges,
// the stats row and the button arrows.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface CibonIconProps {
    name: string
    color: string
    strokeWidth: number
    style?: CSSProperties
}

const ICONS: Record<string, string[]> = {
    swirl: [
        "M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 1 0 0-17.6",
        "M12 7.6a4.4 4.4 0 1 0 4.4 4.4A2.9 2.9 0 0 0 13.5 9.1 1.9 1.9 0 0 0 11.6 11",
    ],
    leaf: [
        "M11 20.5A7.5 7.5 0 0 1 9.7 6.2C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10.5-10 10.5Z",
        "M2.5 21.5c0-3 1.9-5.4 5.1-6C10 15 12.5 13.5 13.5 12.5",
    ],
    heart: [
        "M12 20.6S3.4 15 3.4 9.2A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.6 2.8c0 5.8-8.6 11.4-8.6 11.4Z",
    ],
    truck: [
        "M2 6.5h11.5v10H2z",
        "M13.5 9.8h4L21 13.2v3.3h-7.5z",
        "M7 16.3a2 2 0 1 0 0 4 2 2 0 1 0 0-4",
        "M17.4 16.3a2 2 0 1 0 0 4 2 2 0 1 0 0-4",
    ],
    cupcake: [
        "M6.2 11.2h11.6l-1.4 8.6H7.6z",
        "M6.3 11.2c0-2 1.3-3.2 2.6-3.2S11 9 12 9s2-1 3.1-1 2.6 1.2 2.6 3.2",
        "M8.9 8c0-1.7 1.4-3.1 3.1-3.1S15.1 6.3 15.1 8",
    ],
    chefhat: [
        "M6.2 14A4.1 4.1 0 0 1 7.6 6.1 5.2 5.2 0 0 1 8.7 4.5a5.1 5.1 0 0 1 7.2 0 5.2 5.2 0 0 1 1.1 1.6A4.1 4.1 0 0 1 18.4 14v6.6H6.2Z",
        "M6.2 17.4h12.2",
    ],
    gift: [
        "M19.8 12.2v9.4H4.2v-9.4",
        "M2.6 7.4h18.8v4.8H2.6z",
        "M12 21.6V7.4",
        "M12 7.4H7.7a2.5 2.5 0 0 1 0-5.1C11.1 2.3 12 7.4 12 7.4Z",
        "M12 7.4h4.3a2.5 2.5 0 0 0 0-5.1C12.9 2.3 12 7.4 12 7.4Z",
    ],
    cup: [
        "M5.6 7.6h12.8l-1.5 12.8H7.1z",
        "M4.6 4.2h14.8v3.4H4.6z",
        "M13.8 1.6 12.6 4.2",
        "M7.4 12h9.2",
    ],
    cloche: [
        "M2.8 19.4h18.4",
        "M4 19.4c0-4.4 3.6-8 8-8s8 3.6 8 8",
        "M12 10.3v1.2",
        "M12 8.1a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 1 0 0-2.2",
    ],
    star: [
        "M12 3.6l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.1l-5.3 2.79 1.01-5.9L3.42 9.83l5.93-.86z",
    ],
    arrow: ["M4.5 12h14", "M12.8 6.3 18.5 12l-5.7 5.7"],
    bag: [
        "M4.8 7.5h14.4l-1.1 13.8H5.9z",
        "M9 9.6V6.2a3 3 0 0 1 6 0v3.4",
    ],
}

const ICON_NAMES = Object.keys(ICONS)

/**
 * A single stroke icon from the Cibón set, sized by its frame.
 *
 * @framerIntrinsicWidth 32
 * @framerIntrinsicHeight 32
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function CibonIcon(props: CibonIconProps) {
    const { name, color, strokeWidth, style } = props
    const paths = ICONS[name] ?? ICONS.swirl

    const wrapperStyle: CSSProperties = {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        ...style,
    }

    return (
        <div style={wrapperStyle}>
            <svg
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                {paths.map((d, i) => (
                    <path key={i} d={d} />
                ))}
            </svg>
        </div>
    )
}

CibonIcon.defaultProps = {
    name: "swirl",
    color: "rgba(255, 255, 255, 0.9)",
    strokeWidth: 1.1,
}

addPropertyControls(CibonIcon, {
    name: {
        type: ControlType.Enum,
        title: "Icon",
        options: ICON_NAMES,
        defaultValue: "swirl",
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "rgba(255, 255, 255, 0.9)",
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Stroke",
        min: 0.5,
        max: 3,
        step: 0.1,
        defaultValue: 1.1,
    },
})
