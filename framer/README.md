# Cibón Bakehouse — Framer source

Design work lives in the Framer project *Compassionate Essentials* and is
edited through the Framer MCP. This folder versions the hand-written code
components used on the homepage, so they can be reviewed and restored.

| File | Framer path | Used for |
| --- | --- | --- |
| `code/CibonIcon.tsx` | `CibonIcon.tsx` | Every stroke icon on the page — hero feature column, service bar, menu-card badges, stats row, button arrows, nav bag, logo swirl. |
| `code/FreshDailySeal.tsx` | `FreshDailySeal.tsx` | The circular "Fresh Daily / Premium Quality" seal over the promise photograph. Its lettering ring rotates; see below. |
| `code/ContainImage.tsx` | `ContainImage.tsx` | Contain-fit image, used for the promise photo and the gift-box card. |
| `code/HeroProduct.tsx` | `HeroProduct.tsx` | The hero roll: contain-fit image plus entrance, float and scroll parallax. |
| `code/HeroAmbience.tsx` | `HeroAmbience.tsx` | The hero's glow (behind) and film grain (on top). |
| `code/MenuCardMedia.tsx` | `MenuCardMedia.tsx` | The photograph in each menu card: staggered scroll reveal, contained hover zoom, warm shadow. |

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
- seal is 200px, pinned `top: 131px`, flushed right with `padding-right: 55px`
- centre lands at roughly (715, 231), i.e. 82% across and 42% down

It is deliberately larger than the printed badge (~144px) so it covers it
with room to spare.

**Keep the seal square, and resize it in pairs.** The row is flushed right,
so the centre is `870 - padding-right - width/2`. Changing the width alone
walks the seal sideways off the badge it is hiding; the top pin and the row
height have to move with it too. To resize to width `w` and keep the centre:
`padding-right = 715 - w/2`, `top = 231 - w/2`, `row height = w`. A
non-square box does not distort the disc (the viewBox letterboxes it) but it
does shift the centre, which is what matters here. **If the promise photo is ever replaced,
re-check this alignment** — a badge-free photo would be better, and then the
size can drop back to ~145px.


## Hero motion

The brief was "wow", and the restraint is deliberate. Cheap motion never
stops moving; expensive motion has one moment and then rests. The hero
animates on arrival, then settles to almost nothing — only a 6px float and
the seal's lettering ring keep breathing.

`HeroProduct` runs three motions on the same axis, so they are **nested, not
combined** — parallax outside, entrance in the middle, float inside. All
three animate `y`; on a single element the last writer would win.

The entrance easing is doing most of the work: `cubic-bezier(0.16, 1, 0.3,
1)`. It decelerates hard, so the roll *settles* instead of sliding to a
stop. Default browser easing is the single biggest reason motion reads as
cheap.

`HeroAmbience` is two layers, both `pointer-events: none`:

- **glow** — a radial bloom *behind* the content (`zIndex 0`) so the roll
  looks lit rather than pasted on flat colour. Breathes on a 9s opacity
  cycle; nothing geometric moves.
- **grain** — SVG `feTurbulence` at **3.5%** over everything (`zIndex 9`).
  This is the cheapest luxury signal there is: flat colour fields read
  digital, a little noise reads as printed material. Above ~6% it stops
  looking like texture and starts looking like a broken image.

All of it idles on the Framer canvas, under `prefers-reduced-motion`, and
while scrolled out of view.

### Two MCP gotchas hit while wiring this

- **`left` will not set on a `ComponentInstance`.** Both ambience layers
  came out at `left: -300px` and refused to move. Plain Frames accept it
  fine, so each instance is wrapped in an absolutely positioned Frame that
  carries the pin. Same class of problem as `maxWidth` and `borderRadius`.
- **Adding a child reorders it to the end.** The glow has to paint *behind*
  the content, so after inserting it the whole child order must be restated
  explicitly, or an explicit `zIndex` on a later sibling wins anyway.

### What was deliberately not built

Particles, kinetic type, drifting shapes and anything springy. Bounce reads
playful; this brand reads weighted. The staggered text reveal is better done
in Framer's own Appear panel (select layer, Effects, Appear) than as a code
wrapper — wrapping the hero text in a component would make it far harder to
edit on the canvas for no visual gain.


## Menu section

Five cards, each one `MenuCardMedia` (photo) plus a badge medallion and two
text layers that stay as ordinary Framer layers.

**The hover is the point.** The photo scales inside a clipped frame — the
frame never moves, only the image behind it grows. Scaling the whole card
instead would make it read as a button; containing the movement is what
reads as expensive. 1.06 over 0.7s, on the same hard-decelerating ease as
the hero.

**The reveal is staggered by `index`.** Each card carries its position
(0-4) and delays by `index x 0.07s`, so they arrive as a sequence rather
than a block. It fires `once` — cards settle and stay settled; re-running
on every scroll pass is a classic tell of a cheap template.

**The shadow is warm** (`rgba(60, 44, 24, ...)`), not grey. On a cream page
a neutral shadow reads as dirt. It deepens on hover, so the card lifts.

Text is deliberately outside the component so it keeps its project text
styles and stays editable on the canvas.

### Typography pass

- `/H2Dark` tracking `-0.04em` to `-0.015em`. Playfair at 44px was set
  tight enough that the letters were nearly touching.
- `/CardTitle` 14px/0.8px to 13px/1.7px. Small uppercase wants air; tight
  tracking at that size reads as a UI label rather than a menu heading.
- `/CardBody` line-height 1.5 to 1.75.

### Still worth doing

The section header and the VIEW FULL MENU button have no motion. Both are
better done in Framer's own Effects panel (Appear for the header, a hover
variant for the button) than as code — wrapping the text in components
would cost editability for no visual gain.
