// The hero headline, sized fluidly.
//
// User instruction served: "i addeed the tablet and phone you just need to make
// it mobile responsive."
//
// Why this is a code component rather than two Text layers:
//
// Framer breakpoints are replica nodes. The MCP cannot address the layers
// inside a replica, so every layer property — including the text style on a
// headline — is shared across Desktop, Tablet and Phone. A text style's
// fontSize is also px-only here: "clamp(...)" and "vw" values are accepted by
// the API and then silently discarded. Between those two facts, a 92px
// headline stays 92px on a 390px phone, which is the one piece of type on the
// page that breaks badly rather than merely looking large.
//
// Rendering the headline in CSS sidesteps both limits: clamp() scales it
// continuously with the viewport, so it is correct at every width instead of
// at three fixed steps.
//
// Copy stays editable from the canvas through the two String property
// controls below.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { tokens } from "https://framer.com/m/tristanConfig-9QrhiB.js"

interface FluidHeadlineProps {
    lineOne: string
    lineTwo: string
    minSize: number
    maxSize: number
    scale: number
    style?: CSSProperties
}

/**
 * Two-line display headline: roman first line, italic accent second line.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 190
 */
export default function FluidHeadline(props: FluidHeadlineProps) {
    const { lineOne, lineTwo, minSize, maxSize, scale, style } = props

    const base: CSSProperties = {
        position: "relative",
        width: "100%",
        margin: 0,
        fontFamily: tokens.serif,
        fontWeight: 300,
        // Scales continuously between the two bounds instead of stepping at
        // breakpoints. At 390px wide this lands on minSize; past ~1120px it
        // pins to maxSize.
        fontSize: `clamp(${minSize}px, ${scale}vw, ${maxSize}px)`,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color: tokens.text,
    }

    return (
        <h1 style={{ ...base, ...style }}>
            <span style={{ display: "block" }}>{lineOne}</span>
            <span
                style={{
                    display: "block",
                    fontStyle: "italic",
                    color: tokens.accent,
                }}
            >
                {lineTwo}
            </span>
        </h1>
    )
}

FluidHeadline.defaultProps = {
    lineOne: "Join with",
    lineTwo: "Tristan.",
    minSize: 44,
    maxSize: 92,
    scale: 8.2,
}

addPropertyControls(FluidHeadline, {
    lineOne: {
        type: ControlType.String,
        title: "Line 1",
        defaultValue: "Join with",
    },
    lineTwo: {
        type: ControlType.String,
        title: "Line 2 (italic)",
        defaultValue: "Tristan.",
    },
    minSize: {
        type: ControlType.Number,
        title: "Min size",
        min: 20,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 44,
    },
    maxSize: {
        type: ControlType.Number,
        title: "Max size",
        min: 20,
        max: 200,
        step: 1,
        unit: "px",
        defaultValue: 92,
    },
    scale: {
        type: ControlType.Number,
        title: "Scale",
        min: 1,
        max: 20,
        step: 0.1,
        unit: "vw",
        defaultValue: 8.2,
    },
})
