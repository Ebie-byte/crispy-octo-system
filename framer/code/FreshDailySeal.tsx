// The circular "Fresh Daily / Premium Quality" seal that sits over the
// promise-section photograph: a navy disc with a thin gold ring, curved
// gold lettering top and bottom, and the Cibón swirl in the centre.
//
// Note: the text props are deliberately NOT named top*/bottom*/left*/right*,
// because those names collide with Framer layout pin attributes when the
// instance is written from XML.

import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface FreshDailySealProps {
    lineOne: string
    lineTwo: string
    disc: string
    ink: string
    style?: CSSProperties
}

const UPPER_ARC = "M 100,100 m -72,0 a 72,72 0 1,1 144,0"
const LOWER_ARC = "M 100,100 m 72,0 a 72,72 0 1,1 -144,0"

/**
 * Circular foil-style seal for the promise section.
 *
 * @framerIntrinsicWidth 150
 * @framerIntrinsicHeight 150
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function FreshDailySeal(props: FreshDailySealProps) {
    const { lineOne, lineTwo, disc, ink, style } = props

    const wrapperStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
    }

    return (
        <div style={wrapperStyle}>
            <svg
                viewBox="0 0 200 200"
                width="100%"
                height="100%"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <path id="cibon-seal-upper" d={UPPER_ARC} fill="none" />
                    <path id="cibon-seal-lower" d={LOWER_ARC} fill="none" />
                </defs>

                <circle cx="100" cy="100" r="100" fill={disc} />
                <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke={ink}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                />

                <g
                    fill={ink}
                    fontFamily="Montserrat, Inter, Helvetica, Arial, sans-serif"
                    fontSize="14"
                    fontWeight="500"
                    letterSpacing="3.4"
                >
                    <text>
                        <textPath
                            href="#cibon-seal-upper"
                            startOffset="50%"
                            textAnchor="middle"
                        >
                            {lineOne}
                        </textPath>
                    </text>
                    <text>
                        <textPath
                            href="#cibon-seal-lower"
                            startOffset="50%"
                            textAnchor="middle"
                        >
                            {lineTwo}
                        </textPath>
                    </text>
                </g>

                <g
                    fill="none"
                    stroke={ink}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    transform="translate(100 100) scale(2.1) translate(-12 -12)"
                >
                    <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 1 0 0-17.6" />
                    <path d="M12 7.6a4.4 4.4 0 1 0 4.4 4.4A2.9 2.9 0 0 0 13.5 9.1 1.9 1.9 0 0 0 11.6 11" />
                </g>

                <circle cx="14" cy="100" r="2" fill={ink} />
                <circle cx="186" cy="100" r="2" fill={ink} />
            </svg>
        </div>
    )
}

FreshDailySeal.defaultProps = {
    lineOne: "FRESH DAILY",
    lineTwo: "PREMIUM QUALITY",
    disc: "rgb(15, 30, 52)",
    ink: "rgb(221, 187, 134)",
}

addPropertyControls(FreshDailySeal, {
    lineOne: {
        type: ControlType.String,
        title: "Upper",
        defaultValue: "FRESH DAILY",
    },
    lineTwo: {
        type: ControlType.String,
        title: "Lower",
        defaultValue: "PREMIUM QUALITY",
    },
    disc: {
        type: ControlType.Color,
        title: "Disc",
        defaultValue: "rgb(15, 30, 52)",
    },
    ink: {
        type: ControlType.Color,
        title: "Ink",
        defaultValue: "rgb(221, 187, 134)",
    },
})
