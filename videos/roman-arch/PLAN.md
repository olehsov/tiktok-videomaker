# PLAN: Roman Arch — A Bridge of Loose Stones (`roman-arch`)

## 1. Summary
- Concept: one cut-away elevation of a river valley. Banks, water, mud and bedrock are always visible. A Roman bridge with two semicircular arches and one pier is built in it step by step. The order is a slab attempt, then a dry footing (cofferdam), centering, wedge stones, keystone, striking the frame, abutments, fill to a flat road and a flood hole. Each step follows a red failure ghost. The climax is a spring flood with carts on the deck. A heron is the observer and ends standing over the keystone.
- Duration: en **94.836 s** (voice 93.336 s, `timings.en.json → videoDurationSec`, source `elevenlabs`). It is inside 60–120 s and inside the brief window 110 s ±15 % (93.5–126.5 s).
- Languages: `en` only. Every rule below also works for `uk`/`ru` without code changes.

**Global conventions (binding)**
- Every time is an expression of `ctx.cue(action)`, `ctx.word(beat, text, n)`, `B(id).start/.end` (= `ctx.beat(id)`), `ctx.t0` or `ctx.t1`. Literal numbers are only durations and offsets. The en seconds in brackets are for orientation only.
- Notation: `cue(x)` = `ctx.cue("x")`, `B(b)` = `ctx.beat(b)`, `next(b)` = start of the beat after `b` (or `ctx.t1`), `w(b, "x")` = `ctx.word(b, "x")`.
- **Ids**: the plan writes element ids without a prefix (`ring1`, `pier`). In code every id is `br-<name>` (e.g. `#br-ring1`). The scene id is `br`.
- All scene art is in **world units** inside one camera group `#br-cam` (`attr transform` = `tf({x, y, sx:s, sy:s})`). Screen = `s·world + (x, y)`. Overlays (plates, callouts, labels, meter, gauge, captions) and the screen-space layers (§3.0) are in screen pixels. Scene anchors must be converted with the camera preset that is active at that moment (`toScreen(cam, wx, wy)` in `src/bridge.mjs`).
- Colour meaning:
  - Loads and thrust are `--ui-yellow`. Fix highlights and recap outlines are also `--ui-yellow`.
  - Tension, flood push and ghost cracks are `--ui-red`.
  - Flowing water arrows are `--ui-blue`.
  - Ghosts use kit `ghost()` plus the red veil `#veilRed` (opacity 0.14).
  - Nothing else bright appears in the scene.
- Text sizes: **no overlay text below 36 px** (plates, callout titles, labels, gauge, meter, recap pills). Callout subtitles are **38–40 px**, captions 56–96 px. The final label is up to 64 px.
- Screen zones (1080×1920):
  - Plates: centre y 230 (182–278).
  - Meter: (48, 300), 380×84.
  - Gauge: (48, 400), b01 and b11 only.
  - **Callout slot**: card top-left **(400, 400)**, `width 540`, so the bottom is ≤ 610. It is the same in every beat.
  - Captions: y 1230–1460.
  - Nothing readable right of x 940 or below y 1520.
- **Full-height use**: every camera preset (§3.0) shows sky, mountains and clouds at the top, the bridge in the middle, and water, mud and three faceted bedrock strata with rocks down to y 1920. No flat single-colour band may be taller than 200 px.

## 2. Composition

`node build.mjs en` reads `script.en.json`, `timings.en.json`, `src/scenes.mjs` (with `src/bridge.mjs` and `src/fx.mjs`) and `kit/`. It writes `build/en/index.html` with one paused GSAP timeline `window.__timelines["main"]`, plus `assets/voice.wav` and `assets/music.wav`.

| Layer | What | `data-track-index` | z |
| --- | --- | --- | --- |
| audio voice | `<audio id="voice">` `assets/voice.wav` (loudness-normalised, §8), volume 1 | 0 | — |
| audio music | `<audio id="music">` `assets/music.wav` (the `audio/music.loop.en.mp3` bed lifted to −24 LUFS, §8), volume 1 | -1 | — |
| scene | ONE full-frame scene clip `br`, covering b01–b13. Inside it: screen-space sky, sun and clouds, then `#br-cam` (all world art, characters, effects, ForceArrows), then screen-space rain, cork inset and red veil. FlowArrows clips (screen space) are appended to the scene html | 1 | 1 |
| extras | `recap` (RecapPills), b12 → b12 | 2 | 4 |
| overlays | plates, callouts, labels, gauge, meter (`build.mjs` from `onScreen`) | 3 | 5 |
| captions | KaraokeCaption (`build.mjs`) | 9 | 10 |

There is one scene because the frame accumulates continuously. It starts with `light: "day"`; every later lighting change is a `lightTween` on `ctx.world`.

### 2.1 `build.mjs`
**Copy `videos/hypocaust/build.mjs` over `videos/roman-arch/build.mjs` verbatim.** It already has everything this plan needs:
- `makeCtx`, `overlaysByBeat` (`stepAt`, `meter` frames) and the `extras` loop.
- Anchors with `.at`, `.until`, `.width`, `.maxWidth` and `.max`, with a 1.2 s minimum.
- `METER (48,300)` and `GAUGE (48,400)`.
- Voice two-pass linear loudnorm (I = −15) → `assets/voice.wav`.
- Music measured with `ebur128` and lifted linearly to −24 LUFS (gain ≤ 40 dB, `alimiter` 0.7) → `assets/music.wav`, with `data-volume="1"` on both tracks.

Do not edit `config.json` or `tools/`. Record the copy in `KIT_CHANGES.md`.

## 3. Scenes by beat

### 3.0 World geometry (`src/bridge.mjs`, world units)

**Key numbers**
- Bank/road surface `GY = 718`.
- Road paving top `ROAD = 704`.
- Springing line `S = 960`.
- Normal water top `WATER = 1110`.
- Mud 1200–1272 (`MUD = 1200`).
- Bedrock top `ROCK = 1270`.
- Arch 1: centre `C1 = (320, 960)`. Arch 2: centre `C2 = (800, 960)`.
- Rings: intrados `r = 170`, extrados `R = 212`, mid-ring `RM = 191`. The keystone extrados is `R + 10 = 222`.
- Crown intrados y 790, extrados y 748, keystone top y 738.
- Pier x 490–630, y 960–1270. Arch 1 springs from x 150 (bank ledge) and x 490 (pier). Arch 2 springs from x 630 and x 970.

**Back → front layer order inside `#br-cam`**
1. **Far mountains**: `mountains({ y:718, w:1880, count:7, height:360, snow:false, token:"stone", seed:3 })` in `<g transform="translate(-400 0)">`.
2. **Near hills**: `mountains({ y:718, w:1880, count:9, height:180, snow:false, token:"green-mid", seed:9 })`, same translate.
3. **Trees** (on the hills, behind the banks): `pineTree` at (−40, 640, s 0.5), (1100, 650, s 0.55), (1160, 660, s 0.45).
4. **`#floodBack`** (upstream water seen through the arch openings): rect x −400…1480, y 820–1200, fill `color-mix(in srgb, var(--water) 35%, var(--earth-2))`. It starts at `attr transform tf({py:1200, sy:0})`.
5. **Bedrock** `bedrock()`:
   - Strata 1270–1420 `var(--stone)`, 1420–1620 `shade("stone",10)`, 1620–2000 `shade("stone",20)`, over x −400…1480.
   - Boundaries are wavy (seeded, amplitude 30). Each band gets faceted triangles every 90 px, using the same logic as kit `terrain` `band()`, at opacity .55/.45.
   - `rocks` at (300, 1500, s 0.8), (760, 1680, s 1), (1000, 1450, s 0.7), (80, 1800, s 0.9).
6. **Mud**: rect x −400…1480, y 1200–1272, `var(--earth-2)`, with facets and 12 seeded pebbles (hexagons r 4–7, `shade("stone",6)`).
   - `#mudIn`: the same mud for x 470–650 only, drawn on top. It starts at `tf({py:1272})` (sy 1).
7. **`#cofBack`** (back half of the cofferdam ring): 9 stakes, each 14 wide with a gap of 6, x 470…650, y 1060–1200, `var(--wood)` with the right third `shade("wood",14)` and a pointed top. Opacity 0.
8. **Water `#water`** (`attr transform tf({py:1200})`, sy 1):
   - Three rects, all `var(--water)` with the faceted top edge from kit `waterSurface`, y 1110–1200: `#waterL` x −400…470, `#waterIn` x 470…650 (own `tf({py:1200})`), `#waterR` x 650…1480.
   - `#waterBrown`: the same three shapes in `color-mix(in srgb, var(--water) 40%, var(--earth-1))`, opacity 0.
9. **Banks** (soil cross-section):
   - Left: `<clipPath>` polygon `(-400,680) (98,680) (104,964) (150,964) (178,1200) (178,1272) (-400,1272)` around `terrain({ x:-400, y:718, w:1000, h:560, layers:[150,330], top:"grass", seed:7 })`.
   - Right: the mirror (x' = 1120 − x), so the face is `(1022,680) (1016,964) (970,964) (942,1200)`, around `terrain({ x:520, y:718, w:1000, …, seed:8 })`.
   - Bank faces: a 12 px rock strip along each face polyline, `shade("stone",8)`, with 3 seeded facet triangles. The ledges (104–150 and 970–1016 at y 964) are `tint("stone",6)` 8 px thick.
10. **Stone pile `#pile`** on the left bank: 9 cut blocks (24×16, rows 4/3/2) over x 30–94, base y 718. Faces are `var(--stone)` / `tint("stone",10)` with the right 30 % `shade("stone",16)`. Each block starts at scale 0 about its base.
11. **`#gPier`**: `ghost("br-gPier", pierShape(x 490–630, y 960–1200))`.
12. **Cofferdam walls `#cof`** (opacity 0):
    - Left wall: outer stake x 446–454, clay 454–462, inner stake 462–470. Right wall: 650–658, 658–666, 666–674.
    - Stakes run y 1062–1268 with a pointed bottom to 1276, `var(--wood)` and the right half `shade("wood",14)`, each in its own group `#stk0..3` (start `translate(0 -260)`).
    - Clay `#clay`: `tint("earth-1",10)` with facets `shade("earth-1",10)`, starting at `tf({py:1268, sy:0})`.
    - Two wales per wall (horizontal bands 6 px at y 1090 and 1160, `shade("wood",22)`).
13. **`#bridgeShake`** (`attr transform tf()`). It holds 14–20 and is used in the b10 ghost.
14. **Pier `#pier`** (start `tf({py:1270, sy:0})`):
    - 6 courses of about 51.7 high.
    - Faces: left 60 % `var(--stone)`, right 40 % `shade("stone",16)`.
    - Course lines `shade("stone",28)` 3 px, with staggered vertical joints.
15. **Fill `#fill`**, clipped to polygon F: (96,718) → (1024,718) → (1012,960) → extrados of arch 2 from 0° to 180° (6° steps) → (532,960) → extrados of arch 1 from 0° to 180° → (108,960) → back to (96,718).
    - Inside the clip there are 4 bands `#fill0..3` (y 900–960, 840–900, 780–840, 718–780), each starting at `tf({py:<band bottom>, sy:0})`.
    - Faces alternate `shade("stone",6)` / `tint("sand",4)`, with 30 seeded rubble pentagons r 6–10 `shade("stone",18)`.
16. **Parapet `#parapet`**: x 96–1024, y 682–704, `shade("stone",10)`, with a coping strip 682–688 `tint("stone",20)`. Opacity 0.
17. **Hole `#hole`** (centre (560, 845), opacity 0, start `tf({px:560, py:845, sx:0, sy:0})`):
    - Disc r 30 `var(--sky-2)` (see-through).
    - `#holeWater`: the part of the disc below y 840, filled with the `#floodBack` colour, opacity 0.
    - Rim ring r 30–33 `shade("earth-3",30)`.
    - 10 small wedge stones (r 33–45, 36° each, alternating `var(--stone)` / `tint("stone",8)`, joints `shade("stone",40)` 2 px) in `#holeRing`.
18. **Centering `#cen1`** (arch 1; opacity 0):
    - Posts `#cen1-p0/p1` at x 216–230 and 410–424, y 974–1206, `shade("wood",14)`, start `tf({py:1206, sy:0})`.
    - Beam `#cen1-b` x 150–490, y 960–974, `shade("wood",6)`, opacity 0.
    - Struts `#cen1-s0..4`: quads 8 wide from C1 to radius 154 at 30°, 60°, 90°, 120°, 150°, `tint("wood",6)`, opacity 0.
    - Rib `#cen1-r0..5`: band r 154–170 in six 30° segments, alternating `var(--wood)` / `shade("wood",12)`, opacity 0.
    - `#cen2` is the same shape around C2 (posts at x 696–710 and 890–904).
19. **Rings `#ring1`, `#ring2`** (`archRing({ id, cx, cy:960, r:170, R:212, n:15, key:7 })`):
    - Stone k (k = 0…14) spans θa = 180° − 12k to θb = 180° − 12(k+1); a point is (cx + ρ·cosθ, cy − ρ·sinθ).
    - Each stone is `<g id="v1d-k"><g id="v1-k">quad + facets</g></g>`. The outer wrapper (`v1d`) is only for ghost dimming; the inner one is for laying.
    - Quad corners: (r,θa) (r,θb) (R,θb) (R,θa). Fill: k even `var(--stone)`, k odd `tint("stone",8)`. Extrados band R−12…R `shade("stone",12)`. Highlight triangle (r,θa), mid-point, (R,θa) `tint("stone",16)` at .5.
    - Stones start at opacity 0 and `translate(<outward radial ×50>)`.
    - **Keystone** k = 7 is drawn as `#ks1Drop > #ks1`, with extrados `R+10`, fill `tint("stone",14)` and band `shade("stone",8)`. `#ks1Drop` starts at `translate(0 -70)`, opacity 0.
    - Joints `#joints1`: 14 radial lines at θ = 180 − 12k (k = 1…14) from ρ 170 to 212 (to 222 at 96°/84°), `shade("stone",45)`, `stroke-width 5`, opacity 0. They show "gaps" until b09.
    - `#ring2` is the same around C2 (`v2-k`, `ks2Drop/ks2`, `joints2`).
20. **Outlines (yellow, no fill, stroke `--ui-yellow`, opacity 0)**:
    - `#ring1Y-k` (k = 0…14, stroke 4), `#gapY` (keystone slot of arch 1, stroke 5, dash 12 8).
    - `#radial1`: 14 dashed lines `--ui-yellow` 3 px, dash 10 8, from C1 to ρ 224 along every joint angle, plus a centre dot r 6.
    - Recap outlines `#rc0..6` (stroke 5, §3 b12) and `#ks1Y2` (keystone 1, stroke 5).
21. **Ghosts** (each `ghost(...)`, hidden):
    - `#gStones`: copies of stones 0–2 of arch 1.
    - `#gSquares`: five 40×40 axis-aligned squares centred on stones 4, 5, 6, 8, 9 at RM.
    - `#gCollapse`: copies of arch 1 stones 0–6 and 8–14, each in its own group `#gc-k`, no keystone.
    - `#gSpread`: `#gsL` (arch 1 stones 0–6, pivot (108,960)), `#gsK1` (keystone 1), `#gsR` (arch 2 stones 8–14, pivot (1012,960)) and `#gsK2`.
22. **Slab `#slabFall`** (`translate(0 0)`, opacity 1):
    - `#slabL` (x 60–560) and `#slabR` (560–1060), y 678–718, both starting at `attr transform tf({x:-1100})`.
    - Faces: body `var(--stone)` with the right half `shade("stone",10)`, top facet 8 px `tint("stone",12)`, 4 chisel lines `shade("stone",22)`.
    - `#crackLine`: zig-zag at x 560, y 678–742, `shade("earth-3",40)` 4 px, opacity 0.
23. **Crane `#crane`** (opacity 0):
    - Mast x 66–78, y 640–718. Jib x 66–340, y 640–652 (`var(--wood)` / `shade("wood",12)`). Diagonal brace (78,700) → (200,652).
    - Pulley circle (320,660) r 8 `shade("wood",25)`.
    - `#rope`: line (320,668) → (320,668), `shade("earth-3",20)` 3 px.
24. **`#spout`**: poly (548,872) (572,872) (580,930) (576,975) (552,975) (546,930), `tint("water",25)` at .85, start `tf({py:872, sy:0})`, opacity 0.
25. **`#spanDim`**: line x 150–490 at y 1076, `--ui-white` 3 px, with 16 px end ticks. Opacity 0.
26. **`#abutL`, `#abutR`**:
    - Left polygon `(0,722) (96,718) (104,964) (150,964) (160,1060) (0,1060)`. Right is the mirror (x' = 1120 − x).
    - 5 courses `#abL-c0..4` / `#abR-c0..4` (bottom → top: 990–1060, 922–990, 854–922, 786–854, 718–786), clipped to the polygon.
    - Faces: `tint("stone",6)` with the right 30 % `shade("stone",12)`, course lines `shade("stone",30)` 3 px, alternating vertical joints.
    - Each course starts at opacity 0 and `translate(0 20)`.
    - These are drawn **after** the banks and are not in `#bridgeShake`.
27. **`#paving`**: x −400…1480, y 704–718, `tint("stone",14)`, seams every 40 `shade("stone",6)`. Opacity 0. Not in `#bridgeShake`.
28. **Characters**: `#convoy` (§4.3), puppet `br-p`, heron `br-h`, `#heronWaterFront` (rect x 850–910, y 1118–1162, `var(--water)`, drawn in front of the heron; it hides the legs below the waterline).
29. **`#preview`** (finished bridge for the hook, opacity 1 at t0): a static copy of 14–17 and 19–20 (pier, fill, parapet, paving, both rings with keystones, joints at stroke 1.5, both abutments).
    - The rings are built so each preview stone `#pv1-k` / `#pv2-k` can translate radially.
    - It also holds a yellow outline group `#pvY` (all 30 stones, opacity 0), a red joint copy `#pvJR` (all joints in `--ui-red` 4 px, opacity 0) and the car `#car` (§4.3) at `translate(-120 704)`, scale 1.4.
30. **Splashes, ForceArrows `svg` groups and the b08/b09/b11 FlowArrows** come last. FlowArrows are screen-space html clips; see §5.

**Screen-space layers in the scene stage**
- Before `#br-cam`:
  - `sky({ id:"br-sky", horizonY:1000 })`.
  - `#sunW` (`attr transform translate(0 0)`) holding `sun({ cx:860, cy:330, r:70 })`.
  - `#cloudsDay`: `clouds({ x:180, y:250, s:1, count:3, seed:6 })` plus `clouds({ x:420, y:420, s:0.8, count:2, seed:4 })`. Each group drifts x +80 over the whole video (one linear tween each).
  - `#stormClouds`: 4 cloud polys like kit `clouds`, but fill `shade("stone",35)` / `shade("stone",45)`, spread over x 0–1080, y 150–430. Opacity 0.
- After `#br-cam`:
  - `#rain`: 36 seeded drops, opacity 0 (§4.4).
  - `#cork`: the inset (§4.5), opacity 0.
  - `#veilRed`: full-frame `var(--ui-red)`, opacity 0.

**Camera presets** (`tf({ x, y, sx:s, sy:s })` on `#br-cam`; `toScreen` = s·w + (x, y))

| Preset | s | x | y | Used | Check |
| --- | --- | --- | --- | --- | --- |
| WIDE | 1 | 0 | 0 | b08, b09, b11, b13 | screen = world; bedrock fills 1270–1920 |
| HOOK | 1.08 | −64.8 | −20.3 | b01 end, b02 | world x 60–1060, y 19–1797 |
| CLOSE | 1.6 | −68 | −576.8 | b03 (from "First,"), b04, b05, b07 | world x 42–718, y 360–1560; crown at screen y 620 |
| KEY | 2.2 | −164 | −972 | b06 | world x 74–566, y 442–1314; keystone centre at screen (540, 698) |
| FLOOD | 1.3 | −188 | −266.6 | b10 | world x 145–975, y 205–1682; hole at screen (540, 832) |
| RECAP | 1 | 0 | 180 | b12 | parapet top at screen y 862, under the recap pills |

Camera moves are `fromTo` on `#br-cam` `attr transform` with `immediateRender:false`, through a `cam(to, at, planned, beat)` helper as in hypocaust (`dur = min(planned, max(0.5, next(beat) − at − 0.05))`).

**State at t0**
- Visible:
  - sky, sun, day clouds, mountains, hills, trees, bedrock, mud (+ `#mudIn`), water, banks, `#preview` (with `#car`).
  - Heron at (880, 1160), facing left, standing, with `#heronWaterFront`.
  - Puppet `br-p` at (40, 718), facing right, `stand`.
- Hidden: everything else (slab off-screen left, all build parts at opacity 0 / scale 0).
- Camera WIDE.

### b01 hook (0 → 6.037)
- Camera WIDE → HOOK from `t0`. `dur = B(b02).start − t0`, `power1.inOut` (a slow push-in).
- **Loose stones (hook in the first 3 s)**:
  - At `w(b01,"loose")` [0.615]: every preview stone `#pvN-k` moves 14 px outward along its radial (0.35 s, `power2.out`), and `#pvY` goes 0 → 1 (0.25 s). The bridge visibly breaks into separate blocks.
  - At `w(b01,"mortar.")` [2.659]: the stones snap back (0.22 s, `power3.in`), and `#pvY` → 0 (0.2 s).
  - `#pvJR` flashes 0 → 0.9 → 0 (0.6 s): the bare joints flash red ("no mortar").
  - `#preview` shakes x +4 / −4 / 0 (3 × 0.07 s) at `w(…,"mortar.") + 0.2`.
- **`car-cross`** at `cue` [3.379]: `#car` `translate(-120 704)` → `translate(1180 704)`, `dur = B(b02).start − 0.35 − cue`, ease none. Its wheels rotate 4 turns (`attr transform rotate` about each wheel centre).
- At `B(b02).start − 0.35`: `#preview` 1 → 0 (0.4 s). The empty valley remains.
- Overlays: gauge `1,900 YEARS` (auto, (48,400)), meter STABILITY 0 (auto). No plate, callout or ghost. Light day.

### b02 attempt (6.548 → 15.151); the whole beat is the attempt
- Camera stays HOOK.
- **`slab-place`** at `cue` [8.499]:
  - `#slabL`, `#slabR`: `tf({x:-1100})` → `tf()` (1.2 s, `power2.out`).
  - Puppet `act("push", cue, 1.2, 0.5)`, `move(70, 718, cue, 1.2)`, then `pose("stand", cue + 1.2)`.
- **`slab-sag`** at `cue` [9.973]:
  - `#slabL` → `tf({r:2.5, px:96, py:718})` and `#slabR` → `tf({r:-2.5, px:1024, py:718})` (0.6 s, `sine.inOut`).
  - At `w(b02,"belly")` [10.913]: `ForceArrows({ id:"br-fa2", tone:"red", mode:"stretch", path:[[400,752],[720,752]], count:2, len:52, width:10, gap:20, at, dur: cue("ghost-slab-crack") + 0.2 − at, period:1.0 })` (svg in the world). The belly stretches.
- **`ghost-slab-crack`** at `cue` [14.466]:
  - `#crackLine` 0 → 1 (0.08 s). `#veilRed` 0 → 0.14 (0.15 s).
  - At `cue + 0.1`: `#slabL` → `tf({r:38, px:96, py:718})`, `#slabR` → `tf({r:-38, px:1024, py:718})` (0.45 s, `power2.in`).
  - At `cue + 0.55`: `#slabFall` y 0 → 260 and opacity → 0 (0.35 s, `power1.in`).
  - `splash` at (330,1110) and (790,1110), both at `cue + 0.6`.
  - Puppet `act("shiver", cue + 0.2, 0.9, 0.3)`, then `pose("stand")`.
  - Heron, at `cue + 0.15`: `face("right")`, `pose("fly", 0.15)`, `flap(…, 1.3, 0.25)`, `move(1200, 420, …, 1.3, "power1.in")`. Its `#heronWaterFront` → 0 (0.2 s).
- **Rewind** at `R2 = B(b03).start − 0.25`: `#veilRed` → 0 (0.3 s). The slab is already gone.
- Overlays: `⚠ SLAB CRACKS` (auto, whole beat). Meter stays 0 (b02 has no meter entry).

### b03 step 1: dry footing (15.592 → 25.74)
- At `B(b03).start`: puppet opacity → 0 (0.25 s). At `+0.3` it moves instantly (dur 0.01) to (560, 1270).
- **`stones-pile`** at `cue` [16.603]: the 9 `#pile` blocks scale 0 → 1 about their bases (0.15 s each, staggered 0.06, `back.out(1.4)`).
- Camera HOOK → CLOSE at `w(b03,"First,")` [17.833], planned 1.2 s, `power2.inOut`.
- **`ghost-pier-sink`** (hold `h = clamp(cue("cofferdam-ring") − cue − 0.05, 0.8, 1.3)`; en 0.96):
  - At `w(b03,"mud")` [20.713]: `#gPier` 0 → 1 (0.25 s).
  - At `cue` [21.107]: `#gPier` → `tf({y:45, r:7, px:560, py:1200})` (0.7 s, `power1.in`), and `#veilRed` 0 → 0.14.
  - **Rewind** at `cue + h`: `#gPier` → 0 and `#veilRed` → 0 (0.3 s).
- **`cofferdam-ring`** at `cue` [22.117]:
  - `#cof` 0 → 1 (0.1 s).
  - `#stk0..3` `translate(0 -260)` → `translate(0 0)` (0.25 s each, `power2.in`, staggered 0.08).
  - `#cofBack` 0 → 1 (0.3 s) at `cue + 0.2`.
  - `#clay` sy 0 → 1 (0.4 s) at `cue + 0.45`.
- **Pump dry** at `w(b03,"pump")` [24.01]:
  - `#waterIn` sy 1 → 0 about y 1200 (0.6 s, `power1.in`).
  - `FlowArrows({ id:"br-pump", kind:"water", x:0, y:0, w:1080, h:1920, points: CLOSE-screen of [[600,1150],[640,1070],[700,1050]], at, dur:0.9, width:8 })`.
- **`dig-to-rock`** at `cue` [24.904]:
  - `#mudIn` sy 1 → 0 about y 1272 (0.6 s).
  - Puppet opacity 0 → 1 (0.15 s), `act("dig", cue, 0.6, 0.3)`.
  - At `w(b03,"rock.")` [25.275]: a yellow line over the rock top inside the ring (x 470–650, y 1270, 5 px) flashes 0 → 1 → 0 (0.4 s).
  - Pier rise at `w(b03,"rock.") + 0.25`: `#pier` sy 0 → 1 (0.6 s, `ease:"steps(6)"`). Puppet opacity → 0 (0.15 s) at the same time.
- Callout `cofferdam`:
  - Card (400,400), `width 540`.
  - `target` = CLOSE(458, 1090) = **(664.8, 1167.2)**.
  - `at: cue("cofferdam-ring") + 0.6`.
- Overlays: threat `⚠ PIER SINKS` from beat start. Step `✓ STEP 1 · DRY FOOTING` with **`stepAt: cue("cofferdam-ring")`**. This override is required: the default would pick `stones-pile` and drop the threat before the ghost. Meter 15 (auto).

### b04 step 2: centering (26.181 → 31.103), CLOSE
- **`ghost-stones-fall`** (`h = clamp(cue("centering-build") − cue − 0.05, 0.8, 1.2)`; en 0.93):
  - At `w(b04,"loose")` [26.448]: `#gStones` 0 → 1 (0.2 s). The three stones hang at the left springing.
  - At `cue` [27.237]: each stone translates y +200, x +20·k and rotates 25° + 8k about its centre (0.55 s, `power2.in`, staggered 0.05). `#veilRed` 0 → 0.14. `splash` at (200, 1110) at `cue + 0.5`.
  - **Rewind** at `cue + h`: `#gStones` and `#veilRed` → 0 (0.3 s).
- **`centering-build`** at `cue` [28.224]:
  - `#cen1` → 1 (0.05 s).
  - Posts sy 0 → 1 (0.3 s).
  - Beam 0 → 1 (0.2 s) at `+0.25`.
  - Struts 0 → 1 (0.15 s, staggered 0.08) at `+0.45`.
  - Rib segments 0 → 1 (0.15 s, staggered 0.1, left → right) at `+0.85`.
  - Puppet: `move(128, 964, cue − 0.05, 0.01)`, opacity 0 → 1 (0.2 s) at `cue`, `pose("lift", cue + 0.2, 0.3)`, `pose("stand", cue + 1.6)`.
- Callout `centering`: card (400,400) w 540. `target` CLOSE(320, 798) = **(444, 700)**. `at: cue("centering-build") + 0.8`.
- Overlays: `✓ STEP 2 · CENTERING` (auto at beat start). Meter 25 (auto).

### b05 step 3: wedge stones (31.545 → 39.369), CLOSE
- **`wedges-lay`** at `cue` [32.043]:
  - Stones of arch 1 in the order 0, 14, 1, 13, 2, 12, 3, 11, 4, 10, 5, 9, 6, 8 (no 7). Each `#v1-k`: opacity 0 → 1 and translate → 0 (0.18 s, `power2.out`).
  - Stagger `st = clamp((cue("ghost-square-slip") − cue − 0.5)/13, 0.08, 0.16)`.
  - `#joints1` 0 → 1 (0.3 s) at `cue + 13·st + 0.1`.
  - Puppet `act("carry", cue, min(2.0, 13·st), 0.5)`, then `pose("stand")`.
- **`ghost-square-slip`** (`h = clamp(cue("cork-inset") − cue − 0.6, 1.0, 1.5)`; en 1.5):
  - At `cue` [35.376]: `#v1d-3…#v1d-10` (not 7) → 0.15 (0.2 s). `#gSquares` 0 → 1 (0.2 s). `#veilRed` 0 → 0.14.
  - At `cue + 0.3`: each square translates y +150 and rotates ±10° (alternating) (0.6 s, `power2.in`).
  - **Rewind** at `cue + h`: `#gSquares` → 0, the stones → 1, and `#veilRed` → 0 (0.3 s).
- **Radial joints** at `w(b05,"wedge")` [37.361]: `#radial1` 0 → 0.85 (0.4 s). It holds to `B(b06).start + 0.5`, then → 0 (0.3 s).
- **`cork-inset`** at `cue` [38.835]:
  - `#cork` pops (opacity 0 → 1, scale 0.9 → 1 about (760,500), 0.2 s). The animation inside is in §4.5.
  - `#cork` holds to `B(b06).start + 0.9`, then → 0 (0.25 s). The beat is too short for ≥ 1.2 s, so the inset deliberately runs into b06.
- Callout `voussoir`:
  - Card (400,400) w 540.
  - `target` = stone 3 centre CLOSE(178.1, 832.2) = **(217, 754.7)**.
  - `at: w(b05,"wider")`, `until: cue("cork-inset") − 0.05`.
- Overlays: `✓ STEP 3 · WEDGE STONES` (auto). Meter 40 (auto).

### b06 step 4: keystone (39.811 → 46.231)
- Camera CLOSE → KEY at `B(b06).start`, planned 1.2 s (this is the push-in to the crown).
- **`gap-highlight`** at `cue` [40.078]:
  - `#gapY` pulses 0 → 1 → 0.4 three times (0.3 s per half) and holds 0.4 until `cue("keystone-drop") + 0.3`, then → 0 (0.2 s).
  - `#crane` 0 → 1 (0.3 s).
  - At `cue + 0.6`: `#ks1Drop` opacity 0 → 1 (0.25 s), and `#rope` `attr y2` 668 → 668 (still).
  - From `cue + 0.6` to `cue("keystone-drop")`: `#ks1Drop` `translate(0 -70)` → `translate(0 -36)`, `sine.inOut`. `#rope` y2 668 → 702 with the same timing.
- **`keystone-drop`** at `cue` [42.655]:
  - `#ks1Drop` → `translate(0 0)` (0.3 s, `power2.in`), then a settle bounce `translate(0 -4)` → `translate(0 0)` (0.12 s). `#rope` y2 → 738 (0.3 s).
  - `#rope` → 0 at `cue + 0.6` (0.2 s). `#crane` → 0 at `B(b07).start` (0.3 s).
- **`ring-lock`** at `cue` [45.778]: each `#ring1Y-k` goes 0 → 1 (0.12 s), then → 0.25 (0.25 s), starting at `cue + 0.05·|k − 7|` (a ripple from the keystone out to both springings). All fade → 0 at `B(b07).start + 0.2` (0.3 s).
- Callout `keystone`: card (400,400) w 540. `target` KEY(320, 759) = **(540, 697.8)**. `at: w(b06,"keystone.")`. The keystone is already in place then, and the card bottom (≤ 610) stays above its top at y 652.
- Overlays: `✓ STEP 4 · KEYSTONE` (auto). Meter 60 (auto).

### b07 threat: strike the frame (46.614 → 54.207); light tense → day
- At `B(b07).start`: `lightTween(world, "day", "tense", at, 0.8)`. Camera KEY → CLOSE (planned 1.0 s).
- **`frame-strike`** at `cue` [47.938]: puppet `act("knock", cue, 1.0, 0.4)`, then `pose("stand")`. `#cen1` x 0 → 4 → 0 twice (0.1 s each) at `cue + 0.2` and `cue + 0.6`.
- **`ghost-early-collapse`** (`h = clamp(cue("arch-stands") − cue − 1.0, 1.0, 2.0)`; en 2.0):
  - At `cue` [49.401]: `#ring1`, `#ks1Drop` and `#cen1` → 0.15 (0.2 s). `#gCollapse` 0 → 1 (0.15 s). `#veilRed` 0 → 0.14.
  - At `cue + 0.2`: each `#gc-k` falls (0.7 s, `power2.in`). Let θ = its mid angle. It translates y + (60 + 160·sinθ) and x −40·cosθ, and rotates ±25·sinθ (sign: + for k < 7, − for k > 7) about its centre.
  - `splash` at (320, 1110) at `cue + 0.85`. Puppet `act("shiver", cue, 1.6, 0.3)`, then stand.
  - **Rewind** at `cue + h`: `#gCollapse` and `#veilRed` → 0, and `#ring1`, `#ks1Drop`, `#cen1` → 1 (0.35 s).
- Real strike at `w(b07,"After")` [52.036]: `#cen1` translate y 0 → 220 and opacity → 0 (0.8 s, `power2.in`).
- **`arch-stands`** at `cue` [53.395]:
  - `lightTween(world, "tense", "day", cue − 0.2, 0.8)`.
  - `ForceArrows({ id:"br-ld7a", tone:"yellow", mode:"along", path: halfPath(C1,"L"), count:4, len:46, width:10, at:cue, dur: B(b08).start + 1.5 − cue, period:0.8 })` and the same `br-ld7b` with `halfPath(C1,"R")`.
  - `#ring1Y-*` all 0 → 0.6 → 0 (0.5 s).
- Overlays: `⚠ NO SUPPORT` (auto, whole beat).
- Meter override: `[{ t: cue("ghost-early-collapse"), value: 45 }, { t: cue("arch-stands") }]` (→ 70).

`halfPath(C, side)` = points at RM from 90° to 180° ("L") or 90° to 0° ("R") in 10° steps, then a final point straight down to y 1050 at the same x (C.x ∓ 191). The load arrows therefore follow the ring and end inside the bank, abutment or pier. They **never cross the opening**.

### b08 step 5: abutments (54.591 → 66.607), WIDE
- At `B(b08).start`:
  - Camera CLOSE → WIDE (planned 1.2 s).
  - `#cof` and `#cofBack` → 0 (0.4 s). `#waterIn` sy → 1 and `#mudIn` sy → 1 (0.4 s). `#pile` → 0 (0.3 s).
  - Puppet: → 0 (0.2 s), `move(40, 718, +0.25, 0.01)`, then → 1 (0.3 s) at `+0.6`, stand. It is tiny on the bank for scale.
- **Arch 2** (same process, fast):
  - `#cen2` 0 → 1 (0.25 s) at `+0.3`.
  - Stones `#v2-k` in the order 0, 14, 1, 13, … , 6, 8, 7 (keystone `#ks2Drop` last, from `translate(0 -40)`), each 0.15 s, staggered 0.06, from `+0.5`. `#joints2` → 1 at `+1.5`.
  - `#cen2` translate y +220 and → 0 (0.6 s) at `+1.9`.
- **`thrust-arrows`** at `cue` [57.319], 4 × `ForceArrows({ tone:"yellow", mode:"along", count:1, len:64, width:12, period:1.0, at:cue, dur: B(b09).start − 0.1 − cue })`:
  - `br-t1` path [[160,905],[70,905]] (arch 1 pushes left into the bank)
  - `br-t2` [[480,905],[555,905]]
  - `br-t3` [[640,905],[565,905]] (t2 and t3 meet over the pier: neighbours push on each other)
  - `br-t4` [[960,905],[1050,905]]
- **`ghost-spread`** (`h = clamp(w(b08,"So") − cue − 0.2, 1.0, 1.8)`; en 1.8):
  - At `cue` [61.115]: `#v1d-0…6`, `#ks1Drop`, `#v2d-8…14` and `#ks2Drop` → 0.15 (0.2 s). `#gSpread` 0 → 1 (0.15 s). `#veilRed` 0 → 0.14.
  - Then, 0.7 s `power2.in`:
    - `#gsL` → `tf({x:-30, r:-6, px:108, py:960})`
    - `#gsR` → `tf({x:30, r:6, px:1012, py:960})`
    - `#gsK1` and `#gsK2` → `tf({y:70, r:5, px:<key centre>})`
  - Only the end arches spread; the halves over the pier stay.
  - **Rewind** at `cue + h`: the ghost and veil → 0, and the dimmed parts → 1 (0.35 s).
- **Abutments** from `w(b08,"each")` [63.472]: `#abL-c0…4` and `#abR-c0…4` together, bottom → top, each opacity 0 → 1 and translate y 20 → 0 (0.18 s, staggered 0.14).
- **`abutment-build`** at `cue` [65.55]: yellow outline copies of `#abutL` and `#abutR` (stroke 5) go 0 → 1 → 0.35 (0.5 s), hold to `B(b09).start`, then → 0 (0.3 s).
- Label `span` (`94 ft / 29 m`):
  - Anchor `{ x:320, y:1040, at: w(b08,"day"), until: cue("ghost-spread") − 0.05 }`.
  - `#spanDim` 0 → 1 → 0 with the same times (0.2 s fades).
- Callout `abutment`: card (400,400) w 540. `target` WIDE **(60, 880)**. `at: w(b08,"massive")`.
- Overlays: threat `⚠ SIDES SPREAD` from beat start. Step `✓ STEP 5 · ABUTMENTS` with **`stepAt: w(b08,"So")`**. The override is required, because the default `thrust-arrows` would end the threat before the ghost.
- Meter override: `[{ t: cue("abutment-build") }]` (→ 80).

### b09 step 6: fill to a flat road (67.117 → 73.48), WIDE
- **`fill-rise`** at `cue` [67.512]: `#fill0…3` sy 0 → 1 (0.45 s each, `power1.out`, staggered 0.4).
- At `w(b09,"flat")` [69.056]:
  - `#paving` 0 → 1 (0.3 s). `#parapet` 0 → 1 (0.3 s) at `+0.2`.
  - Puppet `move(40, 704, +0.1, 0.2)`. It now stands on the paving.
- **`squeeze-arrows`** at `cue` [72.063], all with `dur = B(b10).start − 0.1 − cue`:
  - `FlowArrows({ id:"br-sq1", kind:"load", dir:"down", x:150, y:600, w:340, h:110, count:3, at:cue, dur })` and `br-sq2` at x 630. The weight presses down onto the deck.
  - `ForceArrows` along `halfPath` for C1 L/R and C2 L/R (`br-ld9a…d`, yellow, count 3, len 40, width 9, period 0.8).
  - `#joints1` and `#joints2` `attr stroke-width` 5 → 1.5 (0.6 s) at `cue + 0.3`. The joint gaps visibly close.
- Overlays: `✓ STEP 6 · FLAT ROAD` (auto). Meter 90 (auto).

### b10 step 7: flood hole (74.083 → 81.699); light → overcast
- At `B(b10).start`:
  - `lightTween(world, "day", "overcast", at, 1.0)`. `#sunW` opacity → 0.3 (1.0 s).
  - Camera WIDE → FLOOD (planned 1.0 s).
  - Puppet → 0 (0.2 s).
- **`flood-push`** at `cue` [75.244]:
  - `#water` sy 1 → **2.444** about y 1200, so the front water top is at 980 (0.8 s, `power1.out`). `#waterBrown` 0 → 0.85.
  - `#floodBack` sy 0 → 1, so the upstream water top is at 820, seen through the arch openings (0.8 s).
  - Red push arrows: `ForceArrows({ id:"br-fp1", tone:"red", mode:"along", path:[[330,940],[480,940]], count:2, len:56, width:12, period:0.8, at:cue + 0.3, dur: cue("pier-hole") + 0.3 − (cue + 0.3) })` and `br-fp2` path [[790,940],[640,940]].
- **`ghost-shove`** (`h = clamp(cue("pier-hole") − cue − 0.15, 0.8, 1.4)`; en 1.4):
  - At `cue` [76.731]: `#bridgeShake` goes through 6 tweens of 0.14 s alternating `tf({x:8, r:0.6, px:560, py:1270})` / `tf({x:-8, r:-0.6, px:560, py:1270})`.
  - `#cracksR` (3 red zig-zags on the pier and spandrel, `--ui-red` 4 px) 0 → 1 at `cue + 0.3`. `#veilRed` 0 → 0.14.
  - **Rewind** at `cue + h`: `#bridgeShake` → `tf()` (0.3 s), and `#cracksR` and `#veilRed` → 0.
- **`pier-hole`** at `cue` [78.472]:
  - `#hole` opacity 1 and `tf` sx/sy 0 → 1 about (560,845) (0.35 s, `back.out(1.4)`). The `#holeRing` stones pop (staggered 0.03).
  - At `cue + 0.35`: `#holeWater` 0 → 1 (0.2 s).
  - At `cue + 0.3`: the red arrows end (their `dur`). `#floodBack` sy → 0.947, so the top is at 840 (0.6 s): pressure relief.
- **`flood-through`** at `cue` [79.726]:
  - `#spout` opacity 1, sy 0 → 1 about y 872 (0.35 s).
  - `FlowArrows({ kind:"water", x:0, y:0, w:1080, h:1920, width:8, at:cue, dur: B(b11).start − 0.1 − cue })` with these FLOOD-screen points:
    - `br-ft1`: hole spout [[560,858],[566,900],[570,955]]
    - `br-ft2`: opening 1 [[300,845],[310,900],[330,960]]
    - `br-ft3`: opening 2 [[820,845],[810,900],[790,960]]
- Callout `flood-hole`: card (400,400) w 540. `target` FLOOD(560, 845) = **(540, 832)**. `at: cue("pier-hole") + 0.4`.
- Overlays: threat `⚠ FLOOD` from beat start. Step `✓ STEP 7 · FLOOD HOLE` with **`stepAt: cue("pier-hole")`**.
- Meter override: `[{ t: cue("ghost-shove"), value: 75 }, { t: cue("pier-hole") + 0.3 }]` (→ 95).

### b11 climax (82.082 → 88.398); storm → clearing
- At `B(b11).start`:
  - `lightTween(world, "overcast", "tense", at, 0.8)`. Camera FLOOD → WIDE (planned 1.0 s).
  - `#stormClouds` 0 → 1 (0.8 s). `#sunW` → 0 (0.5 s). `#rain` 0 → 0.7 (0.4 s), and the drops run until `cue("heron-land") + 0.6` (§4.4).
- **`flood-roar`** at `cue` [84.195]:
  - `#water` sy → **2.611** (top 965) and `#floodBack` sy → 0.974 (top 830) (0.6 s).
  - The water surface wobbles: `#water` y −4 → 0, 0.3 s per half, yoyo, finite count to `B(b12).start`.
  - WIDE-screen `FlowArrows` water `br-fr1…3`, using the same world points as b10 (WIDE = world), with `at:cue, dur: B(b12).start − 0.1 − cue`.
- **`carts-cross`** at `cue` [85.31]:
  - `#convoy` `translate(-220 704)` → `translate(1000 704)` (`dur = cue("heron-land") − 0.2 − cue`, `power1.out`). The cart wheels spin 3 turns. The ox bodies bob y ±2 (finite).
  - Puppet: `move(-170, 704, cue − 0.1, 0.01)`, → 1 (0.2 s), `act("walk", cue, D, 0.4)`, `move(1050, 704, cue, D, "power1.out")` with the same D. Then stand.
  - `ForceArrows` yellow along `halfPath` C1 L/R and C2 L/R (`br-ld11a…d`, count 3, len 40, width 9, period 1.0) from `cue` to `B(b12).start − 0.1`. This is the steady load pulse into the supports.
- **`heron-land`** at `cue` [87.806]:
  - Heron: at `cue − 1.05` `move(1180, 380, …, 0.01)`, `face("left")`, opacity 1 (0.1 s). At `cue − 1.0`: `pose("fly")`, `flap(cue − 1.0, 1.0, 0.25)`, `move(320, 682, cue − 1.0, 1.0, "power2.out")`. At `cue`: `pose("stand", 0.2)`. It lands on the parapet right over keystone 1.
  - Clearing: `lightTween(world, "tense", "day", cue, min(1.0, next(b11) − cue − 0.05))`. `#rain` and `#stormClouds` → 0 (0.6 s). `#sunW` → 1 (0.6 s).
- Overlays: gauge `148 ft / 45 m` (auto). Step `✓ STILL STANDING` with **`stepAt: w(b11,"Not")`**. Meter 100 (auto).

### b12 recap (88.7 → 91.2, silent, holdSec 2.5)
- At `B(b12).start`:
  - Camera WIDE → RECAP (0.5 s).
  - `#water` sy → 1, `#waterBrown` → 0, `#floodBack` sy → 0, `#spout` → 0 (0.8 s). The flood recedes.
  - `#convoy` → 0 (0.4 s). Puppet → 0 (0.2 s), then `move(40, 704, +0.5, 0.01)`.
- Pulses at `tk = B(b12).start + 0.3 + 0.3·k`, k = 0…6. Each `#rc<k>` goes 0 → 1 (0.15 s), then → 0.35, and holds:
  - k0: pier base and rock contact, rect x 490–630, y 1200–1270
  - k1: dashed semicircle r 162 around C1 (where the centering stood), dash 12 8
  - k2: both ring outlines (intrados + extrados arcs, closed)
  - k3: both keystone outlines
  - k4: `#abutL` and `#abutR` outlines
  - k5: polygon F outline plus the paving top line
  - k6: circle (560, 845) r 46
- Extra `recap` = `RecapPills({ id:"ex-recap-p", items, x0:80, y0:400, colW:860, rowH:64, cols:1, at: B(b12).start + 0.3, step:0.3, dur })`. `items` = `ctx.script.beats.filter(b => b.type === "step").map(b => b.onScreen.stepPlate)` (7 strings: b03–b06, b08–b10). The pills end at y 844, above the parapet (862 in RECAP).
- No captions, plates or callouts (`onScreen` is empty). The meter persists. The heron stays on the parapet.

### b13 ending (91.502 → 94.836)
- At `B(b13).start`:
  - Camera RECAP → WIDE (0.8 s). `lightTween(world, "day", "sunset", at, 1.2)`. `#sunW` `translate(0 0)` → `translate(0 140)` over `D − at`.
  - The `#rc*` outlines → 0 (0.3 s). Puppet → 1 (0.3 s) on the left bank.
- Callback at `B(b13).start + 0.8`: `#ks1Y2` (keystone 1 outline) 0 → 1 → 0.5 (0.5 s), so the heron stands right over the lit keystone. Heron `pose("stand")` holds.
- Label `title`: anchor `{ x:540, y:520, at: B(b13).start + 0.3, maxWidth:900, max:64 }`.
- No plate, ghost or meter change.

### Anchors returned by `render()`
`cofferdam`, `centering`, `voussoir`, `keystone`, `abutment` and `flood-hole` are callouts; all have `card:{x:400,y:400}` and `width:540`, with `target`, `at` and `until` as listed. `span` and `title` are labels. All ids are unique, so one `anchors` object serves every beat.

`overlays` = `{ b03:{stepAt}, b07:{meter}, b08:{stepAt, meter}, b10:{stepAt, meter}, b11:{stepAt} }`.

`export const extras = [{ id:"recap", from:"b12", to:"b12", render }]`.

## 4. Assets

Reused from the kit: `sky`, `sun`, `clouds`, `mountains`, `pineTree`, `terrain` (clipped), `rocks`, `waterSurface` (edge logic), `puppet` (changed), `ghost`, `tf`, `poly`, `shade`, `tint`, `prng`, `stage`, `groundShadow`, `lightTween` (changed), `ForceArrows` (changed), `FlowArrows`, `RecapPills`.

### 4.1 Puppet (`kit/assets/puppet.mjs`): start from `videos/hypocaust/kit/assets/puppet.mjs`, then add
- **`mallet` key** (DEFAULT 0). Inside `armR`, after the branch: `${id}-mallet` (opacity 0):
  - handle (−3,66) (3,66) (3,112) (−3,112) `var(--wood)`
  - head (−15,104) (15,104) (15,126) (−15,126) `shade("wood",20)`, with the right half `shade("wood",32)`
  - Add `["mallet","mallet"]` to the `setPose` opacity loop.
- Poses:
  - `push: { armL:-80, armR:-80, torso:18, legL:-14, legR:10 }`
  - `knock: { armR:-130, torso:4, mallet:1 }`
- Actions:
  - `push: [{armL:-80, armR:-80, torso:18, legL:-14, legR:10}, {armL:-84, armR:-76, torso:20, legL:10, legR:-14}]`
  - `knock: [{armR:-130, torso:4, mallet:1}, {armR:-40, torso:12, mallet:1}]`
- Existing poses and actions used: `stand`, `lift`, `carry`, `dig`, `shiver`, `walk`.
- Instance: `puppet({ id:"br-p", x:40, y:718, s:0.35, jacket:"earth-1", tunic:"earth-1" })`. It is about 77 world px tall: about 123 px in CLOSE and 77 px in WIDE (a tiny human next to a 340-unit span gives the scale).
- Calls are strictly in time order (b02 push → b02 shiver → b03 dig → b04 lift → b05 carry → b07 knock/shiver → b08 bank → b09 paving → b11 walk → b13 bank).

### 4.2 Heron (new `kit/assets/heron.mjs`, export it from `kit/assets/index.mjs`)
`heron({ id, x, y, s = 1, flip = false })` → `{ svg, pose(name, at, dur), flap(at, dur, period = 0.25), move(x, y, at, dur, ease), face(dir, at), tl() }`. Calls are chronological and state is tracked, as in the hypocaust `cat`.

**Structure**
- Root `<g id transform="translate(x y)">` → `<g id="${id}-flip" transform="scale(±s s)">` → `groundShadow(0,0,50)`.
- Inside: `${id}-stand` (opacity 1) and `${id}-fly` (opacity 0).
- Feet are at (0,0) and it faces right. It is about 100 tall at s 1; the instance uses s 0.9.

**Colours**
- body `tint("stone",18)`, wing `shade("stone",12)`, flight feathers `shade("stone",35)`
- neck/head `tint("stone",40)`, crest `shade("earth-3",40)`, beak `tint("sand",10)`
- legs `shade("sand",25)`, eye `var(--earth-3)`

**Stand**
- Legs: lines (−4,0) → (−2,−44) and (4,0) → (2,−44), 3 px.
- Body: (−30,−44) (−22,−62) (8,−66) (20,−56) (12,−44) (−10,−40).
- Wing: (−28,−48) (−20,−62) (10,−62) (6,−50) (−34,−40). Tip: (−34,−40) (−44,−36) (−28,−46).
- Neck: (12,−60) (20,−64) (26,−80) (22,−92) (16,−92) (18,−80) (10,−66).
- Head: (16,−92) (22,−98) (30,−96) (30,−90) (20,−88). Crest line (18,−96) → (6,−100), 3 px. Eye (25,−94) r 1.8.
- Beak: (30,−96) (52,−92) (30,−90).

**Fly**
- Body: (−34,−30) (−10,−40) (24,−38) (30,−30) (−20,−22).
- Neck: tucked S, (24,−38) (34,−44) (40,−40) (30,−32).
- Head + beak: like Stand, moved to (34,−48).
- Legs trail straight back: (−34,−28) → (−64,−24).
- `${id}-wingF`, pivot (−4,−34): (−4,−34) (−40,−80) (−8,−74) (16,−36), with a dark tip.

**Poses and actions**
- `stand`; `fly` (crossfade the two groups, 0.15 s).
- `flap`: `-wingF` `attr transform` alternates `tf({r:-15, px:-4, py:-34})` / `tf({r:40, px:-4, py:-34})` every `period/2`, finite.
- `face(dir, at)`: an instant `scale(±s s)` on `-flip`.

Instance: `heron({ id:"br-h", x:880, y:1160, s:0.9, flip:true })`.

### 4.3 Vehicles (new `kit/assets/vehicles.mjs`, exported). Each takes `{ id, x, y, s }`, origin at the ground, faces right.
- **`car`**: rear-bottom at (0,0).
  - Body: (0,−6) (64,−6) (64,−17) (54,−19) (46,−27) (22,−27) (14,−19) (0,−17), `shade("water",10)`. Top facet `tint("water",8)`.
  - Windows: (24,−25) (44,−25) (50,−19) (18,−19), `var(--sky-2)`.
  - Wheels: octagons r 6 at (14,−6) and (50,−6), `shade("earth-3",30)`, in groups `${id}-w0/w1` for rotation.
  - No text, no logo.
- **`ox`**: feet at y 0, x −34…46.
  - 4 legs (7×22) at x −26, −14, 12, 22, `shade("earth-1",20)`.
  - Body: (−34,−22) (−30,−46) (20,−48) (30,−36) (28,−22), `var(--earth-1)`. Back facet `tint("earth-1",12)`.
  - Head: (26,−44) (44,−40) (46,−28) (34,−24) (26,−30), `shade("earth-1",8)`.
  - Horn: (32,−46) (38,−58) (40,−46), `tint("sand",20)`.
  - Tail line: (−34,−40) → (−40,−18).
  - The body group is `${id}-body` (for the bob).
- **`cart`**: wheel centre (0,−16).
  - Wheel `${id}-wheel`: octagon r 16 `var(--wood)`, hub r 5 `shade("wood",25)`, 4 spokes `shade("wood",20)` 3 px.
  - Box: (−40,−22) (40,−22) (44,−46) (−44,−46), `shade("wood",6)`, with 2 plank lines.
  - Load: 3 stone blocks `var(--stone)` / `shade("stone",14)` over x −30…30, y −58…−46.
  - Shaft: (40,−28) → (78,−30), `var(--wood)` 4 px.
- **Convoy** `#convoy` (in `src/bridge.mjs`), local x relative to the lead: ox1 at 0, cart1 at −90, ox2 at −200, cart2 at −290; s 1. The puppet walks separately at lead + 50.

### 4.4 Effects (`src/fx.mjs`)
- **`tracker(L)`**: copy from `videos/hypocaust/src/scenes.mjs` (`emit`, `op`, `tf`, `flash`, with `immediateRender:false`).
- **`splash({ id, x, y, at, s = 1 })`** → `{ svg, tl }`:
  - 6 drop diamonds (r 5–8, `tint("water",30)`) fly up and out (−60…−110 px, ±60 px) and fall back (0.6 s).
  - An ellipse ring rx 10 → 60, ry 3 → 10 (`tint("water",35)` stroke 3) fades over 0.5 s.
  - All finite.
- **`rain({ id, n:36, seed:21, at, dur })`** (screen space):
  - Lines 3 px, 34 long, slanted 12°, `tint("water",40)`.
  - Seeded x in 0–1200 and start y in −200…1920. Each falls 900 px in 0.9 s, linear.
  - Repeats = `floor(dur/0.9)`, finite, as separate `fromTo` calls.
- **`halfPath(C, side)`**, **`toScreen(cam, x, y)`**, **`archRing(...)`**, **`bedrock()`** and the camera presets `CAM`: all in `src/bridge.mjs`.

### 4.5 Cork inset `#cork` (screen space, centre (760,500), r 120; no text)
- Disc r 120 `var(--panel-bg)`, stroke `--ui-white` 4. The content is clipped to r 116.
- Bottle neck glass: left wall poly (−70,−90) (−52,−90) (−40,100) (−58,100); the right wall is its mirror. `tint("water",45)` at .85. Shoulder lines `tint("water",20)` 3 px.
- Cork `#cork-c`:
  - Body: trapezoid (−50,−60) (50,−60) (38,40) (−38,40), `tint("wood",25)`. Right facet `shade("wood",5)`.
  - Top ellipse: rx 50, ry 8 at y −60, `tint("wood",35)`.
- `#cork-a`:
  - Yellow down arrow (`--ui-yellow`) from (0,−112) to (0,−72), shaft 10 px, head 26 px.
  - Two small yellow arrows from the cork sides pointing outward into the walls at y −10.
  - Opacity 0.
- Animation:
  - `#cork-c` translate y −14 → 0 at `cue + 0.25` (0.3 s, `power2.in`): it jams.
  - `#cork-a` 0 → 1 at `cue + 0.55` (0.2 s).

## 5. Components

| Component | Where | Props / use |
| --- | --- | --- |
| StepBadge / ThreatBadge | build.mjs (auto) | `stepAt` overrides b03, b08, b10, b11 |
| Callout | build.mjs (auto) | slot (400,400), `width:540`; `at` per beat; b05 `until` |
| Label | build.mjs (auto) | `span` (320,1040) `at`/`until`; `title` (540,520) `maxWidth 900`, `max 64` |
| Gauge | build.mjs (auto) | b01, b11 at (48,400) |
| StakesMeter | build.mjs (auto) | STABILITY at (48,300); overrides b07, b08, b10 |
| ForceArrows | scene (`svg` in `#br-cam`) | red tension b02, red flood push b10, yellow loads b07/b09/b11, yellow thrust b08 |
| FlowArrows | scene html (screen space) | water: b03 pump, b10 and b11 spills; load: b09 squeeze |
| RecapPills | extra `recap` (b12) | §3 b12 |
| KaraokeCaption, Cover | build.mjs | as is |

**Kit changes in this video's `kit/` (the builder lists them in `KIT_CHANGES.md`)**
1. Copy from `videos/hypocaust/kit/components/`: `Callout.mjs` (title 44→36, subtitle 40→38, `width`, `Label` with `maxWidth`/`max`), `StakesMeter.mjs`, `RecapPills.mjs`, `Pill.mjs`, `Gauge.mjs` (all minimums 36), and `index.mjs` (exports `RecapPills`).
2. Copy `videos/hypocaust/kit/lighting.mjs` (`lightTween` with `immediateRender:false`; **required**, there are six light tweens on one world). Then add the preset:
   `overcast: { ...graded({ dark: 0.1, to: tok("stone"), amt: 0.22 }), sky: mixHex(tok("bg-sky-day"), tok("stone"), 0.55), "sky-2": mixHex(tok("sky-2"), tok("stone"), 0.45) }`. Import `mixHex` from `./color.mjs`. No hex literals.
3. `ForceArrows.mjs`: add `red: "var(--ui-red)"` to `COLORS` and to the error message.
4. Puppet changes (§4.1). New `heron.mjs` (§4.2) and `vehicles.mjs` (§4.3). Export `heron`, `car`, `ox`, `cart` from `kit/assets/index.mjs`.
5. `build.mjs` copied from hypocaust (§2.1).

Candidates for `/promote`: `heron`, `vehicles`, `overcast`, ForceArrows `red`, puppet `mallet/push/knock`, `archRing`.

## 6. Timing rules
- Cue words resolve in `build.mjs` (normalised, first occurrence). `Too early,` is a phrase cue. `ctx.word` lookups used: b01 loose, mortar.; b02 belly; b03 First,, mud, pump, rock.; b04 loose; b05 wider, wedge; b06 keystone.; b07 After; b08 day, So, each, massive; b09 flat; b11 Not. In other languages the builder only needs the same words present. If a translation lacks one, use `ctx.cue` of the nearest cue plus an offset (never a literal second).
- Minimums:
  - Entrances 0.15–0.4 s, exits 0.2–0.35 s.
  - Ghosts hold 0.8–2.0 s via the `clamp` formulas in §3 (each holds ≥ 0.8 s and is rewound before or at its fix).
  - Callouts and labels are visible ≥ 1.2 s (build clamp).
- **Short-beat rule** (any language, any re-voice):
  - Camera and light moves: `dur = min(planned, max(0.5, next(b) − at − 0.05))`.
  - Any action tween on an element with a later action in the same beat: `dur = min(planned, max(0.2, nextCue − at − 0.05))`.
  - Laying stagger as in b05. ForceArrows/FlowArrows `dur ≥ 0.6`; skip the instance if the available time is under 0.6 s.
- Every tween after a target's first uses `immediateRender:false`; initial states are set in markup. Calls per puppet, heron and camera are in time order.
- FlowArrows are screen space. They must start after and end before any camera move (b03 pump in CLOSE; b10 ends at `B(b11).start − 0.1`; b11 runs `flood-roar` → `B(b12).start − 0.1`; b09 is WIDE).
- No `Math.random` / `Date.now`: use `prng(seed)` for pebbles, rubble, rain, facets and splashes.
- Cover frame: `--at 87.95` (WIDE, flood and spout, carts on the deck, heron just landed over the keystone, light clearing). In other languages use `cue("heron-land") + 0.15`.

## 7. i18n fit (all text min 36 px)

| Box | Width for text | Size range | Lines | Longest now (en) | Rule for new strings |
| --- | --- | --- | --- | --- | --- |
| Plates | 852 px | 46 → 36 | 1 | `✓ STEP 3 · WEDGE STONES` ≈ 700 px at 46 | ≤ 30 Cyrillic / 32 Latin chars |
| Callout title | 476 px (card 540) | 44 → 36 | 1 | `FLOOD HOLE`, `COFFERDAM` | ≤ 16 Cyrillic / 18 Latin uppercase |
| Callout subtitle | 476 px | 40 → 38 | ≤ 2 | `oak stakes + rammed clay, water pumped out` (2 lines at 40) | ≤ 40 Cyrillic / 46 Latin chars |
| Label `span` | 640 px | 36 | 1 | `94 ft / 29 m` | ≤ 24 chars |
| Label `title` | 900 px | 64 → 36 | 1 | `ALCÁNTARA · AD 106` ≈ 775 px at 64 | ≤ 26 chars |
| Gauge | 420 px | 40 → 36 | 1 | `148 ft / 45 m` | ≤ 13 chars |
| Meter | 348 px | 36 | 1 | `STABILITY` | ≤ 12 chars |
| Recap pills | 820 px | 40 → 36 | 1 | as the plates | as the plates |
| Captions | 972 px | 96 → 56 | 1 | kit auto-fit | kit |

- The callout card height is ≤ 210 px (bottom ≤ 610). Every scene target was chosen so the card never covers the element it points to (crown ≥ y 620 in CLOSE, keystone top y 652 in KEY, parapet y 620 in FLOOD).
- If `build.mjs` warns about an overflow, **shorten the script string** (send it back through the orchestrator). Never go below 36.

## 8. Audio
- **Voice**: `audio/voice.en.mp3` → two-pass linear `loudnorm` I = −15, TP = −1.5, LRA = 11 → `assets/voice.wav` (hypocaust `build.mjs`). Volume 1, from 0 to `durationSec`. WAV keeps word timings exact.
- **Music**: `audio/music.loop.en.mp3` (about −50 LUFS: source −27 LUFS × `music.volume` 0.12 × ducking, all from `tools/music-loop.mjs`). `build.mjs` measures it with `ebur128` and lifts it linearly to **−24 LUFS** (`volume=<gain>dB,alimiter=limit=0.7:level=disabled`, gain ≤ 40 dB). The ducking shape stays. The result is `assets/music.wav` at `data-volume 1`.
- **Target final mix**: −14 ±1 LUFS integrated, true peak ≤ −1 dBTP, music clearly audible between phrases and well under the voice.
  - Reviewer measurement (ffmpeg, not a HyperFrames command): `ffmpeg -hide_banner -nostats -i out/draft/roman-arch.en.mp4 -af ebur128=peak=true -f null -`.
  - Below −15: raise the voice `I` by the difference (max −11). Music inaudible: raise its target to −22 (never above −20).
- Do not edit `config.json` or `tools/`. No sound effects.

## 9. Commands (run inside `videos/roman-arch/`, copied from `TEMPLATE.md`)

| Job | Command |
| --- | --- |
| Build a language | `node build.mjs <lang>` → `build/<lang>/` |
| Silent build (no voice file yet) | `node build.mjs <lang> --no-voice` |
| Check | `npx hyperframes check build/<lang> --json` |
| Look at frames | `npx hyperframes snapshot build/<lang> --at 3,10.5 --no-end -o review/frames` |
| Live preview | `npx hyperframes preview build/<lang> --background` (stop: `npx hyperframes preview build/<lang> --stop`) |
| Draft render | `npx hyperframes render build/en -o out/draft/<slug>.en.mp4 --quality draft` |
| Final render | `npx hyperframes render build/<lang> -o out/<slug>.<lang>.mp4 --quality delivery --crf 12`, then `node tools/finish.mjs out/<slug>.<lang>.mp4` (see Look, tokens and finishing) |
| Partial render | add `--start 0 --end 15` |
| Cover | `node build.mjs <lang> --cover [--at <sec>]` → `out/cover.<lang>.png` (builds `build/<lang>-cover/` and snapshots it; default frame = 0.5 s into the last beat), then `node tools/finish.mjs out/cover.<lang>.png` |

- Slug `roman-arch`, lang `en`. `tools/finish.mjs` lives at the repo root (run it from the repo root with the video path, as in hypocaust).
- Concrete: `node build.mjs en`, `npx hyperframes render build/en -o out/draft/roman-arch.en.mp4 --quality draft`, `node build.mjs en --cover --at 87.95`.

## 10. Builder checklist
1. Copy `build.mjs` and the kit components and `lighting.mjs` from hypocaust (§2.1, §5 items 1–2). Add the `overcast` preset, ForceArrows `red`, the puppet additions, `heron.mjs`, `vehicles.mjs` and the exports. Start `KIT_CHANGES.md`.
2. `src/fx.mjs`: `tracker`, `splash`, `rain`.
3. `src/bridge.mjs`: constants, `CAM` + `toScreen` + `camTf`, `archRing`, `halfPath`, `bedrock`, banks (clipped terrain), water segments, cofferdam, pier, centering, abutments, fill polygon F, paving, parapet, hole, spout, crane, slab, ghosts, recap outlines, preview copy, convoy. Use the layer order of §3.0.
4. `src/scenes.mjs`:
   - One scene `{ id:"br", beats:[b01…b13], light:"day" }`.
   - The actions of §3 in time order per element.
   - Return `anchors` and `overlays` (§3, end).
   - `export const extras` (recap).
5. `node build.mjs en`: 0 errors, no "no anchor" or overflow warnings. Then `npx hyperframes check build/en --json` and fix every error.
6. Snapshot en at: 0.3, 1.0, 2.9, 4.6, 8.0, 9.8, 12.2, 14.9, 17.0, 19.4, 21.6, 23.3, 24.7, 25.5, 26.1, 27.7, 29.9, 33.8, 36.1, 37.9, 39.3, 40.6, 42.4, 43.4, 44.6, 46.1, 47.2, 48.4, 50.3, 52.7, 53.9, 55.6, 58.0, 59.6, 62.0, 64.3, 65.8, 68.4, 69.8, 72.9, 75.0, 76.3, 77.4, 79.1, 80.6, 82.9, 84.7, 86.2, 87.9, 89.6, 90.9, 92.3, 94.5. Read every frame.
7. Draft render `out/draft/roman-arch.en.mp4` and measure loudness (§8). Cover: `node build.mjs en --cover --at 87.95`.

## 11. Reviewer focus
1. **Hook (0–3 s)**: the finished two-arch bridge fills the frame from the first frame. At "loose" its stones visibly separate with yellow outlines, and at "mortar" they snap back while the joints flash red. The car crosses at "Cars". Gauge `1,900 YEARS` is readable.
2. **Arch geometry**: true semicircles; every joint (and the dashed radial lines in b05) points to the circle centre; stones are wider at the top; the keystone is the last stone and slightly taller. The rings rest on the bank ledges and the pier top.
3. **Load arrows**: yellow arrows in b07, b09 and b11 run along the ring and end inside the pier, bank or abutment, **never through the empty opening**. In b08 the two thrust arrows over the pier meet; the end arrows push into the abutments.
4. **Cross-section always visible**: water, mud, rock and three bedrock strata with rocks are visible under the bridge in every beat after b03 and in every camera preset. No flat band over 200 px. The sky has mountains, hills and clouds (and a storm in b11).
5. **Ghosts**: each one (slab crack b02, pier sink b03, stones fall b04, squares slip b05, early collapse b07, sides spread b08, shove b10) is red-veiled, lasts ≈ 1–2 s, and fully rewinds before its fix. In b07 the ghost ring has **no keystone**; in b08 only the end arches spread.
6. **Plate timing**: b03 `⚠ PIER SINKS` lasts until "ring"; b08 `⚠ SIDES SPREAD` until "So"; b10 `⚠ FLOOD` until "hole"; b11 `✓ STILL STANDING` appears at "Not".
7. **Text**: no overlay text under 36 px; callout subtitles 38–40 px. The callout card (400,400) never covers the keystone, crown, parapet or meter. Nothing readable in the caption band or right of x 940. The b05 cork inset stays ≥ 1.2 s and does not collide with a callout.
8. **Lighting**: day → tense (b07) → day → overcast (b10) → tense storm (b11) → day at the heron landing → sunset (b13). There is no preset flash at t = 0 (`lightTween immediateRender:false`), and the `overcast` preset exists.
9. **Audio**: integrated mix −14 ±1 LUFS. The music bed is audible under the voice (it was not left at −50 LUFS). Captions stay in sync with the normalised `voice.wav`.
10. **Observer and scale**: the heron wades in b01, flees at the crack in b02, lands on the parapet over keystone 1 at "moves." in b11, and stays there through the sunset with the keystone lit. The tiny puppet appears on the bank in the b08 pull-back and with the carts in b11.

## Builder notes
- Added a faceted far-valley slope (`farSlopeSvg`, 3 layers) behind the arches so no flat sky band over 200 px shows under the mountains; plan was silent.
- Hook stone outlines use the class `.br-pvY` (one tween) instead of an id `#pvY`, because each outline moves with its stone.
- Recap pill step 0.25 s instead of 0.3 s so the last pill is readable longer.
- FlowArrows b10/b11 use the plan's literal point lists (already screen coordinates in FLOOD, close to world in WIDE).
- `hyperframes check`: 0 errors; warnings are the expected structural ones plus one AA contrast note.
