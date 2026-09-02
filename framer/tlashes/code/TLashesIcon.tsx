// T Lashes line-icon set: hero feature column, the process strip, and the
// About-section stat row.
//
// The optional `ring` mode draws the disc and its hairline outline inside the
// SVG. Framer's MCP silently drops borderWidth/borderStyle/borderColor on
// Frame and Stack nodes, so a ringed icon cannot be built from a bordered
// wrapper — it has to be drawn here. (Same fix already applied to Icon.tsx;
// this file predates that fix and still relied on a bordered wrapper, so its
// three hero-feature rings were invisible.)

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface TLashesIconProps {
    name: string
    color: string
    strokeWidth: number
    ring: boolean
    ringColor: string
    discColor: string
    style?: CSSProperties
}

const ICONS: Record<string, string[]> = {
    eyelash: [
        "M3 12.5c3-3.4 6.2-5 9-5s6 1.6 9 5c-3 3.4-6.2 5-9 5s-6-1.6-9-5Z",
        "M12 7.5V4.2",
        "M8.3 8.2 6.7 5.4",
        "M15.7 8.2l1.6-2.8",
        "M5.2 10.3 2.7 8.6",
        "M18.8 10.3l2.5-1.7",
    ],
    leaf: [
        "M11 20.5A7.5 7.5 0 0 1 9.7 6.2C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10.5-10 10.5Z",
        "M2.5 21.5c0-3 1.9-5.4 5.1-6C10 15 12.5 13.5 13.5 12.5",
    ],
    diamond: [
        "M4.5 9 8.2 3.6h7.6L19.5 9 12 20.4Z",
        "M4.5 9h15",
        "M9.2 3.6 8 9l4 11.4",
        "M14.8 3.6 16 9l-4 11.4",
    ],
    calendar: [
        "M4.2 5.4h15.6v14.4H4.2z",
        "M4.2 9.4h15.6",
        "M8.2 3v3.4",
        "M15.8 3v3.4",
        "M8 13h2.2v2.2H8z",
    ],
    clock: ["M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 1 0 0-17.2", "M12 7.5V12l3.2 2"],
    heart: [
        "M12 20.6S3.4 15 3.4 9.2A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.6 2.8c0 5.8-8.6 11.4-8.6 11.4Z",
    ],
    star: [
        "M12 3.6l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.1l-5.3 2.79 1.01-5.9L3.42 9.83l5.93-.86z",
    ],
    shield: [
        "M12 3 4.8 5.6v6c0 5 3 8.4 7.2 10 4.2-1.6 7.2-5 7.2-10v-6Z",
        "M8.7 12.2l2.3 2.3 4.3-4.6",
    ],
    badge: [
        "M12 3.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 1 0 0-11.2",
        "M9.4 13.9 8 21l4-2 4 2-1.4-7.1",
    ],
    arrow: ["M4.5 12h14", "M12.8 6.3 18.5 12l-5.7 5.7"],
}

const ICON_NAMES = Object.keys(ICONS)

/**
 * A single stroke icon from the T Lashes set, sized by its frame. With
 * `ring` on, it draws a disc and hairline outline behind the glyph so the
 * whole badge — background, ring, icon — is one self-contained SVG.
 *
 * @framerIntrinsicWidth 32
 * @framerIntrinsicHeight 32
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function TLashesIcon(props: TLashesIconProps) {
    const { name, color, strokeWidth, ring, ringColor, discColor, style } = props
    const paths = ICONS[name] ?? ICONS.eyelash

    const wrapperStyle: CSSProperties = {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        ...style,
    }

    if (ring) {
        // 48-unit box: disc at the edge, glyph centred at half scale.
        return (
            <div style={wrapperStyle}>
                <svg
                    viewBox="0 0 48 48"
                    width="100%"
                    height="100%"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    <circle
                        cx="24"
                        cy="24"
                        r="23.4"
                        fill={discColor}
                        stroke={ringColor}
                        strokeWidth="1"
                    />
                    <g
                        transform="translate(12 12)"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    >
                        {paths.map((d, i) => (
                            <path key={i} d={d} />
                        ))}
                    </g>
                </svg>
            </div>
        )
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

TLashesIcon.defaultProps = {
    name: "eyelash",
    color: "rgb(182, 127, 106)",
    strokeWidth: 1.2,
    ring: false,
    ringColor: "rgba(28, 26, 25, 0.1)",
    discColor: "rgba(255, 255, 255, 0.6)",
}

addPropertyControls(TLashesIcon, {
    name: {
        type: ControlType.Enum,
        title: "Icon",
        options: ICON_NAMES,
        defaultValue: "eyelash",
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "rgb(182, 127, 106)",
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Stroke",
        min: 0.5,
        max: 3,
        step: 0.1,
        defaultValue: 1.2,
    },
    ring: {
        type: ControlType.Boolean,
        title: "Disc",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    ringColor: {
        type: ControlType.Color,
        title: "Ring",
        defaultValue: "rgba(28, 26, 25, 0.1)",
        hidden: (p) => !p.ring,
    },
    discColor: {
        type: ControlType.Color,
        title: "Disc Color",
        defaultValue: "rgba(255, 255, 255, 0.6)",
        hidden: (p) => !p.ring,
    },
})
