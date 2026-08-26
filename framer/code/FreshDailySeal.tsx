// The circular "Fresh Daily / Premium Quality" seal that sits over the
// promise-section photograph: a navy disc with a thin gold ring, curved
// gold lettering, and the Cibón swirl in the centre.
//
// The lettering ring rotates continuously; the disc, the ring rule and the
// centre swirl stay put. Rotating only the type is what makes it read as a
// stamped foil seal rather than a spinning sticker.
//
// Note: the text props are deliberately NOT named top*/bottom*/left*/right*,
// because those names collide with Framer layout pin attributes when the
// instance is written from XML.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useId, useRef } from "react"
import type { CSSProperties } from "react"

interface FreshDailySealProps {
    lineOne: string
    lineTwo: string
    disc: string
    ink: string
    spin: boolean
    duration: number
    reverse: boolean
    style?: CSSProperties
}

const UPPER_ARC = "M 100,100 m -72,0 a 72,72 0 1,1 144,0"
const LOWER_ARC = "M 100,100 m 72,0 a 72,72 0 1,1 -144,0"

/**
 * Circular foil-style seal with a slowly rotating lettering ring.
 *
 * @framerIntrinsicWidth 150
 * @framerIntrinsicHeight 150
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function FreshDailySeal(props: FreshDailySealProps) {
    const { lineOne, lineTwo, disc, ink, spin, duration, reverse, style } =
        props

    const containerRef = useRef<HTMLDivElement>(null)

    // Never animate on the canvas or in static/SSR renders, honour the
    // viewer's reduced-motion preference, and idle while scrolled away.
    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const inView = useInView(containerRef, { once: false })

    const shouldSpin = spin && !isStatic && !prefersReducedMotion && inView

    // Unique per instance so multiple seals cannot collide on defs ids.
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
    const upperId = `seal-upper-${uid}`
    const lowerId = `seal-lower-${uid}`

    const wrapperStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
    }

    const layerStyle: CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
    }

    return (
        <div ref={containerRef} style={wrapperStyle}>
            {/* Static: disc, hairline ring, centre swirl. */}
            <svg
                viewBox="0 0 200 200"
                style={layerStyle}
                aria-hidden="true"
                focusable="false"
            >
                <circle cx="100" cy="100" r="100" fill={disc} />
                <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke={ink}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                />
                <g
                    fill="none"
                    stroke={ink}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    transform="translate(100 100) scale(2.1) translate(-12 -12)"
                >
                    <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 1 0 0-17.6" />
                    <path d="M12 7.6a4.4 4.4 0 1 0 4.4 4.4A2.9 2.9 0 0 0 13.5 9.1 1.9 1.9 0 0 0 11.6 11" />
                </g>
            </svg>

            {/* Rotating: the lettering ring and its two marker dots. */}
            <motion.svg
                viewBox="0 0 200 200"
                style={{ ...layerStyle, transformOrigin: "50% 50%" }}
                animate={shouldSpin ? { rotate: reverse ? -360 : 360 } : false}
                transition={{
                    duration: Math.max(1, duration),
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop",
                }}
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <path id={upperId} d={UPPER_ARC} fill="none" />
                    <path id={lowerId} d={LOWER_ARC} fill="none" />
                </defs>
                <g
                    fill={ink}
                    fontFamily="Montserrat, Inter, Helvetica, Arial, sans-serif"
                    fontSize="14"
                    fontWeight="500"
                    letterSpacing="3.4"
                >
                    <text>
                        <textPath
                            href={`#${upperId}`}
                            startOffset="50%"
                            textAnchor="middle"
                        >
                            {lineOne}
                        </textPath>
                    </text>
                    <text>
                        <textPath
                            href={`#${lowerId}`}
                            startOffset="50%"
                            textAnchor="middle"
                        >
                            {lineTwo}
                        </textPath>
                    </text>
                </g>
                <circle cx="14" cy="100" r="2" fill={ink} />
                <circle cx="186" cy="100" r="2" fill={ink} />
            </motion.svg>
        </div>
    )
}

FreshDailySeal.defaultProps = {
    lineOne: "FRESH DAILY",
    lineTwo: "PREMIUM QUALITY",
    disc: "rgb(15, 30, 52)",
    ink: "rgb(221, 187, 134)",
    spin: true,
    duration: 24,
    reverse: false,
}

addPropertyControls(FreshDailySeal, {
    lineOne: {
        type: ControlType.String,
        title: "Upper",
        defaultValue: "FRESH DAILY",
    },
    lineTwo: {
        type: ControlType.String,
        title: "Lower",
        defaultValue: "PREMIUM QUALITY",
    },
    disc: {
        type: ControlType.Color,
        title: "Disc",
        defaultValue: "rgb(15, 30, 52)",
    },
    ink: {
        type: ControlType.Color,
        title: "Ink",
        defaultValue: "rgb(221, 187, 134)",
    },
    spin: {
        type: ControlType.Boolean,
        title: "Rotate",
        enabledTitle: "On",
        disabledTitle: "Off",
        defaultValue: true,
    },
    duration: {
        type: ControlType.Number,
        title: "Seconds",
        min: 4,
        max: 90,
        step: 1,
        unit: "s",
        defaultValue: 24,
        hidden: ({ spin }) => !spin,
    },
    reverse: {
        type: ControlType.Boolean,
        title: "Direction",
        enabledTitle: "CCW",
        disabledTitle: "CW",
        defaultValue: false,
        hidden: ({ spin }) => !spin,
    },
})
