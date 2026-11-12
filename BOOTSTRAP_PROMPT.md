# Bootstrap prompt (paste into Claude Code once, from the repo root)

Use `/model opus` for this one-time setup.

---

Set up this repository so the video workflow in `CLAUDE.md` works end to end. Read `CLAUDE.md`,
`docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/style-guide.md`, `docs/tech-requirements.md` first —
they are the spec. Do not change the docs, skills or agents unless something in them is impossible;
if so, explain why and propose the smallest change.

1. **Prerequisites.** Check `node -v` (≥ 22), `ffmpeg -version`, `ffprobe -version`, `git --version`.
   If the folder is not a git repo, `git init`. Check that the HyperFrames skill (`/hyperframes`) is
   available; if not, stop and tell me to run the plugin install commands from README.md.
2. **Template.** Read the HyperFrames skill, then create the project with `npx hyperframes init`
   into `videos/_template` (check `npx hyperframes init --help` for the exact syntax). Keep the
   generated files. Document the generated structure in `videos/_template/TEMPLATE.md`.
3. **Kit** inside `videos/_template/kit/`, following `docs/style-guide.md`:
   - `tokens.css` — every palette token and typography variable from the style guide;
   - components: `StepBadge`, `ThreatBadge`, `Callout` (dashed leader line to a target point), `Gauge`,
     `FlowArrows` (heat / cold / water / load variants), `StakesMeter`, `KaraokeCaption`
     (word-level highlight from timings, keyword colors, auto-fit), `Cover`;
   - low-poly SVG assets: terrain cross-section (3 soil layers), sky (day / night / sunset presets),
     sun, stars, mountains, rocks, pine tree, puppet character (head, torso, arms, legs as separate
     groups; poses: stand, wipe sweat, dig, carry, lift, sleep), water surface, ice block, bucket;
   - a lighting-preset helper (day neutral, night navy, tense navy) per the style guide.
4. **Build pipeline.** `videos/_template/build.mjs <lang>`: reads `script.<lang>.json` +
   `timings.<lang>.json` + `src/` scenes and writes a complete HyperFrames composition to
   `build/<lang>/` (clips with `data-start` / `data-duration` from timings, one GSAP timeline,
   voice track and optional `audio/music.loop.<lang>.mp3`). Implement cue resolution
   (word → time) as described in `docs/ARCHITECTURE.md` §6. Put the exact build, preview, render and
   cover commands in `TEMPLATE.md`.
5. **Kit showcase (style approval, once for the whole series).** In `videos/_template/showcase/` make a
   ~15 s composition with no voice: day scene cross-section with the puppet, a step plate, a callout,
   heat arrows, a threat plate with a failure ghost (a crack), transition to night, stakes meter,
   karaoke caption driven by a small fake timings file. Render it to
   `videos/_template/out/showcase.mp4`, extract 4 frames, look at them, fix obvious problems, then
   show me the video path and ask me to approve the style. Apply my feedback to the kit.
6. **Pipeline smoke test (no credits).** `cp -r videos/_template videos/smoke-test`, copy
   `docs/examples/yakhchal/script.en.json` into it and set `"slug": "smoke-test"`. Run
   `node tools/fake-voice.mjs smoke-test en`, `node tools/validate.mjs smoke-test`, then `node build.mjs en`
   inside the folder with a minimal `src/` (plain plates + captions per beat are enough), and render
   enough to prove the pipeline works (the first ~15 s if the CLI supports a range; otherwise full).
   Confirm captions follow the fake timings. Then delete `videos/smoke-test`.
7. **Commit** `"bootstrap: template, kit, build pipeline"` and give me a 5-line summary plus anything
   that deviates from `docs/ARCHITECTURE.md`.
