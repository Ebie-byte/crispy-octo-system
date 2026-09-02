// Instructions: the hero's blush environment — the warm gradient ground, the
// bloom of light behind the eye portrait, soft out-of-focus blossom clusters at
// both edges and a film grain over the whole band. Sits absolutely behind the
// hero content; never takes pointer events.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { useId } from "react"
import type { CSSProperties } from "react"

interface HeroBackdropProps {
    skyTop: string
    mid: string
    base: string
    bloom: string
    blossom: string
    grain: number
    style?: CSSProperties
}

/**
 * HERO BACKDROP
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 620
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function HeroBackdrop(props: HeroBackdropProps) {
    const { skyTop, mid, base, bloom, blossom, grain, style } = props

    const isStatic = useIsStaticRenderer()
    const reduced = useReducedMotion()
    const animate = !isStatic && !reduced

    const uid = useId().replace(/:/g, "")
    const softId = `soft-${uid}`
    const grainId = `grain-${uid}`

    // One blossom cluster, reused mirrored on both edges. Petals are plain
    // ellipses pushed far out of focus, which is what sells depth here.
    // Sized to actually read at page scale — at 1440px wide, anything under
    // ~80px radius disappears into the blur before it registers as a shape.
    const cluster = (
        <g filter={`url(#${softId})`} fill={blossom}>
            <ellipse cx="150" cy="120" rx="130" ry="96" opacity="0.85" />
            <ellipse cx="290" cy="250" rx="106" ry="84" opacity="0.72" />
            <ellipse cx="70" cy="310" rx="118" ry="90" opacity="0.78" />
            <ellipse cx="320" cy="60" rx="80" ry="64" opacity="0.58" />
            <ellipse cx="200" cy="400" rx="96" ry="74" opacity="0.62" />
            <ellipse cx="20" cy="150" rx="86" ry="68" opacity="0.52" />
        </g>
    )

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                background: `linear-gradient(178deg, ${skyTop} 0%, ${mid} 46%, ${base} 100%)`,
                ...style,
            }}
            aria-hidden="true"
        >
            {/* Bloom of warm light behind the portrait. */}
            <motion.div
                animate={animate ? { opacity: [0.72, 1, 0.72] } : { opacity: 0.88 }}
                transition={
                    animate
                        ? { duration: 9, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                }
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "42%",
                    width: 900,
                    height: 900,
                    marginLeft: -450,
                    marginTop: -450,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${bloom} 0%, rgba(255,255,255,0) 66%)`,
                }}
            />

            {/* A cooler catch of light in the upper right, as in the reference. */}
            <div
                style={{
                    position: "absolute",
                    right: "-6%",
                    top: "-20%",
                    width: 620,
                    height: 620,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0) 68%)",
                }}
            />

            {/* Pale floor, so the podium has something to stand on. */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "26%",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,252,250,0.72) 100%)",
                }}
            />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1440 620"
                preserveAspectRatio="xMidYMid slice"
                style={{ position: "absolute", inset: 0 }}
            >
                <defs>
                    <filter id={softId} x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="26" />
                    </filter>
                    <filter id={grainId}>
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.85"
                            numOctaves="3"
                        />
                    </filter>
                </defs>

                <g transform="translate(-160 90)">{cluster}</g>
                <g transform="translate(1600 -80) scale(-1 1)">{cluster}</g>
                <g transform="translate(1220 260) scale(0.75)">{cluster}</g>

                {grain > 0 && (
                    <rect
                        width="100%"
                        height="100%"
                        filter={`url(#${grainId})`}
                        opacity={grain}
                    />
                )}
            </svg>
        </div>
    )
}

HeroBackdrop.defaultProps = {
    skyTop: "#F5E7E1",
    mid: "#F0DCD5",
    base: "#F8EEE9",
    bloom: "rgba(255, 231, 213, 0.95)",
    blossom: "#E9C0BC",
    grain: 0.035,
}

addPropertyControls(HeroBackdrop, {
    skyTop: { type: ControlType.Color, title: "Top", defaultValue: "#F5E7E1" },
    mid: { type: ControlType.Color, title: "Middle", defaultValue: "#F0DCD5" },
    base: { type: ControlType.Color, title: "Base", defaultValue: "#F8EEE9" },
    bloom: {
        type: ControlType.Color,
        title: "Bloom",
        defaultValue: "rgba(255, 231, 213, 0.95)",
    },
    blossom: { type: ControlType.Color, title: "Blossom", defaultValue: "#E9C0BC" },
    grain: {
        type: ControlType.Number,
        title: "Grain",
        defaultValue: 0.035,
        min: 0,
        max: 0.09,
        step: 0.005,
    },
})
