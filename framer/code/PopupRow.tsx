// One line of the "where to find us" schedule.
//
// Built as an editorial list row rather than a card: a date block, the
// venue, the hours, the area, and an arrow that slides on hover. Rows
// divided by hairlines read as a printed schedule; boxes would read as a
// dashboard.
//
// Text lives in props rather than in child Framer layers because these
// rows change every week — editing four fields in the properties panel is
// faster than editing four nested text layers, and it keeps the row's
// internal alignment from drifting as the copy changes.
//
// `past` dims a row that has already happened without removing it, so the
// schedule can carry a little history.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import type { CSSProperties } from "react"

interface PopupRowProps {
    day?: string
    date?: string
    venue?: string
    hours?: string
    area?: string
    index?: number
    past?: boolean
    ink?: string
    muted?: string
    accent?: string
    rule?: string
    style?: CSSProperties
}

const SETTLE = [0.16, 1, 0.3, 1] as const
const SANS = "Montserrat, Inter, Helvetica, Arial, sans-serif"
const SERIF = "'Playfair Display', Georgia, serif"

/**
 * A single pop-up schedule row.
 *
 * @framerIntrinsicWidth 1100
 * @framerIntrinsicHeight 104
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function PopupRow({
    day = "SAT",
    date = "00",
    venue = "Venue name",
    hours = "00:00 - 00:00",
    area = "Area",
    index = 0,
    past = false,
    ink = "rgb(36, 31, 25)",
    muted = "rgb(121, 114, 106)",
    accent = "rgb(201, 160, 99)",
    rule = "rgba(36, 31, 25, 0.10)",
    style,
}: PopupRowProps) {
    const ref = useRef<HTMLDivElement>(null)

    const isStatic = useIsStaticRenderer()
    const prefersReducedMotion = useReducedMotion()
    const motionOff = isStatic || prefersReducedMotion
    const inView = useInView(ref, { once: true, margin: "-10% 0px" })

    const shouldReveal = !motionOff
    const shouldHover = !motionOff && !past

    const wrapper: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "26px 4px",
        borderBottom: `1px solid ${rule}`,
        opacity: past ? 0.45 : 1,
        ...style,
    }

    return (
        <motion.div
            ref={ref}
            style={wrapper}
            initial={shouldReveal ? "hidden" : false}
            animate={shouldReveal && !inView ? "hidden" : "shown"}
            whileHover={shouldHover ? "hover" : undefined}
            variants={{
                hidden: { opacity: 0, y: 18 },
                shown: { opacity: past ? 0.45 : 1, y: 0 },
                hover: { opacity: past ? 0.45 : 1, y: 0 },
            }}
            transition={{
                duration: 0.75,
                ease: SETTLE,
                delay: shouldReveal ? Math.max(0, index) * 0.08 : 0,
            }}
        >
            {/* date block */}
            <div
                style={{
                    flex: "0 0 auto",
                    minWidth: 62,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 2,
                }}
            >
                <span
                    style={{
                        fontFamily: SANS,
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: accent,
                    }}
                >
                    {day}
                </span>
                <span
                    style={{
                        fontFamily: SERIF,
                        fontSize: 30,
                        lineHeight: 1,
                        color: ink,
                    }}
                >
                    {date}
                </span>
            </div>

            {/* venue */}
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: SERIF,
                        fontSize: 24,
                        lineHeight: 1.25,
                        color: ink,
                    }}
                >
                    {venue}
                </div>
            </div>

            {/* hours + area */}
            <div
                style={{
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                }}
            >
                <span
                    style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        letterSpacing: 0.2,
                        color: muted,
                    }}
                >
                    {hours}
                </span>
                <span
                    style={{
                        fontFamily: SANS,
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: muted,
                    }}
                >
                    {area}
                </span>
                <motion.svg
                    viewBox="0 0 24 24"
                    width={16}
                    height={16}
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                    style={{ display: "block" }}
                    variants={{
                        hidden: { x: 0 },
                        shown: { x: 0 },
                        hover: { x: 6 },
                    }}
                    transition={{ duration: 0.45, ease: SETTLE }}
                >
                    <path d="M4.5 12h14" />
                    <path d="M12.8 6.3 18.5 12l-5.7 5.7" />
                </motion.svg>
            </div>
        </motion.div>
    )
}

addPropertyControls(PopupRow, {
    day: { type: ControlType.String, title: "Day", defaultValue: "SAT" },
    date: { type: ControlType.String, title: "Date", defaultValue: "00" },
    venue: {
        type: ControlType.String,
        title: "Venue",
        defaultValue: "Venue name",
    },
    hours: {
        type: ControlType.String,
        title: "Hours",
        defaultValue: "00:00 - 00:00",
    },
    area: { type: ControlType.String, title: "Area", defaultValue: "Area" },
    index: {
        type: ControlType.Number,
        title: "Order",
        min: 0,
        max: 20,
        step: 1,
        defaultValue: 0,
    },
    past: {
        type: ControlType.Boolean,
        title: "Past",
        enabledTitle: "Dimmed",
        disabledTitle: "Upcoming",
        defaultValue: false,
    },
    ink: {
        type: ControlType.Color,
        title: "Ink",
        defaultValue: "rgb(36, 31, 25)",
    },
    muted: {
        type: ControlType.Color,
        title: "Muted",
        defaultValue: "rgb(121, 114, 106)",
    },
    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "rgb(201, 160, 99)",
    },
    rule: {
        type: ControlType.Color,
        title: "Rule",
        defaultValue: "rgba(36, 31, 25, 0.10)",
    },
})
