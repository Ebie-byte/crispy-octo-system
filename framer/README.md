# Cibón Bakehouse — Framer source

Design work lives in the Framer project *Compassionate Essentials* and is
edited through the Framer MCP. This folder versions the hand-written code
components used on the homepage, so they can be reviewed and restored.

| File | Framer path | Used for |
| --- | --- | --- |
| `code/CibonIcon.tsx` | `CibonIcon.tsx` | Every stroke icon on the page — hero feature column, service bar, menu-card badges, stats row, button arrows, nav bag, logo swirl. |
| `code/FreshDailySeal.tsx` | `FreshDailySeal.tsx` | The circular "Fresh Daily / Premium Quality" seal over the promise photograph. Its lettering ring rotates; see below. |
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

## Sticky section stacking (scroll effect)

The cream "Indulge Your Way" section and the navy "Our Promise" section stack:
on scroll the cream section pins to the top of the viewport and the navy
section slides up over it.

This is pure CSS, no JS:

| Section | node | position | z-index |
| --- | --- | --- | --- |
| Hero (navy) | `mQeEOl4C8` | relative | 0 |
| Menu (cream) | `EFIHjHtK0` | **sticky, top 0** | 1 |
| Promise (navy) | `vpnrIIJAT` | relative | 2 |
| Stats (cream) | `HC4ErToYO` | relative | 3 |

Two things make it work, and both are easy to break:

1. **The z-indexes must ascend across ALL four sections**, not just the two
   being stacked. Raising only the promise section would make it paint over
   the stats section below it too, since an explicit z-index beats the
   `auto` of a later sibling. Any new section added below must continue the
   sequence.
2. **The covering section needs an opaque background.** Both use solid
   colour styles. A transparent section would let the pinned one show
   through.

Note `overflow` on the page root is `clip`, not `hidden` — `clip` does not
create a scroll container, so sticky still resolves against the viewport.
Changing it to `hidden` would silently kill the effect.

Caveat: the pinned section is ~740px tall. On a viewport shorter than that,
its lower edge (the VIEW FULL MENU button) is pinned out of reach. Fine on
desktop; revisit if a mobile breakpoint is added.


## The rotating seal, and the badge printed into the photo

`FreshDailySeal` rotates only the **lettering ring**. The disc, the hairline
rule and the centre swirl stay still — spinning the whole disc looks like a
sticker, spinning just the type reads as a stamped foil seal.

It idles rather than burning frames: no animation on the Framer canvas or in
static/SSR renders (`useIsStaticRenderer`), none when the viewer has
reduced-motion set (`useReducedMotion`), and none while scrolled out of view
(`useInView`). Rotation is a CSS transform, so it stays on the compositor.

**The promise photograph already has a seal printed into its pixels.** That
baked-in badge cannot rotate, so the live component is positioned directly on
top of it and hides it. The disc is opaque, which is what makes the cover
work. That means the overlay's position is load-bearing, not decorative:

- frame `qRpFQ1q9Y` is 870 x 552
- seal is 155px, pinned `top: 154px`, flushed right with `padding-right: 78px`
- centre lands at roughly (715, 231), i.e. 82% across and 42% down

It is deliberately a little larger than the printed badge (~144px) so it
covers it with a few pixels to spare. **If the promise photo is ever replaced,
re-check this alignment** — a badge-free photo would be better, and then the
size can drop back to ~145px.
