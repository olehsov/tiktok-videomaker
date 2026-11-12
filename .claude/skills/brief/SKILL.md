---
name: brief
description: Create the video folder for a chosen topic and have the brief-writer agent produce BRIEF.md and script.<lang>.json files. Use right after the owner picks a topic, or to add a language to an existing video.
argument-hint: "<topic or slug> [uk] [ru]"
---

# Brief a video

Arguments: `$ARGUMENTS` → first token(s) = topic name or slug, trailing tokens in {uk, ru} = extra languages. `en` is always included.

Logging (orchestrator only; skip the run-log lines when `/generate` or another command already wraps this): `node tools/log.mjs --run brief <slug|-> start "<args>"`; per-video: `node tools/log.mjs <slug> brief start|done|error "<details>"`; end: `node tools/log.mjs --run brief <slug> <result> ""` (the tool adds the duration).

## Steps
1. **Resolve** the topic in `topics.md` (by name, slug or number from the last batch). Slug = lowercase ASCII with hyphens. If the topic is not in `topics.md`, add it with status `selected`.
2. **Template check:** `videos/_template/` must exist. If not → stop and tell the owner to run `BOOTSTRAP_PROMPT.md` first.
3. **Folder:**
   - New video: `cp -r videos/_template videos/<slug>`, then remove any `build/`, `out/`, `audio/` copied from the template. Write `STATUS` = `selected`.
   - Existing video with `BRIEF.md` and owner change notes (from `/generate`'s production gate): **revise mode** — apply the notes to `BRIEF.md` and every script, keep beat ids stable where possible, validate.
   - Existing video with `BRIEF.md` otherwise: **add-language mode** — only the missing `script.<lang>.json` / `voiceover.<lang>.txt` are written; nothing else changes.
4. **Delegate** to the `brief-writer` agent. The delegation message must contain:
   - slug, topic name, the topic's Link from `topics.md` (if any), languages, today's date, mode (new | add-language | revise);
   - absolute paths of the video folder and `docs/`;
   - "Do not ask questions. Make reasonable choices and record them in BRIEF.md under 'Decisions'."
   - "Run `node tools/validate.mjs <slug>` before finishing and fix every error."
5. **Verify:** run `node tools/validate.mjs <slug>`. If it fails, send the errors back to `brief-writer` once. If it still fails, stop and show the errors.
6. **Status:** `topics.md` row → `briefed` + languages; `STATUS` → `briefed`.
7. **Commit:** `git add -A videos/<slug> topics.md && git commit -m "<slug>: brief"` (skip silently if not a git repo).
8. **Report** to the owner in ≤ 6 lines: title, target duration, number of steps and threats, languages, word count per language, and the next command: `/produce <slug>`.
