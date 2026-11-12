# Kit

Import everything with `import * as kit from "../kit/index.mjs"` (or named imports). All functions run at **build time**
(Node) and return strings: SVG/HTML, CSS and GSAP code. Style source of truth: `docs/style-guide.md`.

## Tokens and helpers
- `tokens.css` — every palette token, UI color, typography and safe-zone variable (inlined into every build).
- `lighting.mjs` — `lightingStyle(preset)`, `lightTween(sel, from, to, at, dur)`; presets `day` (neutral), `night` (navy, scene colors −35 % + blue),
  `tense`, `sunset`. They override palette variables on a scene's world, so the whole diorama recolors.
- `lowpoly.mjs` — `poly`, `shade(token, %)`, `tint(token, %)`, `prng(seed)`, `stage(svg)`, `ghost(id, svg)` (desaturated red-tinted failure ghost, starts hidden).
- `measure.mjs` — `textWidth`, `fitFont`, `fitLines` (deterministic text fitting for EN/UK/RU). `layout.mjs` — canvas and safe-zone numbers.

## Components (overlays) — each returns `{ html, css, tl }`
| Component | Props |
| --- | --- |
| `StepBadge` / `ThreatBadge` | `{ id, text, at, dur }` — green `✓ STEP N · NAME` / red `⚠ NAME` pill, pop 0.9→1 in 180 ms |
| `Callout` | `{ id, title, subtitle, card:{x,y}, target:{x,y}, at, dur }` — white card, yellow bar, dashed leader to a dot; title 1 line, subtitle ≤ 2 lines |
| `Label` | `{ id, text, x, y, at, dur }` — small in-scene tag |
| `Gauge` | `{ id, text, x, y, level, tone:'heat'\|'cold', at, dur }` — thermometer + value |
| `StakesMeter` | `{ id, label, x, y, w, keyframes:[{t,value}], at, dur, tone }` — bar that animates to each value |
| `FlowArrows` | `{ id, kind:'heat'\|'cold'\|'water'\|'load', x, y, w, h, count, dir, points, at, dur }` — heat wavy/rising, cold straight/sinking, load yellow (`dir` up/down/left/right), water dashed along `points` |
| `KaraokeCaption` | `{ beats:[{words, keywords}], lang, endAt }` — used by `build.mjs` |
| `Cover` | `{ headline, lang, start, dur }` — used by `build.mjs --cover` |

`build.mjs` creates plates, callouts, labels, gauge, meter and captions from the script automatically; scenes normally only use assets,
`FlowArrows`, `lightTween`, `ghost`.

## Assets (low-poly SVG generators, palette tokens only)
`terrain` (cut-away, 3 soil layers) · `sky` · `sun` (also `kind:"moon"`) · `stars` · `mountains` · `rocks` · `pineTree` ·
`waterSurface` · `iceBlock` · `bucket` · `pit` (a hole that deepens per dig stroke + spoil mound + flying clods) ·
`puppet` (head/torso/arms/legs as separate groups).

Puppet: `const p = puppet({ id, x, y, s, flip })`; then in time order `p.pose(name, at, dur)`, `p.act(name, at, dur, period)` (looping
actions), `p.move(x, y, at, dur)`; `p.svg`, `p.tl()`. Poses: `stand wipeSweat dig carry lift sleep sleepLeft`; actions: `wipeSweat dig carry`.

Interaction detail rule (owner feedback): when a character acts on the world, show the effect — `pit` for digging (hole grows, clods fly,
mound rises), and keep earlier results in later scenes (`pit({ static: true })`).
