// Contain-fit image with an optional scroll parallax.
//
// Why contain: Framer's native Image node has no exposed "Fit" vs "Fill"
// attribute in this project's XML API — it always crops to cover. Photos
// composited with negative space around the subject lose that space to the
// crop, so they are drawn here instead.
//
// The parallax drifts the photograph UPWARD as the section scrolls past,
// against the page direction. In the promise section the copy column moves
// with the page and the photograph resists it, which opens a little depth
// between the two without either of them leaving its box. Set to 0 to
// switch it off.
//
// Takes a plain string URL rather than Framer's ResponsiveImage control:
// the MCP's XML writer only round-trips scalar prop values and silently
// drops the {src, srcSet, alt} object ResponsiveImage expects. The `image`
// picker is still exposed for editing by hand on the canvas, and wins when
// it is set.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion"
import { useRef } from "react"
import type { CSSProperties } from "react"

interface ContainImageProps {
    image?: { src: string; srcSet?: string; alt?: string }
    src?: string
    alt?: string
    parallax?: number
    style?: CSSProperties
}

/**
 * Renders an image scaled with object-fit: contain so nothing is cropped.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ContainImage({
    image,
    src = "",
    alt = "",
    parallax = 0,
    style,
}: ContainImageProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })

    const drift = motionOff ? 0 : parallax
    const y = useTransform(scrollYProgress, [0, 1], [drift, -drift])

    const wrapperStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
    }

    const resolvedSrc = image?.src || src
    const resolvedAlt = alt || image?.alt || ""

    if (!resolvedSrc) {
        return <div ref={ref} style={wrapperStyle} />
    }

    return (
        <div ref={ref} style={wrapperStyle}>
            <motion.img
                src={resolvedSrc}
                srcSet={image?.src ? image.srcSet : undefined}
                alt={resolvedAlt}
                style={{
                    width: "100%",
                    // Overscan so the drift never exposes an edge.
                    height: drift ? `calc(100% + ${Math.abs(drift) * 2}px)` : "100%",
                    marginTop: drift ? -Math.abs(drift) : 0,
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                    y,
                }}
            />
        </div>
    )
}

addPropertyControls(ContainImage, {
    image: {
        type: ControlType.ResponsiveImage,
        title: "Image",
    },
    src: {
        type: ControlType.String,
        title: "or URL",
        defaultValue: "",
    },
    alt: {
        type: ControlType.String,
        title: "Alt text",
        defaultValue: "",
    },
    parallax: {
        type: ControlType.Number,
        title: "Parallax",
        min: 0,
        max: 120,
        step: 5,
        unit: "px",
        defaultValue: 0,
        description: "Drift against the scroll. 0 is off.",
    },
})
