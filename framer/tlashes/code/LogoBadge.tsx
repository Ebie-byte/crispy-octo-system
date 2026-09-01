// Instructions: the circular "T LASHES / BY TANITH LEE" logo badge used in the
// header (dark type on white) and in the footer (white type on the dark band).
// Ring lettering follows the circle via SVG textPath; the centre holds a lash
// mark over a Parisienne "TL" monogram with a hairline flourish beneath.

import { addPropertyControls, ControlType } from "framer"
import { useId } from "react"
import type { CSSProperties } from "react"

interface LogoBadgeProps {
    ringWordOne: string
    ringWordTwo: string
    monogram: string
    ink: string
    ring: string
    fill: string
    showFill: boolean
    style?: CSSProperties
}

/**
 * LOGO BADGE
 *
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 120
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function LogoBadge(props: LogoBadgeProps) {
    const { ringWordOne, ringWordTwo, monogram, ink, ring, fill, showFill, style } =
        props

    // useId keeps the two textPath references unique when the badge appears
    // more than once on a page (header + footer).
    const uid = useId().replace(/:/g, "")
    const topArc = `topArc-${uid}`
    const bottomArc = `bottomArc-${uid}`

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...style,
            }}
        >
            <svg
                viewBox="0 0 120 120"
                width="100%"
                height="100%"
                fill="none"
                role="img"
                aria-label={`${ringWordOne} ${ringWordTwo}`}
                style={{ display: "block", overflow: "visible" }}
            >
                <defs>
                    {/* Arcs are drawn, never stroked — they only carry type. */}
                    <path
                        id={topArc}
                        d="M 16 60 A 44 44 0 0 1 104 60"
                        fill="none"
                    />
                    <path
                        id={bottomArc}
                        d="M 20.5 60 A 39.5 39.5 0 0 0 99.5 60"
                        fill="none"
                    />
                </defs>

                {showFill && <circle cx="60" cy="60" r="59" fill={fill} />}
                <circle cx="60" cy="60" r="59" stroke={ring} strokeWidth="1" />

                <text
                    fill={ink}
                    style={{
                        fontFamily:
                            "Montserrat, 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: "9px",
                        fontWeight: 500,
                        letterSpacing: "2.6px",
                    }}
                >
                    <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
                        {ringWordOne}
                    </textPath>
                </text>

                <text
                    fill={ink}
                    style={{
                        fontFamily:
                            "Montserrat, 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: "7.5px",
                        fontWeight: 500,
                        letterSpacing: "2.2px",
                    }}
                >
                    <textPath
                        href={`#${bottomArc}`}
                        startOffset="50%"
                        textAnchor="middle"
                    >
                        {ringWordTwo}
                    </textPath>
                </text>

                {/* Lash mark: a lid sweep with lashes, sitting above the monogram. */}
                <g
                    stroke={ink}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    fill="none"
                >
                    <path d="M42 50c6.5 7 29.5 7 36 0" />
                    <path d="M47.5 54.6 45.4 59" />
                    <path d="M54.5 57 53.6 61.6" />
                    <path d="M62 57.4 62.6 62" />
                    <path d="M69.5 55.2 71.6 59.4" />
                </g>

                <text
                    x="60"
                    y="84"
                    textAnchor="middle"
                    fill={ink}
                    style={{
                        fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                        fontSize: "27px",
                    }}
                >
                    {monogram}
                </text>

                <path
                    d="M40 90c8 4.5 32 4.5 40 0"
                    stroke={ink}
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.75"
                />
            </svg>
        </div>
    )
}

LogoBadge.defaultProps = {
    ringWordOne: "T LASHES",
    ringWordTwo: "BY TANITH LEE",
    monogram: "TL",
    ink: "#1C1714",
    ring: "#1C1714",
    fill: "#FFFFFF",
    showFill: true,
}

addPropertyControls(LogoBadge, {
    ringWordOne: { type: ControlType.String, title: "Top", defaultValue: "T LASHES" },
    ringWordTwo: {
        type: ControlType.String,
        title: "Bottom",
        defaultValue: "BY TANITH LEE",
    },
    monogram: { type: ControlType.String, title: "Monogram", defaultValue: "TL" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#1C1714" },
    ring: { type: ControlType.Color, title: "Ring", defaultValue: "#1C1714" },
    showFill: {
        type: ControlType.Boolean,
        title: "Disc",
        defaultValue: true,
        enabledTitle: "Filled",
        disabledTitle: "Clear",
    },
    fill: {
        type: ControlType.Color,
        title: "Disc Color",
        defaultValue: "#FFFFFF",
        hidden: (p) => !p.showFill,
    },
})
