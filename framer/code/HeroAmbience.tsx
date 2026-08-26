// Two ambient layers for the navy hero, selected with `layer`:
//
//   glow  — a soft radial bloom that sits BEHIND the product, so the roll
//           reads as lit rather than pasted onto flat colour.
//   grain — a fine film grain that sits ON TOP of everything, so the navy
//           reads as printed matter (paper, foil, packaging) instead of a
//           flat digital fill.
//
// Grain is the cheapest luxury signal available: large flat colour fields
// look digital, and a few percent of noise makes them look like material.
// Keep it subtle — above ~6% it stops reading as texture and starts
// reading as a broken image.
//
// Both layers are inert: no pointer events, no animation on the canvas or
// under reduced-motion, and the glow's drift is a slow opacity breath
// rather than anything that moves geometry.
//
// Defaults live in the destructure rather than in `defaultProps`: assigning
// defaultProps widens the `layer` union back to `string` and fails the
// addPropertyControls type check.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { useId } from "react"
import type { CSSProperties } from "react"

type AmbienceLayer = "glow" | "grain"

interface HeroAmbienceProps {
    layer?: AmbienceLayer
    tint?: string
    intensity?: number
    spread?: number
    breathe?: boolean
    style?: CSSProperties
}

/**
 * Ambient glow / grain layer for the hero section.
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function HeroAmbience({
    layer = "glow",
    tint = "rgba(120, 165, 235, 0.22)",
    intensity = 1,
    spread = 60,
    breathe = true,
    style,
}: HeroAmbienceProps) {
    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const animate = breathe && !isStatic && !prefersReducedMotion

    const rawId = useId().replace(/[^a-zA-Z0-9]/g, "")
    const grainId = `grain-${rawId}`

    const base: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
    }

    if (layer === "grain") {
        return (
            <div style={{ ...base, opacity: intensity }}>
                <svg
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                    focusable="false"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        mixBlendMode: "overlay",
                    }}
                >
                    <filter id={grainId}>
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.82"
                            numOctaves="3"
                            stitchTiles="stitch"
                        />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect
                        width="100%"
                        height="100%"
                        filter={`url(#${grainId})`}
                    />
                </svg>
            </div>
        )
    }

    // glow
    return (
        <motion.div
            style={{
                ...base,
                background: `radial-gradient(ellipse ${spread}% ${spread}% at 50% 45%, ${tint} 0%, rgba(0,0,0,0) 70%)`,
                opacity: intensity,
            }}
            animate={
                animate
                    ? { opacity: [intensity, intensity * 1.25, intensity] }
                    : false
            }
            transition={{
                duration: 9,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
            }}
            aria-hidden="true"
        />
    )
}

addPropertyControls(HeroAmbience, {
    layer: {
        type: ControlType.Enum,
        title: "Layer",
        options: ["glow", "grain"],
        optionTitles: ["Glow", "Grain"],
        defaultValue: "glow",
        displaySegmentedControl: true,
    },
    tint: {
        type: ControlType.Color,
        title: "Tint",
        defaultValue: "rgba(120, 165, 235, 0.22)",
        hidden: ({ layer }) => layer !== "glow",
    },
    spread: {
        type: ControlType.Number,
        title: "Spread",
        min: 20,
        max: 120,
        step: 1,
        unit: "%",
        defaultValue: 60,
        hidden: ({ layer }) => layer !== "glow",
    },
    intensity: {
        type: ControlType.Number,
        title: "Opacity",
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 1,
    },
    breathe: {
        type: ControlType.Boolean,
        title: "Breathe",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
        hidden: ({ layer }) => layer !== "glow",
    },
})
