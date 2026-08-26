// A plain image renderer that always scales with object-fit: contain,
// never cropping. Framer's native Image node has no exposed "Fit" vs
// "Fill" attribute in this project's XML API (it defaults to a cover
// crop), which clips or distorts photos that were shot/composited with
// negative space around the subject — like the hero product shot, which
// is meant to float inside its frame rather than fill it edge to edge.
//
// Takes a plain string URL rather than Framer's ResponsiveImage control:
// the MCP's XML writer only round-trips scalar prop values, not the
// {src, srcSet, alt} object ResponsiveImage expects.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface ContainImageProps {
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
    const { src, alt, style } = props

    const wrapperStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
    }

    if (!src) {
        return <div style={wrapperStyle} />
    }

    return (
        <div style={wrapperStyle}>
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
        </div>
    )
}

ContainImage.defaultProps = {
    src: "",
    alt: "",
}

addPropertyControls(ContainImage, {
    src: {
        type: ControlType.String,
        title: "Image URL",
        defaultValue: "",
    },
    alt: {
        type: ControlType.String,
        title: "Alt text",
        defaultValue: "",
    },
})
