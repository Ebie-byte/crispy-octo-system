// Instructions: the hero's blush environment — the warm gradient ground, the
// bloom of light behind the eye portrait, and soft out-of-focus blossom
// shapes bleeding in from the corners. Sits absolutely behind the hero
// content; never takes pointer events.
//
// NOTE: the top colour prop is called `skyTop`, not `top`. A prop named `top`
// is swallowed by the layout pin attribute of the same name when an instance
// is written from XML over MCP.
//
// NOTE: this component deliberately uses ONLY plain CSS (linear-gradient,
// radial-gradient, border-radius). An earlier version built the blossom
// shapes as SVG <ellipse> nodes behind an SVG <filter><feGaussianBlur>, with
// the bloom animated via framer-motion. Both were confirmed present in the
// deployed code and correctly wired to the instance on the page, yet the
// rendered result in Framer's own canvas showed no visible effect at all —
// a flat gradient with no bloom, no blossoms. Whatever the exact cause
// (SVG filter primitives or framer-motion's animate effects not running in
// Framer's canvas render pass), it wasn't diagnosable without visual access
// to the canvas, so the fix was to stop depending on either: radial-gradient
// already produces a soft falloff on its own, no blur filter needed, and a
// plain static div needs no animation library to hold an opacity.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface HeroBackdropProps {
    skyTop: string
    mid: string
    base: string
    bloom: string
    blossom: string
    style?: CSSProperties
}

interface Blob {
    left: number
    top: number
    w: number
    h: number
    opacity: number
}

// One cluster's petals, as offsets from the cluster's own anchor point.
// Values are px, tuned against a 1440x620 frame — the same coordinate
// philosophy as the previous SVG viewBox, just consumed by plain divs.
const PETALS: Blob[] = [
    { left: 0, top: 0, w: 320, h: 240, opacity: 0.55 },
    { left: 210, top: 160, w: 260, h: 200, opacity: 0.42 },
    { left: -70, top: 220, w: 280, h: 210, opacity: 0.48 },
    { left: 260, top: -60, w: 190, h: 150, opacity: 0.32 },
    { left: 90, top: 320, w: 220, h: 170, opacity: 0.36 },
    { left: -110, top: 60, w: 200, h: 160, opacity: 0.3 },
]

function Cluster({
    anchorLeft,
    anchorTop,
    color,
    scale = 1,
}: {
    anchorLeft: number
    anchorTop: number
    color: string
    scale?: number
}) {
    return (
        <>
            {PETALS.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        left: anchorLeft + p.left * scale,
                        top: anchorTop + p.top * scale,
                        width: p.w * scale,
                        height: p.h * scale,
                        opacity: p.opacity,
                        borderRadius: "50%",
                        background: `radial-gradient(ellipse at center, ${color} 0%, ${color} 22%, transparent 72%)`,
                    }}
                />
            ))}
        </>
    )
}

/**
 * HERO BACKDROP
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 620
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function HeroBackdrop(props: HeroBackdropProps) {
    const { skyTop, mid, base, bloom, blossom, style } = props

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                background: `linear-gradient(178deg, ${skyTop} 0%, ${mid} 46%, ${base} 100%)`,
                ...style,
            }}
            aria-hidden="true"
        >
            {/* Blossom clusters, bleeding in from three corners. */}
            <Cluster anchorLeft={-180} anchorTop={200} color={blossom} />
            <Cluster anchorLeft={1180} anchorTop={-140} color={blossom} scale={1.1} />
            <Cluster anchorLeft={1260} anchorTop={300} color={blossom} scale={0.85} />

            {/* Bloom of warm light behind the portrait. */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "42%",
                    width: 900,
                    height: 900,
                    marginLeft: -450,
                    marginTop: -450,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${bloom} 0%, rgba(255,255,255,0) 66%)`,
                }}
            />

            {/* A cooler catch of light in the upper right, as in the reference. */}
            <div
                style={{
                    position: "absolute",
                    right: "-6%",
                    top: "-20%",
                    width: 620,
                    height: 620,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 68%)",
                }}
            />

            {/* Pale floor, so the podium has something to stand on. */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "26%",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,252,250,0.72) 100%)",
                }}
            />
        </div>
    )
}

HeroBackdrop.defaultProps = {
    skyTop: "#F8EBE2",
    mid: "#EAC8BE",
    base: "#FBF6F3",
    bloom: "rgba(255, 214, 178, 0.98)",
    blossom: "#E9ACAC",
}

addPropertyControls(HeroBackdrop, {
    skyTop: { type: ControlType.Color, title: "Top", defaultValue: "#F8EBE2" },
    mid: { type: ControlType.Color, title: "Middle", defaultValue: "#EAC8BE" },
    base: { type: ControlType.Color, title: "Base", defaultValue: "#FBF6F3" },
    bloom: {
        type: ControlType.Color,
        title: "Bloom",
        defaultValue: "rgba(255, 214, 178, 0.98)",
    },
    blossom: { type: ControlType.Color, title: "Blossom", defaultValue: "#E9ACAC" },
})
