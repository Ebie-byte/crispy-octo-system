// The Locations picker.
//
// User instructions served:
//
//  - "Three selectable rows, each showing branch name + a small caption, with a
//     radio-style selection indicator on the right. Real branches: Durbanville
//     ('MY HOME BRANCH', selected by default), De Waterkant ('TUESDAYS &
//     THURSDAYS'), Plattekloof ('BY REQUEST')"
//
//  - "Should selecting a branch in the Locations section pre-fill the Preferred
//     Branch dropdown in the booking form?" -> "Yes — wire the selection
//     through."
//
//     The selection is written to the shared store in tristanConfig, which
//     ConsultationSheet reads when it opens. The two components are far apart
//     on the canvas and never nested, so a module-level store does the work
//     that prop drilling cannot.
//
// Built on real <input type="radio"> elements rather than styled divs, so
// arrow-key navigation, focus order and screen-reader semantics all come from
// the browser instead of being reimplemented badly.

import { addPropertyControls, ControlType } from "framer"
import { startTransition, useId } from "react"
import type { CSSProperties } from "react"
// @ts-ignore — Framer resolves code-file module URLs at runtime; the typechecker has no declarations for them.
import { BRANCHES, BRANCH_CAPTIONS, setSelectedBranch, tokens, useSelectedBranch } from "https://framer.com/m/tristanConfig-9QrhiB.js"

interface BranchSelectorProps {
    style?: CSSProperties
}

/**
 * The three selectable branch rows.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 560
 * @framerIntrinsicHeight 190
 */
export default function BranchSelector(props: BranchSelectorProps) {
    const selected = useSelectedBranch()

    const rawId = useId()
    const cls = `bs${rawId.replace(/[^a-zA-Z0-9]/g, "")}`
    const groupName = `${cls}-branch`

    const css = `
.${cls}-row{cursor:pointer;transition:background-color 200ms ease}
.${cls}-row:hover{background:rgba(255,255,255,0.022)}
.${cls}-row:has(input:focus-visible){outline:2px solid ${tokens.accent};outline-offset:-2px}
`

    return (
        <div
            style={{
                position: "relative",
                boxSizing: "border-box",
                width: "100%",
                border: `1px solid ${tokens.line}`,
                background: tokens.panel,
                fontFamily: tokens.sans,
                ...props.style,
            }}
        >
            <style>{css}</style>
            <div role="radiogroup" aria-label="Preferred branch">
                {BRANCHES.map((branch: string, index: number) => {
                    const isSelected = branch === selected
                    return (
                        <label
                            key={branch}
                            className={`${cls}-row`}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                padding: "18px 22px",
                                borderTop:
                                    index === 0
                                        ? "none"
                                        : `1px solid ${tokens.line}`,
                                background: isSelected
                                    ? "rgba(63,123,196,0.05)"
                                    : "transparent",
                            }}
                        >
                            <input
                                type="radio"
                                name={groupName}
                                value={branch}
                                checked={isSelected}
                                onChange={() =>
                                    startTransition(() =>
                                        setSelectedBranch(branch)
                                    )
                                }
                                style={{
                                    position: "absolute",
                                    width: 1,
                                    height: 1,
                                    opacity: 0,
                                    margin: 0,
                                    pointerEvents: "none",
                                }}
                            />

                            <Dot selected={isSelected} />

                            <span
                                style={{
                                    flex: 1,
                                    fontSize: 16,
                                    fontWeight: 500,
                                    letterSpacing: "-0.01em",
                                    color: isSelected
                                        ? tokens.text
                                        : tokens.dim,
                                    transition: "color 200ms ease",
                                }}
                            >
                                {branch}
                            </span>

                            <span
                                style={{
                                    fontSize: 10,
                                    letterSpacing: "2.5px",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                    color: isSelected
                                        ? tokens.accent
                                        : tokens.faint,
                                    transition: "color 200ms ease",
                                }}
                            >
                                {BRANCH_CAPTIONS[branch]}
                            </span>
                        </label>
                    )
                })}
            </div>
        </div>
    )
}

function Dot({ selected }: { selected: boolean }) {
    return (
        <span
            aria-hidden="true"
            style={{
                position: "relative",
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `1px solid ${selected ? tokens.accent : tokens.line}`,
                transition: "border-color 200ms ease",
            }}
        >
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: tokens.accent,
                    transform: selected ? "scale(1)" : "scale(0)",
                    opacity: selected ? 1 : 0,
                    transition: "transform 200ms ease, opacity 200ms ease",
                }}
            />
        </span>
    )
}

addPropertyControls(BranchSelector, {})
