// A row of filled stars for the testimonials.
//
// Filled, not outlined: the outline star in CibonIcon is right for the
// stats band, where it reads as an icon, but a review needs the stars to
// read as a rating at a glance. Solid gold does that.
//
// They tick on one at a time when the row scrolls into view — a small
// flourish that makes the rating feel counted rather than printed.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import type { CSSProperties } from "react"

interface StarRatingProps {
    count?: number
    size?: number
    gap?: number
    color?: string
    animate?: boolean
    align?: "left" | "center" | "right"
    style?: CSSProperties
}

const STAR =
    "M12 3.6l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.1l-5.3 2.79 1.01-5.9L3.42 9.83l5.93-.86z"

const SETTLE = [0.16, 1, 0.3, 1] as const

/**
 * A row of solid stars, revealed one by one.
 *
 * @framerIntrinsicWidth 96
 * @framerIntrinsicHeight 16
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function StarRating({
    count = 5,
    size = 14,
    gap = 5,
    color = "rgb(201, 160, 99)",
    animate = true,
    align = "center",
    style,
}: StarRatingProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion
    const inView = useInView(ref, { once: true, margin: "-10% 0px" })

    const shouldAnimate = animate && !motionOff
    const shown = !shouldAnimate || inView

    const justify =
        align === "left"
            ? "flex-start"
            : align === "right"
              ? "flex-end"
              : "center"

    const wrapper: CSSProperties = {
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: justify,
        gap,
        width: "100%",
        height: "100%",
        ...style,
    }

    const total = Math.max(0, Math.round(count))

    return (
        <div ref={ref} style={wrapper}>
            {Array.from({ length: total }).map((_, i) => (
                <motion.svg
                    key={i}
                    viewBox="0 0 24 24"
                    width={size}
                    height={size}
                    fill={color}
                    aria-hidden="true"
                    focusable="false"
                    style={{ display: "block", flex: "0 0 auto" }}
                    initial={shouldAnimate ? { opacity: 0, scale: 0.5 } : false}
                    animate={
                        shown
                            ? { opacity: 1, scale: 1 }
                            : { opacity: 0, scale: 0.5 }
                    }
                    transition={{
                        duration: 0.45,
                        ease: SETTLE,
                        delay: shouldAnimate ? i * 0.08 : 0,
                    }}
                >
                    <path d={STAR} />
                </motion.svg>
            ))}
        </div>
    )
}

addPropertyControls(StarRating, {
    count: {
        type: ControlType.Number,
        title: "Stars",
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 5,
    },
    size: {
        type: ControlType.Number,
        title: "Size",
        min: 8,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        min: 0,
        max: 20,
        step: 1,
        unit: "px",
        defaultValue: 5,
    },
    color: {
        type: ControlType.Color,
        title: "Colour",
        defaultValue: "rgb(201, 160, 99)",
    },
    align: {
        type: ControlType.Enum,
        title: "Align",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Centre", "Right"],
        defaultValue: "center",
        displaySegmentedControl: true,
    },
    animate: {
        type: ControlType.Boolean,
        title: "Animate",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
})
