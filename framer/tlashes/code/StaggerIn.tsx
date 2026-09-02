// Staggered entrance reveal for a stack of hero copy.
//
// WHY THIS IS A "DRIVER" AND NOT A WRAPPER
// The obvious build is a wrapper component with a ControlType.Slot that you
// nest the text inside. That is impossible over Framer's MCP: slot children
// can never be attached from XML (three verified attempts, and the
// "Moved node X from parent Y to Z" status messages come back false), and
// getComponentInsertUrlAndTypes reports no props at all for a slot-only
// component. The other fallback — hardcoding the copy as string props —
// would cost inline canvas editing and force every text style to be
// re-implemented in CSS, which is exactly how typography drifts away from
// the client's design.
//
// So instead: drop this component into a stack as a zero-size, absolutely
// positioned child. On mount it reads its own parent element, finds the
// sibling elements that actually carry content, and animates them in
// sequence. Every headline, script line and button stays a completely
// normal, editable Framer node — this component only supplies the motion.
//
// Spacer frames are skipped automatically (they hold no text and no
// image), so the stagger index counts real copy elements only.
//
// The easing (0.16, 1, 0.3, 1) is a slow expo-out — it decelerates hard at
// the end, which is what makes entrance motion read as premium rather than
// mechanical. fill: "backwards" holds the from-state through the delay, so
// later items stay hidden until their turn instead of flashing in first.

import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useLayoutEffect, useRef } from "react"
import type { CSSProperties } from "react"

interface StaggerInProps {
    startDelay: number
    stagger: number
    rise: number
    duration: number
    style?: CSSProperties
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"

function hasContent(el: Element): boolean {
    if ((el.textContent ?? "").trim().length > 0) return true
    return el.querySelector("img, svg, canvas, video, picture") !== null
}

// Framer may render a component instance inside one or more pass-through
// wrapper divs. Climb out of any ancestor that has no other children, so
// "siblings" means the real siblings in the designed stack.
function escapeWrappers(host: HTMLElement): {
    self: HTMLElement
    parent: HTMLElement | null
} {
    let self = host
    let parent = self.parentElement
    while (parent && parent.children.length === 1) {
        self = parent
        parent = self.parentElement
    }
    return { self, parent }
}

/**
 * STAGGER IN
 *
 * @framerIntrinsicWidth 0
 * @framerIntrinsicHeight 0
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function StaggerIn(props: StaggerInProps) {
    const { startDelay, stagger, rise, duration, style } = props
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const host = ref.current
        if (!host) return
        if (RenderTarget.current() === RenderTarget.canvas) return
        if (typeof window === "undefined") return
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
            return
        }

        const { self, parent } = escapeWrappers(host)
        if (!parent) return

        const targets = Array.from(parent.children).filter(
            (el): el is HTMLElement =>
                el !== self && el instanceof HTMLElement && hasContent(el)
        )
        if (targets.length === 0) return

        const clearHints = () => {
            for (const el of targets) el.style.willChange = ""
        }

        const animations = targets.map((el, i) => {
            el.style.willChange = "opacity, transform"
            return el.animate(
                [
                    { opacity: "0", transform: `translateY(${rise}px)` },
                    { opacity: "1", transform: "translateY(0px)" },
                ],
                {
                    duration: duration * 1000,
                    delay: (startDelay + i * stagger) * 1000,
                    easing: EASE,
                    fill: "backwards",
                }
            )
        })

        Promise.all(animations.map((a) => a.finished)).then(clearHints, () => {})

        return () => {
            for (const a of animations) a.cancel()
            clearHints()
        }
    }, [startDelay, stagger, rise, duration])

    return (
        <div
            ref={ref}
            aria-hidden="true"
            style={{ width: 0, height: 0, pointerEvents: "none", ...style }}
        />
    )
}

StaggerIn.defaultProps = {
    startDelay: 0.1,
    stagger: 0.12,
    rise: 14,
    duration: 0.8,
}

addPropertyControls(StaggerIn, {
    startDelay: {
        type: ControlType.Number,
        title: "Start",
        defaultValue: 0.1,
        min: 0,
        max: 2,
        step: 0.02,
        unit: "s",
    },
    stagger: {
        type: ControlType.Number,
        title: "Stagger",
        defaultValue: 0.12,
        min: 0,
        max: 0.6,
        step: 0.01,
        unit: "s",
    },
    rise: {
        type: ControlType.Number,
        title: "Rise",
        defaultValue: 14,
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
    },
    duration: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: 0.8,
        min: 0.1,
        max: 2,
        step: 0.05,
        unit: "s",
    },
})
