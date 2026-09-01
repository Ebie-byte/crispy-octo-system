// Instructions: the small white disc that floats on the edge of Tanith's
// portrait — a Playfair figure over two lines of spaced caps ("2+ / YEARS
// EXPERIENCE"). Built as a component because the disc needs its own type
// scale and a soft shadow that a Framer frame cannot carry over MCP.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface YearsBadgeProps {
    figure: string
    lineOne: string
    lineTwo: string
    disc: string
    ink: string
    muted: string
    style?: CSSProperties
}

/**
 * YEARS BADGE
 *
 * @framerIntrinsicWidth 96
 * @framerIntrinsicHeight 96
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function YearsBadge(props: YearsBadgeProps) {
    const { figure, lineOne, lineTwo, disc, ink, muted, style } = props

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: disc,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                boxShadow: "0 14px 34px -12px rgba(120, 80, 62, 0.38)",
                ...style,
            }}
        >
            <span
                style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: 22,
                    lineHeight: 1.1,
                    color: ink,
                    letterSpacing: "-0.01em",
                }}
            >
                {figure}
            </span>
            <span
                style={{
                    fontFamily: "Montserrat, 'Helvetica Neue', Helvetica, sans-serif",
                    fontSize: 7.5,
                    letterSpacing: "1.3px",
                    textTransform: "uppercase",
                    color: muted,
                    lineHeight: 1.5,
                    textAlign: "center",
                }}
            >
                {lineOne}
                <br />
                {lineTwo}
            </span>
        </div>
    )
}

YearsBadge.defaultProps = {
    figure: "2+",
    lineOne: "Years",
    lineTwo: "Experience",
    disc: "#FFFFFF",
    ink: "#1C1714",
    muted: "#7A726C",
}

addPropertyControls(YearsBadge, {
    figure: { type: ControlType.String, title: "Figure", defaultValue: "2+" },
    lineOne: { type: ControlType.String, title: "Line 1", defaultValue: "Years" },
    lineTwo: {
        type: ControlType.String,
        title: "Line 2",
        defaultValue: "Experience",
    },
    disc: { type: ControlType.Color, title: "Disc", defaultValue: "#FFFFFF" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "#1C1714" },
    muted: { type: ControlType.Color, title: "Label", defaultValue: "#7A726C" },
})
