# Tristan — Planet Fitness consultant portfolio (Framer source)

Single-page portfolio and booking site for Tristan, a Planet Fitness
consultant and personal trainer in Cape Town. The design lives in the Framer
project **Tristan Personal Portfolio** and is edited through the Framer MCP.
This folder versions the hand-written code components so they can be reviewed
and restored.

| File | Framer path | Used for |
| --- | --- | --- |
| `code/tristanConfig.tsx` | `tristanConfig.tsx` | Shared module: the WhatsApp number, branch list, message builder, cross-component stores, design tokens. Every other file imports it. Also default-exports a `ConfigStatus` badge. |
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

## Outstanding — not done, and why

- **Breakpoints.** The page is desktop-only (1200px). Framer breakpoints are a
  special node type the MCP cannot create — writing a sibling frame produces a
  plain frame, not a breakpoint. They have to be added in the editor, after
  which the tablet and phone layouts can be styled over MCP. The hero was
  rebuilt as a two-column flow layout (copy `1fr`, photo `520px`) rather than
  absolute pins specifically so it reflows sensibly once they exist.
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
