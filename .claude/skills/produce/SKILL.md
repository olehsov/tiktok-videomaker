---
name: produce
description: Turn a briefed video into a finished MP4 - voice, plan, build, review, preview, final render, cover, marketing copy and upload file. Owns the production steps that /generate also uses.
argument-hint: "<slug> [langs] [--revoice] [--unattended] [--resume]"
---

# Produce a video

Arguments: `$ARGUMENTS` → slug, optional languages (default: every `script.<lang>.json` in the folder), optional `--revoice`, `--unattended`, `--resume`.
You are the orchestrator: run tools, delegate to agents, check their files, talk to the owner. Do not write scenes yourself.
Read `docs/ARCHITECTURE.md` §4–§10 (**Gates** and **Logging** are binding) once at the start.

This skill is the single home of steps P1–P9. `/generate` runs topic → brief and then **calls this skill** with the Skill tool (it does not copy these steps), so this skill must stay model-invocable (no `disable-model-invocation`).
`/produce` standing alone starts at P1 for a briefed video, or — with `--resume` — at the first unfinished step.

## Gates (config-driven)
Read `config.json → pipeline`. Effective flag = the config flag, or `true` for every **approval gate** when `--unattended` is set for this run
(never write that override into `config.json`; `--unattended` does not touch `publish` or `autoPromoteKit`).
Gates: `production` (autoStartProduction), `plan` (autoApprovePlan), `preview` (autoApprovePreview), `upload` (autoPrepareUpload).
- Effective flag true → log `gate <name> auto` and continue.
- False → ask with AskUserQuestion: **Approve** / **Request changes** (changes = the owner's free-text answer); log `gate <name> owner-approved` or `owner-changes`.
- **Hard rule** (no flag, no `--unattended`): the last review is FAIL after `maxReviewLoops` fix rounds → stop. Write `STATUS` = `needs-owner` (and the `topics.md` row), and `PENDING.md` with a first line `Previous status: <status>` and one paragraph: why it stopped and the open issues. Log `needs-owner`. Report and end.
- Before ending the run or stopping for any reason, wait for any running background agent (async marketing) to finish.

## Logging (orchestrator only — agents never log)
All through `node tools/log.mjs`. Run log: at the start `node tools/log.mjs --run produce <slug> start "<flags>"`; at the end `... --run produce <slug> <final status> ""` (duration added by the tool).
(When called from `/generate`, only `/generate` writes the run-log start/end.) Video log `node tools/log.mjs <slug> <step> <result> "<details>"` for: start and end of every step P1–P9, every gate decision, TTS characters sent per language, review verdict per round, needs-owner, resume, errors with their message, final output paths.

## Resume
With `--resume [<slug>]` (also used by `/generate --resume`): slug omitted → the most recently updated video whose `STATUS` is not `ready` or `rejected` (`ls -t videos/*/STATUS`, ignore `_template`). Log `resume`. Delete a leftover `PENDING.md` that a blocking error (not `needs-owner`) wrote, fix nothing silently: the step that failed runs again. Continue from the first unfinished step; **never redo finished steps** and never spend TTS credits for languages that already have audio (P1 re-uses it). Map STATUS → next step:
`briefed` → production gate/P1 · `voiced` → P2 · `planned` → plan gate then P3 · `built` → P4 (read `REVIEW.md`: latest verdict and fix rounds done) · `approved` → P6 · `rendered` → P7 · `needs-owner` → below. `ready` → nothing to do.
`needs-owner`: show `PENDING.md` and the open issues in `REVIEW.md`, ask **Approve anyway** / **Request changes**. With `--unattended` a needs-owner video is **never** passed automatically: report and stop.
Approve anyway → set STATUS back to `Previous status` (the draft is accepted), continue at the preview gate. Request changes → classify as in P5.

## Preflight
- `videos/<slug>/BRIEF.md` and `script.en.json` exist; `node tools/validate.mjs <slug>` passes.
- `node -v` ≥ 22, `ffmpeg -version`, `ffprobe -version` work; the HyperFrames skill is available.
- Any failure → log `error`, write `PENDING.md` (first line `Previous status: <STATUS>`, then what to fix; STATUS is **not** changed, so `--resume` continues from it and deletes `PENDING.md`), stop with one clear message saying what to fix. The same rule applies to every other blocking error below (missing key, validation, tool failure); an unattended run never waits on a question.

## P1 Voice and music (per language)
For each language `L`:
- `audio/voice.L.source.mp3` exists, or `audio/voice.L.mp3` exists without `audio/voice.L.alignment.json` → owner-provided audio → `node tools/timings-from-silence.mjs <slug> L`.
- `timings.L.json` has `"source": "fake"`, or `--revoice` was given → `node --env-file=.env tools/tts.mjs <slug> L --force`.
- Otherwise → `node --env-file=.env tools/tts.mjs <slug> L` (re-uses saved audio when the text has not changed; never spends credits twice).
- If `.env` is missing and there is no audio → stop: "Add ELEVENLABS_API_KEY to .env, or put voice.L.mp3 into videos/<slug>/audio/, then run /produce again."
- Log the characters sent to TTS per language (`details: "L: <N> chars"`; 0 when audio was re-used).
- Then `node tools/music-loop.mjs <slug> L` (does nothing when there is no music file).
- Then `node tools/validate.mjs <slug>`. If a video is longer than 120 s:
  - manual run → stop and list the 2–3 longest beats as cut candidates;
  - `--unattended` and `pipeline.autoTrimOverlong` true (default) → trim automatically **once**: delegate to `brief-writer` (revise mode: cut the longest beats by about the overshoot plus 5 %, keep cues and keywords valid, validate), then redo P1 for the affected languages (**this spends ElevenLabs credits a second time** — log the characters of both runs); still > 120 s → hard stop below;
  - `--unattended` and `autoTrimOverlong` false → no trim: hard stop;
  - hard stop = `STATUS` `needs-owner` (and the `topics.md` row), `PENDING.md` (first line `Previous status: voiced`, the measured duration and the 2–3 longest beats), log `needs-owner`, report and end.
Status → `voiced`.

## P2 Plan
If `PLAN.md` is missing, or `BRIEF.md`/any script is newer than `PLAN.md` → delegate to `video-architect` (mode: new). Message: slug, languages, folder path, "Do not ask questions; write PLAN.md and return a 5-line summary." (The architect has no shell: it takes commands from `videos/_template/TEMPLATE.md`.)
Status → `planned`. **Plan gate.** Request changes → `video-architect` (mode: revise) with the notes, then the gate again.

## P3 Build
Delegate to `video-builder` (mode: build): implement `PLAN.md`, render the `en` draft to `out/draft/<slug>.en.mp4`.
Status → `built`.

## P4 Automatic review (max `pipeline.maxReviewLoops` fix rounds)
The reviewer always runs at least once. Loop: `video-reviewer` (round N) → writes `REVIEW.md`, returns PASS or FAIL + issue count; log the verdict.
FAIL and fix rounds used < `maxReviewLoops` → `video-builder` (mode: fix, source: REVIEW.md round N, re-renders the draft), then the next review round.
Last verdict FAIL with no fix rounds left → **hard rule** (needs-owner, stop).

## P5 Preview gate (only reached with last review = PASS)
Show: draft path, live preview command from `PLAN.md`, the reviewer verdict and any open minor issues (one line each).
- `autoApprovePreview` (or `--unattended`) true → continue; otherwise ask **Approve** / **Request changes**.
- Changes → classify each:
  - small (text, position, color, speed, timing inside a beat) → `video-builder` (mode: fix, source: owner notes);
  - structural (add/remove/reorder scenes, change composition or concept) → `video-architect` (mode: revise) then `video-builder` (mode: fix).
  Then one `video-reviewer` round (FAIL after that → hard rule), then this gate again.
- Approve → status `approved`.

## P6 Final render
- Refuse to finalise any language whose `timings.L.json` source is `fake`.
- Delegate to `video-builder` (mode: final, languages): renders `out/<slug>.L.mp4` and `out/cover.L.png` for every language (no post text; marketing replaces it).
- **Finishing** (look: sharpen / grain / vignette, CRF, x264 tune): for each language run `node tools/finish.mjs videos/<slug>/out/<slug>.L.mp4` and `node tools/finish.mjs videos/<slug>/out/cover.L.png` (once per render; drafts are never finished). Log it.
- Verify each MP4 with ffprobe: 1080×1920, ~30 fps, has audio, duration 60–120 s. Fix via builder if not.
- Status → `rendered`. Commit `"<slug>: rendered"` (renders, audio and logs are git-ignored).

## P7 Marketing
Per language: `node tools/script-hash.mjs <slug> L`. If `marketing.L.json` exists with this hash → skip.
- If the marketing-writer is already running (async, started by `/generate` right after the brief) → wait for it.
- Otherwise delegate to `marketing-writer`: slug, languages, folder path, the hash per language, `config.marketing.alsoShortsAndReels`, "Do not ask questions; write `marketing.<lang>.json` and `MARKETING.md`." Then `node tools/validate.mjs <slug>`; errors go back to the writer once.

## P8 Upload preparation
**Upload gate** (`autoPrepareUpload`). Request changes → `marketing-writer` with the notes (new hashes), then the gate again.
For every language: `node tools/prepare-upload.mjs <slug> L`. Exit code 3 (stale marketing) → recompute the hash, rerun `marketing-writer` **once**, run `prepare-upload` again; still failing → error, stop. Then `node tools/validate.mjs <slug>`.

## P9 Publish stub and finish
For every language `node tools/publish-tiktok.mjs <slug> L` (with `publish: "off"` it only says the upload file is ready). Status → `ready` (`STATUS`, `topics.md`). Commit `"<slug>: ready"`.
Kit: if `pipeline.autoPromoteKit` is true → read `.claude/skills/promote/SKILL.md` and follow its **Auto mode** for `<slug>` (shared instructions; the `promote` skill itself stays owner-only and is not invoked); otherwise, if `KIT_CHANGES.md` is not empty, suggest `/promote <slug>`.
Report: output paths per language (`mp4`, `cover`, `upload.<lang>.json`, `MARKETING.md`), final durations, open minor issues. Wait for background agents, then write the run-log end line.
