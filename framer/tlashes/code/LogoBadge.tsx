// Instructions: the circular "T LASHES / BY TANITH LEE" logo badge used in the
// header (dark type on white) and in the footer (white type on the dark band).
// Ring lettering follows the circle via SVG textPath; the centre holds the lash
// mark — an eye line with lashes sweeping UP and outward, cat-eye style, as in
// the brand mockup — over a Dancing Script "tl" monogram finished with a long
// signature swash.
//
// NOTE: the ring text props are named `ringWordOne` / `ringWordTwo`, not
// anything containing "top"/"bottom"/"left"/"right" as a substring — Framer's
// XML writer matches those substrings against the layout pin attributes of the
// same name and silently overwrites the prop with the pin's value.

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
    const {
        ringWordOne,
        ringWordTwo,
        monogram,
        ink,
        ring,
        fill,
        showFill,
        style,
    } = props

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
                        d="M 17 60 A 43 43 0 0 1 103 60"
                        fill="none"
                    />
                    <path
                        id={bottomArc}
                        d="M 21 60 A 39 39 0 0 0 99 60"
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
                        fontSize: "8px",
                        fontWeight: 500,
                        letterSpacing: "3px",
                    }}
                >
                    <textPath
                        href={`#${topArc}`}
                        startOffset="50%"
                        textAnchor="middle"
                    >
                        {ringWordOne}
                    </textPath>
                </text>

                <text
                    fill={ink}
                    style={{
                        fontFamily:
                            "Montserrat, 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: "6.6px",
                        fontWeight: 500,
                        letterSpacing: "2.4px",
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

                {/* Lash mark: an eye line with lashes sweeping up and outward. */}
                <g
                    stroke={ink}
                    strokeWidth="1.15"
                    strokeLinecap="round"
                    fill="none"
                >
                    <path d="M38 55c10-9 34-9 44 0" />
                    <path d="M43.5 49.6 40.4 42.6" />
                    <path d="M51.5 46.2 49.4 38.6" />
                    <path d="M60 44.9 60 37" />
                    <path d="M68.5 46.2 71.4 38.4" />
                    <path d="M76.5 49.6 80.6 42.8" />
                </g>

                <text
                    x="60"
                    y="82"
                    textAnchor="middle"
                    fill={ink}
                    style={{
                        fontFamily:
                            "'Dancing Script', 'Brush Script MT', cursive",
                        fontSize: "26px",
                    }}
                >
                    {monogram}
                </text>

                {/* Signature swash, wider than the monogram it sits under. */}
                <path
                    d="M31 87c8 5.4 20 7.4 29 7.4S72 92.4 89 86.4"
                    stroke={ink}
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </div>
    )
}

LogoBadge.defaultProps = {
    ringWordOne: "T LASHES",
    ringWordTwo: "BY TANITH LEE",
    monogram: "tl",
    ink: "#1C1714",
    ring: "#1C1714",
    fill: "#FFFFFF",
    showFill: true,
}

addPropertyControls(LogoBadge, {
    ringWordOne: {
        type: ControlType.String,
        title: "Ring Word 1",
        defaultValue: "T LASHES",
    },
    ringWordTwo: {
        type: ControlType.String,
        title: "Ring Word 2",
        defaultValue: "BY TANITH LEE",
    },
    monogram: {
        type: ControlType.String,
        title: "Monogram",
        defaultValue: "tl",
    },
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
