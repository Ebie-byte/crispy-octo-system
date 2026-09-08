# Tristan — Planet Fitness consultant portfolio (Framer source)

Single-page portfolio and booking site for Tristan, a Planet Fitness
consultant and personal trainer in Cape Town. The design lives in the Framer
project **Tristan Personal Portfolio** and is edited through the Framer MCP.
This folder versions the hand-written code components so they can be reviewed
and restored.

| File | Framer path | Used for |
| --- | --- | --- |
| `code/tristanConfig.tsx` | `tristanConfig.tsx` | Shared module: the WhatsApp number, branch list, message builder, cross-component stores, design tokens. Every other file imports it. Also default-exports a `ConfigStatus` badge. |
| `code/FluidHeadline.tsx` | `FluidHeadline.tsx` | The hero headline. Sized with CSS `clamp()` so it scales continuously with the viewport — see the responsive notes below. |
| `code/DemoBanner.tsx` | `DemoBanner.tsx` | Fixed "DEMO — not approved" notice for the HR review round. One toggle (`Show banner`) turns it off for launch. |
| `code/TristanIcon.tsx` | `TristanIcon.tsx` | Every icon: qualification shield / dumbbell / flame, and the WhatsApp mark. |
| `code/ImageSlot.tsx` | `ImageSlot.tsx` | Placeholder-aware image slot — hero photo (with left gradient fade), Planet Fitness logo, QR code. |
| `code/ActionButton.tsx` | `ActionButton.tsx` | Every button. Opens the booking sheet, opens WhatsApp directly, or follows a URL. |
| `code/BranchSelector.tsx` | `BranchSelector.tsx` | The three selectable Locations rows. Writes the choice to the shared store. |
| `code/ConsultationSheet.tsx` | `ConsultationSheet.tsx` | The booking bottom sheet: form, WhatsApp deep link, post-submit handoff state. |

## The WhatsApp number lives in exactly one place

`code/tristanConfig.tsx`, line 32:

```ts
export const WHATSAPP_NUMBER = "27721482950"
```

Currently set to Tristan's number, `072 148 2950`, in the format `wa.me`
requires: country code plus number, digits only, no `+`, no spaces, and the
leading `0` of the local part dropped.

This is why the standalone WhatsApp buttons are `ActionButton` code components
rather than plain Framer link layers. A canvas link would bake the number into
the link field, which would have made it a second place to edit. `grep -rn
27721482950 code/` returns exactly one line, and that is the point.

## How the interactive parts fit together

Framer's native form element cannot do this job: it posts to Framer's form
backend and has no way to read its own field values at submit time and
interpolate them into a `wa.me` URL. Building the deep link *from* the field
values is what forces code. So the split is:

- **Sheet chrome** (the fixed, full-viewport layer) is a canvas Frame with
  `position="fixed"`. Framer's own component guidance forbids `position: fixed`
  *inside* a code component — it breaks canvas layout and thumbnails — so the
  fixed layer is the parent and `ConsultationSheet` fills it.
- **Everything stateful** is in `ConsultationSheet`: fields, validation, the
  link builder, the handoff state.

### Cross-component state without prop drilling

`tristanConfig` holds two module-level stores read through
`useSyncExternalStore`. Framer resolves imports between code files to the same
module instance, so every component importing them shares the same state:

- `branchStore` — the Locations list writes it, the booking form reads it on
  open and writes back when the dropdown changes. This is what makes selecting
  "De Waterkant" on the page pre-fill the form.
- `sheetStore` — any `ActionButton` with `action="book"` opens the sheet. Both
  triggers (hero and final CTA) work with no canvas wiring, and stay in sync.

The two components sit far apart on the canvas and are never nested, so a
module-level store does work that props cannot.

### "Request Sent" would have been a lie

Submitting does not deliver anything. It opens WhatsApp with the message
pre-filled; the visitor still has to press send. If they close that tab,
Tristan receives nothing. The post-submit state therefore reads **"Opening
WhatsApp — press send to finish"**, and the form footer says "This opens
WhatsApp with your details written out. You press send."

If a real record of requests is ever wanted, that needs a backend — a Framer
form with a webhook, or Supabase — alongside the deep link. It does not exist
today.

## MCP XML writer gotchas found on this project

These cost real time. They are in addition to the ones in `../framer/README.md`
(which still hold: `<SVG>` nodes are dropped, `backgroundImage` cannot be
written, `maxWidth`/`borderRadius`/`left` do not apply to a `ComponentInstance`,
adding a child reorders it to the end).

- **New frames default to opaque white.** Any frame created without an explicit
  `backgroundColor` comes out `rgba(255,255,255,1)`. On a near-black page every
  container must say `backgroundColor="rgba(0,0,0,0)"`.
- **New frames default to `height="100px"`.** Always state `height="fit-content"`.
- **`stackDistribution` and `stackAlignment` default to `center`.** Left-aligned
  copy needs both set to `start` explicitly.
- **The tag name does not set layout.** Writing `<Stack …>` produces a plain
  Frame; only `layout="stack"` makes it a stack. Without it, `padding` is
  ignored and children stay absolutely positioned.
- **`padding` is silently dropped in the same call that converts a Frame into a
  Stack.** Set `layout="stack"` first, then set `padding` in a second call.
- **`padding` accepts 1 or 4 values only.** A two-value shorthand like
  `padding="56px 44px"` is dropped without warning. Write all four.
- **A `ComponentInstance` inside a non-layout Frame gets
  `position:absolute; left:-300px`.** Put instances inside a `layout="stack"`
  parent and give them `position="relative"`.
- **`100vw` is not accepted as a width** — `width="100vw"` silently became
  `100px`. Use `100%` and handle viewport-width needs in component CSS.
- **The `typecheck` field lags one revision.** After `updateCodeFile` it
  reports errors for the *previous* content. The `exports` array is current —
  if it lists an `insertURL`, the file compiled. Re-save to see a true result.
- **Cross-file imports need a module URL, not a relative path.** `./file` and
  `./file.tsx` both fail to resolve. Framer issues a URL like
  `https://framer.com/m/tristanConfig-9QrhiB.js` — but only to a file that
  exports a component, which is why `tristanConfig` default-exports the
  `ConfigStatus` badge. The URL hash is stable across edits to the file.
  Prefix each such import with a single-line `// @ts-ignore`; a two-line
  comment or a multi-line import statement breaks the suppression.

## Responsive: one fluid layout, not three

Tablet (810px) and Phone (390px) breakpoints exist. Two hard limits shaped how
they are supported:

1. **Breakpoints are replica nodes, and their children are not addressable.**
   `getNodeXml` on the Phone breakpoint returns the root and nothing else.
   Writing to a child nodeId while nesting it under the Phone root reports
   success but the change lands on **Desktop** — verified by writing a
   distinctive value and reading it back from the Desktop tree. So there are no
   per-breakpoint layer overrides over MCP. Only attributes on the breakpoint
   *root itself* (its padding, for example) are per-breakpoint.
2. **Text-style `fontSize` is px-only.** `clamp(...)` and `vw` values are
   accepted by `manageTextStyle`, reported as success, and silently discarded —
   the echoed style still shows the old px value. Confirmed live by writing a
   plain px value, which does take.

Together those mean the page cannot have three tuned layouts; it has to be one
layout that holds at every width. How that was done:

- **Hero** is a vertical stack: top bar, then a wrapping two-column row. The
  columns are `1fr` with `minWidth: 300px`, so they sit side by side above
  ~630px and stack below it. It was previously absolutely positioned with fixed
  `left` pins, which could not reflow at all.
- **Every two-column section** (About, Locations, Services, Get Started) has
  `stackWrap="true"` with `1fr` / `minWidth: 280px` columns, so each collapses
  to a single column on phone.
- **Fixed widths became fluid**: the quote and CTA stack are `width: 100%` with
  a `maxWidth`, rather than 440px / 520px.
- **Section padding** dropped from 44px to 32px, and the breakpoint roots carry
  their own padding (Desktop 28, Tablet 20, Phone 12) — one of the few genuine
  per-breakpoint overrides available.
- **Qualification labels** use new centred caps styles and full-width boxes, so
  "SUSTAINABLE FAT LOSS" wraps to two centred lines in a narrow column instead
  of overflowing.
- **The hero headline** is `FluidHeadline.tsx`, sized `clamp(44px, 8.2vw,
  92px)`. This is the one piece of type that genuinely breaks rather than merely
  looking large — 92px in a 390px viewport. Everything else was reduced to sizes
  that read acceptably at all three widths (section headings 34px, stats 40px,
  prices 26px).

### If you want per-breakpoint type sizes

Framer supports different font sizes per breakpoint in the text-style editor;
the MCP just cannot reach them. To tune by hand, edit these styles at the Phone
breakpoint: `/Display/Section`, `/Display/Stat`, `/Row/Price`,
`/Display/Quote`. The headline needs no attention — it is already fluid.

## Testing the WhatsApp flow

Buttons do nothing on the Framer **canvas** — the canvas is a static renderer
and never runs click handlers. Use **Preview**, or publish and open the staging
URL in a real tab (more reliable, since some browsers block scripted
`window.open` inside the preview iframe).

The standalone WhatsApp buttons are plain `<a href>` links built from the shared
number, so they cannot be blocked by a pop-up blocker. Only the booking sheet
uses JS, because its link is assembled from the live form values on submit.

## Sending it for approval

The page carries placeholder photos **and invented figures** — the years, client
count, REPS certification line and all three prices were written to match the
original mockup, not supplied by Tristan. `DemoBanner` puts a fixed notice at the
top saying so, because an approval link tends to get forwarded and those numbers
would otherwise read as claims Tristan is making. Switch `Show banner` off before
launch; it needs no code change and leaves nothing behind.

Get every figure and the certification line confirmed before HR sees it. A wrong
certification claim is a much bigger problem than an empty photo slot.

## Outstanding — not done, and why

- **Three image slots are empty**: hero photo, Planet Fitness logo, QR code.
  Each renders a labelled placeholder. To fill one: drag the asset onto the
  canvas to upload it, copy its `framerusercontent.com` URL, paste it into the
  instance's **Source** field. No code change.
- **The QR code** cannot be generated until the site is published and has a
  final URL to encode.
- **`JOIN PLANET FITNESS`** currently links to `https://www.planetfitness.co.za/`.
  Confirm that is the right destination.
- **Planet Fitness branding.** Their logo is deliberately not recreated. Worth
  confirming Tristan has sign-off to trade under their marks on a page that
  takes bookings.
