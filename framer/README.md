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
- **`backgroundImage` cannot be written at all** over MCP — not on update, and
  not on create either (creating a node with it yields a plain white frame).
  Existing values read back fine, so it looks writable but is not; the write
  is refused with "No changes were made". Every image placed by an agent
  therefore goes through `ContainImage.tsx` with a `src` string. This is also
  why the hero was a flattened `.jpg`: it had to be set by hand in the UI.
- `maxWidth` does not apply to a `ComponentInstance`. Put the width cap on a
  wrapper `Stack` and let the instance fill it — the hero, the promise photo
  and the gift-box card all use that pattern. Likewise `borderRadius` does not
  apply to an instance, so the gift-box card wraps it in a rounded frame with
  `overflow="hidden"`.
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

## Hero image — must stay a PNG

The hero product shot is a **transparent PNG** with feathered edges: the roll
and pedestal are composited with negative space around them so the image melts
into the navy background with no visible edge.

Two things break that effect, and both were present at one point:

1. **Saving it as JPG.** JPG has no alpha channel, so the transparency is
   flattened into a solid background box. The asset originally wired into the
   hero was `oiwCpeewMf2MzFN1JXDmZlzC5s.jpg` — already flattened. It must be
   re-uploaded as PNG.
2. **A cover crop.** Framer's native Image node always crops to cover here,
   which clips the feathered negative space. `ContainImage.tsx` renders it
   with `object-fit: contain` instead.

The correct PNG is now in place:
`https://framerusercontent.com/images/SISuNgc06ZvAEPYXs9Vt2cTR44.png`
(1602x1134, aspect 1.413). The hero frame is set to 552px tall so that at its
780px max width the image fits exactly, with no letterboxing.

### Getting a new asset URL from over MCP

An agent working through the Framer MCP cannot upload an image: it has no
network access to Framer's CDN, and cannot populate the object-shaped
`ResponsiveImage` picker prop from XML. The way around it, which is how the
hero PNG got here:

1. Drag the image anywhere onto the Framer canvas. It uploads and becomes a
   loose layer with a real `framerusercontent.com` URL.
2. Leave that layer selected. The agent reads it with `getSelectedNodesXml`,
   which reports the uploaded URL.
3. The agent writes that URL into the target layer's `src`, then deletes the
   loose layer.

Deleting the loose layer does not break anything: the CDN URL is permanent and
independent of whether any layer references it.
