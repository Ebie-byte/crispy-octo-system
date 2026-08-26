// A stat figure that counts up when it scrolls into view.
//
// Takes the finished string ("2,000+", "100%", "5") and animates only the
// number inside it, keeping whatever sits either side. That means the copy
// stays readable in the properties panel — you type what you want the
// viewer to end on, not a number plus three formatting props.
//
// Values with no number in them ("Premium") simply render as text, so the
// four stats can all use this component and stay typographically identical.
//
// The counter runs on a MotionValue rendered directly as a child, so the
// React tree does NOT re-render on every frame — only the text node
// updates. A useState counter here would re-render the section ~60 times a
// second.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import {
    animate,
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "framer-motion"
import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"

interface CountUpProps {
    value?: string
    duration?: number
    fontSize?: number
    color?: string
    align?: "left" | "center" | "right"
    style?: CSSProperties
}

const SERIF = "'Playfair Display', Georgia, serif"

// First run of digits, optionally with thousands separators.
const NUMBER = /[0-9][0-9,\s]*/

interface Parsed {
    prefix: string
    target: number
    suffix: string
    grouped: boolean
    raw: string
}

function parse(value: string): Parsed | null {
    const match = value.match(NUMBER)
    if (!match || match.index === undefined) return null

    const digits = match[0]
    const numeric = Number(digits.replace(/[,\s]/g, ""))
    if (!Number.isFinite(numeric)) return null

    return {
        prefix: value.slice(0, match.index),
        target: numeric,
        suffix: value.slice(match.index + digits.length),
        grouped: digits.includes(","),
        raw: value,
    }
}

/**
 * Stat figure that counts up on entering the viewport.
 *
 * @framerIntrinsicWidth 140
 * @framerIntrinsicHeight 40
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function CountUp({
    value = "0",
    duration = 1.8,
    fontSize = 30,
    color = "rgb(36, 31, 25)",
    align = "left",
    style,
}: CountUpProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion
    const inView = useInView(ref, { once: true, margin: "-10% 0px" })

    const parsed = parse(value)
    const shouldCount = !!parsed && !motionOff

    const count = useMotionValue(shouldCount ? 0 : (parsed?.target ?? 0))

    const text = useTransform(count, (current) => {
        if (!parsed) return value
        const rounded = Math.round(current)
        const body = parsed.grouped
            ? rounded.toLocaleString("en-US")
            : String(rounded)
        return `${parsed.prefix}${body}${parsed.suffix}`
    })

    useEffect(() => {
        if (!shouldCount || !inView || !parsed) return
        const controls = animate(count, parsed.target, {
            duration: Math.max(0.2, duration),
            ease: [0.16, 1, 0.3, 1],
        })
        return () => controls.stop()
    }, [shouldCount, inView, parsed?.target, duration, count])

    const wrapper: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent:
            align === "left"
                ? "flex-start"
                : align === "right"
                  ? "flex-end"
                  : "center",
        fontFamily: SERIF,
        fontSize,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        color,
        whiteSpace: "nowrap",
        ...style,
    }

    // No number to animate — render the string as-is.
    if (!parsed) {
        return (
            <div ref={ref} style={wrapper}>
                <span>{value}</span>
            </div>
        )
    }

    return (
        <div ref={ref} style={wrapper}>
            <motion.span>{text}</motion.span>
        </div>
    )
}

addPropertyControls(CountUp, {
    value: {
        type: ControlType.String,
        title: "Value",
        defaultValue: "0",
        description: "Type the final figure, e.g. 2,000+ or 100%",
    },
    duration: {
        type: ControlType.Number,
        title: "Duration",
        min: 0.2,
        max: 6,
        step: 0.1,
        unit: "s",
        defaultValue: 1.8,
    },
    fontSize: {
        type: ControlType.Number,
        title: "Size",
        min: 12,
        max: 96,
        step: 1,
        unit: "px",
        defaultValue: 30,
    },
    color: {
        type: ControlType.Color,
        title: "Colour",
        defaultValue: "rgb(36, 31, 25)",
    },
    align: {
        type: ControlType.Enum,
        title: "Align",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Centre", "Right"],
        defaultValue: "left",
        displaySegmentedControl: true,
    },
})
