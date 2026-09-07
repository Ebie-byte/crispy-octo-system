// A placeholder-aware image slot.
//
// User instructions served:
//  - hero: "real photo to be supplied separately — leave as a clearly marked
//    placeholder image slot for now"
//  - about: the Planet Fitness logo, "leave as a clearly marked placeholder
//    asset slot; do not attempt to recreate their logo, it must be the real
//    file supplied separately"
//  - final CTA: "a QR code image (placeholder for now)"
//
// Two reasons this is a code component rather than a Framer image layer:
//
//  1. The MCP's XML writer cannot set `backgroundImage` at all — not on create,
//     not on update (see framer/README.md). An agent-placed image has to go
//     through a `src` string prop.
//  2. The hero needs a gradient fade from the photo into the page background,
//     and gradients are not expressible through the XML `backgroundColor`
//     attribute either.
//
// Dropping the real asset in later is a two-step job with no code change:
// drag the file onto the canvas to upload it, copy its framerusercontent URL,
// paste it into this instance's Source field.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { tokens } from "https://framer.com/m/tristanConfig-9QrhiB.js"

interface ImageSlotProps {
    src: string
    alt: string
    slotLabel: string
    slotNote: string
    fit: "cover" | "contain"
    focus: string
    fade: "none" | "left" | "bottom" | "left and bottom"
    fadeColor: string
    placeholderBackground: string
    style?: CSSProperties
}

/**
 * Renders `src` when set, and a clearly marked placeholder when not.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 480
 * @framerIntrinsicHeight 640
 */
export default function ImageSlot(props: ImageSlotProps) {
    const {
        src,
        alt,
        slotLabel,
        slotNote,
        fit,
        focus,
        fade,
        fadeColor,
        placeholderBackground,
        style,
    } = props

    const hasImage = typeof src === "string" && src.trim().length > 0
    const fadesLeft = fade === "left" || fade === "left and bottom"
    const fadesBottom = fade === "bottom" || fade === "left and bottom"

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: hasImage ? "transparent" : placeholderBackground,
                ...style,
            }}
        >
            {hasImage ? (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: fit,
                        objectPosition: focus,
                    }}
                />
            ) : (
                <Placeholder label={slotLabel} note={slotNote} />
            )}

            {/*
                The fades sit above the photograph, so the headline column
                reads against flat page colour rather than against the
                picture. Pointer-events off so they never eat a click meant
                for something underneath.
            */}
            {hasImage && fadesLeft && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: `linear-gradient(90deg, ${fadeColor} 0%, ${fadeColor} 12%, rgba(0,0,0,0) 62%)`,
                    }}
                />
            )}
            {hasImage && fadesBottom && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: `linear-gradient(0deg, ${fadeColor} 0%, rgba(0,0,0,0) 34%)`,
                    }}
                />
            )}
        </div>
    )
}

function Placeholder({ label, note }: { label: string; note: string }) {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 20,
                boxSizing: "border-box",
                border: `1px dashed ${tokens.line}`,
                textAlign: "center",
                fontFamily: tokens.sans,
            }}
        >
            {/* A quiet cross-hair, so an empty slot reads as deliberate. */}
            <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M3.5 3.5h17v17h-17z M3.5 16l5-5 4.5 4.5 3-3 4.5 4.5"
                    stroke={tokens.faint}
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
                <circle cx="9" cy="8.5" r="1.6" fill={tokens.faint} />
            </svg>
            <div
                style={{
                    fontSize: 10,
                    letterSpacing: 2.5,
                    textTransform: "uppercase",
                    color: tokens.dim,
                }}
            >
                {label}
            </div>
            {note ? (
                <div
                    style={{
                        fontSize: 11,
                        lineHeight: 1.6,
                        color: tokens.faint,
                        maxWidth: 240,
                    }}
                >
                    {note}
                </div>
            ) : null}
        </div>
    )
}

ImageSlot.defaultProps = {
    src: "",
    alt: "",
    slotLabel: "Image slot",
    slotNote: "Drag the asset onto the canvas, then paste its URL into Source.",
    fit: "cover" as const,
    focus: "50% 50%",
    fade: "none" as const,
    fadeColor: tokens.ink,
    placeholderBackground: tokens.panel,
}

addPropertyControls(ImageSlot, {
    src: {
        type: ControlType.String,
        title: "Source",
        placeholder: "https://framerusercontent.com/images/....jpg",
        defaultValue: "",
    },
    alt: {
        type: ControlType.String,
        title: "Alt text",
        defaultValue: "",
    },
    slotLabel: {
        type: ControlType.String,
        title: "Slot label",
        defaultValue: "Image slot",
    },
    slotNote: {
        type: ControlType.String,
        title: "Slot note",
        displayTextArea: true,
        defaultValue:
            "Drag the asset onto the canvas, then paste its URL into Source.",
    },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        options: ["cover", "contain"],
        optionTitles: ["Cover (crop)", "Contain (whole image)"],
        defaultValue: "cover",
    },
    focus: {
        type: ControlType.String,
        title: "Focus",
        placeholder: "50% 50%",
        defaultValue: "50% 50%",
        hidden: (p: Partial<ImageSlotProps>) => p.fit !== "cover",
    },
    fade: {
        type: ControlType.Enum,
        title: "Fade",
        options: ["none", "left", "bottom", "left and bottom"],
        defaultValue: "none",
    },
    fadeColor: {
        type: ControlType.Color,
        title: "Fade to",
        defaultValue: tokens.ink,
        hidden: (p: Partial<ImageSlotProps>) => p.fade === "none",
    },
    placeholderBackground: {
        type: ControlType.Color,
        title: "Empty bg",
        defaultValue: tokens.panel,
    },
})
