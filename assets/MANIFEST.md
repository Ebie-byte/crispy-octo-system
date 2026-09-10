# VERTEXIA CINEMATIC EDIT — ASSET MANIFEST

Structure revised by client to 9 scenes (was 12). Mockup scenes dropped.
Story: YOU -> WALK -> CITY CHANGES -> VERTEXIA -> CLIENT DESIGNS -> MORE BUSINESSES -> PRICE -> BRAND.
Target runtime 22-27s. Assembly begins only when all 9 slots are CONFIRMED.

| # | Scene | File | Status | Probe |
|---|-------|------|--------|-------|
| 1 | Hook — close-up + text | `scene01_closeup.MOV` | CONFIRMED | 1440x1440, 24fps, 4.11s |
| 2 | Journey begins — walking | `scene02_walking.mp4` | CONFIRMED | 1080x1916, 24fps, 5.04s |
| 3 | City / portfolio transformation | — | AWAITING `scene 3.mp4` | — |
| 4 | Vertexia storefront reveal | — | AWAITING `scene 4.mp4` | — |
| 5 | Website showcase #1 — Aslibella | — | AWAITING `scene 5.mp4` | — |
| 6 | Website showcase #2 / final transformation | — | AWAITING `scene 6.mp4` | — |
| 7 | Mission — CREATE / BUILD / GROW still | — | AWAITING still | — |
| 8 | The offer — R3,500 / $500 still | — | AWAITING still | — |
| 9 | End card — IDEAS INTO IMPACT still | — | AWAITING still | — |

## Timing budget (target ~26s)

| # | Scene | Duration | Notes |
|---|-------|---------:|-------|
| 1 | Hook | 3.00s | fixed by brief |
| 2 | Walk | 2.40s | capped by green-spill defect, not by choice |
| 3 | City transformation | ~3.50s | provisional |
| 4 | Vertexia reveal | ~3.00s | provisional |
| 5 | Aslibella | ~3.50s | provisional, must end before the turn |
| 6 | Showcase #2 | ~2.50s | client asked for fast |
| 7 | Mission still | 3.00s | push-in / parallax |
| 8 | Offer still | 2.75s | client asked 2.5-3s, must convert |
| 9 | End card | 2.00s + 0.6s fade to black | |
| | **Total** | **~26.25s** | inside the 22-27s target |

Scenes 3-6 are provisional and will be set from the real footage — cut points
follow the movement in frame, not the spreadsheet.

## Scene notes

### Scene 1 — CONFIRMED
- Close-up facing camera, black jacket / white shirt / black tie, golden-hour
  street bokeh. Matches brief.
- In-point 0.00, out-point 3.00. Frame at 3.00 is clean (eyes open, neutral hold).
- Very slow push-in across the 3s. That forward push carries into Scene 2.
- TREATMENT: FULL-BLEED, per client. Square 1440x1440 is scaled to 1920 height
  and centre-cropped to 1080 wide. Costs 44% of the width, a 1.33x upscale, and
  the tie leaves frame. Client chose immersion in the opening second over the
  tie, correctly for a Reel.
- Text sits over a soft bottom scrim (black, alpha ramped to 0.88 over the
  lower 760px). The scrim is needed: the white shirt sits centre-bottom in the
  cropped frame and white text on it would not hold. Face is never covered.
- Source audio (aac) stripped.

### Scene 2 — CONFIRMED
- Full body, business district, low sun behind, walking toward camera.
- NO CROP. Source is already 9:16. Only a 4px scale, 1916 -> 1920 (0.2%).
  Head, feet, sun and full-body composition are all preserved exactly.
- USABLE WINDOW 0.00 -> 2.40s ONLY.
- DEFECT: green light-spill artifact grows on the left of the jacket.
  Chroma measured in that region (neutral = U128/V128):
      t=0.00  U=128.0  V=128.6   clean
      t=1.33  U=125.7  V=130.6   warm shift only, still clean
      t=2.33  U=126.6  V=128.1   onset
      t=2.66  U=125.9  V=127.0   green visible
      t=4.00  U=123.4  V=124.6   green obvious
  colorbalance=gs=-0.07:gm=-0.03 neutralises the average but the localised blob
  survives, so the tail is unusable without rotoscoping. Cut at 2.40s instead.
  This is unrelated to cropping and would apply at any aspect ratio.
- Forward motion matches Scene 1's push-in. Cut on motion, no dissolve.
- Out-point placed on a stride phase to motion-match into Scene 3.

## Global decisions — LOCKED
- MASTER: 1080x1920, 9:16, 24 fps, h264 high, CRF 16, yuv420p. Instagram Reel.
- 24 fps throughout, matching sources. No frame interpolation anywhere.
- Square/landscape sources are full-bleed centre-cropped (client decision).
  Native 9:16 sources are never cropped.
- AUDIO: silent AAC track on the master so it drops into an NLE without a sync
  offset. Client supplies the soundtrack.
- TYPOGRAPHY: Inter Display Medium. Headline 64px at 97% white, sub-line 40px at
  60% white. Bottom scrim where the plate underneath is bright. No drop shadows,
  no boxes, no motion beyond a slow opacity rise.
- TRANSITIONS: cuts on movement. No cross-dissolves between clips. The only
  fade in the film is the final fade to black on Scene 9.
