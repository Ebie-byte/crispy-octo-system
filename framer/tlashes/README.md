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
- **`left` cannot be set on a `ComponentInstance` at all** — not on
  create, not on update. `getNodeXml` reports a stray `left="-300px"` on
  every instance regardless of what's requested; this appears to be a
  read-back artifact rather than the true render, matching prior
  first-hand findings on this project. Positioning is done on a wrapping
  `Frame`, never on the instance's own pins.
- **Absolute positioning with only two opposite pins (e.g. `bottom` +
  `right`) gets the missing pins defaulted to `0`**, stretching the node
  to fill its parent instead of sizing it from `width`/`height`. The
  floating years-badge is instead a full-size absolutely-positioned
  `Stack` with `stackDistribution="end"` / `stackAlignment="end"` to push
  its child into the corner.
- **Reordering children via a bare self-closing tag list sometimes
  silently no-ops** ("No changes were made") even when the requested
  order differs from the current one. Restating the parent's own
  attributes in the same call reliably forces the reorder to register.
- **Writing a `ComponentInstance` onto an existing node's `nodeId` does
  not convert its type** — the old node (e.g. a flat-colour `Frame`) stays
  a `Frame` and the insert is silently ignored. Delete the old node first,
  then create the instance fresh.

## Palette & type

Colours and text styles are Framer project styles (Color Styles /
`ColorStyles`, `TextStyles`), matching the supplied asset kit:
Playfair Display (headings), Dancing Script (accents), Montserrat (body/UI).
