// Renders an image scaled with object-fit: contain, so it is never cropped
// or stretched.
//
// Why this exists: Framer's native Image node has no exposed "Fit" vs "Fill"
// attribute in this project's XML API — it always crops to cover. The hero
// product shot is a transparent PNG with feathered edges, composited with
// negative space around the roll so it melts into the navy background. A
// cover crop clips that negative space and breaks the effect, so the hero
// must be drawn with "contain".
//
// Two ways to set the image, checked in this order:
//   1. `image`  — Framer's normal image picker. USE THIS. Drag the asset in
//                 and it is uploaded to Framer's CDN like any other asset.
//   2. `src`    — a plain URL string. Fallback only, because the MCP's XML
//                 writer can only round-trip scalar prop values and silently
//                 drops the {src, srcSet, alt} object `image` expects, so an
//                 agent editing over MCP cannot populate the picker.
//
// IMPORTANT: the hero asset must stay a PNG. JPG has no alpha channel, so
// saving it as JPG bakes in a solid background box and the roll stops
// blending into the navy.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface ContainImageProps {
    image?: { src: string; srcSet?: string; alt?: string }
    src: string
    alt: string
    style?: CSSProperties
}

/**
 * Renders an image scaled with object-fit: contain so nothing is cropped.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ContainImage(props: ContainImageProps) {
    const { image, src, alt, style } = props

    const wrapperStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
    }

    // The picker wins when it has been set; otherwise fall back to the URL.
    const resolvedSrc = image?.src || src
    const resolvedAlt = alt || image?.alt || ""

    if (!resolvedSrc) {
        return <div style={wrapperStyle} />
    }

    return (
        <div style={wrapperStyle}>
            <img
                src={resolvedSrc}
                srcSet={image?.src ? image.srcSet : undefined}
                alt={resolvedAlt}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                }}
            />
        </div>
    )
}

ContainImage.defaultProps = {
    src: "",
    alt: "",
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
})
