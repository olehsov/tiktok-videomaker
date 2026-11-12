---
name: style-preview
description: Tune the visual style on still frames. Renders the style specimen (day, night, tense) for the current or overridden look values, compares it with the previous preview, and can apply values to config.json. No video is rendered.
argument-hint: "[key=value ...] [key=v1,v2,v3] [--neutral] [--apply] [--guides]"
disable-model-invocation: true
---

# Style preview

Arguments: `$ARGUMENTS` — `key=value` temporary look overrides (e.g. `saturation=1.2 depthFade=0.5`), one `key=v1,v2,v3` for a comparison grid,
`--neutral` (baseline: all look values neutral = the original palette), `--apply` (write the overrides into `config.json → look`), `--guides` (draw safe-zone guides).
Keys, ranges and defaults: `docs/style-guide.md` → "Look parameters". Everything runs through `tools/style-preview.mjs`; you only orchestrate.

## Steps
1. Log the start: `node tools/log.mjs --run style-preview - start "$ARGUMENTS"`.
2. Run `node tools/style-preview.mjs $ARGUMENTS` (≈ 20 s per preview; a grid renders one preview per value). The tool:
   - generates a temporary tokens file with `tools/apply-look.mjs` logic (`config.json` is never edited without `--apply`),
   - builds the specimen `videos/_template/style/specimen/` and takes HyperFrames snapshots at 2 s / 6 s / 10 s (day / night / tense),
   - applies the final-render finishing (sharpen, grain, vignette) to the stills the same way `tools/finish.mjs` does for videos,
   - saves `videos/_template/style/previews/<YYYY-MM-DD_HHMM>/` with `day.png`, `night.png`, `tense.png`, `look.json`, and `compare.png`
     (previous preview left, this one right) — or `grid.png` (one column per value, day + night rows) for `key=v1,v2,v3`.
   A failure (build, snapshot, ffmpeg) → log `error` with the message and stop.
3. **Show the images** with Read: `compare.png` (or `grid.png`) first, then `day.png` / `night.png` / `tense.png` when there is no comparison.
   Check and say in one line each: white caption words readable on all three states, snow still distinct from white (callout card, `ui-white` chip), UI colours unchanged.
4. `--apply`: the tool already wrote `config.json → look` and regenerated `videos/_template/kit/tokens.css`. Commit
   `git add config.json videos/_template/kit/tokens.css && git commit -m "style: look <changed keys>"` (keys from the tool's `applied` list; nothing to commit → say so).
   Existing videos keep their own copy of `kit/` and are not changed.
5. Log the end: `node tools/log.mjs --run style-preview - ok "<look summary>"` (or `error`).
6. Finish with one line: what changed versus the previous preview (the tool's `summary`), and the preview folder path.

## Notes
- Previews are git-ignored. Run `/style-preview --neutral` once to get the original palette as the baseline for the next comparison.
- The look only reaches videos through `kit/tokens.css`; to restyle an existing video, copy the new `kit/tokens.css` into it (owner decision, not automatic).
