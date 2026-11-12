# PRD — TikTok Videomaker

## 1. Goal

A Claude Code project that turns a chosen topic into a finished, upload-ready TikTok
explainer video with minimal owner effort. The owner's work is limited to:

1. picking a topic from a proposed list,
2. running the next command,
3. approving (or commenting on) the final preview.

## 2. Content concept

Short explainers (60–120 s) about simple inventions, tools and survival builds — an igloo,
a katana, a sled, a yakhchal, a dugout shelter. The video shows how the thing is built, step by
step, and **why every design detail exists**: what problem forced it, what would break without
it, and how the solution fixes it. The message to the viewer: complex things are a chain of
simple, logical decisions — they are achievable.

Every video ends with the line: **"Now you know how to build a/an <thing>."** (localised).

## 3. Users

- **Owner** — one person, runs Claude Code in this repo, uploads results to TikTok manually.
- **Viewer** — average TikTok user; no special knowledge; watches on a phone with sound.

## 4. Functional requirements

### FR-1 Topic proposal (`/topics`)
- Propose exactly 10 topics per run.
- Each topic: name, category, one-line hook, the 3–5 problems the design solves, suggested duration (60/90/120 s).
- Topics must be new: not present in `topics.md` with any status except `proposed`.
- Never propose a topic with status `rejected`.
- Variety: max 2 topics per category in one batch (categories in `docs/storytelling.md`).
- Record every proposed topic in `topics.md` (status `proposed`).
- When the owner picks a topic → status `selected`. When the owner explicitly rejects topics → `rejected`.

### FR-2 Brief (`/brief <topic> [langs]`)
- Create `videos/<slug>/` as a copy of `videos/_template/`.
- Research facts on the web; every number and historical claim has a source link.
- Write `BRIEF.md` following `docs/brief-template.md` (English only).
- Write `script.en.json` plus `script.<lang>.json` for each extra language, following `docs/script.schema.json`.
- Write `voiceover.<lang>.txt` (plain narration, for manual TTS if ever needed).
- Write post text: description + hashtags per language (inside the script file).
- Choose the target duration 60–120 s based on how many steps the topic needs.
- Topic status → `briefed`.

### FR-3 Production (`/produce <slug> [langs]`)
- Generate voice per language via ElevenLabs API with character timestamps, unless `audio/voice.<lang>.mp3` already exists.
- Derive `timings.<lang>.json` (beat and word level). Fallback without API: silence detection.
- Optional music: if `assets/music.*` exists, loop it under the voice at low volume for every video.
- `video-architect` writes `PLAN.md` (no owner approval needed).
- `video-builder` implements the plan in HyperFrames, data-driven per language.
- `video-reviewer` renders a draft, inspects frames against the acceptance criteria, reports issues; builder fixes. Max 2 automatic loops.
- Owner reviews the draft and approves or lists changes. Small changes → builder; structural changes → architect, then builder.
- Final render per language → `out/<slug>.<lang>.mp4`, cover `out/cover.<lang>.png`, `out/post.<lang>.txt`.
- Topic status → `rendered`.

### FR-4 Kit promotion (`/promote <slug>`)
- Show which kit components changed in the video vs `_template/kit/`, copy approved ones back.

## 5. Non-functional requirements

- **Consistency:** every video uses the same style guide, palette and component kit.
- **Determinism:** same inputs → same render (HyperFrames seek-based rendering).
- **No Python, no extra installs** beyond Node 22+, FFmpeg, Claude Code and the HyperFrames plugin.
- **Secrets:** ElevenLabs key only in `.env` (git-ignored), read by tools, never by Claude.
- **Cost awareness:** do not regenerate voice if audio exists; regenerate only with an explicit `--revoice` argument.
- **Autonomy:** agents never ask the owner questions; only the main session asks, and only at the preview gate or on a blocking error.

## 6. System acceptance criteria

- [ ] `/topics` returns 10 varied, new topics and records them in `topics.md`.
- [ ] `/brief` produces a complete video folder with `BRIEF.md` and valid `script.<lang>.json` for every requested language.
- [ ] `/produce` with only an API key in `.env` ends with an MP4, cover and post text per language, after a single owner approval.
- [ ] A second video in a new language requires no code changes — only new script/audio data.
- [ ] Re-running `/produce` does not spend TTS credits for languages that already have audio.
- [ ] Nothing secret or heavy (`.env`, audio, renders) is tracked by git.

## 7. Out of scope

- Uploading to TikTok, scheduling, analytics.
- Real-person voices / voice cloning.
- Live-action footage or AI-generated video clips.
