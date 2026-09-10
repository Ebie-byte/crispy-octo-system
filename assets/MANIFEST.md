# VERTEXIA CINEMATIC EDIT — ASSET MANIFEST

Locked scene order (do not change). Assembly begins only when all 12 slots are CONFIRMED.

| # | Scene | File | Status | Probe |
|---|-------|------|--------|-------|
| 1 | Close-up / hook (first 3s + text) | `scene01_closeup.MOV` | CONFIRMED | 1440x1440, 24fps, 4.11s, h264 + aac |
| 2 | Walking into the city | `scene02_walking.mp4` | CONFIRMED | 1080x1916, 24fps, 5.04s, h264 + aac |
| 3 | Crosswalk + website advertisements | — | AWAITING | — |
| 4 | Vertexia storefront | — | AWAITING | — |
| 5 | Aslibella building reveal (cut before turn) | — | AWAITING | — |
| 6 | Aslibella laptop + phone mockup | — | AWAITING | — |
| 7 | LuxeLash / T Lashes building ad | — | AWAITING | — |
| 8 | LuxeLash / T Lashes laptop + phone mockup | — | AWAITING | — |
| 9 | Wide city transformed into portfolio | — | AWAITING | — |
| 10 | "Good Design Builds Bigger Businesses" portrait | — | AWAITING | — |
| 11 | R3,500 / $500 offer | — | AWAITING | — |
| 12 | Vertexia CTA end card + IDEAS INTO IMPACT branding | — | AWAITING | — |

## Scene notes

### Scene 1 — CONFIRMED
- Visual check: subject facing camera, outdoors, black jacket / white shirt / black tie,
  golden-hour street bokeh behind. Matches brief.
- Source runs 4.11s; brief calls for the first 3.00s only. In-point 0.00, out-point 3.00.
- Camera: very slow push-in over the 3s, subject drifts marginally larger and left.
  That forward push is the motion to carry into Scene 2 — no dissolve needed.
- Frame at 3.00s is clean (eyes open, neutral hold) — safe cut point.
- Source audio (aac) will be stripped. Soundtrack handled by client.
- Text placement: subject's face occupies the centre and upper-middle of a square frame.
  Hook copy goes in the lower third, clear of the jacket collar line.

### Scene 2 — CONFIRMED
- Visual check: full body, modern business district, sun low and behind subject,
  walking toward camera. Matches brief.
- Source runs 5.04s. USABLE WINDOW IS 0.00 -> 2.40s ONLY. See defect below.
- DEFECT: a green light-spill artifact grows on the left side of the jacket.
  Measured chroma drift in the jacket region (neutral = U128/V128):
      t=0.00  U=128.0  V=128.6   clean
      t=1.33  U=125.7  V=130.6   warm shift only, still clean
      t=2.33  U=126.6  V=128.1   onset
      t=2.66  U=125.9  V=127.0   green visible
      t=4.00  U=123.4  V=124.6   green obvious
  Global correction (colorbalance=gs=-0.07:gm=-0.03) neutralises the average but
  NOT the localised blob, which stays visible. Tail is not salvageable cheaply.
  Decision: cut at 2.40s, inside the clean window. No correction needed.
- Camera pushes in / subject walks toward lens, same forward direction as Scene 1.
  Scene 1 -> Scene 2 cuts on continuing forward motion. No dissolve.
- Cut point will be placed on a stride phase to motion-match into Scene 3.
- Source audio (aac) stripped.

## Global decisions — LOCKED
- MASTER FORMAT: 1080x1920, 9:16 vertical, 24 fps, h264 high, CRF 16, yuv420p.
  Rationale: the CTA is "DM WEBSITE", so this is a phone-feed ad (IG Reels /
  TikTok / Shorts). Vertical full-bleed is the correct delivery. Scene 2 already
  is 9:16; square and landscape sources are handled per scene below.
- 24 fps master, matching both sources so far. No frame interpolation anywhere.
- Scene 2 is 1916 tall, 4px short. Scaled to 1920 (0.2%, imperceptible) rather
  than padded, to avoid a black edge line.
- AUDIO: master exports with a silent AAC track so it drops straight into an
  NLE timeline without sync offset. Client adds the soundtrack.
- SQUARE SOURCES (Scene 1): NOT centre-cropped to fill. A 1:1 -> 9:16 full-bleed
  crop discards 44% of the width, upscales 1.33x, and cuts the tie out of the
  opening shot. Instead Scene 1 is composed as a deliberate opening frame:
  footage full-width at 1080x1080 on a near-black field, hook typography in the
  dedicated space beneath it, so nothing ever covers the face. The film then
  opens out to full-bleed at Scene 2 — contained hook, then the journey opens up.
- TYPOGRAPHY: Inter Display. Headline Medium 62px at 95% white, sub-line
  Medium 40px at 50% white. No drop shadows, no boxes, no animation beyond a
  slow opacity rise.

## Global decisions still open
- Nothing blocking. Ratios of Scenes 3-12 may refine per-scene reframing rules.
