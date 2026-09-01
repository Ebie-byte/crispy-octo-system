// Instructions: every photograph on the T Lashes homepage — the five service
// cards, the hero eye close-up and Tanith's portrait. Framer's backgroundImage
// attribute cannot be written over MCP, so images arrive here as a plain `src`
// string. With no src it renders a designed blush placeholder rather than a
// broken frame, so the layout reads correctly before the real photos land.
//
// `fit` matters: a photograph that is already composited (the hero eye, with
// its glow ring, podium and monogram baked in) must be "contain" so none of
// that composition is cropped away. Cards and portraits use "cover".

import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import { useState } from "react"
import type { CSSProperties } from "react"

interface PhotoProps {
    src: string
    alt: string
    fit: "cover" | "contain"
    radius: number
    focalX: number
    focalY: number
    hoverZoom: boolean
    placeholderLabel: string
    tintFrom: string
    tintTo: string
    style?: CSSProperties
}

/**
 * PHOTO
 *
 * @framerIntrinsicWidth 240
 * @framerIntrinsicHeight 200
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function Photo(props: PhotoProps) {
    const {
        src,
        alt,
        fit,
        radius,
        focalX,
        focalY,
        hoverZoom,
        placeholderLabel,
        tintFrom,
        tintTo,
        style,
    } = props

    const [hovered, setHovered] = useState(false)
    const hasSrc = typeof src === "string" && src.trim().length > 0

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: radius,
                background: `linear-gradient(150deg, ${tintFrom} 0%, ${tintTo} 100%)`,
                ...style,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {hasSrc ? (
                <motion.img
                    src={src}
                    alt={alt}
                    draggable={false}
                    animate={{ scale: hoverZoom && hovered ? 1.06 : 1 }}
                    transition={{
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: fit,
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
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        padding: 16,
                        textAlign: "center",
                    }}
                >
                    {/* A lash arc, so an empty slot still reads as this brand. */}
                    <svg
                        width="46"
                        height="26"
                        viewBox="0 0 46 26"
                        fill="none"
                        stroke="rgba(28,23,20,0.34)"
                        strokeWidth="1.1"
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
                    {placeholderLabel ? (
                        <span
                            style={{
                                fontFamily:
                                    "Montserrat, 'Helvetica Neue', Helvetica, sans-serif",
                                fontSize: 9.5,
                                letterSpacing: "1.4px",
                                textTransform: "uppercase",
                                color: "rgba(28,23,20,0.42)",
                                lineHeight: 1.6,
                                maxWidth: "90%",
                            }}
                        >
                            {placeholderLabel}
                        </span>
                    ) : null}
                </div>
            )}
        </div>
    )
}

Photo.defaultProps = {
    src: "",
    alt: "",
    fit: "cover" as const,
    radius: 0,
    focalX: 50,
    focalY: 50,
    hoverZoom: false,
    placeholderLabel: "Add photo",
    tintFrom: "#F2E2DB",
    tintTo: "#E7CBC2",
}

addPropertyControls(Photo, {
    src: {
        type: ControlType.String,
        title: "Image URL",
        defaultValue: "",
        placeholder: "https://…",
    },
    alt: { type: ControlType.String, title: "Alt", defaultValue: "" },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        defaultValue: "cover",
        options: ["cover", "contain"],
        optionTitles: ["Fill", "Fit"],
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        max: 400,
        step: 1,
        unit: "px",
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
    hoverZoom: {
        type: ControlType.Boolean,
        title: "Hover Zoom",
        defaultValue: false,
    },
    placeholderLabel: {
        type: ControlType.String,
        title: "Empty Label",
        defaultValue: "Add photo",
    },
    tintFrom: {
        type: ControlType.Color,
        title: "Tint From",
        defaultValue: "#F2E2DB",
    },
    tintTo: { type: ControlType.Color, title: "Tint To", defaultValue: "#E7CBC2" },
})
