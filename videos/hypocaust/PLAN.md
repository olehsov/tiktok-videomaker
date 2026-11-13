# PLAN: Hypocaust — Fire Under the Floor (`hypocaust`)

## 1. Summary
- Concept: one side cut-away of a small Roman bath-house that gains its parts one by one: furnace outside the wall, tile stacks (pilae) that raise the floor, a thick floor, box-tile flues up the walls, three rooms (hot, warm, cold), a stoker with a woodpile, and sealed joints. Each part comes after a red failure ghost. The climax is a January frost outside a warm hot room, and the video ends with the cat asleep on the warm floor.
- Duration: en **92.693 s** (voice 91.193 s), uk **106.747 s** (voice 105.247 s), from `timings.<lang>.json → videoDurationSec`, source `elevenlabs`. Both are inside 60–120 s. The en duration is **below the brief's 115 s ±15 % window (97.75–132.25 s)**. This plan does not change the voice; see §11.
- Languages: `en`, `uk`. Every rule below also works for `ru` without code changes.

**Global conventions (binding)**
- Every time is an expression of `ctx.cue(action)`, `ctx.word(beat, text, n)`, `B(id).start/.end` (= `ctx.beat(id)`), `ctx.t0`, `ctx.t1`. Literal numbers are only durations and offsets. The en seconds given below are only for orientation.
- Notation: `cue(x)` = `ctx.cue("x")`; `B(b)` = `ctx.beat(b)`; `next(b)` = the start of the beat after `b`.
- All scene art lives in **world units** inside one camera group `#bath-cam` (`attr transform` = `tf({x, y, sx:s, sy:s})`). Screen = `s·world + (x, y)`. Overlays (plates, callouts, labels, meter, gauge, captions) are screen-space. Every anchor the scene returns must be converted with the camera preset that is active at that moment (helper `toScreen(cam, wx, wy)` in `src/bath.mjs`).
- Colour meaning:
  - Heat streams, flames and room heat glows use `--ui-heat`.
  - Cold uses `--ui-blue`.
  - Fix highlights and recap outlines use `--ui-yellow`.
  - Ghosts use the kit `ghost()` filter plus the red veil `#veilRed` (`--ui-red`).
  - Carbon monoxide is a low-opacity grey-violet haze with a dashed outline, never a UI colour (§4.6).
  - No other bright colour appears in the scene.
- Text sizes: **no overlay text below 36 px** in any language (plates, callout titles and subtitles, labels, gauge, meter, recap pills). Captions keep 56–96 px. See §5 for the kit changes that enforce this.
- Screen zones (1080×1920):
  - Plates: centre y 230 (182–278).
  - Meter: **(48, 300)**, 380×84, so it ends at y 384. This is moved from y 470 (§2.1).
  - Gauge: **(48, 400)**, b10 only. It ends at about y 504.
  - Callout slot: card top-left **(400, 400)**, width **540**, height ≤ 195, so the bottom is ≤ 595. It is the same slot in every beat.
  - Captions: y 1230–1460.
  - Nothing readable below y 1520 or right of x 940.
  - **Full-height use**: sky and roof fill y 150–600. The building and the under-floor cavity fill y 600–1215. The ground cross-section (strata, foundations, rocks, snow) fills y 1215–1920 under the captions. No flat single-colour band may be taller than 200 px anywhere in the frame.

## 2. Composition

`node build.mjs <lang>` reads `script.<lang>.json`, `timings.<lang>.json`, `src/scenes.mjs` (with `src/bath.mjs`, `src/fx.mjs`) and `kit/`. It writes `build/<lang>/index.html` with one paused GSAP timeline `window.__timelines["main"]`, plus `assets/voice.wav` and `assets/music.mp3`.

| Layer | What | `data-track-index` | z |
| --- | --- | --- | --- |
| audio voice | `<audio id="voice">` `assets/voice.wav` (loudness-normalised copy of `audio/voice.<lang>.mp3`, §8), volume 1 | 0 | — |
| audio music | `<audio id="music">` `assets/music.mp3` from `audio/music.loop.<lang>.mp3` (exists for en and uk), **volume 1** (the loop already carries `music.volume` and ducking, §8) | -1 | — |
| scene | ONE full-frame scene clip `bath`, covering b01–b12. Inside it, in order: screen-space sky/stars/moon, then `#bath-cam` (all world art, characters, effects), then screen-space pizza icon and veils | 1 | 1 |
| extras | `recap` (RecapPills) b11 → b11 | 2 | 4 |
| overlays | plates, callouts, labels, gauge, meter (built by `build.mjs` from `onScreen`) | 3 | 5 |
| captions | KaraokeCaption (`build.mjs`) | 9 | 10 |

There is only one scene, because the frame accumulates continuously. The scene starts with `light: "day"`, and every later lighting change is a `lightTween` on `ctx.world`.

### 2.1 `build.mjs` changes (builder implements; list them in `KIT_CHANGES.md`)
1. **Port from `videos/pin-tumbler-lock/build.mjs`**: `makeCtx`, `overlaysByBeat` (`stepAt`, `meter` frames, sorted by `t`), the extras loop (`export const extras`), anchor `.at` for callouts and labels, the step-only `stepAt`, and `extrasHtml` in `body`.
2. **New: anchor `.until`.** It is optional, in absolute seconds, for callouts and labels.
   - `end = Math.min(a.until ?? hide, hide)`.
   - If `end − at < 1.2`, use `end = Math.min(hide, at + 1.2)`.
   - `dur = r3(end − at)`.
   - It is used for the sequential b07 callouts.
3. **New: pass-through props.** Pass `width: a?.width` to `Callout` and `maxWidth: a?.maxWidth` to `Label`.
4. **New: positions.** `const METER = { x: 48, y: 300 }` and `const GAUGE = { x: 48, y: 400 }` replace the literals `48, 470` (meter) and `48, 330` (gauge).
5. **New: voice loudness.** It replaces the `copyFileSync` of the voice and uses two-pass linear `loudnorm` through `spawnSync("ffmpeg", …)`:
   - Pass 1: `ffmpeg -hide_banner -nostats -i <src> -af loudnorm=I=-13:TP=-1.5:LRA=11:print_format=json -f null -`. Parse the last `{…}` JSON block from stderr.
   - Pass 2: `ffmpeg -y -hide_banner -nostats -i <src> -af loudnorm=I=-13:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true -ar 44100 -c:a pcm_s16le <OUT>/assets/voice.wav`.
   - The `<audio>` src becomes `assets/voice.wav`; `data-duration` is unchanged.
   - Any ffmpeg failure → `die("voice loudness normalisation failed: …")`.
   - WAV avoids MP3 encoder delay, so word timings stay exact.
6. **New: music volume.** Set `data-volume="1"` for `#music`. `tools/music-loop.mjs` already multiplies by `config.music.volume` (0.12) and ducks under the voice. The template applied it a second time, which is the cause of the −25 LUFS mix in pin-tumbler-lock.

## 3. Scenes by beat

### 3.0 World geometry (`src/bath.mjs`, world units)
- **Ground**: outside ground line `GY = 1150`.
  - `terrain({ id:"bath-ter", x:-700, y:1150, w:2600, h:1250, layers:[110, 360], top:"grass", seed:7 })`.
  - Stone footings `shade("stone",12)` (two-tone, right half `shade("stone",22)`) under the left wall (x 296–340), partition B (936–974), right wall (1216–1260) and furnace (136–304), all y 1150–1240.
  - `rocks` at (−220, 1420, s 0.7), (560, 1560, s 0.6), (1080, 1380, s 0.8), (1500, 1500, s 0.6).
  - Hills: `mountains({ y:1150, w:2600, count:6, height:300, snow:false, token:"green-mid" })` inside `<g transform="translate(-700 0)">`. `#hillsSnow` is the same call with `snow:true`, opacity 0.
- **Furnace** (praefurnium) x 140–300.
  - 4 courses `#furn-c0..c3` (bottom → top: y 1110–1150, 1070–1110, 1030–1070, 990–1030), each `var(--stone)` with the right 40 % `shade("stone",16)`.
  - Mortar lines `shade("stone",28)` 3 px. Top slab `#furn-slab` y 978–990, x 132–308, `tint("stone",12)`.
  - Tunnel `#furn-tunnel` (cut-away): poly (140,1150) (140,1092) (158,1076) (190,1068) (300,1068) (300,1150), `shade("earth-3",38)`.
  - Tunnel glow ellipse (220, 1120) rx 70 ry 26, `var(--ui-heat)`, opacity 0.
  - Stokehole voussoirs: 5 trapezoids around (140–176, 1068–1100), alternating `tint("earth-1",4)` / `shade("earth-1",14)`.
  - Fire: `fire({ id:"bath-ff", x:218, y:1150, s:0.75 })` inside `#furnFireW` (`attr transform tf({px:218, py:1150, sx, sy})`, starts at sx = sy = 0).
- **Left outer wall** x 300–336, y 660–1150.
  - Cut face `tint("sand",6)`, right 30 % `shade("sand",10)`.
  - `#wallMouth`: arch x 300–336, y 1068–1150, `shade("earth-3",38)`, opacity 0.
  - `#flueL`: box tiles in the wall, x 306–330, y 670–1060 (§4.3).
- **Interior**:
  - Back wall `#backWall` x 336–1220, y 660–1150, `tint("sand",24)`. Dado y 960–1150 `tint("earth-1",30)`.
  - Three arched windows (x 430–500, 770–830, 1070–1130; y 720–800) filled with `var(--sky-2)` and framed `shade("wood",10)` 4 px.
  - Ceiling beam band y 650–660 `shade("wood",12)`.
- **Rooms**:
  - Caldarium interior x 336–650.
  - Partition A x 650–680, y 660–1150, cut face as the left wall. It holds `#flueA` x 656–674.
  - Tepidarium interior x 680–940.
  - Partition B x 940–970, y 660–1150.
  - Frigidarium x 970–1220.
  - Right wall x 1220–1256.
- **Cavity** (heated, x 336–940):
  - `#cavityBack` rect y 1066–1150 `shade("earth-3",30)`, opacity 0. Bedding y 1150–1162 `shade("stone",18)`.
  - **Pilae** `#pila0..11`: centres x = 360 + 48k, width 28, from y 1150 up to 1066. Each is 7 tiles of 12 px, alternating `tint("earth-1",8)` / `shade("earth-1",6)`, with a right facet 8 px `shade("earth-1",20)`.
  - All pilae sit in `#pilae` (`attr transform tf({px:0, py:1150, sy})`, starts at sy = 0).
- **Heated floor** `#floorRise` (`attr transform translate(0 84)` at start, translate(0 0) after the rise):
  - `#flBig`: big tiles y 1056–1066, x 336–940. Seams every 48 px at the pila centres. Faces `tint("earth-1",14)` / `shade("earth-1",4)`.
  - `#flConc`: concrete y 1036–1056, `shade("stone",8)` with 14 seeded aggregate dots `shade("stone",24)`. It starts with `attr transform tf({px:0, py:1056, sy:0})`.
  - `#flTop`: top tiles y 1028–1036, `tint("stone",22)`, seams every 40 px `shade("stone",6)`. It starts at `tf({py:1036, sy:0})`.
  - Floor overlays (§4.5), and the ride group `#ride` (`attr transform translate(0 0)`) that holds the bather puppet and the cat. Local floor in `#ride` is y 1056.
- **Frigidarium floor** x 970–1220: stone y 1028–1066 `tint("stone",14)`, solid fill y 1066–1150 `var(--earth-2)` (no pilae). Pool: `pool({ id:"bath-pool", x:1040, y:1028, w:140, depth:62 })` in `#pool`, opacity 0.
- **Roof**:
  - Section triangle: eaves (280,660) and (1276,660), ridge (778,560). Left half `shade("earth-1",4)`, right half `shade("earth-1",16)`. Top tile edge strip 12 px `tint("earth-1",10)`.
  - Vents `#ventL` x 306–330 from the roof (y ≈ 652) up to 618, and `#ventA` x 656–674 from y ≈ 582 up to 552. Both are `shade("stone",6)` with a cap 4 px wider. Each starts at `tf({py:<roof y>, sy:0})`.
  - Snow cap `#roofSnow`: a 12 px band along both roof slopes, `var(--snow)` with the right half `shade("snow",10)`, plus 3 icicles at x 300, 520, 1240 (triangles 10×26 `tint("snow",10)`). Opacity 0.
- **Woodpile** `#wp` (§4.4) at x −60…96, on GY. Only row 0 is visible at the start.
- **Snow**:
  - `#groundSnow`: strips x −700…300 and 1256…1900, y 1140–1152, `var(--snow)`, starting at `tf({py:1152, sy:0})`.
  - `#snowfall`: 40 seeded flakes, diamonds r 4–7 `var(--snow)`, opacity 0. Their area is x −100…1400, y 100…640 plus x −100…290, y 640…1140 (the outside only, never inside the rooms).

**Camera presets** (`tf({ x, y, sx:s, sy:s })` on `#bath-cam`; `toScreen` = s·w + (x, y)):

| Preset | s | x | y | Used |
| --- | --- | --- | --- | --- |
| HOOK | 1.55 | −139.5 | −700 | t0 → pilae-rise |
| CLOSE | 1.55 | −139.5 | −567.5 | pilae-rise → b06 end |
| WIDE | 0.9 | −89 | 180 | b07, b12 |
| STOKE | 1.3 | 124 | −280 | b08 |
| PUSH | 1.9 | −352 | −1016 | b09 |
| CLIMAX | 1.2 | 0 | −165 | b10 |
| RECAP | 0.78 | 66.8 | 583 | b11 |

The cavity bottom (world 1150) lands at screen y 1215 in CLOSE, WIDE, STOKE and CLIMAX, and at 1082 in HOOK (the floor is still on the ground there). That is always above the caption band. Camera moves are `fromTo` on `#bath-cam` `attr transform`, `immediateRender:false`.

**Screen-space layers in the scene stage**
- Before `#bath-cam`:
  - `sky({ id:"bath-sky", horizonY:1300 })`.
  - `stars({ id:"bath-stars", n:40, w:1080, h:700 })`, opacity 0.
  - Moon `sun({ id:"bath-moon", kind:"moon", cx:870, cy:470, r:48 })`, opacity 0.
- After `#bath-cam`:
  - `#pizza`: circle (870, 660) r 50 `var(--panel-bg)` with the icon from §4.7, opacity 0.
  - `#veilGrey`: full-frame rect `var(--stone)`, opacity 0.
  - `#veilRed`: full-frame rect `var(--ui-red)`, opacity 0.

**State at t0**
- Visible: sky, hills, terrain, footings, the walls (left, partitions A/B, right), back wall, windows, roof (without vents), and the frigidarium floor.
- `#floorRise` sits at +84: only `#flBig` is visible, so the floor top is at 1140, on the ground.
- The bather is in `#ride` at (360, 1056) local, facing right, pose `stand`, puppet s 0.95. The cat is in `#ride` at (600, 1056) local, facing left.
- Hidden: furnace (courses, slab and tunnel opacity 0), pilae (sy 0), cavityBack, wallMouth, flues, vents, woodpile rows 1–5, stoker, pool and snow.
- Camera HOOK.

### b01 hook (en 0 → 5.341)
- **`furnace-glow-reveal`** at `cue`:
  - `#teaser` (in the ground under the floor, at (470, 1185)) appears. It is a pocket ellipse rx 90 ry 30 `shade("earth-3",40)` with `fire({ id:"bath-tf", x:470, y:1210, s:0.4 })` inside and a glow ellipse rx 110 ry 40 `var(--ui-heat)` at 0.35.
  - The pocket scales from 0.2 to 1 about its centre and its opacity goes 0 → 1 (0.4 s, `power2.out`). The teaser fire `tl(cue, B(b02).start − cue)`.
  - `#floorWarmB01` (rect over `#flBig`, `var(--ui-heat)`) opacity 0 → 0.25 (0.5 s) at `cue + 0.3`.
- **`puppet-walk-floor`** at `cue`: bather `act("walk", cue, 1.2, 0.5)`, `move(470, 1056, cue, 1.2, "none")`, then `pose("stand", cue + 1.2, 0.25)`.
- Cat: `act("shiver", t0, B(b02).start − t0, 0.2)` (§4.2).
- At `B(b02).start − 0.1`: `#teaser` and `#floorWarmB01` fade to 0 (0.3 s).
- Overlays: meter WARMTH 10 (auto). No plate, callout, ghost or camera move.

### b02 attempt (5.666 → 11.947), whole beat is the ghost
- **`ghost-room-fire`** at `cue`:
  - `ghost("bath-g2", …)` holds the room fire `fire({ id:"bath-g2f", x:560, y:1140, s:0.7 })` plus the soot and smoke below. Its opacity goes 0 → 1 (0.3 s) and the fire runs `tl(cue, R2 − cue)`.
  - `#veilGrey` 0 → 0.3 and `#veilRed` 0 → 0.14 (0.4 s).
- **`smoke-fill-cat-flees`** at `cue`:
  - Six smoke puffs `#g2-s0..5` (7-point polygons r 60–90, `tint("stone",10)` opacity 0.85, seeded centres in x 350–640, y 700–900) scale 0 → 1, staggered 0.18 s, then drift y +40 until `R2`.
  - Three soot streaks on the back wall at x 470, 540, 600 (polys 18 wide, y 670 → 780, `shade("earth-3",20)` opacity 0.7) scale from the top, sy 0 → 1 (0.6 s), staggered 0.15 s.
  - Bather `act("cough", cue, 1.5, 0.5)`.
  - Cat: `face("right", cue)`, `act("run", cue, 0.7, 0.25)`, `move(900, 1056, cue, 0.7, "power1.in")` (it leaves the frame).
- **`cold-floor-arrows`** at `cue`:
  - `coldArrows({ id:"bath-ca2", xs:[430, 470, 510], y0:1090, y1:1132, at:cue, dur: max(0.6, B(b03).start − cue) })` (§4.6).
  - Bather `act("shiver", cue, max(0.6, B(b03).start − cue − 0.1), 0.24)`.
- **Rewind** at `R2 = B(b03).start − 0.3`: ghost group, both veils, smoke and soot → 0 (0.35 s); bather `pose("stand", R2, 0.3)`.
- Overlays: `⚠ SMOKE` (auto, whole beat). Meter 15 (auto).

### b03 step 1: furnace (12.388 → 18.796)
- Cat at `B(b03).start + 0.4`: `face("left")`, `act("run", t, 1.0, 0.4)`, `move(620, 1056, t, 1.0)`, then `pose("stand", t + 1.0)`.
- **`furnace-build`** at `cue`:
  - Courses c0…c3 then the slab: each fromTo `y +30, opacity 0` → `y 0, opacity 1` (0.18 s, `power2.out`), staggered 0.15 s. `#furn-tunnel` and the voussoirs fade in with c1.
  - At `cue + 0.85`: `#furnFireW` sx/sy 0 → 1 (0.3 s, `back.out(1.4)`), fire `tl(cue + 0.85, D − cue − 0.85)`, tunnel glow 0 → 1 (0.3 s).
- **`heat-arrows-under`** at `cue`: `stream({ id:"bath-sB3", points:[[176,1132],[292,1132]], tone:"heat", at:cue, dur: cue("pilae-rise") + 0.9 − cue })`. The arrow presses against the solid wall base under the floor line and runs until the pilae are up.
- Callout `furnace`:
  - `card {x:400, y:400}`, `width 540`.
  - `target` = HOOK(215, 1110) = **(193.8, 1020.5)**.
  - `at: cue("furnace-build") + 0.5`.
- Overlays: `✓ STEP 1 · FURNACE` (auto). Meter 25 (auto).

### b04 step 2: pilae (19.18 → 26.749)
- **`ghost-heat-blocked`** (1.2 s, hold `h = clamp(cue("pilae-rise") − cue − 0.4, 0.8, 1.2)`):
  - At `cue`, the head of `bath-sB3` flashes red: overlay `#sB3-red` `var(--ui-red)` 0 → 1 → 0, twice in `h`.
  - The stream group scales x 1 → 0.85 → 1 about x 176, twice.
  - `#blockRed`: rect x 290–940, y 1140–1190, `var(--ui-red)`, 0 → 0.45 (0.15 s). It is the solid ground under the floor.
  - `#veilRed` 0 → 0.14.
  - **Rewind** at `cue + h`: `#blockRed` and `#veilRed` → 0 (0.3 s).
- **`pilae-rise`** at `cue`. The floor is raised on tile stacks, and the camera opens the cavity:
  - `#pilae` sy 0 → 1 and `#floorRise` translate(0 84) → translate(0 0), both 0.84 s with `ease:"steps(7)"`, so the floor rises one tile at a time with the stacks.
  - `#cavityBack` 0 → 1 (0.84 s, linear).
  - Camera HOOK → CLOSE (1.0 s, `power2.inOut`) from `cue`.
  - At `cue + 0.9`: `#wallMouth` 0 → 1 (0.25 s). `bath-sB3` fades (0.3 s).
- **`hot-air-between-pilae`** at `cue`:
  - `stream({ id:"bath-sU1", points: wavy from (176,1104) through (336,1104) to (650,1104), amplitude 14, tone:"heat", at:cue, dur:D − cue })`.
  - `stream({ id:"bath-sU2", points: wavy (650,1104) → (928,1104), tone:"heat", at: cue + 0.4, dur: D − cue − 0.4 })`.
  - Both are drawn behind the pilae (layer order §3.0).
  - `#floorWarm` (rect over `#flBig`, `var(--ui-heat)`) 0 → 0.22 (0.6 s) at `cue + 0.6`.
- Dimension line (scene, world): x 384, y 1066–1150, `var(--ui-white)` 3 px, with 14 px ticks at both ends. Opacity 0 → 1 at `cue("pilae-rise") + 1.2`; it fades at `next(b04) − 0.1`.
- Callout `pilae`: card (400,400) w 540, `target` CLOSE(504, 1108) = **(641.7, 1149.9)**, `at: cue("pilae-rise") + 1.05`.
- Label `pilae-height`: `{ x:620, y:1180, at: cue("pilae-rise") + 1.2 }` (screen, inside the cavity, right of the dimension line).
- Overlays: threat `⚠ NO WAY UNDER` from beat start, then step `✓ STEP 2 · PILLARS` at `pilae-rise` (build default). Meter 40 (auto).

### b05 step 3: thick floor (27.028 → 38.22)
- **`ghost-hot-spot`** (hold `h = clamp(cue("layer-big-tiles") − cue − 0.6, 1.0, 2.5)`; en 2.5):
  - At `cue`:
    - `#hotSpot` (over the floor, x 336–500) `var(--ui-heat)` 0 → 0.9 (0.3 s), then a red overlay `#hotSpotR` `var(--ui-red)` 0 → 0.5.
    - Three short heat wisps above it (`stream` vertical, x 380/430/480, y 1050 → 990, tone heat).
    - `#veilRed` 0 → 0.14.
    - The bather hops: `move(470, 1026, cue, 0.15)`, then `move(560, 1056, cue + 0.15, 0.35)`, and `pose("stand", cue + 0.5)`.
  - At `cue + 0.5`: `#coldRest` (x 500–940) `var(--ui-blue)` 0 → 0.45 (0.4 s). Cat `act("shiver", cue + 0.5, h − 0.5, 0.2)`.
  - **Rewind** at `cue + h`: hotSpot, hotSpotR, coldRest, wisps and veilRed → 0 (0.35 s).
- **`layer-big-tiles`** at `cue`: a yellow outline copy of `#flBig` (`#flBigY`, stroke `--ui-yellow` 4) goes 0 → 1 → 0 (0.5 s), and the tile seams pulse.
- **`layer-concrete`** at `cue`: `#flConc` sy 0 → 1 and `#ride` translate y 0 → −20, both 0.35 s `power2.out`.
- **`layer-top-tiles`** at `cue`: `#flTop` sy 0 → 1 and `#ride` −20 → −28, both 0.3 s.
- **`floor-glow-even`** at `cue`:
  - `#floorWarm` → 0 (0.3 s). `#floorWarmAll` (all three layers x 336–940) 0 → 0.28 (0.6 s).
  - Four even heat wisps rise above the floor at x 380, 520, 760, 880 (`stream` vertical, 0.6 s fade in, they run until `next(b05)`).
  - `#pizza` pops (opacity 0 → 1, scale 0.9 → 1, 0.18 s) at `cue + 0.2` and fades at `next(b05) − 0.1`.
- Callout `floor-layers`: card (400,400) w 540, `target` CLOSE(480, 1046) = **(604.5, 1053.8)**, `at: cue("layer-top-tiles")`.
- Overlays: threat `⚠ HOT SPOT`, then step `✓ STEP 3 · THICK FLOOR` at `layer-big-tiles` (default). Meter 55 (auto).

### b06 step 4: wall flues (38.545 → 49.563)
- **`ghost-smoke-backflow`** (hold `h = clamp(cue("box-tiles-in-walls") − cue − 0.5, 1.0, 2.0)`):
  - `ghost("bath-g6", …)` holds:
    - Cavity smoke: 5 puffs in the cavity, `tint("stone",10)` opacity 0.8. They grow from right to left (0.15 s stagger).
    - Stokehole smoke `smoke({ id:"bath-g6s", x:150, y:1080, s:0.8 })` with `tl(cue + 0.3, h)`.
  - `#furnFireW` 1 → 0.45 (0.6 s). `#streamsUnder` (the group of sU1/sU2) opacity 1 → 0.25. `#veilRed` 0 → 0.14.
  - **Rewind** at `cue + h`: the ghost group and the veil → 0 (0.35 s). Streams → 1 and fire → 0.6 (0.35 s).
- **`box-tiles-in-walls`** at `cue`: the box tiles of `#flueL` and `#flueA` pop bottom → top (opacity 0 → 1, 0.12 s each, 0.04 s stagger). Then `#ventL` and `#ventA` sy 0 → 1 (0.3 s) at `cue + 0.5`.
- **`hot-air-up-walls`** at `cue`:
  - `stream({ id:"bath-sFL", points: wavy (318,1060) → (318,606), tone:"heat", at:cue, dur:D − cue })` and `stream({ id:"bath-sFA", points: wavy (665,1060) → (665,540), … })`.
  - `#wallWarm` (the cut faces of the left wall and partition A) `var(--ui-heat)` 0 → 0.15 (0.6 s).
- **`roof-vent-smoke`** at `cue`:
  - `smoke({ id:"bath-vL", x:318, y:612, s:0.55 })` and `smoke({ id:"bath-vA", x:665, y:546, s:0.55 })`, both with `tl(cue, D − cue)`.
  - `#furnFireW` 0.6 → 1 (0.5 s).
- Callout `tubuli`: card (400,400) w 540, `target` CLOSE(318, 900) = **(353.4, 827.5)**, `at: cue("box-tiles-in-walls") + 0.4`.
- Overlays: threat `⚠ TRAPPED SMOKE`, then step `✓ STEP 4 · WALL FLUES` at `box-tiles-in-walls` (default). Meter 70 (auto).

### b07 step 5: room order (50.167 → 60.348)
- At `B(b07).start`: camera CLOSE → WIDE (1.2 s, `power2.inOut`). This is the brief's pull back that shows three rooms.
- **`air-cools-gradient`** at `cue`:
  - `bath-sU2` opacity 1 → 0 and `bath-sU2w` (same path, tone `warm`) 0 → 1, over 0.8 s.
  - A short neutral tail `bath-sU3` (tone `cool`, path (900,1104) → (930,1104)) fades in.
- **`room-hot-glow`** at `cue`: `#glowC` (x 336–650, y 660–1028, `var(--ui-heat)`) 0 → 0.2 (0.5 s), plus 2 heat wisps in the caldarium.
- **`room-warm-glow`** at `cue`: `#glowT` (x 680–940) 0 → 0.1 (0.5 s).
- **`room-cold-plain`** at `cue`:
  - `#pool` 0 → 1 (0.3 s). The pool water rises (`#bath-pool` water sy 0 → 1 about the pool bottom, 0.5 s).
  - `#glowF` (x 970–1220, `var(--ui-blue)`) 0 → 0.12.
  - `coldArrows({ xs:[1000, 1200], y0:900, y1:990 })` from `cue` to `next(b07)`.
- Callouts, all in the same slot (400,400) w 540 and shown **one after another**:
  - `caldarium`: `target` WIDE(493, 900) = **(354.7, 990)**, `at: cue("room-hot-glow")`, `until: cue("room-warm-glow") − 0.05`.
  - `tepidarium`: `target` WIDE(810, 900) = **(640, 990)**, `at: cue("room-warm-glow")`, `until: cue("room-cold-plain") − 0.05`.
  - `frigidarium`: `target` WIDE(1110, 1050) = **(910, 1125)**, `at: cue("room-cold-plain")` (to `hide`).
- Bather and cat stay in the caldarium (bather at 560, cat at 620).
- Overlays: step `✓ STEP 5 · HOT · WARM · COLD` (auto, beat start). Meter 75 (auto).

### b08 step 6: stoker (60.674 → 68.289)
- At `B(b08).start`: camera WIDE → STOKE (1.0 s).
- **`to-night`** at `cue`:
  - `lightTween(ctx.world, "day", "night", cue, 0.8)`.
  - `#bath-stars` and `#bath-moon` 0 → 1 (0.8 s).
  - The bather fades out (0.3 s). The stoker puppet (§4.1, at (118, 1150), facing right, `tunic:"earth-1"`) fades in at `cue + 0.3` (0.3 s), standing by the stokehole.
- **`ghost-fire-out`** at `cue`. It holds until `stoker-feeds-wood`:
  - `#furnFireW` 1 → 0.15 (0.8 s), so only embers remain. The tunnel glow → 0.2.
  - `#streamsUnder`, the flue streams, `#floorWarmAll`, `#glowC`, `#glowT` and `#wallWarm` → 0.15 of their value (0.8 s).
  - `#floorCold` (over `#flTop`, `var(--ui-blue)`) 0 → 0.35. `coldArrows({ xs:[420, 520, 620], y0:960, y1:1010 })` from `cue` to `cue("stoker-feeds-wood") + 0.3`.
  - `#veilRed` 0 → 0.12. Cat `act("shiver", cue, cue("stoker-feeds-wood") − cue, 0.2)`.
- **`stoker-feeds-wood`** at `cue`:
  - Stoker `act("feed", cue, 1.6, 0.8)`, then `pose("stand", cue + 1.6)`.
  - `#furnFireW` → 0.55 at `cue + 0.4` and → 1 at `cue + 1.2` (0.3 s each).
  - At `cue + 0.3`: veilRed and floorCold → 0, and every dimmed element returns to its value (0.6 s).
- **`woodpile-grows`** at `cue`: woodpile rows 1–5 pop (scale 0 → 1 about the row base, 0.15 s, staggered 0.08 s).
- Overlays: threat `⚠ FIRE OUT` from beat start. Step `✓ STEP 6 · STOKER` with **`stepAt: cue("stoker-feeds-wood")`**. This override is required: the build default would pick `to-night` and hide the threat before the ghost.
- Meter override: `[{ t: cue("ghost-fire-out"), value: 50 }, { t: cue("stoker-feeds-wood") + 0.5 }]` (→ 80).

### b09 step 7: sealed joints (68.672 → 77.96), light → tense
- At `B(b09).start`: `lightTween(ctx.world, "night", "tense", B(b09).start, 1.0)`. Camera STOKE → PUSH (2.5 s, `power1.inOut`). This is the slow push-in to the floor.
- **`gas-cloud-under`** at `cue`: `haze({ id:"bath-co", area:{x:340, y:1070, w:580, h:76}, n:5 })` (§4.6) opacity 0 → 1 (0.8 s). The blobs drift ±10 px (finite yoyo).
- **`ghost-crack-seep`** at `cue`:
  - `#crack` (zigzag through all three floor layers at x 520, 6 px wide, `shade("earth-3",40)`) sy 0 → 1 from the top (0.25 s).
  - Three haze puffs `#co-up0..2` rise from (520, 1028) to (500…600, 880), scale 0.5 → 1.4, opacity 0 → 0.4 (1.6 s, staggered 0.35 s).
  - Cat `pose("earsFlat", cue + 0.3, 0.2)` and `move(660, 1056, cue + 0.3, 0.4)`.
  - `#veilRed` 0 → 0.14.
- **`seal-joints`** at `cue` (it may overlap `gas-up-flues`; en gap 0.51 s, and they act on different elements):
  - `#crack` sx 1 → 0 (0.3 s). `#mortar` line (`tint("stone",30)` 4 px over the crack and every floor seam) 0 → 1.
  - `#jointsY` (yellow copies of every floor seam line) 0 → 1 → 0 (0.6 s).
  - The room haze puffs → 0 (0.4 s). `#veilRed` → 0. Cat `pose("stand", cue + 0.3)`.
- **`gas-up-flues`** at `cue`: the cavity haze blobs move to the flue bottoms (x → 318 or 665, 0.5 s), then up the flues to the vent tops (y → 600 / 540, 0.9 s), and fade at the top.
- Overlays: threat `⚠ INVISIBLE GAS` from beat start. Step `✓ STEP 7 · SEALED JOINTS` with **`stepAt: cue("seal-joints")`** (otherwise the default `gas-cloud-under` would end the threat before the crack).
- Meter override: `[{ t: cue("ghost-crack-seep"), value: 40 }, { t: cue("seal-joints") + 0.2 }]` (→ 85).

### b10 climax (78.564 → 85.901), light → day (winter)
- At `B(b10).start`:
  - `lightTween(ctx.world, "tense", "day", B(b10).start, 1.0)`. `#bath-stars` and `#bath-moon` → 0.
  - Camera PUSH → CLIMAX (1.2 s).
  - The bather (now with `sandals:1`, local y 1044 so the 12 px soles stand on the floor) fades in at (400, 1044) at `B(b10).start + 0.3`.
- **`winter-outside`** at `cue`:
  - `#groundSnow` sy 0 → 1 (0.4 s). `#roofSnow` and `#hillsSnow` 0 → 1 (0.5 s).
  - `#snowfall` opacity 0 → 1: each flake falls 260 px over 3 s in finite loops (repeat count = floor((D − cue)/3)), seeded x drift ±20.
  - Stoker `act("feed", cue + 0.6, 0.8, 0.8)`, then `pose("stand")`.
- **`inside-warm-glow`** at `cue`:
  - `#glowAmber` (x 336–650, y 660–1028, `color-mix(in srgb, var(--ui-heat) 60%, var(--ui-yellow))`) 0 → 0.28 (0.6 s). `#glowT` → 0.15.
  - Two heat wisps rise in the caldarium.
  - Bather `act("walk", cue, 1.0, 0.5)` and `move(520, 1044, cue, 1.0, "none")`, then `pose("stand")`.
- **`puppet-sandals-cat`** at `cue`:
  - `#bath-p-sandalYL, #bath-p-sandalYR` (yellow outlines) 0 → 1 (0.15 s), pulse to 0.5, then hold to `next(b10)`.
  - Bather `act("walk", cue, 0.6, 0.3)` and `move(560, 1044, cue, 0.6, "none")`, then stand.
  - Cat `pose("curl", cue, 0.5)`. It stays curled to the end of the video.
- Overlays: gauge `104°F / 40°C` (auto; tone heat, at (48,400)). Step `✓ WARM IN WINTER` with **`stepAt: cue("inside-warm-glow")`** (step-only override). Meter 95 (auto).

### b11 recap (86.122 → 89.122, silent, holdSec 3)
- At `B(b11).start`: camera CLIMAX → RECAP (0.5 s).
- Pulses `tk = B(b11).start + 0.3 + 0.33·k`, k = 0..6. Each is a `--ui-yellow` outline (world stroke 6) that goes 0 → 1 (0.15 s), then to 0.35, and holds:
  - k0: furnace outline
  - k1: all pilae
  - k2: floor layers outline
  - k3: both flue columns + vents
  - k4: the three room outlines
  - k5: woodpile
  - k6: floor seams (`#jointsY` at 0.6)
- Extra `recap` = `RecapPills({ id:"ex-recap-p", items, x0:60, y0:400, colW:880, rowH:70, cols:1, at: B(b11).start + 0.3, step:0.33, dur })`. `items` = `ctx.script.beats.filter(b => b.type === "step").map(b => b.onScreen.stepPlate)` (7 strings, b03–b09).
- No captions (silent). Meter persists. No plates or callouts (`onScreen` is empty).

### b12 ending (89.342 → 92.693)
- At `B(b12).start`: camera RECAP → WIDE (0.8 s) and `lightTween(ctx.world, "day", "sunset", B(b12).start, 1.2)`. The recap outlines fade (0.3 s).
- Vent smoke and snow keep running. The cat stays curled on the warm floor (callback). The bather stands. The stoker stands by the furnace.
- Label `title`: `{ x:540, y:480, at: B(b12).start + 0.3, maxWidth: 640 }`.
- No plate, ghost or meter change.

### Anchors returned by `render()`
`furnace`, `pilae`, `pilae-height`, `floor-layers`, `tubuli`, `caldarium`, `tepidarium`, `frigidarium` and `title` are all unique, so one `anchors` object serves every beat. Every callout gets `width: 540`. The `.at` and `.until` values are as given above.

## 4. Assets

Reused from the kit: `sky`, `stars`, `sun` (moon), `mountains`, `terrain`, `rocks`, `pool`, `fire`, `smoke`, `puppet` (changed), `ghost`, `tf`, `poly`, `shade`, `tint`, `prng`, `stage`, `groundShadow`, `lightTween` (changed).

### 4.1 Puppet changes (`kit/assets/puppet.mjs`, backward compatible; record in `KIT_CHANGES.md`)
- New options:
  - `tunic` (token or null, default null). When set, the torso uses `tunic` instead of `jacket`, and a skirt poly is added after the legs: (−28,−92) (28,−92) (32,−44) (−32,−44), left half `tint(tunic,4)`, right half `shade(tunic,16)`. A belt poly runs (−27,−95)…(27,−88), `shade("wood",10)`.
  - With `tunic`, the arms are short-sleeved: arm y 0–26 in the tunic colour, y 26–64 in skin.
  - `sandals` key in `DEFAULT` (0). Inside each leg part at the foot, add `${id}-sandalL` / `${id}-sandalR` (opacity 0): sole (−13,92) (28,92) (28,104) (−13,104) `tint("wood",10)`, lower half `shade("wood",8)`, strap line (−8,84)→(20,90) `shade("wood",20)` 3 px. Also add yellow outline copies `${id}-sandalYL/YR` (stroke `--ui-yellow` 3, no fill, opacity 0).
  - `branch` key (0). Inside `armR`, after the shovel: `${id}-branch` (opacity 0) is a stick (−3,74) (3,74) (4,150) (−2,150) `var(--wood)` with a twig (2,110) (16,124) (14,127) (1,114) `shade("wood",10)`.
  - `setPose` opacity loop: add `["sandals", "sandalL, sandalR"]` (selector `#id-sandalL, #id-sandalR`) and `["branch","branch"]`.
- Poses:
  - `shiver: { armL:-60, armR:-60, torso:-3, head:4 }`
  - `cough: { armR:-120, head:10, torso:10 }`
  - `feed: { armL:-70, armR:-70, torso:20, branch:1 }`
  - `standSandals: { sandals:1 }`
  - Sandal state persists: the scene builds the b10 bather as a second puppet `bath-p2` that starts with `sandals:1` (pose `standSandals` at its fade-in). The b01–b07 bather is `bath-p`.
- Actions:
  - `walk: [{legL:16, legR:-16, armL:-12, armR:12}, {legL:-16, legR:16, armL:12, armR:-12}]` (`bath-p2` adds `sandals:1` to both frames)
  - `shiver: [{armL:-60, armR:-62, torso:-3, head:4}, {armL:-66, armR:-56, torso:-3, head:-2}]`
  - `cough: [{armR:-120, head:10, torso:10}, {armR:-110, head:2, torso:2}]`
  - `feed: [{armL:-55, armR:-55, torso:22, branch:1}, {armL:-95, armR:-95, torso:6, branch:1}]`
- Characters:
  - Bather: `puppet({ id:"bath-p", x:360, y:1056, s:0.95, jacket:"sand", tunic:"sand" })` in `#ride`, about 208 world px tall. `bath-p2` is identical with sandals, in `#ride`, opacity 0 until b10.
  - Stoker: `puppet({ id:"bath-st", x:118, y:1150, s:0.95, jacket:"earth-1", tunic:"earth-1" })` outside, opacity 0 until b08.

### 4.2 `cat` (new: `kit/assets/cat.mjs`, export it from `kit/assets/index.mjs`)
`cat({ id, x, y, s = 1, flip = false })` → `{ svg, pose(name, at, dur), act(name, at, dur, period), move(x, y, at, dur, ease), face(dir, at), tl() }`. Calls are in chronological order; state is tracked as in `puppet`.

**Structure**
- Root `<g id transform="translate(x y)">` → `<g id="${id}-flip" transform="scale(±s s)">` → `groundShadow(0, 0, 70)` → `<g id="${id}-lift" transform="translate(0 0)">`.
- Inside: `${id}-stand` (opacity 1) and `${id}-curl` (opacity 0).
- Feet are at (0,0) and it faces right. It is about 80 long and 66 tall to the ear tips at s = 1, so about 120×100 screen px in CLOSE.

**Colours**
- fur `tint("earth-1",12)`, dark `shade("earth-1",12)`, stripes `shade("earth-1",30)`
- belly/muzzle `tint("sand",30)`, eye `var(--earth-3)`, inner ear `tint("earth-1",35)`

**Parts** (rotating groups use `attr transform tf({ r, px, py })`)
- `-tail`, pivot (−34,−30): (−34,−30) (−58,−46) (−64,−62) (−58,−64) (−52,−50) (−30,−36), dark.
- `-legB`, pivot (−24,−22): (−30,−22) (−18,−22) (−16,0) (−26,0), fur.
- `-legF`, pivot (22,−22): (16,−22) (28,−22) (28,0) (18,0), fur.
- Body: (−36,−24) (−30,−40) (10,−44) (30,−34) (30,−20) (−30,−18), fur.
- Underside: (−30,−18) (30,−20) (26,−14) (−26,−14), dark.
- 3 stripes: thin quads across the back at x −20, −6, 8, stripes colour.
- `-head`, pivot (30,−36):
  - head (24,−36) (30,−54) (48,−56) (56,−44) (50,−32) (32,−30), fur
  - muzzle (48,−44) (58,−42) (54,−36) (46,−36)
  - eye circle (46,−47) r 2.2
- `-ears`, pivot (40,−55): (30,−52) (32,−66) (40,−55) and (40,−55) (48,−67) (50,−55), with inner triangles.
- `-curl`:
  - loaf: 10-point ellipse poly centre (0,−16), rx 36, ry 17, fur; top facet `tint("earth-1",20)`
  - tail wrap (−30,−8) … (28,−4), a 6-point arc band 7 px thick, dark
  - head tucked (16,−26) (34,−32) (40,−18) (22,−10), fur, with ear triangles
  - closed-eye line (28,−22) → (34,−21), `var(--earth-3)` 2 px

**Poses**
- `stand: {}`
- `earsFlat: { ears:55, head:8, tail:20 }`
- `run: { legF:-35, legB:35, tail:-25, dy:-6 }`
- `curl`: `-stand` → 0 and `-curl` → 1 (crossfade 0.4 s)

**Actions**
- `shiver`: `-lift` x ±2 alternating every `period/2`, finite.
- `run: [{legF:-35, legB:35}, {legF:25, legB:-25}]`.

**`face(dir, at)`**: an instant (0.01 s) attr tween of `-flip` between `scale(s s)` and `scale(-s s)`.

Instance: `cat({ id:"bath-cat", x:600, y:1056, s:1, flip:true })` in `#ride`.

### 4.3 Bath-house parts (`src/bath.mjs`, video-specific)
- Everything in §3.0, plus the helpers `toScreen(cam, wx, wy)`, the constants `CAM`, `GY`, `PILA_X`, `FLOOR`, and `outline(id, shapePoints)` for the recap copies.
- **Box tiles** (`#flueL`, `#flueA`): rectangles 24×36 (flue A: 18×36) stacked from y 1060 up to 670 with a 2 px gap (11 tiles each). Each is a frame `tint("earth-1",6)` 4 px with a hollow core `shade("earth-3",35)`, opacity 0 until b06.
- Faces use tokens only; there are no hex colours.

### 4.4 Woodpile (`src/bath.mjs`)
- `#wp-r0..r5`: row r has `6 − r` log ends. Each is an octagon r 13 at x = −60 + 13 + 26·i + 13·r, y = 1150 − 13 − 22.5·r. Faces `tint("wood",30)`, with a ring octagon r 6 `shade("wood",6)` and a lower-right facet `shade("wood",18)`.
- Row 0 is visible from the start. Rows 1–5 start at scale 0 about each row's base.
- `groundShadow(18, 1150, 170)`.

### 4.5 Floor overlays (inside `#floorRise`, all opacity 0)
- `#floorWarmB01`, `#floorWarm` (over `#flBig`): `var(--ui-heat)`.
- `#floorWarmAll` (x 336–940, y 1028–1066): `var(--ui-heat)`.
- `#hotSpot` (x 336–500, over `#flBig`): `var(--ui-heat)`. `#hotSpotR`: `var(--ui-red)`.
- `#coldRest` (x 500–940): `var(--ui-blue)`. `#floorCold` (over `#flTop`): `var(--ui-blue)`.
- `#crack`, `#mortar`, `#jointsY`, `#flBigY` as specified in the beats.

### 4.6 Effects (`src/fx.mjs`, world-space, inside `#bath-cam`)
- **`stream({ id, points, tone, at, dur, width = 7, wavy = true, amp = 12 })`** → `{ svg, tl }`.
  - It samples a wavy polyline along `points` (sine, 3 waves per 300 px, amplitude `amp`, deterministic). The path has `stroke-dasharray 26 18`, an arrowhead at the end, and opacity 0.
  - Tweens: opacity 0 → 1 (0.3 s) at `at`, and `strokeDashoffset 0 → −(44·dur·1.5)` linear over `dur` (one tween, no repeats).
  - Tones:
    - `heat` = `var(--ui-heat)`
    - `warm` = `color-mix(in srgb, var(--ui-heat) 45%, var(--stone))`
    - `cool` = `color-mix(in srgb, var(--ui-heat) 15%, var(--stone))`
    - `cold` = `var(--ui-blue)`
- **`coldArrows({ id, xs, y0, y1, at, dur })`**: straight blue arrows, 6 px, that sink from y0 to y1. Each cycle is 0.8 s (fade in, travel, fade out), finite, and they stop at `at + dur`.
- **`haze({ id, area, n })`**: n seeded 9-point blobs.
  - Fill `color-mix(in srgb, color-mix(in srgb, var(--stone) 70%, var(--night-tint)) 85%, var(--ui-red))` at opacity 0.32.
  - Stroke `tint("stone",40)` 3 px, `stroke-dasharray 10 8`, opacity 0.5.
  - It reads as a faint, dashed, "invisible" grey-violet gas, never as a UI colour.

### 4.7 Pizza-stone icon (screen-space, in the scene stage)
- Circle (870,660) r 50 `var(--panel-bg)`.
- Stone disc: a side ellipse (870,680) rx 34 ry 9 `tint("stone",10)`, with an edge `shade("stone",14)`.
- Pizza wedge: triangle (848,672) (892,672) (870,646) `tint("earth-1",20)`, with 3 dots `var(--ui-heat)` r 3.
- 3 short heat lines above it (`var(--ui-heat)` 3 px).
- It contains no text.

## 5. Components

| Component | Where | Props / use |
| --- | --- | --- |
| StepBadge / ThreatBadge | build.mjs (auto) | `stepAt` overrides in b08, b09, b10 (§3) |
| Callout (+ Label) | build.mjs (auto) | anchors from the scene; slot (400,400), `width: 540`; b07 uses `.until` |
| Label | build.mjs (auto) | `pilae-height` (620,1180); `title` (540,480), `maxWidth: 640` |
| Gauge | build.mjs (auto) | b10 at (48, 400) |
| StakesMeter | build.mjs (auto) | WARMTH / ТЕПЛО at (48, 300), frames + overrides b08/b09 |
| RecapPills | extra `recap` (b11) | §3 b11 |
| KaraokeCaption | build.mjs | as is |
| Cover | `build.mjs --cover` | headline from the script |

**Kit component changes (this video's `kit/`; list them in `KIT_CHANGES.md`)**
1. Copy `videos/pin-tumbler-lock/kit/components/Callout.mjs` (it has `width` and `Label` with `maxWidth`), `StakesMeter.mjs` and `RecapPills.mjs` over this kit, and export `RecapPills` from `kit/components/index.mjs`. Then set the minimums to 36:
   - Callout: title `max 44, min 36`; subtitle `max 36, min 36`, maxLines 2.
   - Label: default `max 36, min 36, maxWidth 640`.
   - StakesMeter: `max 36, min 36`.
   - RecapPills: `max 40, min 36` (already).
2. `Pill.mjs`: `fitFont(..., { max: 46, min: 36 })`. It was min 28.
3. `Gauge.mjs`: `fitFont(..., { maxWidth: 420, max: 40, min: 36 })`. It was min 24.
4. `kit/lighting.mjs`: `lightTween` adds `immediateRender:false` to the to-vars. This is required: there are four light tweens on the same world, and otherwise the last preset shows from t = 0 (the pin-tumbler-lock builder note).

## 6. Timing rules
- Cue words resolve in `build.mjs` (normalised, first occurrence unless `occurrence`; b05 `tiles,` occ 1, b10 `hot` occ 1). Everything in a beat is anchored to `cue(...)`, `B(b).start/.end` or `next(b)`.
- Minimums:
  - Entrances 0.15–0.4 s, exits 0.3–0.35 s.
  - Ghosts hold 1.0–2.5 s as listed; b02 is a whole-beat attempt, and b08/b09 hold while the narration names the problem.
  - Every callout and label is visible ≥ 1.2 s (build clamp, §2.1).
- **Short-beat rule** (any language, any re-voice):
  - Ghost hold `h = clamp(nextCue − cue − margin, min, planned)`, with the margin, min and planned values per beat in §3.
  - Any action tween on an element with a later action uses `dur = min(planned, max(0.2, nextCueOnThatElement − cue − 0.05))`.
  - Camera and light moves use `dur = min(planned, max(0.5, next(b) − at − 0.05))`, so they always finish inside their beat.
  - `coldArrows` and wisps get `dur ≥ 0.6`.
- Puppet and cat calls are made strictly in time order per character. Use `immediateRender:false` on every `fromTo` after a target's first tween, and set initial states in markup.
- No `Math.random` or `Date.now`: `prng(seed)` for smoke, haze, flakes and aggregate dots.
- Cover frame: `--at` = `cue("puppet-sandals-cat") + 0.6` → en **85.79**, uk **99.41** (CLIMAX framing: snow outside, amber room, cat curled, sandals outlined).

## 7. i18n fit (all text min 36 px)

| Box | Width for text | Size range | Lines | Longest now | Rule for new strings |
| --- | --- | --- | --- | --- | --- |
| Plates | 852 px | 46 → 36 | 1 | uk `✓ КРОК 5 · ГАРЯЧЕ · ТЕПЛЕ · ХОЛОДНЕ` ≈ 38 px | ≤ 30 chars (Cyrillic) / 32 (Latin) |
| Callout title | 476 px (card 540) | 44 → 36 | 1 | uk `ПІДЛОГА-БУТЕРБРОД` ≈ 36 px | ≤ 16 Cyrillic / 18 Latin uppercase chars |
| Callout subtitle | 476 px | 36 | ≤ 2 | en `furnace outside, fed through a stokehole` (2 lines) | ≤ 40 Cyrillic / 46 Latin chars |
| Label | 640 px | 36 | 1 | uk `ГІПОКАУСТ · 2000 р. тому` ≈ 543 px at 36 | ≤ 24 chars |
| Gauge | 420 px | 40 → 36 | 1 | `104°F / 40°C` ≈ 341 px at 40 | ≤ 13 chars |
| Meter | 348 px | 36 | 1 | `WARMTH` | ≤ 12 chars |
| Recap pills | 840 px | 40 → 36 | 1 | same as plates | as plates |
| Captions | 972 px | 96 → 56 | 1 | kit auto-fit | kit |

- Measurement uses `kit/measure.mjs` (conservative). If the builder gets an overflow warning, **shorten the script string** (send it back through the orchestrator). Never go below 36.

## 8. Audio
- **Voice**: `audio/voice.<lang>.mp3` → two-pass linear `loudnorm` to **−13 LUFS integrated, −1.5 dBTP, LRA 11** → `assets/voice.wav` (§2.1 item 5). Volume 1, from 0 to `durationSec`.
- **Music**: `audio/music.loop.<lang>.mp3` already has fade in 1 s, fade out 2 s, volume 0.12 and −8 dB ducking (by `tools/music-loop.mjs`). It is copied to `assets/music.mp3` at **data-volume 1** (§2.1 item 6). The expected bed is about −30 LUFS between phrases and lower under the voice, so it is at least 15 dB under the voice.
- **Target final mix**: −14 ±1 LUFS integrated, true peak ≤ −1 dBTP.
  - The reviewer measures it with ffmpeg; this is a measurement, not a HyperFrames command: `ffmpeg -hide_banner -nostats -i out/draft/hypocaust.en.mp4 -af ebur128=peak=true -f null -`.
  - If the mix is below −15 LUFS, raise the loudnorm `I` by the difference (max −11). Do not raise the music.
- No sound effects.

## 9. Commands (run inside `videos/hypocaust/`, copied from `TEMPLATE.md`)

| Job | Command |
| --- | --- |
| Build a language | `node build.mjs <lang>` → `build/<lang>/` |
| Silent build | `node build.mjs <lang> --no-voice` |
| Check | `npx hyperframes check build/<lang> --json` |
| Look at frames | `npx hyperframes snapshot build/<lang> --at 3,10.5 --no-end -o review/frames` |
| Live preview | `npx hyperframes preview build/<lang> --background` (stop: `npx hyperframes preview build/<lang> --stop`) |
| Draft render | `npx hyperframes render build/en -o out/draft/<slug>.en.mp4 --quality draft` |
| Final render | `npx hyperframes render build/<lang> -o out/<slug>.<lang>.mp4 --quality delivery --crf 12`, then `node tools/finish.mjs out/<slug>.<lang>.mp4` |
| Partial render | add `--start 0 --end 15` |
| Cover | `node build.mjs <lang> --cover [--at <sec>]` → `out/cover.<lang>.png`, then `node tools/finish.mjs out/cover.<lang>.png` |

- Slug = `hypocaust`; langs `en`, `uk`. `tools/finish.mjs` lives at the repo root.
- Cover: `node build.mjs en --cover --at 85.79` and `node build.mjs uk --cover --at 99.41`.

## 10. Builder checklist
1. Port the `build.mjs` items 1–6 (§2.1). Copy the Callout, StakesMeter and RecapPills components and apply the 36 px minimums, plus the Pill, Gauge and `lightTween` changes (§5). Start `KIT_CHANGES.md`.
2. Puppet changes (§4.1) and the new `kit/assets/cat.mjs` (§4.2), with exports.
3. `src/fx.mjs`: `stream`, `coldArrows`, `haze`.
4. `src/bath.mjs`: geometry, layer order (§3.0), camera presets, `toScreen`, woodpile, box tiles, floor overlays, recap outlines, pizza icon.
5. `src/scenes.mjs`:
   - One scene `{ id:"bath", beats:[b01…b12], light:"day" }`.
   - The beat actions in §3, in time order per element.
   - Return `anchors` (with `.at`, `.until`, `.width`, `.maxWidth`) and `overlays` (b08/b09 `stepAt` + meter, b10 `stepAt`).
   - `export const extras = [{ id:"recap", from:"b11", to:"b11", render }]`.
6. `node build.mjs en`: 0 errors, no "no anchor" or overflow warnings. Then `node build.mjs uk`, and `npx hyperframes check build/<lang> --json` for both (fix every error).
7. Snapshot en at: 0.8, 3.5, 7.5, 10.0, 11.7, 14.5, 18.3, 20.6, 22.9, 25.5, 28.6, 33.0, 34.9, 37.0, 39.8, 43.6, 46.6, 51.6, 54.0, 56.3, 58.0, 59.6, 62.4, 65.6, 67.8, 72.3, 74.6, 77.4, 81.0, 83.0, 85.8, 87.5, 88.9, 90.5, 92.2. Snapshot uk at 18.9, 45.5, 66.5, 99.4. Read every frame.
8. Draft render (`out/draft/hypocaust.en.mp4`), and measure its loudness (§8).

## 11. Reviewer focus
1. **Duration**: en 92.7 s is within 60–120 s but under the brief's 115 s ±15 % window. Report it for the orchestrator/owner; it is not a build failure. uk 106.7 s is inside the window.
2. **Text size and layout**:
   - No overlay text under 36 px in en or uk (plates, callouts, labels, gauge, meter, recap pills).
   - The callout card never covers the bather's head, the meter or the left-wall flue.
   - Nothing readable sits in the caption band or right of x 940.
3. **Full frame**: the ground cross-section (strata, footings, rocks, later snow) fills y 1215–1920. The roof and sky fill the top. No flat single-colour band taller than 200 px; the lower third must not look empty.
4. **Audio**: the integrated mix is −14 ±1 LUFS and the voice is clearly above the music. The music is not doubly attenuated (`data-volume` 1), and the voice is the normalised `voice.wav` with words still in sync with the captions.
5. **Floor raise (b04)**: the pilae and the floor rise together in 7 tile steps with no gap. The puppet and the cat ride with the floor, and the cavity stays above the captions after the camera shift.
6. **Ghost readability**: each ghost (b02 room fire, b04 blocked heat, b05 hot spot, b06 backflow, b08 fire out, b09 crack) is red-tinted and visibly reverses before or at its fix. The b02 ghost fully clears by b03.
7. **Plate timing**: in b08 `⚠ FIRE OUT` stays until "feeds", in b09 `⚠ INVISIBLE GAS` stays until "sealed", and in b10 the step plate appears at "hot". The b07 callouts appear one at a time on hot / warm / cold, each for ≥ 1.2 s, and every leader hits its room under the WIDE camera.
8. **Heat logic**:
   - The streams run furnace → under the floor → up the flues → out of the vents.
   - The tepidarium segment turns warm-neutral in b07, and the frigidarium has no pilae and no heat.
   - The CO haze stays faint, dashed and grey-violet, and leaves through the flues.
9. **Lighting**: day → night (b08) → tense (b09) → day with snow (b10) → sunset (b12). There is no preset flash at t = 0 (`lightTween immediateRender:false`), and the fire and heat stay bright at night.
10. **Observer callback**: the cat shivers (b01), flees (b02), returns (b03), shivers (b05, b08), flattens its ears (b09) and curls up asleep from b10 to the end. The sandals are visibly outlined in b10.
