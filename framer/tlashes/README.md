# T Lashes by Tanith Lee — Framer redesign

Design work lives in the Framer project and is edited through the Framer
MCP. This folder versions the hand-written code components used to
reproduce the target design (`framer/tlashes/code/*.tsx`), since the MCP
cannot write images, gradients, or SVG nodes directly onto the canvas.

## Why code components at all

Two hard limits of the Framer MCP forced everything visual through code:

- **`backgroundImage` cannot be written over MCP** — not on create, not on
  update. Every photo slot (hero eye, five service cards, Tanith's
  portrait) is therefore a `Photo` component taking a plain `src` string,
  with a designed blush placeholder when empty.
- **`<SVG>` nodes silently drop their `svg="..."` content** when written
  from XML. All iconography, the gradient hero backdrop, the logo badge,
  and the years-experience seal are code components for this reason.

## Components (`code/`)

| File | Used for |
| --- | --- |
| `Icon.tsx` | Every stroke icon: hero feature column, booking-steps bar, About stats, footer contacts, button arrows. One enum prop keeps every icon on the page the same line weight. |
| `Photo.tsx` | Every photograph slot. Hover-zoom on the service cards, contain/cover via `objectFit`, blush gradient + lash-mark placeholder when `src` is empty. |
| `HeroBackdrop.tsx` | The hero's blush gradient ground, light bloom behind the portrait, soft out-of-focus blossom clusters, and film grain. |
| `HeroPortrait.tsx` | The hero's glowing ring, marble podium, and the framed eye photo at the centre. |
| `LogoBadge.tsx` | The circular "T LASHES / BY TANITH LEE" roundel (header, filled; footer, white-on-dark) — ring lettering via SVG `textPath`. |
| `YearsBadge.tsx` | The white "2+ / Years Experience" disc on Tanith's portrait. |

## MCP gotchas hit while building this

- **A prop name that merely *contains* "top"/"bottom"/"left"/"right" as a
  substring collides with the layout pin of the same name** and gets
  silently overwritten when an instance is written from XML — not just
  props literally named `top`. `HeroBackdrop`'s top-colour prop is
  `skyTop`, and `LogoBadge`'s ring-text props are `ringWordOne` /
  `ringWordTwo` for this reason (an intermediate `arcTop`/`arcBottom`
  naming still collided).
- **A `ComponentInstance` that is the sole child of a plain, absolutely
  positioned `Frame` gets silently pinned `left: -300px`** (`-600px` in one
  case) — and this is a REAL rendering shift, not a cosmetic read-back
  artifact. It visibly skewed the hero backdrop, the header and footer logo
  badges, and the hero portrait until it was found. `left` cannot be
  corrected on the instance afterwards either: writing it is silently
  ignored ("No changes were made"), and even deleting and recreating the
  instance reproduces it.
  **The fix: never wrap a lone instance in a plain `Frame`. Use a `Stack`**
  (`layout="stack"`, `stackDistribution="center"`, `stackAlignment="center"`)
  so the instance is a flow child rather than an absolutely pinned one. Icon
  instances never hit this bug precisely because they were always dropped
  into `Stack` layout parents.
- **Absolute positioning with only two opposite pins (e.g. `bottom` +
  `right`) gets the missing pins defaulted to `0`**, stretching the node
  to fill its parent instead of sizing it from `width`/`height`. The
  floating years-badge is instead a full-size absolutely-positioned
  `Stack` with `stackDistribution="end"` / `stackAlignment="end"` to push
  its child into the corner.
- **`borderWidth` / `borderStyle` / `borderColor` are silently dropped** on
  `Frame` and `Stack` nodes — the write reports success and the attributes
  simply never appear on read-back. Anything needing a hairline outline has
  to draw it itself; this is why `Icon.tsx` has a `ring` mode that renders
  the disc and its outline inside the SVG rather than relying on a bordered
  wrapper.

- **Reordering children only registers when the parent's own attributes are
  restated in the same call.** A bare list of self-closing `nodeId` tags in
  the desired order returns "No changes were made" even when the order
  genuinely differs.

- **Writing a `ComponentInstance` onto an existing node's `nodeId` does
  not convert its type** — the old node (e.g. a flat-colour `Frame`) stays
  a `Frame` and the insert is silently ignored. Delete the old node first,
  then create the instance fresh.

## Palette & type

Colours and text styles are Framer project styles (Color Styles /
`ColorStyles`, `TextStyles`), matching the supplied asset kit:
Playfair Display (headings), Dancing Script (accents), Montserrat (body/UI).

## Live image assets

Dragged onto the Framer canvas by the client, then referenced by URL from
the `Photo` component's `src`. The loose canvas layers can be deleted — the
CDN URL is permanent and independent of any layer referencing it.

| Slot | Layer name | URL |
| --- | --- | --- |
| Header logo | `01Logo` | `.../NTwXbCfAyQcqyv1iYojYnDskRiA.png` |
| Hero centrepiece | `02HeroEye` | `.../DP5ehkNCvrCamuFdApFQIPlF74c.png` |
| About portrait | `08AboutTanith` | `.../TAGj9kejTPapOiS8GTKdDEpkI.png` |
| Hero background | `09HeroFullBg` | `.../GOyaodc7BbrlrGEiHAFSWFi8Fw.png` |

Unused decorative extras also on the canvas: `13HeroBgPedestal`,
`14HeroBgFlowersVase`, `15HeroBgSparkle`, `16HeroBgGlowArch`.

**`02HeroEye` is already fully composited** — the glow ring, marble podium,
sparkles and `tl` monogram are baked into the photograph. `HeroPortrait.tsx`
draws all of those itself, so it is deliberately NOT used on the page any
more; the slot is a plain `Photo` sized to the image's native 0.843 aspect
(440x522) so nothing is cropped. Re-introducing `HeroPortrait` here would
double every decoration.

**Still outstanding:** the five service-card photographs (Classic Set,
Volume Set, Mega Volume, Lash Lift, Brow Shape). Those slots still render
the blush placeholder. The delivered file numbering skips 03-07, which is
presumably where they live.


## Hero centrepiece: known desync after a plugin disconnect

The Framer MCP plugin disconnected and reconnected mid-session once. After
reconnecting, `getNodeXml` on the hero centrepiece slot (`vIks2Bb9X`)
reported the WRONG child — the old, already-removed `09HeroFullBg` raw
image layer (`GOyaodc7BbrlrGEiHAFSWFi8Fw.png`, the giant zoomed-eye asset)
had silently reappeared as its child, even though a prior tool call's own
diff had shown the correct `Photo` component in place. The correct state
had genuinely been lost, not just misread.

**Lesson: a diff returned by `updateXmlForNode` is not proof a change
persists.** After any edit that matters, especially following a
disconnect/reconnect, re-verify with a fresh `getNodeXml` call before
telling the user it's fixed.

**Also: writing a new child into a node that already has one does not
replace it — it adds a sibling.** Fixing the hero required an explicit
`deleteNode` on the stray old child, not just writing the correct one
alongside it.

Hero centrepiece is sized 610x724 (0.843 aspect, matching the source
photograph exactly) — re-measured from the mockup as ~42% of the 1440px
page width, replacing an earlier, too-small 440px guess.
