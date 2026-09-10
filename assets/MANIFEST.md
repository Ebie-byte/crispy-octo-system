# VERTEXIA CINEMATIC EDIT — ASSET MANIFEST

Structure revised by client to 9 scenes (was 12). Mockup scenes dropped.
Story: YOU -> WALK -> CITY CHANGES -> VERTEXIA -> CLIENT DESIGNS -> MORE BUSINESSES -> PRICE -> BRAND.
Target runtime 22-27s. Assembly begins only when all 9 slots are CONFIRMED.

| # | Scene | File | Status | Probe |
|---|-------|------|--------|-------|
| 1 | Hook — close-up + text | `scene01_closeup.MOV` | CONFIRMED | 1440x1440, 24fps, 4.11s |
| 2 | Journey begins — walking | `scene02_walking.mp4` | CONFIRMED | 1080x1916, 24fps, 5.04s |
| 3 | City / portfolio transformation | `scene03_city.mp4` | CONFIRMED | 1576x1312, 24fps, 5.04s |
| 4 | Reaction — impressed, looking around | `scene04_reaction.mp4` | CONFIRMED | 1628x1272, 24fps, 5.04s |
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
| 3 | City transformation | 2.20s | 1.10s source at 50%, capped by billboard decay |
| 4 | Reaction — impressed | 2.00s | in 0.70, out 2.70 |
| 5 | Aslibella | ~3.50s | provisional, must end before the turn |
| 6 | Showcase #2 | ~2.50s | client asked for fast |
| 7 | Mission still | 3.00s | push-in / parallax |
| 8 | Offer still | 2.75s | client asked 2.5-3s, must convert |
| 9 | End card | 2.00s + 0.6s fade to black | |
| | **Total** | **~23.95s** | inside 22-27s, with room to extend Scenes 5-6 |

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

### Scene 4 — CONFIRMED (reframed by client)
- The Vertexia storefront beat is REMOVED FROM THE FILM ENTIRELY. Scene 4 is now
  the reaction: he has entered the city, seen the designs in Scene 3, and is
  looking around impressed.
- Source 1628x1272 landscape. Crop x=688 of a 2457-wide scaled frame. That is a
  tight portrait; the "Good Design Builds Bigger Businesses" wall sign is cropped
  out. No loss — the sign was only legible to 0.30s in the source anyway, and no
  crop existed that held both it and the subject.
- SHOT/REVERSE PAIR WITH SCENE 3. Scene 3 is him from behind facing the
  billboards; Scene 4 is the reverse angle on his face. The eyeline matches too:
  the Vertexia billboard is screen-left in Scene 3 and he looks off screen-left
  here. That pairing is why removing the storefront strengthens the cut rather
  than leaving a hole.
- NO DEGRADATION. Clean through 5.04s — the first clip since Scene 1 with a full
  usable run. Only the framing moves: the camera drifts right over the clip.
- Turn timing, measured:
      t=1.40  profile, looking off-left
      t=1.70  mid-turn, EYES CLOSED — do not cut here
      t=2.00  facing camera, slight smile
      t=2.30  facing camera, settled
- CUT: in 0.70, out 2.70 -> 2.00s. Gives ~0.6s of profile taking the city in,
  the turn landing ~1.2s in, then ~0.8s held on camera. Ending on the look to
  camera hands off into the Scene 5 showcase as "let me show you".
- Source audio (aac) stripped.

### Scene 3 — CONFIRMED
- Cape Town. Subject from behind, Table Mountain centre, Vertexia billboard far
  left, LuxeLash "Elevate Your Natural Beauty" billboard far right, "IDEAS BUILD
  BRANDS" billboard centre-right. Matches brief.
- Source is 1576x1312, LANDSCAPE (1.20:1). Full-bleed 9:16 costs 53% of width.
- CROP LOCKED AT x=613 (of a 2306-wide scaled frame). Tested three positions:
    x=300  too far left, subject falls out of frame
    x=613  KEEPS the Vertexia logo and wordmark AND "IDEAS BUILD BRANDS",
           subject right-of-frame, Table Mountain behind. Chosen.
    x=900  best symmetry, but drops Vertexia entirely and puts the garbled
           right-hand billboard on screen. Rejected.
  The LuxeLash billboard cannot be kept: holding both it and the Vertexia logo
  needs a 1426px window and only 1080 is available. Scene 4 is the dedicated
  Vertexia beat, so Scene 3 leads with the logo and lets the rest go.
- DEFECT: the billboards decay fast. This is generation drift in the source.
      t=0.00  Vertexia headline + logo sharp, LuxeLash eye ad readable
      t=0.50  LuxeLash ad already abstract
      t=0.75  Vertexia logo + headline hold, body copy blurring
      t=1.00  Vertexia logo + headline still legible — LAST GOOD FRAME
      t=1.20  Vertexia billboard BLANK
      t=1.70  right billboard garbled text, Vertexia dark purple
      t=5.00  Vertexia billboard is an abstract pink shape, LuxeLash gone
  USABLE WINDOW 0.00 -> 1.10s. Budget wanted 3.50s.
- FIX: 50% motion-interpolated slow motion (setpts=2.0*PTS, minterpolate mci /
  aobmc / vsbmc) turns the 1.1s clean window into 2.20s. Inspected at 100% crop:
  no tearing on the pedestrians, wordmark stays legible. A 2.727x stretch to
  2.88s also renders clean and is available if the scene needs more room.
  Dramatically apt — he is standing still taking the city in.
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

## SYSTEMIC WARNING
Every video asset received so far degrades in its back half, and the clean
window keeps shrinking:
    Scene 1  clean throughout (4.11s)
    Scene 2  clean to 2.40s of 5.04s  (green spill on the jacket)
    Scene 3  clean to 1.10s of 5.04s  (billboard content dissolves)
    Scene 4  CLEAN THROUGHOUT (5.04s) — portrait, no decay
Scene 4 broke the pattern. Assume Scenes 5-6 may still follow it. Each will be probed for its clean window before
any timing is promised, and motion-interpolated slow motion is the standing
remedy where a window is shorter than the beat needs.

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
