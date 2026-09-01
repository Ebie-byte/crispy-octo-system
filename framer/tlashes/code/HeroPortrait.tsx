// Instructions: the hero centrepiece — the client eye close-up held in a
// glowing rose ring, standing on a marble podium, with a Parisienne "TL"
// monogram across the podium face and a scatter of sparkles at the lower left.
// The photograph arrives as a plain `src` string; empty renders a blush disc.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import type { CSSProperties } from "react"

interface HeroPortraitProps {
    src: string
    alt: string
    focalX: number
    focalY: number
    monogram: string
    glow: string
    ringColor: string
    podium: string
    style?: CSSProperties
}

/**
 * HERO PORTRAIT
 *
 * @framerIntrinsicWidth 560
 * @framerIntrinsicHeight 560
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function HeroPortrait(props: HeroPortraitProps) {
    const {
        src,
        alt,
        focalX,
        focalY,
        monogram,
        glow,
        ringColor,
        podium,
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const reduced = useReducedMotion()
    const animate = !isStatic && !reduced
    const hasSrc = typeof src === "string" && src.trim().length > 0

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                ...style,
            }}
        >
            {/* Podium — drawn first so the disc sits on top of it. */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "76%",
                    width: "75%",
                    height: "16%",
                    transform: "translateX(-50%)",
                    borderRadius: "50%",
                    background: `linear-gradient(180deg, #FFFFFF 0%, ${podium} 55%, #E6D9D2 100%)`,
                    boxShadow: "0 26px 46px -18px rgba(120, 80, 62, 0.34)",
                }}
            />

            {/* Ring: the glow lives entirely in shadows so nothing is clipped. */}
            <motion.div
                animate={
                    animate
                        ? { opacity: [0.82, 1, 0.82] }
                        : { opacity: 0.94 }
                }
                transition={
                    animate
                        ? { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                }
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "4%",
                    width: "78%",
                    aspectRatio: "1 / 1",
                    transform: "translateX(-50%)",
                    borderRadius: "50%",
                    border: `1.5px solid ${ringColor}`,
                    boxShadow: `0 0 60px 6px ${glow}, 0 0 120px 30px ${glow}, inset 0 0 40px 6px ${glow}`,
                }}
            />

            {/* The photograph. */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "7%",
                    width: "72%",
                    aspectRatio: "1 / 1",
                    transform: "translateX(-50%)",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background:
                        "linear-gradient(150deg, #F4E4DD 0%, #E7C9BF 100%)",
                    boxShadow: "0 20px 50px -20px rgba(120, 80, 62, 0.4)",
                }}
            >
                {hasSrc ? (
                    <img
                        src={src}
                        alt={alt}
                        draggable={false}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: `${focalX}% ${focalY}%`,
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width="150"
                            height="86"
                            viewBox="0 0 46 26"
                            fill="none"
                            stroke="rgba(28,23,20,0.28)"
                            strokeWidth="0.9"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <path d="M2 9c7.5 9.5 34.5 9.5 42 0" />
                            <path d="M6.5 13.4 4 19" />
                            <path d="M14 17 12.6 22.6" />
                            <path d="M23 18.4V24" />
                            <path d="M32 17l1.4 5.6" />
                            <path d="M39.5 13.4 42 19" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Sparkles and monogram. */}
            <svg
                viewBox="0 0 560 560"
                width="100%"
                height="100%"
                fill="none"
                style={{ position: "absolute", inset: 0, overflow: "visible" }}
                aria-hidden="true"
            >
                <g fill={ringColor} opacity="0.9">
                    <path d="M104 300c1.6 6.2 3.9 8.5 10.1 10.1-6.2 1.6-8.5 3.9-10.1 10.1-1.6-6.2-3.9-8.5-10.1-10.1 6.2-1.6 8.5-3.9 10.1-10.1Z" />
                    <path d="M132 356c1.1 4.4 2.8 6.1 7.2 7.2-4.4 1.1-6.1 2.8-7.2 7.2-1.1-4.4-2.8-6.1-7.2-7.2 4.4-1.1 6.1-2.8 7.2-7.2Z" />
                    <path d="M88 372c.8 3.2 2 4.4 5.2 5.2-3.2.8-4.4 2-5.2 5.2-.8-3.2-2-4.4-5.2-5.2 3.2-.8 4.4-2 5.2-5.2Z" />
                    <path d="M158 300c.8 3.2 2 4.4 5.2 5.2-3.2.8-4.4 2-5.2 5.2-.8-3.2-2-4.4-5.2-5.2 3.2-.8 4.4-2 5.2-5.2Z" />
                </g>
                <text
                    x="280"
                    y="474"
                    textAnchor="middle"
                    fill={ringColor}
                    opacity="0.95"
                    style={{
                        fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                        fontSize: "62px",
                    }}
                >
                    {monogram}
                </text>
            </svg>
        </div>
    )
}

HeroPortrait.defaultProps = {
    src: "",
    alt: "Lash extensions close-up",
    focalX: 50,
    focalY: 50,
    monogram: "tl",
    glow: "rgba(255, 198, 160, 0.55)",
    ringColor: "#E8B48C",
    podium: "#F6EDE8",
}

addPropertyControls(HeroPortrait, {
    src: {
        type: ControlType.String,
        title: "Image URL",
        defaultValue: "",
        placeholder: "https://…",
    },
    alt: {
        type: ControlType.String,
        title: "Alt",
        defaultValue: "Lash extensions close-up",
    },
    focalX: {
        type: ControlType.Number,
        title: "Focal X",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
    },
    focalY: {
        type: ControlType.Number,
        title: "Focal Y",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
    },
    monogram: { type: ControlType.String, title: "Monogram", defaultValue: "tl" },
    glow: {
        type: ControlType.Color,
        title: "Glow",
        defaultValue: "rgba(255, 198, 160, 0.55)",
    },
    ringColor: { type: ControlType.Color, title: "Ring", defaultValue: "#E8B48C" },
    podium: { type: ControlType.Color, title: "Podium", defaultValue: "#F6EDE8" },
})
