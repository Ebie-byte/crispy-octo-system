# Cibón Bakehouse — Framer source

Design work lives in the Framer project *Compassionate Essentials* and is
edited through the Framer MCP. This folder versions the hand-written code
components used on the homepage, so they can be reviewed and restored.

| File | Framer path | Used for |
| --- | --- | --- |
| `code/CibonIcon.tsx` | `CibonIcon.tsx` | Every stroke icon on the page — hero feature column, service bar, menu-card badges, stats row, button arrows, nav bag, logo swirl. |
| `code/FreshDailySeal.tsx` | `FreshDailySeal.tsx` | The circular "Fresh Daily / Premium Quality" seal over the promise photograph. |
| `code/ContainImage.tsx` | `ContainImage.tsx` | Renders the hero product photo with `object-fit: contain` so it can never be cropped or stretched — see note below. |

## Notes for future edits

- Framer's XML writer in this MCP **cannot create `<SVG>` nodes** from an
  `svg="..."` attribute — the node is silently dropped. Use a code component
  and insert it as a `ComponentInstance` instead.
- The XML writer also ignores the `centerX` / `right` pins. To centre or
  right-align an absolutely positioned element, wrap it in a full-width
  absolute stack and use `stackDistribution`.
- Component prop names must not start with `top`, `bottom`, `left` or
  `right`: those collide with layout pin attributes when an instance is
  written from XML (`top="138px"` was swallowed by a `topText` prop). The
  seal's text props are named `lineOne` / `lineTwo` for this reason.
- Text colour in Framer must come from a text style, never a node attribute,
  so every piece of copy on the page references a project text style.
- Framer's native `<Image backgroundImage="...">` node has no documented
  "Fit" vs "Fill" attribute in this XML API — it always crops to cover. For
  the hero product photo (which has real negative space around the subject)
  that meant the crop clipped or distorted the shot. `ContainImage.tsx`
  wraps a plain `<img style={{objectFit:"contain"}}>` instead, so the photo
  is always shown in full, letterboxed rather than cropped. It takes the
  image as a plain `src` string prop rather than Framer's `ResponsiveImage`
  control, because the MCP's XML writer only round-trips scalar prop values
  (strings/numbers/colors) — it silently drops object-shaped props like the
  `{src, srcSet, alt}` that `ResponsiveImage` expects.
