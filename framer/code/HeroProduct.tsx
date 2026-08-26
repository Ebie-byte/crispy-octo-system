// The hero product shot: a contain-fit image with three separate motions
// that must not fight each other.
//
//   parallax  — outer layer, driven by scroll position
//   entrance  — middle layer, a one-shot reveal on load
//   float     — inner layer, a slow endless drift
//
// They are nested rather than combined because all three animate `y`. Put
// them on one element and the last writer wins; nested, they compose.
//
// The easing on the entrance is the part that reads as expensive:
// cubic-bezier(0.16, 1, 0.3, 1) decelerates hard, so the roll settles into
// place rather than sliding to a stop. Default browser easing is what makes
// motion feel cheap.
//
// Everything idles on the Framer canvas, under prefers-reduced-motion, and
// (for the float) while scrolled out of view.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import {
    motion,
    useInView,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion"
import { useRef } from "react"
import type { CSSProperties } from "react"

interface HeroProductProps {
    src?: string
    alt?: string
    reveal?: boolean
    revealDelay?: number
    float?: boolean
    floatDistance?: number
    floatDuration?: number
    parallax?: number
    style?: CSSProperties
}

const SETTLE = [0.16, 1, 0.3, 1] as const

/**
 * Hero product image with entrance, float and scroll parallax.
 *
 * @framerIntrinsicWidth 780
 * @framerIntrinsicHeight 586
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function HeroProduct({
    src = "",
    alt = "",
    reveal = true,
    revealDelay = 0.25,
    float = true,
    floatDistance = 6,
    floatDuration = 6,
    parallax = 60,
    style,
}: HeroProductProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion

    const inView = useInView(ref, { once: false })

    // Scroll parallax: drift down slightly as the hero leaves the viewport.
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })
    const parallaxY = useTransform(
        scrollYProgress,
        [0, 1],
        [0, motionOff ? 0 : parallax]
    )

    const shouldFloat = float && !motionOff && inView
    const shouldReveal = reveal && !motionOff

    const wrapper: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
    }

    const fill: CSSProperties = { width: "100%", height: "100%" }

    return (
        <div ref={ref} style={wrapper}>
            {/* 1. parallax */}
            <motion.div style={{ ...fill, y: parallaxY }}>
                {/* 2. entrance */}
                <motion.div
                    style={fill}
                    initial={
                        shouldReveal
                            ? { opacity: 0, y: 26, scale: 0.96 }
                            : false
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 1.1,
                        ease: SETTLE,
                        delay: shouldReveal ? revealDelay : 0,
                    }}
                >
                    {/* 3. float */}
                    <motion.div
                        style={fill}
                        animate={
                            shouldFloat
                                ? { y: [0, -floatDistance, 0] }
                                : false
                        }
                        transition={{
                            duration: Math.max(2, floatDuration),
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop",
                        }}
                    >
                        {src ? (
                            <img
                                src={src}
                                alt={alt}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    objectPosition: "center",
                                    display: "block",
                                }}
                            />
                        ) : null}
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    )
}

addPropertyControls(HeroProduct, {
    src: {
        type: ControlType.String,
        title: "Image URL",
        defaultValue: "",
    },
    alt: { type: ControlType.String, title: "Alt text", defaultValue: "" },
    reveal: {
        type: ControlType.Boolean,
        title: "Reveal",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    revealDelay: {
        type: ControlType.Number,
        title: "Delay",
        min: 0,
        max: 2,
        step: 0.05,
        unit: "s",
        defaultValue: 0.25,
        hidden: ({ reveal }) => !reveal,
    },
    float: {
        type: ControlType.Boolean,
        title: "Float",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    floatDistance: {
        type: ControlType.Number,
        title: "Rise",
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
        defaultValue: 6,
        hidden: ({ float }) => !float,
    },
    floatDuration: {
        type: ControlType.Number,
        title: "Cycle",
        min: 2,
        max: 20,
        step: 0.5,
        unit: "s",
        defaultValue: 6,
        hidden: ({ float }) => !float,
    },
    parallax: {
        type: ControlType.Number,
        title: "Parallax",
        min: 0,
        max: 200,
        step: 5,
        unit: "px",
        defaultValue: 60,
    },
})
