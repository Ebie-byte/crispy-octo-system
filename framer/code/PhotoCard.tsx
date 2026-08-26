// A photograph presented as a physical card: white board, a mat of even
// margin around the image, and a caption printed on the board below it.
//
// The mat is the whole trick. A photo bled to the edge of a card reads as
// a web thumbnail; the same photo inset on white board reads as something
// mounted and placed. That is why the caption sits on the board rather
// than under the card — it belongs to the object, not to the page.
//
// On hover the board lifts and the photograph scales inside its window;
// the board and mat never move, so the card stays an object rather than
// turning into a button.
//
// `tilt` is off by default. A degree or two reads as hand-placed on two
// cards side by side, but it tips into scrapbook fast — use sparingly and
// in opposite directions.
//
// Note: rotation is declared in the variants, never in the base style
// object. `rotate` in a plain CSSProperties is typed as a CSS Rotate, not
// a number, and mixing the two also lets the static value fight the
// animated one.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import type { CSSProperties } from "react"

interface PhotoCardProps {
    src?: string
    alt?: string
    caption?: string
    board?: string
    ink?: string
    mat?: number
    radius?: number
    tilt?: number
    index?: number
    style?: CSSProperties
}

const SETTLE = [0.16, 1, 0.3, 1] as const
const SANS = "Montserrat, Inter, Helvetica, Arial, sans-serif"

const RESTING_SHADOW = "0 12px 34px rgba(60, 44, 24, 0.13)"
const RAISED_SHADOW = "0 26px 60px rgba(60, 44, 24, 0.22)"

/**
 * A mounted photograph card with caption.
 *
 * @framerIntrinsicWidth 520
 * @framerIntrinsicHeight 420
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function PhotoCard({
    src = "",
    alt = "",
    caption = "",
    board = "rgb(255, 255, 255)",
    ink = "rgb(121, 114, 106)",
    mat = 14,
    radius = 6,
    tilt = 0,
    index = 0,
    style,
}: PhotoCardProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion
    const inView = useInView(ref, { once: true, margin: "-12% 0px" })

    const shouldReveal = !motionOff
    const shouldHover = !motionOff

    const boardStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        background: board,
        borderRadius: radius + mat / 2,
        padding: mat,
        display: "flex",
        flexDirection: "column",
        gap: mat - 2,
        boxShadow: RESTING_SHADOW,
        ...style,
    }

    return (
        <motion.div
            ref={ref}
            style={boardStyle}
            initial={shouldReveal ? "hidden" : false}
            animate={shouldReveal && !inView ? "hidden" : "shown"}
            whileHover={shouldHover ? "hover" : undefined}
            variants={{
                hidden: { opacity: 0, y: 34, rotate: tilt },
                shown: {
                    opacity: 1,
                    y: 0,
                    rotate: tilt,
                    boxShadow: RESTING_SHADOW,
                },
                hover: {
                    y: -6,
                    rotate: tilt,
                    boxShadow: RAISED_SHADOW,
                },
            }}
            transition={{
                duration: 0.85,
                ease: SETTLE,
                delay: shouldReveal ? Math.max(0, index) * 0.12 : 0,
            }}
        >
            {/* photo window */}
            <div
                style={{
                    position: "relative",
                    flex: "1 1 auto",
                    minHeight: 0,
                    borderRadius: radius,
                    overflow: "hidden",
                    background: "rgba(60, 44, 24, 0.06)",
                }}
            >
                {src ? (
                    <motion.img
                        src={src}
                        alt={alt}
                        variants={{
                            hidden: { scale: 1 },
                            shown: { scale: 1 },
                            hover: { scale: 1.07 },
                        }}
                        transition={{ duration: 0.75, ease: SETTLE }}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                            display: "block",
                        }}
                    />
                ) : null}
            </div>

            {caption ? (
                <div
                    style={{
                        flex: "0 0 auto",
                        fontFamily: SANS,
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: ink,
                        textAlign: "center",
                        paddingBottom: 2,
                    }}
                >
                    {caption}
                </div>
            ) : null}
        </motion.div>
    )
}

addPropertyControls(PhotoCard, {
    src: { type: ControlType.String, title: "Image URL", defaultValue: "" },
    alt: { type: ControlType.String, title: "Alt text", defaultValue: "" },
    caption: {
        type: ControlType.String,
        title: "Caption",
        defaultValue: "",
    },
    board: {
        type: ControlType.Color,
        title: "Board",
        defaultValue: "rgb(255, 255, 255)",
    },
    ink: {
        type: ControlType.Color,
        title: "Caption",
        defaultValue: "rgb(121, 114, 106)",
    },
    mat: {
        type: ControlType.Number,
        title: "Mat",
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
        defaultValue: 6,
    },
    tilt: {
        type: ControlType.Number,
        title: "Tilt",
        min: -4,
        max: 4,
        step: 0.1,
        unit: "deg",
        defaultValue: 0,
    },
    index: {
        type: ControlType.Number,
        title: "Order",
        min: 0,
        max: 20,
        step: 1,
        defaultValue: 0,
    },
})
