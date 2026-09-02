// Hover lift + shadow bloom for a button — the button rises a few px with a
// soft coloured shadow blooming beneath it, and presses back down on tap,
// instead of a flat colour swap.
//
// Same "driver" pattern as StaggerIn, and for the same reason: a Slot-based
// wrapper cannot be populated over Framer's MCP at all. Drop this in as a
// zero-size, absolutely positioned child of the button's own Stack. It walks
// up to its parent element and drives that — so the button keeps its real
// label, its icon, and its link, all still editable on canvas.
//
// The parent's existing transform is read once and kept as a prefix, so if
// Framer is already transforming that node for layout we compose with it
// rather than clobbering it.

import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useLayoutEffect, useRef } from "react"
import type { CSSProperties } from "react"

interface HoverLiftProps {
    lift: number
    glowColor: string
    pressScale: number
    style?: CSSProperties
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"
const FLAT = "0 0px 0px 0 rgba(0, 0, 0, 0)"

// Framer may render a component instance inside one or more pass-through
// wrapper divs. Climb out of any ancestor that has no other children, so we
// drive the designed button stack and not an anonymous wrapper.
function findTarget(host: HTMLElement): HTMLElement | null {
    let self = host
    let parent = self.parentElement
    while (parent && parent.children.length === 1) {
        self = parent
        parent = self.parentElement
    }
    return parent
}

/**
 * HOVER LIFT
 *
 * @framerIntrinsicWidth 0
 * @framerIntrinsicHeight 0
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function HoverLift(props: HoverLiftProps) {
    const { lift, glowColor, pressScale, style } = props
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const host = ref.current
        if (!host) return
        if (RenderTarget.current() === RenderTarget.canvas) return
        if (typeof window === "undefined") return

        const target = findTarget(host)
        if (!target) return

        const reduced =
            window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
            false

        const computed = getComputedStyle(target).transform
        const base = computed && computed !== "none" ? `${computed} ` : ""

        const prev = {
            transition: target.style.transition,
            transform: target.style.transform,
            boxShadow: target.style.boxShadow,
            cursor: target.style.cursor,
            willChange: target.style.willChange,
        }

        target.style.transition = `transform 0.34s ${EASE}, box-shadow 0.34s ${EASE}`
        target.style.willChange = "transform, box-shadow"
        target.style.cursor = "pointer"
        target.style.boxShadow = FLAT

        const glow = `0 ${14 + lift * 2}px ${28 + lift * 2}px -12px ${glowColor}`

        const rest = () => {
            target.style.transform = `${base}translateY(0px)`
            target.style.boxShadow = FLAT
        }
        const raise = () => {
            target.style.transform = reduced
                ? `${base}translateY(0px)`
                : `${base}translateY(${-lift}px)`
            target.style.boxShadow = glow
        }
        const press = () => {
            target.style.transform = reduced
                ? `${base}translateY(0px)`
                : `${base}translateY(${-Math.max(lift - 2, 0)}px) scale(${pressScale})`
        }

        target.addEventListener("pointerenter", raise)
        target.addEventListener("pointerleave", rest)
        target.addEventListener("pointerdown", press)
        target.addEventListener("pointerup", raise)
        target.addEventListener("pointercancel", rest)

        return () => {
            target.removeEventListener("pointerenter", raise)
            target.removeEventListener("pointerleave", rest)
            target.removeEventListener("pointerdown", press)
            target.removeEventListener("pointerup", raise)
            target.removeEventListener("pointercancel", rest)
            target.style.transition = prev.transition
            target.style.transform = prev.transform
            target.style.boxShadow = prev.boxShadow
            target.style.cursor = prev.cursor
            target.style.willChange = prev.willChange
        }
    }, [lift, glowColor, pressScale])

    return (
        <div
            ref={ref}
            aria-hidden="true"
            style={{ width: 0, height: 0, pointerEvents: "none", ...style }}
        />
    )
}

HoverLift.defaultProps = {
    lift: 3,
    glowColor: "rgba(182, 127, 106, 0.5)",
    pressScale: 0.98,
}

addPropertyControls(HoverLift, {
    lift: {
        type: ControlType.Number,
        title: "Lift",
        defaultValue: 3,
        min: 0,
        max: 12,
        step: 1,
        unit: "px",
    },
    glowColor: {
        type: ControlType.Color,
        title: "Glow",
        defaultValue: "rgba(182, 127, 106, 0.5)",
    },
    pressScale: {
        type: ControlType.Number,
        title: "Press",
        defaultValue: 0.98,
        min: 0.9,
        max: 1,
        step: 0.005,
    },
})
