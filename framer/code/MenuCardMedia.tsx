// The photograph half of a menu card.
//
// Three things it adds over a plain image:
//
//   reveal — rises and settles as the section scrolls in, offset by `index`
//            so the five cards arrive as a sequence rather than a block.
//   hover  — the photo scales INSIDE a clipped frame. The frame never
//            moves; only the image behind it grows. That containment is
//            what reads as expensive — a card that scales as a whole reads
//            as a button.
//   depth  — a soft WARM shadow. On a cream page a grey/black shadow looks
//            like dirt; tinting it brown keeps the page feeling lit.
//
// Hover is driven by variant propagation: the frame declares `whileHover`
// and the image responds through its own `hover` variant, so a single
// pointer target drives both without duplicated state.
//
// Only the text stays as real Framer layers — the title and body are
// deliberately NOT part of this component so they keep their project text
// styles and stay editable on canvas.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import type { CSSProperties } from "react"

type Fit = "cover" | "contain"

interface MenuCardMediaProps {
    src?: string
    alt?: string
    fit?: Fit
    radius?: number
    index?: number
    reveal?: boolean
    hover?: boolean
    hoverScale?: number
    shadow?: boolean
    style?: CSSProperties
}

const SETTLE = [0.16, 1, 0.3, 1] as const

const RESTING_SHADOW = "0 10px 30px rgba(60, 44, 24, 0.10)"
const RAISED_SHADOW = "0 22px 50px rgba(60, 44, 24, 0.20)"

/**
 * Menu card photograph with scroll reveal and a contained hover zoom.
 *
 * @framerIntrinsicWidth 257
 * @framerIntrinsicHeight 305
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function MenuCardMedia({
    src = "",
    alt = "",
    fit = "cover",
    radius = 14,
    index = 0,
    reveal = true,
    hover = true,
    hoverScale = 1.06,
    shadow = true,
    style,
}: MenuCardMediaProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion

    // once: the cards should settle and stay settled, not re-run on scroll.
    const inView = useInView(ref, { once: true, margin: "-12% 0px" })

    const shouldReveal = reveal && !motionOff
    const shouldHover = hover && !motionOff

    const frameStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: shadow ? RESTING_SHADOW : "none",
        ...style,
    }

    return (
        <motion.div
            ref={ref}
            style={frameStyle}
            initial={shouldReveal ? "hidden" : false}
            animate={shouldReveal && !inView ? "hidden" : "shown"}
            whileHover={shouldHover ? "hover" : undefined}
            variants={{
                hidden: { opacity: 0, y: 28, scale: 0.98 },
                shown: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    boxShadow: shadow ? RESTING_SHADOW : "none",
                },
                hover: {
                    boxShadow: shadow ? RAISED_SHADOW : "none",
                },
            }}
            transition={{
                duration: 0.9,
                ease: SETTLE,
                delay: shouldReveal ? Math.max(0, index) * 0.07 : 0,
            }}
        >
            {src ? (
                <motion.img
                    src={src}
                    alt={alt}
                    variants={{
                        hidden: { scale: 1 },
                        shown: { scale: 1 },
                        hover: { scale: hoverScale },
                    }}
                    transition={{ duration: 0.7, ease: SETTLE }}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: fit,
                        objectPosition: "center",
                        display: "block",
                    }}
                />
            ) : null}
        </motion.div>
    )
}

addPropertyControls(MenuCardMedia, {
    src: { type: ControlType.String, title: "Image URL", defaultValue: "" },
    alt: { type: ControlType.String, title: "Alt text", defaultValue: "" },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        options: ["cover", "contain"],
        optionTitles: ["Fill", "Fit"],
        defaultValue: "cover",
        displaySegmentedControl: true,
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    index: {
        type: ControlType.Number,
        title: "Order",
        min: 0,
        max: 20,
        step: 1,
        defaultValue: 0,
        description: "Position in the row — drives the reveal stagger.",
    },
    reveal: {
        type: ControlType.Boolean,
        title: "Reveal",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    hover: {
        type: ControlType.Boolean,
        title: "Hover",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    hoverScale: {
        type: ControlType.Number,
        title: "Zoom",
        min: 1,
        max: 1.2,
        step: 0.01,
        defaultValue: 1.06,
        hidden: ({ hover }) => !hover,
    },
    shadow: {
        type: ControlType.Boolean,
        title: "Shadow",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
})
