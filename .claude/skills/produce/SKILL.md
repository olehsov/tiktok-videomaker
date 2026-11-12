---
name: produce
description: Produce a briefed video end to end — voice, plan, build, automatic review, owner preview, final render, cover and post text. Owner-invoked only because it spends TTS credits.
argument-hint: "<slug> [en] [uk] [ru] [--revoice]"
disable-model-invocation: true
---

# Produce a video

Arguments: `$ARGUMENTS` → slug, optional languages (default: every `script.<lang>.json` in the folder), optional `--revoice`.
You are the orchestrator: run tools, delegate to agents, check their files, talk to the owner. Do not write scenes yourself.
Read `docs/ARCHITECTURE.md` §4–§10 once at the start.

## 0. Preflight
- `videos/<slug>/BRIEF.md` and `script.en.json` exist; `node tools/validate.mjs <slug>` passes.
- `node -v` ≥ 22, `ffmpeg -version`, `ffprobe -version` work; the HyperFrames skill is available.
- Any failure → stop with one clear message saying what to fix.

## 1. Voice and music (per language)
For each language `L`:
- `audio/voice.L.source.mp3` exists, or `audio/voice.L.mp3` exists without `audio/voice.L.alignment.json` → owner-provided audio → `node tools/timings-from-silence.mjs <slug> L`.
- `timings.L.json` has `"source": "fake"`, or `--revoice` was given → `node --env-file=.env tools/tts.mjs <slug> L --force`.
- Otherwise → `node --env-file=.env tools/tts.mjs <slug> L` (re-uses saved audio when the text has not changed; never spends credits twice).
- If `.env` is missing and there is no audio → stop: "Add ELEVENLABS_API_KEY to .env, or put voice.L.mp3 into videos/<slug>/audio/, then run /produce again."
- Then `node tools/music-loop.mjs <slug> L` (does nothing when there is no music file).
- Then `node tools/validate.mjs <slug>`. If a video is longer than 120 s → stop and list the 2–3 longest beats as cut candidates.
Status → `voiced`.

## 2. Plan
If `PLAN.md` is missing, or `BRIEF.md`/any script is newer than `PLAN.md` → delegate to `video-architect` (mode: new). Message: slug, languages, folder path, "Do not ask questions; write PLAN.md and return a 5-line summary."
Status → `planned`. No owner approval at this step.

## 3. Build
Delegate to `video-builder` (mode: build): implement `PLAN.md`, render the `en` draft to `out/draft/<slug>.en.mp4`.
Status → `built`.

## 4. Automatic review (max `config.review.maxAutoFixLoops`, default 2)
Loop:
1. Delegate to `video-reviewer` (round N): writes `REVIEW.md`, returns PASS or FAIL + issue count.
2. FAIL → delegate to `video-builder` (mode: fix, source: REVIEW.md round N), which re-renders the draft.
Stop after PASS or after the loop limit.

## 5. Owner preview gate
Show: draft path (`videos/<slug>/out/draft/<slug>.en.mp4`), live preview command from `PLAN.md`, the reviewer verdict and any open issues (one line each).
Ask with AskUserQuestion: **Approve** / **Request changes** (the owner writes the changes in the free-text answer).
- Changes → classify each:
  - small (text, position, color, speed, timing inside a beat) → `video-builder` (mode: fix, source: owner notes);
  - structural (add/remove/reorder scenes, change composition or concept) → `video-architect` (mode: revise) then `video-builder` (mode: fix).
  Then one `video-reviewer` round, then this gate again.
- Approve → status `approved`.

## 6. Final
- Refuse to finalise any language whose `timings.L.json` source is `fake`.
- Delegate to `video-builder` (mode: final, languages): renders `out/<slug>.L.mp4`, `out/cover.L.png`, `out/post.L.txt` for every language.
- Verify each MP4 with ffprobe: 1080×1920, ~30 fps, has audio, duration 60–120 s. Fix via builder if not.
- Status → `rendered` in `topics.md` and `STATUS`. Commit `"<slug>: rendered"` (renders and audio are git-ignored).
- Report: output paths per language, final durations, and — if `KIT_CHANGES.md` is not empty — suggest `/promote <slug>`.
