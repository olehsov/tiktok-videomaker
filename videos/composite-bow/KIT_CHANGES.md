# Kit changes (composite-bow)

| File | Change | Reason |
| --- | --- | --- |
| `build.mjs` | Anchor `at` (absolute s) for callouts and labels, clamped to `[beat start, hide - 0.8]` | Overlays must appear at the narrated word, not at beat start |
| `build.mjs` | Label anchors pass `maxWidth` / `max` to `Label` | Long title label stays at 42 px |
| `build.mjs` | `render()` may return `overlays: { [beatId]: { stepAt, meter: [{t, value?}] } }`; meter frames are sorted by `t` | Step plate and BOW POWER keyframes at cues, several frames per beat |
| `build.mjs` | `export const extras = [{ id, from, to, render(ctx) }]` in `src/scenes.mjs` -> clip `ex-<id>`, track 2, z 4, `from` start to next beat start - 0.1; ctx.t1 = that end; ids `ex-<id>-…` | Persistent multi-beat inset |
| `kit/components/Callout.mjs` | `Label` takes `maxWidth`, `max`, `min` (defaults keep old behaviour) | See above |
| `kit/components/ForceArrows.mjs` | NEW: squeeze / stretch / along arrows along a polyline (blue / heat / yellow), `svg` + `html`, finite loops | Show compression / tension on a part |
| `kit/components/LayerInset.mjs` | NEW: cross-section disc gaining layers; `add`, `ghost(slip|peel)`, `pulse` | Layered-build explainers |
| `kit/assets/horse.mjs` | NEW: side-view horse, poses stand/graze/grazeBob/toss, action gallop, `SEAT`; legs are 200 px (pivot y -200) so they overlap the barrel | Riders, steppe scenes |
| `kit/assets/marmot.mjs` | NEW: marmot, `moveTo`, `sitUp`, `crouch`, `dive` | Callback character |
| `kit/assets/puppet.mjs` | POSES `ride`, `rideHold`, `rideDraw` | Mounted archer |
| `kit/lowpoly.mjs` | NEW `tf({x,y,r,px,py,sx,sy})`: constant-structure SVG transform string for `attr:{transform}` tweens | Robust SVG rotate/scale about a pivot without GSAP origin surprises |
| `kit/assets/index.mjs`, `kit/components/index.mjs` | exports for the above | |

## Round 1 fixes
| File | Change | Reason |
| --- | --- | --- |
| `kit/components/Callout.mjs` | Card width 640; title min 34 / max 44; subtitle 36 (min 34); `Label` default max 36 / min 34 / maxWidth 520 | No on-screen text under ~34 px at 1080 width |
| `kit/components/StakesMeter.mjs` | Label size 36 (min 34) | Same |
| `kit/assets/horse.mjs` | Redrawn: rounded barrel, haunch/shoulder facets, knees, thicker legs, mane, muzzle, blanket; shadow centred under the hooves | Crude horse; floating shadow |
| `kit/assets/puppet.mjs` | `shadow` option (default true); riders pass `shadow:false` | Rider's own shadow floated in the air |
| `src/bow.mjs` | Plain self bow limb thickness 7 -> 10 | Thin longbow |
| `kit/components/Callout.mjs`, `build.mjs` | Callout accepts optional `width` (anchor `width` passes through) | Narrow card that clears the labelled part (SIYAH, b09) |
| `kit/components/LayerInset.mjs` | Removed the decorative head glyph drawn left of the inset disc | Read as a stray floating head/hat fragment (round 2 #1) |
| `src/scenes.mjs` | b10 sun moved to (160,690), r 50; marmot hop 110 px, "!" above it for 0.8 s | Round 2 #3, #4 |
