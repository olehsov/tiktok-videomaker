# PLAN: Pin Tumbler Lock, Why Only One Key Turns It (`pin-tumbler-lock`)

## 1. Summary
- Concept: a side cut-away of one pin tumbler lock gains its parts one by one: plug in a shell, one pin, split pin and shear line, springs, five heights, rounded tips, spool drivers. Each part comes after a red failure ghost. An end-view inset (upper right) shows whether the plug can turn. The climax is "wrong key stuck, pick stuck, your key: click", and the video ends with the door opening.
- Duration: en **80.808 s** (`timings.en.json → videoDurationSec`; voice 79.308 s, source `elevenlabs`). This is inside 60–120 s but **below the brief's 100 s ±15 % window (85–115 s)**. This plan does not change the voice; see §11.
- Languages: `en` only. Every rule below works for `uk` / `ru` without code changes.

**Global conventions (binding for every scene)**
- Times are always expressions of `ctx.cue(action)`, `ctx.word(beat, text, n)`, `ctx.beat(id).start/.end`, `ctx.t0`, `ctx.t1`. Literal numbers are only allowed as durations and offsets (`cue + 0.3`, `duration: 0.35`). Below, en seconds are given only to help you orient.
- Notation: `cue(x)` = `ctx.cue("x")`, `w(b,"t",n)` = `ctx.word(b,"t",n)`, `B(b)` = `ctx.beat(b)`.
- Colour meaning:
  - Key pins are brass (`--sand`). Drivers are steel (`--stone`, mid tone). Springs are thin `var(--snow)` zig-zags. The shell is dark steel and the plug is light steel.
  - Failure ghosts are shown with kit `ghost()` on the ghost-only props, plus the red lock overlay `#s2-lockRed` (`--ui-red`, opacity 0 → 0.28).
  - A blocking pin flashes red (`--ui-red` overlay on that part, 0 → 0.6 → 0). Correct alignment glows yellow (`--ui-yellow` dashed seam line). Spring force arrows are yellow.
  - These UI colours never appear in the scene with any other meaning.
- Screen zones (1080×1920):
  - Plates sit at y ≈ 230.
  - Gauge and meter sit in the corner at x < 430, y 330–560.
  - The **end-view inset** circle is at x 675–925, y 345–595 (b02–b09).
  - **Callout card slot**: top-left **(40, 610)**, card height ≤ 170, so its bottom is ≤ 780.
  - The **lock cut-away** spans x 150–1070, y 800–1200.
  - Captions sit at y 1230–1460.
  - Nothing readable goes below y 1520 or right of x 940.

## 2. Composition

One `build/<lang>/index.html` with one paused GSAP timeline `window.__timelines["main"]`. `node build.mjs <lang>` generates it from `script.<lang>.json`, `timings.<lang>.json`, `src/scenes.mjs` (+ `src/lock.mjs`, `src/endInset.mjs`, `src/egyptInset.mjs`) and `kit/`.

| Layer | What | `data-track-index` | z |
| --- | --- | --- | --- |
| audio voice | `<audio id="voice">` `assets/voice.mp3`, volume 1 | 0 | — |
| audio music | `<audio id="music">` `assets/music.mp3` from `audio/music.loop.en.mp3` (exists), volume `config.music.volume` = 0.12 | -1 | — |
| scenes | 4 full-frame scene clips s1–s4. Background, diorama, characters and effects live inside each scene's SVG stage | 1 | 1 |
| extras | `inset` (EndInset) b02 → b09; `recap` (RecapPills) b10 → b10 | 2 | 4 |
| overlays | plates, callouts, labels, gauge, meter (built by `build.mjs` from `onScreen`) | 3 | 5 |
| captions | KaraokeCaption (`build.mjs`) | kit default | 10 |

Scene map (start = first beat's start; end = next scene's start):

| Scene | Beats | en span | Light | Setting |
| --- | --- | --- | --- | --- |
| s1 `door` | b01 | 0 – 5.271 | day | house front, door, puppet with key, magpie; push-in to the tiny lock |
| s2 `lock` | b02–b09 | 5.271 – 74.664 | day → tense (b08) → sunset "dawn" (b09) | one accumulating side cut-away of the lock |
| s3 `recap` | b10 | 74.664 – 77.384 | day | the finished cut-away (raised), parts pulse in step order |
| s4 `ending` | b11 | 77.384 – 80.808 | sunset → day ("morning") | pull back to the door; the door opens; magpie with a bottle cap |

### 2.1 `build.mjs` extensions (builder implements; list them in `KIT_CHANGES.md`)
`videos/composite-bow/build.mjs` already contains items 1–4. Port that code (`makeCtx`, `overlaysByBeat`, the extras loop, the anchor `.at` handling, the meter frame override and sort, and `extrasHtml` in `body`). Do **not** port Label `maxWidth`/`max` or Callout `width`: this kit's `Label`/`Callout` do not take them.
1. **Anchor timing.** `anchors[id].at` (absolute seconds) is optional for callouts and labels. When it is set: `at = r3(Math.min(Math.max(a.at, bs), hide - 0.8))`.
2. **Scene overlay timing.** `render()` may return `overlays: { [beatId]: { stepAt?, meter?: [{ t, value? }] } }`.
   - `stepAt` replaces the step-plate time in beats that have both plates (still `≥ bs + 0.8`).
   - `meter` replaces that beat's meter keyframe. A missing `value` means the script value. All frames are sorted by `t`.
3. **Extras.** `export const extras = [{ id, from, to, render(ctx) }]` gives clip `ex-<id>`, track 2, z 4. It runs from `beat(from).start` to `beat(after to).start − 0.1` (or to D).
4. **New, small:** `stepAt` also applies to beats that have **only** a step plate. There the plate starts at `r3(Math.max(stepAt, bs))` and runs to `hide`. It is used in b09.

## 3. Scenes by beat

### Shared geometry: `src/lock.mjs` (side cut-away; all numbers are in stage px when the camera is at identity)
- `SHEAR_Y = 1010`. Pin x `PX = [300, 420, 540, 660, 780]` (pin 3 = index 2 = the first pin, in the centre).
- **Shell** x 180–860, y 800–1010. Top bevel y 800–816. The bottom strip is y 1170–1200.
- **Plug** x 180–860, y 1010–1170. Front lip x 150–180, y 990–1190.
- **Keyway slot** x 150–860, y 1040–1160.
- **Chamber hole i**: x `PX[i] ± 22`. The shell part spans y 820–1010 and the plug part y 1010–1040.
- **Key pins**: width 36. Length `KL = [62, 92, 50, 80, 70]`. The tip rests at y 1125, so the rest top is `KT = 1125 − KL` = [1063, 1033, 1075, 1045, 1055].
- **Drivers**: width 36, length 100, sitting on the key pin. Rest top `DT = KT − 100` = [963, 933, 975, 945, 955]. Every driver crosses `SHEAR_Y` at rest.
- **Springs**: from y 820 (chamber top) to `DT[i]`. Rest length `SL = DT − 820`.
- **Correct lift** `D = KT − 1010` = [53, 23, 65, 35, 45]. It puts every split exactly on the seam.
- **Key** (group `#…-key`, `attr transform translate(ox 0)`, inserted ox = 0, out ox = −900):
  - Bow (handle) x 30–150, y 1050–1170, chamfered octagon.
  - Blade x 150–840, bottom y 1152.
  - Top profile: shoulder (150, 1048). For each pin, `v = V[i]` and `s = (v − 1048) × 0.7`: points (PX−10−s, 1048), (PX−10, v), (PX+10, v), (PX+10+s, 1048). The tip goes (800, 1048) → (840, 1110) → (840, 1152).
  - Correct valleys `V = 1125 − D` = [1072, 1102, 1060, 1090, 1080]. The magpie's wrong key uses the same valleys except `V[3] = 1070` (pin 4 is lifted 55, so its key pin crosses the seam).
- **Profile function** `profileY(xLocal)` = the blade's top y at local x (`Infinity` when x > 840 or x < 150). The lift of pin i at key offset ox is `max(0, 1125 − profileY(PX[i] − ox))`.
- **Cam + bolt** (the bolt is drawn *before* the shell so a retracted bolt hides behind it):
  - Bolt rect x 870–1070, y 1130–1180. Retracted = `translate(-100 0)`.
  - The cam group pivots at (875, 1090): disc r 28 plus lobe [(875,1090),(905,1120),(895,1135),(870,1110)]. Open = rotate 60.
- **Seam line** `#…-seam`: y 1010, x 180–860, `shade("stone",45)` 2 px. Visible from b04 onward, opacity 0 before.
- **Seam glow** `#…-seamGlow`: same line, `--ui-yellow` 5 px, dash 16 10, opacity 0.
- **Red overlay** `#…-lockRed`: rect x 150–1070, y 800–1200, `--ui-red`, opacity 0.

Faces (tokens only): see §4.1.

Element order inside `#s2-lock`:
1. bolt
2. cam
3. shell
4. plug
5. keyway
6. holes `#s2-hole{i}`, the shell part inside `#s2-up{i}`
7. seam
8. springs `#s2-sp{i}`, inside `#s2-up{i}`
9. stacks `#s2-st{i}`, each holding `-kpFlat`, `-kpRound`, `-drv`, `-spool`, `-kpRed`, `-drvRed`, `-spoolRed`, `-kpY`, `-drvY`
10. keys
11. tools
12. lockRed
13. seamGlow
14. clickRing

`#s2-lock` sits inside the camera group `#s2-cam` (attr transform `tf(…)`). Indices i = 0..4 (pin 1..5).

**Lift helper** (in `src/lock.mjs`, tracks state per stack):
- `lift(i, value, at, dur = 0.25, ease = "power2.out")` emits two tweens:
  - `#s2-st{i}` `attr:{transform:"translate(0 −value)"}`
  - `#s2-sp{i}` `attr:{transform: tf({ px: PX[i], py: 820, sy: (SL[i] − value) / SL[i] })}`
  - Both use `fromTo(prev → new)` with `immediateRender:false`.
- `ride(keySel, idxs, V, ox0, ox1, at, dur, steps = 14)`:
  - Tweens the key `ox0 → ox1` (ease `none`).
  - For each step k = 1..steps, at `at + dur·k/steps`, it calls `lift(i, liftAt(ox), at + dur·(k−1)/steps, dur/steps, "none")` for each `i` in `idxs`, using the profile of `V`.
- `flash(sel, color, at, hold = 0.35)`: overlay opacity 0 → 0.6 (0.1 s), then back to 0 (0.15 s) at `at + hold`.

### s1 `door` (b01), light `day`
Backdrop (static):
- `sky({ horizonY: 400 })` and `sun({ cx: 880, cy: 210, r: 60 })`.
- `houseFront({ id: "s1-house" })` (§4.2) with ground y 1520. The door is x 330–710, y 760–1520. The lock face is at (650, 1130), r 13.

Characters:
- Puppet `puppet({ id: "s1-p", x: 860, y: 1520, s: 3.0, flip: true, jacket: "water" })`, pose `holdKey` at t0 (dur 0.01). The hand with the key ends up beside the lock.
- `magpie({ id: "s1-m", x: 690, y: 740, s: 1.5, flip: true })` perches on the door frame top, facing the key.

Everything above sits in `#s1-cam`.

#### b01 hook (0 → 4.458)
- At t0 the frame is wide. Puppet and magpie are visible. The magpie's head tilts −10° at `t0 + 0.3` (0.25 s), eyeing the key.
- **`pullback-door-to-lock`** (the brief means a push-in): `#s1-cam` goes from `tf()` to `tf({ x: −110, y: −230, px: 650, py: 1130, sx: 3.5, sy: 3.5 })`. This puts the lock at (540, 900). It runs from `cue` for 1.55 s, `power2.inOut`.
- **Key fan** (screen space, outside the cam, group `#s1-fan`):
  - 9 keys rotate about pivot (540, 1180) at angles −60…+60 in 15° steps. Each key is 260 px long, pointing up: a bow ring at the pivot end, then the blade.
  - Faces `tint("stone",30)` / `shade("stone",10)`. The centre key is `#s1-fan4`.
  - Each key pops (opacity 0 → 1, scale 0.9 → 1 about the pivot, 0.25 s), staggered 0.05 s, starting at `w(b01,"thousands")`.
- **`keys-fan-one-glows`** at `cue`:
  - The 8 other keys go to opacity 0.3 (0.3 s).
  - `#s1-fan4` scales to 1.15 about the pivot (0.3 s).
  - Its outline copy (`--ui-yellow` stroke 6, no fill) goes 0 → 1 (0.2 s), pulses 1 → 0.5 → 1 (0.4 s), then holds.
- Overlays: gauge "1 KEY OF 1,000s" (auto, at bs + 0.15); meter 0 (auto). No plates, ghost or camera move beyond the push-in.

### s2 `lock` (b02–b09), light `day`, one accumulating cut-away
Backdrop:
- `sky({ horizonY: 1500 })`.
- A workbench plank y 1500–1920: `var(--wood)` top face y 1500–1530 `tint("wood",10)`, front `shade("wood",14)`.
- Shelf for the magpie: poly x 20–170, y 1215–1235, `shade("wood",20)`.

Intro at t0:
- `#s2-lock` opacity 0 → 1 and `tf({px:540,py:1000,sx:0.94,sy:0.94})` → `tf()` (0.45 s, `power2.out`).
- Visible at the start: shell, plug, keyway, cam, bolt. There are no holes, pins or seam yet.

Magpie `magpie({ id: "s2-m", x: −140, y: 1215, s: 1.25 })` faces right and is hidden offscreen. "MP_LOW" = x 90 (beak tip ≈ (175, 1147), at the keyway mouth). `hopTo(x, at)` = attr translate tween, 0.35 s, `power2.out`, plus a 12 px up-and-down arc on the inner group.

#### b02 attempt (5.271 → 11.029)
- **`plug-turns-bolt-slides`** at `cue`:
  - Inset `turn(90, cue)`.
  - Cam rotates to 60 and the bolt retracts −100 (0.35 s, `power2.inOut`).
  - At `w(b02,"bolt.") + 0.3` everything returns (inset `turn(0)`, cam 0, bolt 0; 0.35 s).
- **`ghost-screwdriver-opens`** (failure ghost, 1.3 s):
  - `ghost("s2-sd", …)` screwdriver: handle x −60…120, y 1080–1130, `var(--wood)` faces. Shaft x 120–620, y 1096–1114, `tint("stone",20)`. Flat tip.
  - At `cue` the ghost opacity goes 0 → 1, the screwdriver moves x −400 → 0 (0.3 s), and `#s2-lockRed` goes 0 → 0.28 (0.2 s).
  - At `cue + 0.35`: inset `turn(90)`, cam 60, bolt −100 (0.35 s).
  - **Rewind** at `cue + 1.3`: the screwdriver moves back to −400 and fades, cam and bolt return, lockRed → 0, inset `turn(0)` (0.35 s).
- Callout `plug`: `{ card: {x:40, y:610}, target: {x:420, y:1025}, at: cue("plug-turns-bolt-slides") }`.
- Overlays: `⚠ ANY TOOL OPENS IT` (auto, whole beat). Meter `[{ t: cue("plug-turns-bolt-slides") }]` → 5.

#### b03 step 1: pin (11.413 → 18.483)
- **`drill-hole`**:
  - The drill bit `#s2-drill` is a rect 30×300 `tint("stone",35)` with 8 diagonal groove lines `shade("stone",30)` and a pointed tip. It is centred x 540, tip at y 1040 when in.
  - It moves from y −520 offset to 0 between `cue − 0.1` and `cue + 0.7` (`power1.inOut`).
  - The grooves group shifts y 0 → −60 three times (finite repeats, 0.25 s each) to read as spinning.
  - Hole 3 (`#s2-hole2`) grows `scaleY` 0 → 1 about y 820 over the same span.
  - The bit pulls out (y → −520, 0.3 s) at `cue + 0.9`.
- **`pin-drop`**:
  - The one-piece pin `#s2-st2` is drawn whole in `--sand` faces: the driver part uses the key-pin faces until the split, and the split line has opacity 0.
  - It drops from `translate(0 −420)` to rest (0.35 s, `power2.in`).
  - Inset `pin(cue + 0.35)`.
- **`plug-jams`**: inset `jam(cue)`. At the same time a yellow outline pulse runs on the pin where it crosses the seam (`#s2-st2-drvY` 0 → 1 → 0, 0.4 s). Yellow means "this is the fix".
- **`egypt-wooden-lock-inset`**: `egyptInset({ id: "s2-eg", cx: 270, cy: 1040, r: 110, at: cue })` (§4.4). It fades out at `B(b04).start − 0.3` (0.3 s).
- Callout `pin`: `{ card: {x:40,y:610}, target: {x:540, y:1010}, at: cue("pin-drop") + 0.3 }`. Label `egypt`: `{ x: 270, y: 900, at: cue("egypt-wooden-lock-inset") }`.
- Overlays: `✓ STEP 1 · PIN` (auto). Meter `[{ t: cue("pin-drop") }]` → 20.

#### b04 step 2: split pin + shear line (19.18 → 31.614)
- `B(b04).start`: the seam line fades in (0.3 s) and stays to the end of s2.
- **`ghost-stick-lifts-pin`** (1.3 s):
  - `ghost("s2-stick", …)`: a twig polyline from (−200, 1150) to (560, 1130), stroke `var(--wood)` 10 px, with one short side twig.
  - At `cue` it slides in from x −500 (0.25 s) and lockRed goes 0 → 0.28.
  - At `cue + 0.25`: `lift(2, 125, …, 0.3)`. The whole pin leaves the plug (bottom at 1000).
  - At `cue + 0.55`: inset `turn(70)`, cam 60, bolt −100.
  - **Rewind** at `cue + 1.3`: `lift(2, 0, 0.3)`, the stick goes out, everything else returns, lockRed → 0.
- **`pin-split`**:
  - A white cut line (`var(--snow)` 4 px, x 516–564 at y 1075) flashes 0 → 1 → 0 (0.25 s).
  - The upper part crossfades to driver faces (`#s2-st2-drv` 0 → 1 over the sand copy, 0.3 s).
  - The split line `shade("earth-3",30)` 3 px appears.
  - The driver nudges up 6 px and back (0.3 s).
- **`stack-too-low`**: `lift(2, 30, cue)`, then `flash("#s2-st2-drvRed", red, cue + 0.25, 0.6)` and inset `jam(cue + 0.3)`.
- **`stack-too-high`**: `lift(2, 95, cue)`, then `flash("#s2-st2-kpRed", red, cue + 0.25, 0.6)` and inset `jam(cue + 0.3)`.
- Between the two, the stack stays where it was put. A small yellow up-arrow `ForceArrows({ tone:"yellow", mode:"along", path:[[540,1190],[540,1150]], count:1, len:40, width:9, at: cue("stack-too-low"), dur: cue("shear-line-glow") + 1.0 − cue("stack-too-low") })` shows the push from below. Use its `svg` inside the cam group.
- **`shear-line-glow`**:
  - `lift(2, 65, cue)` puts the split on the seam.
  - `#s2-seamGlow` goes 0 → 1 (0.25 s), pulses to 0.6 and back (0.6 s), then holds until `B(b05).start − 0.2` and fades (0.3 s).
  - Inset `align(true, cue)`, `flash("yellow", cue + 0.3)`, `turn(25, cue + 0.5)`, `turn(0, cue + 1.4)`, `align(false, cue + 1.8)`.
  - `lift(2, 0)` at `B(b05).start − 0.4` (0.3 s).
- Callout `shear-line`: `{ card:{x:40,y:610}, target:{x:720, y:1010}, at: cue("shear-line-glow") }`.
- Overlays: threat `⚠ ANY STICK LIFTS IT` from the beat start, then step `✓ STEP 2 · SPLIT PIN` at `pin-split` (build default). Meter `[{ t: cue("shear-line-glow") }]` → 35.

#### b05 step 3: springs (32.31 → 39.288)
- **`ghost-flip-pins-stay-out`** (1.5 s):
  - At `cue`, `#s2-lock` rotates 180° about (610, 1000) (`tf({r:180, px:610, py:1000})`, 0.5 s, `power2.inOut`) and lockRed goes 0 → 0.28.
  - At `cue + 0.5`: `lift(2, 120, …, 0.3, "power2.in")`. The pins "fall" into the shell (out of the plug).
  - At `cue + 0.8`: inset `turn(70)`, cam 60, bolt −100 (0.3 s).
  - **Rewind** at `cue + 1.5`: cam, bolt and inset return (0.25 s). `#s2-lock` rotates back to 0 (0.5 s). `lift(2, 0)` at `cue + 2.0` (0.25 s). lockRed → 0.
  - The flip happens inside `#s2-cam`; the inset is not flipped.
- **`springs-push-down`**:
  - Spring 3 (`#s2-sp2`) draws in (opacity 0 → 1 and `scaleY` 0.2 → 1 about y 820, 0.35 s).
  - Then a demo: `lift(2, 60, cue + 0.45, 0.25)` and `lift(2, 0, cue + 0.9, 0.35, "power2.in")` (the spring snaps it back).
  - `ForceArrows({ tone:"yellow", mode:"along", path:[[575,830],[575,950]], count:2, len:44, width:9, at: cue, dur: ctx.beat("b06").start − cue − 0.1 })`, inside the cam.
- Overlays: threat `⚠ UPSIDE DOWN`, then step `✓ STEP 3 · SPRINGS` at `springs-push-down` (default). Meter `[{ t: cue("springs-push-down") }]` → 45.

#### b06 step 4: five heights (39.729 → 46.451)
- **`ghost-one-pin-guessed`** (unplated ghost, 1.5 s):
  - The magpie `hopTo(MP_LOW, cue − 0.4)`.
  - `ghost("s2-twig", …)` is a twig from the beak (175, 1147) to (560, 1130), stroke `var(--wood)` 7 px. It slides in from x −380 at `cue` (0.2 s). lockRed goes 0 → 0.28.
  - Three tries; for each, the twig rotates by `atan(lift/385)` about (175, 1147) at the same time as the lift:
    - `cue + 0.2`: `lift(2, 30)`, then red flash on the driver.
    - `cue + 0.55`: `lift(2, 95)`, then red flash on the key pin.
    - `cue + 0.9`: `lift(2, 65)`, then a seamGlow flash 0 → 1 → 0 (0.4 s).
  - Inset: `jam(cue + 0.3)`, `jam(cue + 0.65)`, `align(true, cue + 0.95)`, `turn(40, cue + 1.0)`.
  - **Rewind** at `cue + 1.45`: `lift(2, 0)`, the twig goes out, inset `turn(0)` and `align(false)`, lockRed → 0. The magpie hops out to x −140 at `cue + 1.5`.
- **`five-stacks-appear`**:
  - Holes 1, 2, 4, 5 grow (as in b03, 0.25 s each). Then stacks 1, 2, 4, 5 drop in from −420 (0.35 s, `power2.in`) with their springs (draw as in b05), staggered 0.15 s in the order 1, 2, 4, 5.
  - Key pins have flat tips (`-kpFlat` visible) until b07.
  - Extend the spring ForceArrows: a second `ForceArrows` for the other 4 springs is not needed. Keep the one arrow set.
- **`key-slides-in`**:
  - The correct key `#s2-key` (opacity 1 at `cue`) runs `ride("#s2-key", [0..4], V, −900, 0, cue, 1.2)`.
  - At `cue + 1.25`: seamGlow 0 → 1 (0.25 s), holding until `B(b07).start` and fading over 0.2 s. Inset `align(true, cue + 1.25)` and `flash("yellow", cue + 1.3)`.
- Callout `key-cuts`: `{ card:{x:40,y:610}, target:{x:420, y:1120}, at: cue("key-slides-in") }`.
- Overlays: step `✓ STEP 4 · FIVE HEIGHTS` (auto, beat start). Gauge "5 PINS" (auto). Meter `[{ t: cue("five-stacks-appear") }]` → 70.

#### b07 step 5: rounded tips (46.892 → 52.709)
- `B(b07).start`:
  - The key withdraws: `ride(…, 0, −900, B(b07).start, 0.5)`. Inset `align(false)`.
  - **Camera push-in**: `#s2-cam` goes `tf()` → `tf({ px:300, py:1060, sx:1.6, sy:1.6 })` (0.6 s, `power2.inOut`). Pin 1 and the key tip fill the left half.
- **`ghost-key-snags`** (1.4 s):
  - At `cue` the key goes ox −900 → −530 (0.45 s, `power1.in`). Then it jolts: −524, −532, −530 (0.2 s total).
  - `flash("#s2-st0-kpRed", red, cue + 0.45, 0.7)`. A red flash on the key tip (`#s2-keyRed` overlay on the key) at the same moment. lockRed 0 → 0.28.
  - **Rewind** at `cue + 1.4`: the key goes to −900 (0.35 s) and lockRed → 0.
- **`tips-round`**: for every stack `-kpFlat` → 0 and `-kpRound` → 1 (0.3 s), staggered 0.06 s. Then a yellow outline pulse on the tips (`-kpY` 0 → 1 → 0, 0.4 s).
- **`key-rides-pins`**: `ride("#s2-key", [0..4], V, −900, 0, cue, 1.3)` (the pins bob over the peaks like speed bumps). Inset `align(true, cue + 1.35)`.
- Camera pull back: `tf(...1.6)` → `tf()` from `B(b07).end + 0.05` (0.4 s), finished before b08.
- Callout `rounded-tip`: `{ card:{x:40,y:610}, target:{x:300, y:1164}, at: cue("tips-round") }`. The target is mapped through the 1.6 zoom: (300, 1060 + 1.6·65).
- Overlays: step `✓ STEP 5 · ROUNDED TIPS` (auto). Meter `[{ t: cue("tips-round") }]` → 75.

#### b08 step 6: spool pins (53.22 → 66.409)
- `B(b08).start`: the key withdraws (`ride` 0 → −900, 0.4 s). Inset `align(false)`.
- **`to-night-tense`**: `lightTween(ctx.world, "day", "tense", cue, 0.8)`. The magpie `hopTo(MP_LOW, cue + 0.2)`. It now holds the wire pick `#s2-pick` (stroke `tint("stone",40)` 4 px, from x −300 to the hook tip at (330, 1140), hook 12 px up). The pick passes "through" the beak because the magpie is drawn over it. Pick opacity 0 → 1 at `cue + 0.4`.
- **`holes-offset-zoom`**:
  - `#s2-cam` goes `tf()` → `tf({px:540, py:1010, sx:1.2, sy:1.2})` (2.5 s, `power1.inOut`).
  - At `cue + 0.2`, each `#s2-up{i}` (shell hole + spring) shifts x by `DX = [10, −12, 14, −10, 8]` (0.6 s, staggered 0.1 s). This exaggerates "holes slightly off".
  - Two dashed centre lines per hole (`var(--snow)` 2 px, dash 8 6, opacity 0.7) show the shell axis and the plug axis apart. They fade in with the shift and fade out at `cue("spool-drivers")`.
- **`ghost-pick-sets-pins`** (1.6 s):
  - Tension tool `ghost("s2-tension", …)`: an L-bar, `tint("stone",20)`, vertical x 150–160 y 1150–1195, horizontal y 1150–1158 to x 300. It slides in at `cue` (0.15 s). The pick group is wrapped in a ghost tint for this span (opacity swap to a ghost copy `#s2-pickG`).
  - Inset `turn(4, cue)`. lockRed 0 → 0.28.
  - Set order `[2, 1, 0, 3, 4]` (pins 3, 2, 1, 4, 5: the biggest offset binds first). Each step k takes 0.25 s from `cue + 0.15 + 0.25k`:
    - The pick moves x so the hook sits under `PX[i]` (0.1 s).
    - Then pick y −`D[i]` with `lift(i, D[i], …, 0.12)`, then pick y back to 0. The stack stays set.
    - A small yellow ring pops at (`PX[i]`, 1010) (r 8 → 20, opacity 1 → 0, 0.25 s) as the "click".
  - At `cue + 1.4`: inset `turn(40)`, cam 60, bolt −50.
  - **Rewind** at `cue + 1.6`: all `lift(i, 0)`, the tools go out, the pick swaps back to normal, inset `turn(0)`, cam and bolt return, lockRed → 0 (0.3 s).
- **`spool-drivers`**: every `-drv` → 0 and `-spool` → 1 (0.35 s, staggered 0.08 s, left to right). Then a yellow outline pulse on the waists.
- **`false-set`** (normal colours, it is the fix working):
  - Before the cue: the tension tool (normal copy `#s2-tension2`) is in at `cue("spool-drivers") + 0.5`. The pick sets pins 1, 2, 4, 5 (`lift` to `D`, 0.12 s each, starting at `cue("spool-drivers") + 0.6`, step 0.15 s).
  - At `cue`: `lift(2, 15)` puts the spool waist across the seam. Inset `turn(12, cue, 0.3)`.
  - At `w(b08,"stops.")`: inset `turn(14, t, 0.08)` then `turn(12, t + 0.08, 0.1)`. `flash("#s2-st2-spoolRed", red, t, 0.5)`.
  - At `w(b08,"fake")`: the magpie head tilts −20° (0.25 s) and back at `B(b08).end + 0.1`.
- Overlays:
  - Threat `⚠ LOCK PICK` from the beat start. Step `✓ STEP 6 · SPOOL PINS` with **`stepAt: cue("spool-drivers")`** (override: otherwise the build default would pick `to-night-tense` and hide the threat plate before the ghost).
  - Meter `[{ t: cue("ghost-pick-sets-pins"), value: 50 }, { t: cue("spool-drivers") }]` → 90.
- Callout `spool`: `{ card:{x:40,y:610}, target:{x:540, y:1028}, at: cue("spool-drivers") + 0.3 }`. The target is mapped through the 1.2 zoom; the stack is not shifted.

#### b09 climax (66.734 → 74.443), light tense → sunset
- `B(b09).start`:
  - All stacks `lift(i, 0)` (0.3 s). Tools out. Inset `turn(0)`.
  - `#s2-up{i}` shift back to 0 (0.4 s). Camera `tf(1.2)` → `tf()` (0.5 s).
- **`wrong-key-blocked`**:
  - The magpie's shiny key `#s2-mkey` (faces `var(--snow)` / `tint("stone",30)`, plus one white-ish glint poly `tint("snow",60)`) uses `V` with `V[3] = 1070`.
  - `ride("#s2-mkey", [0..4], Vwrong, −900, 0, cue − 0.5, 0.8)`. The magpie moves with it: `hopTo(40, cue − 0.5)`, so its beak touches the bow.
  - At `cue + 0.3`: `flash("#s2-st3-kpRed", red, …, 0.7)` and inset `jam`.
  - At `w(b09,"stuck.",1) + 0.4` the key rides out (0.4 s).
- **`pick-blocked`**:
  - The tension tool and pick go in at `cue − 0.2`. Pins 1, 2, 4, 5 are set (0.1 s each from `cue`), then `lift(2, 15)` at `cue + 0.45`. Inset `turn(12, cue + 0.5)`.
  - At `w(b09,"stuck.",2)`: `flash spoolRed`, inset `turn(14)` → `turn(12)` (as in b08).
  - At `+0.3`: everything drops back and the tools go out (0.3 s). Inset `turn(0)`.
- **`right-key-in`**:
  - `lightTween(ctx.world, "tense", "sunset", cue, 1.0)`. The magpie hops out to x −140 (0.4 s).
  - The correct key rides in: `ride("#s2-key", [0..4], V, −900, 0, cue, w(b09,"five") − cue)`. Use a minimum of 0.6 s; if the gap is shorter, start earlier at `w(b09,"five") − 0.6`.
  - At `w(b09,"gaps")`: seamGlow 0 → 1 (0.25 s) and holds to t1. Five yellow ticks (short 24 px lines across each split) pop in. Inset `align(true)` and `flash("yellow")`.
- **`plug-turns-bolt-opens`** at `cue`:
  - Inset `turn(90, cue, 0.4)`. Cam → 60, bolt → −100 (0.4 s, `power2.inOut`). Hold.
  - The click ring `#s2-clickRing` (circle at (875, 1090), `--ui-yellow` 5 px, r 20 → 70, opacity 1 → 0, 0.45 s).
- Overlays: step `✓ ONLY ONE KEY` with **`stepAt: cue("right-key-in")`** (step-only override, §2.1 item 4). Meter `[{ t: cue("plug-turns-bolt-opens") }]` → 100.

### s3 `recap` (b10, 74.664 → 77.384), light `day`
- Backdrop: as in s2, without the shelf.
- The lock is built with `lock({ id:"s3", state:"final" })`: 5 stacks at rest, springs, spools, round tips, seam visible, bolt extended, no key. It sits inside `<g transform="translate(0 −180)">`, so the lock spans y 620–1020.
- Pulses, k = 0..5, at `tk = ctx.t0 + 0.15 + 0.4k`. Each is a yellow outline 0 → 1 → 0.35 (0.3 s), then it stays at 0.35:
  - k0: stack 3 outline (pin)
  - k1: seamGlow (split pin / shear line)
  - k2: all springs (a `--ui-yellow` copy of the spring polylines)
  - k3: all five stacks
  - k4: key-pin tips
  - k5: spool waists
- Extra `recap` (RecapPills, §5) pops the six step plates in sync at the same `tk`.
- Gauge, plates and callouts: none (the beat's `onScreen` is empty). The meter stays (persistent).

### s4 `ending` (b11, 77.384 → 80.808), light `sunset` → `day`
Backdrop and characters:
- Same `houseFront({ id:"s4-house" })`, sky and sun.
- Puppet (`holdKey`) at (860, 1520).
- `#s4-cam` starts at the s1 zoom transform.

Actions:
- `ctx.t0`: `#s4-cam` → `tf()` (1.0 s, `power2.inOut`) pulls back to the door. `lightTween(ctx.world, "sunset", "day", ctx.t0, 1.5)`.
- `w(b11,"build")`:
  - The door panel group `#s4-house-door` goes `tf({px:330, py:1140})` → `tf({px:330, py:1140, sx:0.2})` (0.8 s, `power2.inOut`). The dark interior `shade("earth-3",40)` behind it shows.
  - `magpie({ id:"s4-m", s:1.5 })` hops from (760, 600) to (368, 760) on the top of the open door (0.5 s) at `w(b11,"build") + 0.4`. It holds a bottle cap: circle r 12 at the beak tip (470, 679), `shade("water",10)`, with a crimped edge (12-point star poly `shade("water",30)`).
- `w(b11,"tumbler")`: puppet pose `stand` (0.35 s); the key hides with the pose.
- Label `title`: `{ x: 540, y: 640, at: ctx.t0 + 1.0 }`. Fit: "YALE CYLINDER · 1865" is 30 px wide ≈ 380 px, which is OK at ≤ 360 max width after the kit shrinks it to about 28 px.
- No plate, ghost or meter change.

## 4. Assets

Reused from kit: `sky`, `sun`, `puppet` (changed, see below), `ghost`, `tf`, `poly`, `shade`, `tint`, `prng`, `stage`, `lightTween`, `ForceArrows`, all overlay components.

### 4.1 Lock cut-away (`src/lock.mjs`, video-specific): faces
- Shell: main `shade("stone",22)`. Right 30 % `shade("stone",30)`. Top bevel `tint("stone",5)`. Bottom strip `shade("stone",22)`.
- Plug: main `tint("stone",28)`. Lower facet y 1120–1170 `tint("stone",15)`. Front lip `tint("stone",12)`.
- Keyway: `shade("earth-3",25)`. Holes: `shade("earth-3",35)`.
- Key pin: left half `var(--sand)`, right half `shade("sand",14)`.
  - Rounded variant points (relative to the pin centre, `top` and `tip`): (−18,top), (18,top), (18,tip−14), (10,tip−3), (0,tip), (−10,tip−3), (−18,tip−14).
- Driver: left `tint("stone",8)`, right `shade("stone",6)`.
  - Spool points: (−18,t), (18,t), (18,t+26), (9,t+34), (9,t+66), (18,t+74), (18,t+100), (−18,t+100), (−18,t+74), (−9,t+66), (−9,t+34), (−18,t+26).
- Spring: polyline, 9 zig-zags of ±14 px about `PX`, from y 820 to `DT`. Stroke `var(--snow)` 4 px, round joins.
- Key: blade `tint("stone",45)` with a lower facet `tint("stone",30)`. Bow `tint("stone",38)` with a hole circle `shade("earth-3",30)` r 14.
- Bolt `tint("stone",8)` with top face `tint("stone",25)`. Cam disc `shade("stone",10)`, lobe `shade("stone",18)`.
- Every red/yellow overlay is the same polygon with fill `var(--ui-red)` or stroke `var(--ui-yellow)` 4 px, opacity 0.
- Export: `lock({ id, state: "empty" | "final" })` → `{ svg, ids }` plus the helpers `lift`, `ride`, `flash`, `profileY`, and the constants. The helpers are a factory per scene id, because the state is per scene.

### 4.2 `houseFront` (new: `kit/assets/house.mjs`, export it from `kit/assets/index.mjs`)
`houseFront({ id, groundY = 1520, doorX = 330, doorW = 380, doorTop = 760, lock = { x: 650, y: 1130 } })` → `{ svg, doorId: id+"-door", lockPt }`.
- Wall: x 0–1080, y 330–groundY, `tint("sand",12)`. Right third facet `tint("sand",4)`. Eave strip y 330–370 `shade("earth-2",10)`. Plinth y groundY−80 → groundY `shade("stone",10)`.
- Door frame: x doorX−20 → doorX+doorW+20, y doorTop−20 → groundY, `shade("wood",25)`. Interior opening (behind the door) `shade("earth-3",40)`.
- Door group `${id}-door`:
  - Panel `var(--wood)` with right half facet `shade("wood",10)`.
  - 4 recessed panels `shade("wood",18)`: (doorX+30..+170, doorTop+40..+340), (doorX+210..+350, same), (doorX+30..+170, doorTop+420..+720), (doorX+210..+350, same).
  - Knob circle (lock.x, lock.y+50) r 16 `tint("stone",20)`.
  - Lock face circle at lock r 13 `tint("stone",30)` with keyway slit 3×12 `shade("earth-3",30)`.
- Ground y groundY → 1920 `tint("stone",10)` with 3 slab lines `shade("stone",10)` 3 px.

### 4.3 `magpie` (new: `kit/assets/magpie.mjs`, export it from `kit/assets/index.mjs`)
`magpie({ id, x, y, s = 1, flip = false })` → `{ svg }`.
- Root `<g id>` has `transform="translate(x y)"` (tween with attr). Inner `<g id="${id}-b" transform="scale(±s s)">`. The feet are at (0,0), it faces right, and it is ≈ 95 px tall at s = 1.
- Local polygons (ink = `shade("earth-3",55)`):
  - legs [(−4,0),(2,−24),(8,0)] `shade("earth-3",60)`
  - tail [(−40,−24),(−110,−6),(−112,2),(−30,−12)] `shade("water",35)`, with edge [(−40,−24),(−110,−6),(−96,−12)] ink
  - body [(−40,−24),(−12,−54),(22,−56),(34,−32),(12,−10),(−18,−12)] ink
  - belly [(−6,−14),(14,−12),(32,−32),(22,−46),(0,−30)] `var(--snow)`
  - wing patch [(−30,−30),(−8,−46),(10,−40),(−14,−26)] `tint("snow",10)`
- Head group `${id}-head`, pivot (24,−54). Tilt with `attr transform tf({r, px:24, py:−54})`:
  - head [(22,−56),(38,−68),(52,−58),(42,−44),(30,−44)] ink
  - beak [(48,−60),(68,−54),(48,−50)] `shade("earth-3",65)`
  - eye circle (42,−58) r 2.6 `var(--snow)`
- Beak tip (local) = (68,−54).
- Ground shadow: `groundShadow(0, 0, 56)`.

### 4.4 `egyptInset` (`src/egyptInset.mjs`)
`egyptInset({ id, cx, cy, r, at })` → `{ svg, tl(endAt) }`. Shapes are relative to (cx, cy); clip with a circle r − 6.
- Panel circle r, `var(--panel-bg)`, stroke `var(--ui-white)` 5.
- Housing block (−40..+60, −50..+10) `shade("wood",25)`.
- Bolt plank (−90..+90, +10..+40) `var(--wood)` / lower half `shade("wood",14)`.
- 2 pegs (x −15, +30; w 14; h 40) `tint("wood",18)`. They start inside the housing (y −40..0).
- Wooden key: a stick (−160..−40, +44..+54) with 2 up-pins at x −15, +30 (h 14), `tint("wood",30)`.

Animation:
- Pop at `at` (opacity, scale 0.9 → 1, 0.18 s).
- Pegs drop +30 at `at + 0.2` (0.3 s, `power2.in`).
- The key slides x +120 under the bolt at `at + 1.0` (0.4 s) and lifts the pegs −30 at `at + 1.5` (0.3 s).
- The bolt slides +40 at `at + 1.9` (0.4 s).
- Fade out at `endAt` (0.3 s).

### 4.5 Props (scene-local in `src/lock.mjs`)
- Screwdriver, stick, twig, drill bit, tension tool (ghost + normal copies), wire pick (ghost + normal copies), magpie key, correct key, bottle cap, key fan (s1).
- Shapes and positions are given in §3. All use tokens only.

### 4.6 Puppet change (`kit/assets/puppet.mjs`; record in `KIT_CHANGES.md`)
- Add `key: 0` to `DEFAULT`.
- Add pose `holdKey: { armR: -75, key: 1 }`.
- Inside `armR`, after the shovel, add `<g id="${id}-key" style="opacity:0">`:
  - bow [(−8,70),(8,70),(10,86),(−10,86)] `tint("stone",30)`
  - blade [(−2,86),(4,86),(4,116),(−2,116)] `tint("stone",30)`
  - 2 teeth [(4,96),(9,99),(4,102)], [(4,106),(9,109),(4,112)] `shade("stone",10)`
- Add `["key","key"]` to the opacity loop in `setPose`. The change is backward compatible.

## 5. Components

| Component | Where | Props / use |
| --- | --- | --- |
| StepBadge / ThreatBadge | build.mjs (auto) | from `stepPlate` / `threatPlate`; overrides b08, b09 (§3) |
| Callout | build.mjs (auto) | anchors from scene s2 (b02 plug, b03 pin, b04 shear-line, b06 key-cuts, b07 rounded-tip, b08 spool); all cards at (40, 610) |
| Label | build.mjs (auto) | b03 `egypt` (270, 900, at cue egypt), b11 `title` (540, 640, at t0 + 1.0) |
| Gauge | build.mjs (auto) | b01 "1 KEY OF 1,000s", b06 "5 PINS" (x 48, y 330) |
| StakesMeter | build.mjs (auto) | "SECURITY"; frames from `overlays.meter` (§3) |
| ForceArrows | scene s2 (`svg` inside the cam) | b04 push-up arrow, b05 spring arrows (yellow, `along`) |
| KaraokeCaption | build.mjs | as is |
| Cover | `build.mjs --cover` | headline "WHY ONLY ONE KEY?" |
| **EndInset** (new, `src/endInset.mjs`) | extra `inset` b02 → b09 | see below |
| **RecapPills** (new, `kit/components/RecapPills.mjs`, export it from `kit/components/index.mjs`) | extra `recap` b10 | see below |

**EndInset** `EndInset({ id, cx = 800, cy = 470, r = 125, at, dur })` → `{ html, css, turn(deg, t, d = 0.35), jam(t), pin(t), align(on, t), flash(color, t), ghostTint(t, hold), tl() }`. Calls are made in time order; the component tracks the current angle and pin offset.
- Full-frame clip div (`clipAttrs(at, dur, 2)`) containing an SVG 1080×1920:
  - Panel circle r, `var(--panel-bg)`, stroke `var(--ui-white)` 5.
  - Shell disc r 100 `shade("stone",22)` (the dark facet is the right half: `shade("stone",30)`).
  - Plug group `${id}-plug`, `attr transform tf({r, px:cx, py:cy})`: disc r 62 `tint("stone",28)`, keyway slot rect (cx−9, cy−10, 18×62) `shade("earth-3",25)`.
  - Pin layer (does not rotate), opacity 0 until `pin()`. Driver rect (cx−10, cy−90, 20×40) faces as §4.1. Key pin rect (cx−10, cy−50, 20×24) `var(--sand)`. So at rest the driver crosses the plug edge at r 62.
  - Ghost tint disc r 100 `var(--ui-red)` opacity 0. Ring `${id}-ring` circle r 64, stroke 6, opacity 0.
- `turn(deg)`: the plug rotates to the absolute angle. If |deg| > 6 the key pin fades out (0.1 s) at the start; it fades back in when the angle returns to 0.
- `jam(t)`: angle 0 → 5 (0.12 s) → −2 (0.08 s) → 3 (0.08 s) → 0 (0.12 s), and the ring stroke `--ui-red` 0 → 1 → 0 (0.5 s).
- `align(true)`: both pin rects move y −12 (0.25 s), putting the split on the plug edge. `align(false)` reverses it.
- `flash("yellow" | "red", t)`: ring stroke colour, 0 → 1 → 0 over 0.5 s.
- `ghostTint(t, hold)`: red disc 0 → 0.35 (0.15 s), back to 0 at `t + hold`.
- `pin(t)`: the pin layer fades in (0.25 s).
- Pop in at `at` (opacity 0 → 1, scale 0.9 → 1, 0.18 s); fade out at `at + dur − 0.22`.
- No text.

**RecapPills** `RecapPills({ id, items: [text], x0 = 40, y0 = 1060, colW = 440, rowH = 80, cols = 2, at, step = 0.4, dur })` → `{ html, css, tl, overflow }`.
- Green pills like StepBadge (`--ui-green`, white 900 text, height 60, radius 30), laid out column-major. Item k is at column ⌊k / rows⌋, row k mod rows, with rows = ceil(n / cols). Position: left = x0 + col·(colW + 10), top = y0 + row·rowH.
- Font: `fitFont(text.toUpperCase(), { maxWidth: colW − 40, max: 30, min: 24 })`. `overflow` is true if any item is below 24.
- Item k pops at `at + k·step` and stays to the clip end (`clipAttrs(at, dur, 2)`).
- Items = `ctx.script.beats.filter(b => b.type === "step").map(b => b.onScreen.stepPlate)` (6 strings from the script). Timing = the s3 `tk`: `at = ctx.t0 + 0.15`, `step = 0.4`.

## 6. Timing rules
- Every time is derived from `timings.<lang>.json` through `ctx.cue` / `ctx.word` / beat start/end. Cue words resolve in `build.mjs` (normalised, first occurrence unless `occurrence`). b09 uses `w("b09","stuck.",1|2)`.
- Minimums:
  - Entrances 0.18–0.45 s, exits 0.2–0.35 s.
  - Ghost hold 1.3–1.5 s as listed.
  - Every callout and label is visible ≥ 1.2 s; build.mjs clamps it to `hide − 0.8`.
- **Short-beat rule** (other languages or re-voicing): for any ghost with hold `h` whose next cue (or beat end + 0.3) is at `n`, use `h = clamp(n − cue − 0.45, 0.8, h)`. Scale the internal offsets of that ghost by `h / h_planned`. Rides use `dur = clamp(nextCue − cue − 0.1, 0.6, planned)`.
- Return tweens that would end after the next cue start at `nextCue − dur`. Nothing may overlap the next action on the same element; implement this with a `clampEnd(t, d, limit)` helper in `src/lock.mjs`.
- Scene-wide moves (lightTween, camera) must end before `ctx.t1 − 0.05`.
- The b07 camera pull back starts at `min(B(b07).end + 0.05, B(b08).start − 0.45)`.

## 7. i18n fit
- Plates: kit Pill, max 46 px, min 28 px, max text width 852 px. The longest en, "✓ STEP 5 · ROUNDED TIPS", is ≈ 650 px at 46 px. Uk/ru may shrink to 36 px.
- Callouts: card 560 px wide. Title 1 line, 38 → 26 px (≈ 496 px of text). Subtitle ≤ 2 lines at 28 px. En subtitles are ≤ 41 chars, which fits; keep them ≤ 60 chars in other languages.
- Gauge: ≤ 420 px of text, 40 → 24 px. "1 KEY OF 1,000s" ≈ 420 px at 40 px.
- Labels: 30 → 20 px, max 360 px. "YALE CYLINDER · 1865" fits at about 28 px; uk/ru must stay ≤ 24 chars.
- RecapPills: 30 → 24 px within 400 px. En is ≈ 400 px at 28 px. Uk/ru plate strings over 400 px at 24 px raise the overflow warning: shorten them in the script rather than reducing further.
- Captions: KaraokeCaption auto-fit (≤ 90 % width, 2–4 words).

## 8. Audio
- Voice: `assets/voice.mp3` (from `audio/voice.en.mp3`), track 0, volume 1, from 0 to `durationSec`.
- Music: `audio/music.loop.en.mp3` (already looped, faded in 1 s / out 2 s, ducked −8 dB by `tools/music-loop.mjs`) → `assets/music.mp3`, track −1, volume 0.12 from `config.json`. No extra fades in markup.
- No sound effects (the "click" is visual).

## 9. Commands (run inside `videos/pin-tumbler-lock/`, copied from `TEMPLATE.md`)
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

- Slug = `pin-tumbler-lock`.
- `tools/finish.mjs` lives at the repo root.
- **Cover frame**: use `--at` = `cue("plug-turns-bolt-opens") + 0.5` for that language (en: `--at 74.48`). That frame shows the open lock with five aligned gaps on the glowing seam. The template default (0.5 s into b11) lands mid-pull-back.

## 10. Builder checklist
1. Port the build.mjs extensions (§2.1, items 1–4) from `videos/composite-bow/build.mjs` and add item 4. Write `KIT_CHANGES.md` entries for build.mjs, puppet `holdKey`/key, `houseFront`, `magpie`, `RecapPills`.
2. Add the kit assets `house.mjs` and `magpie.mjs` and the puppet change; add the kit component `RecapPills.mjs`; update the index exports.
3. Write `src/lock.mjs`: geometry constants, `lock()` drawing, `lift`/`ride`/`flash`/`clampEnd` helpers, props.
4. Write `src/endInset.mjs` and `src/egyptInset.mjs`.
5. Write `src/scenes.mjs`: s1 → s4 as in §3, plus `export const extras = [ { id:"inset", from:"b02", to:"b09" }, { id:"recap", from:"b10", to:"b10" } ]`. Return `anchors` with `.at` and `overlays` (stepAt b08/b09, meter frames b02–b09).
6. Run `node build.mjs en` with 0 errors and no "no anchor" warnings, then `npx hyperframes check build/en --json` (fix every error).
7. Snapshot at least: 2.5, 4.0, 7.2, 10.2, 13.8, 17.5, 20.1, 24.0, 27.0, 30.0, 33.6, 37.3, 41.3, 45.9, 48.4, 51.9, 56.9, 59.9, 63.8, 67.9, 69.9, 72.5, 74.4, 76.8, 79.5. Read the frames.
8. Draft render (`out/draft/pin-tumbler-lock.en.mp4`).

## 11. Reviewer focus
1. **Duration**: 80.8 s is within 60–120 s but outside the brief's 100 s ±15 % criterion. Report it so the orchestrator/owner can decide; do not fail the build for it unless the brief rule is applied.
2. **Pin geometry truth**:
   - At rest every driver crosses the seam.
   - With the correct key all five splits sit exactly on y 1010.
   - With the magpie key only pin 4's key pin crosses.
   - The one-piece pin in the b04 ghost is fully above the seam.
3. **Ghost readability**: each ghost (b02 screwdriver, b04 stick, b05 flip, b06 twig, b07 snag, b08 pick) is red-tinted, lasts about 1.3–1.6 s and visibly rewinds before the next fix. The b05 flip returns the lock exactly upright.
4. **Plate timing**: in b08, `⚠ LOCK PICK` stays visible through the pick ghost and `✓ STEP 6` appears at "spools". In b09 the step plate appears at "Your".
5. **Inset agreement**: the end-view plug turns only when the side view is aligned, the pins are out, or a ghost tool is in. It jams when blocked. It never turns during a "stuck" moment except the 12° false set.
6. **Spring scaling**: springs compress and extend with their stack (no detached gaps, no negative scale) during rides, flips and picks; they stay attached during the b08 hole offsets.
7. **Overlap**: callout cards (40, 610) must not cover the inset or the meter. Leaders must hit the right part under the zooms (b07 ×1.6, b08 ×1.2). Nothing readable is in the caption band or right of x 940.
8. **Colour meaning**: key pins brass, drivers/spools steel with a visibly narrow waist, springs light zig-zags. No bright UI colour in the scene except ghost red, glow/arrow yellow and the yellow fan glow in b01.
9. **Recap**: six pills read in order from script text, each pulse matches its part, and the s3 lock does not collide with the pills (lock bottom ≤ 1020, pills from 1060).
10. **Callbacks**: the magpie appears in b01, b06, b08, b09, b11; in b11 it holds a bottle cap on the open door; the door visibly opens on "build".

## Builder notes
- Puppet in s1/s4 at x 980 (not 860) so the key tip reaches the lock after the push-in. Drill start offset -900 (not -520) so it starts off-screen. Snag ghost key stops at ox -558 (key tip touches the flat pin) instead of -530.
- Magpie stays at x 90 from b08 to the right-key cue; the wrong key slides in past it (no hop to x 40). Inset adds `turn(40)` after the key aligns (b06, b07).
- EndInset uses two ring circles (red, yellow) instead of one; its html is the svg only (the `inset` extra supplies the clip).
- `lightTween` output is patched with `immediateRender:false` (otherwise the last preset showed from t=0).
- Callout cards overlap the top of the shell under the b07/b08 zooms (cosmetic).
