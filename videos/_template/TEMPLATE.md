# Video template

Copied by `/brief` into `videos/<slug>/`. It is the output of `npx hyperframes init` (pinned CLI `hyperframes@0.9.36`,
portrait 1080×1920) plus the shared kit and the data → composition builder.

## Structure

```
index.html  hyperframes.json  meta.json  package.json  AGENTS.md  CLAUDE.md   # from `hyperframes init` (kept as is; index.html is
                                                                             # a placeholder — the real composition is generated)
build.mjs                 # data → build/<lang>/index.html (the only thing HyperFrames renders)
kit/                      # shared kit (see kit/README.md): tokens.css, components/, assets/, lighting.mjs, measure.mjs …
src/scenes.mjs            # THIS video's scenes (the builder writes it, from PLAN.md)
showcase/                 # kit demo (script + fixture timings + scenes). Render: see below. Safe to delete in a video.
script.<lang>.json  timings.<lang>.json  audio/  BRIEF.md  PLAN.md  …       # per docs/ARCHITECTURE.md §4
build/<lang>/             # generated, git-ignored
out/draft/  out/          # renders, git-ignored
```

The generated composition is **one** `index.html` with one paused GSAP timeline registered as `window.__timelines["main"]`
(scenes, overlays and captions are timed clips inside it). `hyperframes check` reports structural *warnings*
(`nested_structure_needs_subcomposition`, `timeline_track_too_dense`) for this layout; they are expected. Fix every *error*.

## Commands (run inside `videos/<slug>/`)

| Job | Command |
| --- | --- |
| Build a language | `node build.mjs <lang>` → `build/<lang>/` |
| Silent build (no voice file yet) | `node build.mjs <lang> --no-voice` |
| Check | `npx hyperframes check build/<lang> --json` |
| Look at frames | `npx hyperframes snapshot build/<lang> --at 3,10.5 --no-end -o review/frames` |
| Live preview | `npx hyperframes preview build/<lang> --background` (stop: `npx hyperframes preview build/<lang> --stop`) |
| Draft render | `npx hyperframes render build/en -o out/draft/<slug>.en.mp4 --quality draft` |
| Final render | `npx hyperframes render build/<lang> -o out/<slug>.<lang>.mp4 --quality delivery` |
| Partial render | add `--start 0 --end 15` |
| Cover | `node build.mjs <lang> --cover [--at <sec>]` → `out/cover.<lang>.png` (builds `build/<lang>-cover/` and snapshots it; default frame = 0.5 s into the last beat) |
| Kit showcase | `node build.mjs en --root showcase --no-voice && npx hyperframes render showcase/build/en -o out/showcase.mp4 --quality draft` |

`build.mjs <lang> [--root <dir>] [--out <dir>] [--no-voice] [--cover [--at <sec>]]`. Post text is not built by `build.mjs`:
`out/post.<lang>.txt` = `post.description`, blank line, hashtags on one line.

## What `build.mjs` does

1. Reads `script.<lang>.json`, `timings.<lang>.json`, `src/scenes.mjs`. Beat ids must match; `source: "fake"` warns.
2. **Cue resolution.** For each `cues[]` entry of a beat, the cue word (or phrase) is matched against that beat's timed words
   (lower-cased, edge punctuation stripped, Unicode NFC; phrases match consecutive words) and the Nth `occurrence` gives the
   start time in seconds. A cue that cannot be found fails the build with beat id and word. So cues follow the voice in every language.
3. **Scenes** → one full-frame clip each. A scene covers one or more consecutive beats (all beats must be covered, in order);
   it starts at its first beat's start (the first scene at 0) and ends where the next begins (the last at the video end).
4. **Overlays** are generated from `onScreen` — scenes do not draw them:
   - `stepPlate` / `threatPlate`: pill at beat start. If a beat has both, the threat plate shows first and the step plate
     appears at the first cue whose action does not start with `ghost` (else the beat middle).
   - `callouts[]`: appear at the cue `callout-<id>` if the script has it, else at beat start + 0.35 s (+0.4 s each).
   - `labels[]`, `gauge` (top-left, y 330), `meter` (top-left, y 470; one persistent meter per label, fill animates per beat).
   - Overlays stay until just before the next beat.
5. **Captions**: karaoke groups of 2–4 words from the word timings, `keywords[]` colors, numbers yellow, font auto-fit.
6. Writes `build/<lang>/index.html`, copies `audio/voice.<lang>.mp3` → `assets/voice.mp3` and `audio/music.loop.<lang>.mp3`
   → `assets/music.mp3` (volume from `config.json → music.volume`). Total length = `videoDurationSec` from timings.

## Scene contract (`src/scenes.mjs`)

```js
import { stage, sky, terrain, puppet, pit, lightTween /* … */ } from "../kit/index.mjs";
export default [
  {
    id: "s1",                 // unique; element ids should be built with ctx.id("name")
    beats: ["b01", "b02"],    // consecutive beat ids
    light: "day",             // initial lighting preset: day | night | tense | sunset
    render(ctx) {
      // ctx: lang, script, timings, t0, t1, dur (absolute seconds), beats[], world (selector of this scene's root),
      //      id(name), beat(id), cue(action) → seconds (throws if missing), cueOpt(action) → seconds|null,
      //      word(beatId, text, n=1) → seconds
      return {
        html: stage(/* SVG fragments */),   // + any extra HTML (e.g. FlowArrows html)
        tl: "tl.fromTo(…)",                 // GSAP code; `tl` is the single timeline, times are ABSOLUTE seconds
        css: "",                            // optional extra CSS
        anchors: { soil: { card: { x: 360, y: 600 }, target: { x: 575, y: 1075 } },  // callout id → card top-left + leader target
                   "pool-depth": { x: 540, y: 900 } },                               // label id → center point
      };
    },
  },
];
```

Rules: no `Math.random` / `Date.now` (use `prng` from the kit); use `fromTo` (with `immediateRender:false` for later tweens
of the same target); animate transforms/opacity, not `left/top/width/height`; SVG rotation of limbs goes through the SVG `transform`
attribute (`attr`), as the puppet does. Anything visible must trace back to `script.<lang>.json` or to art in `kit/`.

## Layout rules the checks enforce

- Canvas 1080×1920. Key text out of the top 150 px, bottom 400 px, right 140 px. Plates at 12 %, captions at 70 % height.
- Keep callout cards **out of the caption band** (y ≈ 1230–1460) and the corner gauge/meter area (x < 430, y 330–560).
- Text sizes come from `kit/measure.mjs` (conservative width estimates, no browser needed). The builder warns when text
  cannot fit at the minimum size: shorten the script string instead of overflowing.
- Min readable text 28 px; every line stays on screen long enough to read (`check` craft warning `line_unread`).

## Known notes

- The CLI is pinned in `package.json`; GSAP loads from jsDelivr (same as `hyperframes init`), Inter/Montserrat are resolved by the compiler.
- Upcoming caption words are grey on purpose (style guide); `check` may report a low-contrast *warning* for them.
- `build/<lang>/` contains a `.hyperframes/` report folder after `check`; it is git-ignored.
