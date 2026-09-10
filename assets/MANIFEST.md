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
| 5 | Website showcase #1 — Aslibella | `scene05_aslibella.mov` | CONFIRMED | 1576x1312, 24fps, 2.02s |
| 6 | Website showcase #2 — Brioche & Co | `scene06_showcase2.mp4` | CONFIRMED | 1764x1176, 24fps, 5.04s |
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
| 5 | Aslibella | 2.04s | full source; he never turns, no trim needed |
| 6 | Showcase #2 | 2.50s | in 1.00, out 3.50 |
| 7 | Mission still | 3.00s | push-in / parallax |
| 8 | Offer still | 2.75s | client asked 2.5-3s, must convert |
| 9 | End card | 2.00s + 0.6s fade to black | |
| | **Total** | **~22.49s** | low end of 22-27s — see note |

Scenes 3-6 are provisional and will be set from the real footage — cut points
follow the movement in frame, not the spreadsheet.

RUNTIME NOTE: sources keep coming in shorter than budgeted (Scene 5 is 2.02s
against 3.50s). The total now sits at the low end of the target. If Scene 6 is
also short, the recovery options in order of preference are: ease Scene 5 to
~2.6s for design read time, ease Scene 3 to its 2.88s render, then extend the
Scene 7 push-in. The stills are the only elastic material in the film.

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

### Scene 6 — CONFIRMED
- Brioche & Co Bake House device mockup. Navy/gold, "CINNAMON ROLLS / Like No
  Other", laptop and phone showing the same design. Clean throughout, no decay.
- WIDEST SOURCE IN THE FILM: 1764x1176 (1.5:1). Scaled to 1920 tall it is 2880
  wide; the laptop and phone together span 2325px of that. 1080 is available.
  Both devices cannot be held in one full-bleed frame. This is arithmetic.
- Also note the laptop headline alone spans ~1108px once the camera has pushed
  in — wider than the frame. It can never be shown complete after ~t=1.0.
- TESTED TWO TREATMENTS:
    PAN (laptop -> phone, eased): rejected. The midpoint of the move shows the
      headline cut in half — reads as a mistake, not a reveal.
    PHONE-FORWARD (crop x=1760->1830, native push-in kept): CHOSEN. The phone
      carries the identical design and is fully legible start to finish, with
      the laptop bleeding in at frame left. A vertical device filling a vertical
      frame, which is what the viewer is literally holding.
- The phone-forward choice also protects continuity: Scene 5 ends pushing in on
  the Aslibella storefront and Scene 6 pushes in on the phone. Cutting push-in to
  push-in carries the forward motion across the film's biggest tonal break —
  Cape Town street to studio tabletop. A lateral pan would have broken it.
- CUT: in 1.00, out 3.50 -> 2.50s. Client asked for fast.
- Source audio (aac) stripped.

### Scene 5 — CONFIRMED
- Aslibella Lash Studio storefront. Black/pink design, "ASLIBELLA LASH STUDIO"
  wordmark, "Enhance Your Natural Beauty", Book Appointment, feature icons, the
  lash model image and the "Lashes that speak for you" side panel. Matches brief.
- HE NEVER TURNS AROUND. Checked every sampled frame to the final one at 2.02s —
  he stays in profile / back to camera throughout. The source is already trimmed,
  so the "cut before I turn around" instruction needs no action.
- SHORTEST SOURCE SO FAR: 2.02s, against a 3.50s budget. No decay in it though —
  the wordmark and headline stay crisp to the last frame.
- Source 1576x1312 landscape, crop to 1080 of a 2306-wide scaled frame.
- DYNAMIC CROP. The camera pushes in during the clip, so a fixed crop that frames
  the headline at the start clips it by the end: at x=420 "Natural Beauty" runs
  off the right edge by t=1.6. The crop therefore drifts left as the push-in
  happens, x = 420 -> 210 across the clip, holding the headline fully in frame
  throughout. Verified at t=0.1, 1.0 and 1.9.
  This is a counter-move against camera motion already in the plate, not an added
  camera move — the framing stays still while the lens comes in.
- He walks into the headline slightly at the end. That is natural occlusion and
  reads as intended.
- Runs at natural speed, 2.04s. Could be eased to ~2.6s if the design needs more
  read time; deferred until Scene 6 lands and the total is known.
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
    Scene 5  CLEAN THROUGHOUT (2.02s) — but the source is only 2.02s long
    Scene 6  CLEAN THROUGHOUT (5.04s)
Scene 4 broke the pattern. Assume Scenes 5-6 may still follow it. Each will be probed for its clean window before
any timing is promised, and motion-interpolated slow motion is the standing
remedy where a window is shorter than the beat needs.

## COLOUR GRADE — MEASURED AND MATCHED

The six clips arrived as two different-looking films. Measured before grading:

    scene        Y      U      V     reads as
    1 hook       82.0   120.8  137.5 warm, golden hour
    2 walk      102.9   120.7  135.1 warm but MUCH brighter
    3 city       78.9   129.9  128.3 neutral/blue daylight
    4 reaction   75.4   120.8  137.5 warm
    5 aslibella  57.9   125.6  132.5 slightly warm, dark
    6 showcase   53.9   129.7  128.1 neutral, darkest

Two faults: brightness spanned 53.9-102.9, nearly 2x, with Scene 2 the outlier;
and colour split into a warm family (1,2,4) and a neutral family (3,6).

Grade applied per scene, then re-measured:

    scene        Y      U      V
    1            68.1   124.6  133.4
    2            74.0   124.8  131.3
    3            70.3   122.8  133.6
    4            69.0   124.6  133.3
    5            55.0   124.5  132.5
    6            50.1   125.2  130.5

    U spread  9.2 -> 2.4
    V spread  9.4 -> 3.1
    Scenes 1-4 now sit within 6 points of brightness.

Scenes 5 and 6 are deliberately left darker. Their designs are black/pink and
navy/gold; lifting them to match would wreck the client work the film exists to
sell. The goal was never one flat number — it was removing the JUMP at each cut
while letting scene-appropriate variation stand.

Filter chain per scene (geometry first, then grade):
    1  eq=brightness=-0.008:contrast=1.03:saturation=1.02, colortemperature=9800 mix=0.85
    2  eq=brightness=-0.082:contrast=1.06:saturation=1.02, colortemperature=9400 mix=0.80
    3  eq=brightness= 0.012:contrast=1.03:saturation=1.05, colortemperature=3900 mix=0.80
    4  eq=brightness= 0.022:contrast=1.02:saturation=1.02, colortemperature=9800 mix=0.85
    5  eq=brightness= 0.014:contrast=1.04:saturation=1.03, colortemperature=6100 mix=0.35
    6  eq=brightness= 0.024:contrast=1.03:saturation=1.04, colortemperature=4000 mix=0.75

OPEN QUESTION: Scene 3 warming at mix=0.80 mutes the Cape Town sky from punchy
blue toward blue-grey. Continuity gained, postcard blue lost. Worth a look —
dropping to mix=0.65 keeps more sky at the cost of some convergence.

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
