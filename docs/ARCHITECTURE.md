# Architecture — TikTok Videomaker

## 1. Overview

```
owner ──/generate [--unattended|--resume]──▶ main session (skill: generate): topic → brief → produce, gates from config.json
                              (topic: /topics + owner pick, or /topics-auto) ── logs/runs.log, videos/<slug>/logs/pipeline.log
owner ──/topics──────────▶ main session (skill: topics) ──▶ topics.md (10 topics + scores)
owner ──/topics-auto─────▶ main session (skill: topics-auto) ──▶ highest score → brief
owner ──/brief igloo uk──▶ main session (skill: brief)
                              ├─ cp -r videos/_template videos/igloo
                              └─ Agent: brief-writer (Opus) ──▶ BRIEF.md, script.<lang>.json, voiceover.<lang>.txt
owner ──/produce igloo───▶ main session (skill: produce)
                              ├─ Agent: marketing-writer (Sonnet, low; background right after the brief when asyncMarketing) ──▶ marketing.<lang>.json, MARKETING.md
                              ├─ tools/tts.mjs            ──▶ audio/voice.<lang>.mp3, timings.<lang>.json
                              ├─ tools/music-loop.mjs      ──▶ audio/music.loop.<lang>.mp3 (only if assets/music.* exists)
                              ├─ Agent: video-architect (Opus, high)   ──▶ PLAN.md
                              ├─ Agent: video-builder (Sonnet, medium) ──▶ scenes, build, draft render
                              ├─ Agent: video-reviewer (Sonnet, medium) ─▶ REVIEW.md  ⟲ builder (≤ pipeline.maxReviewLoops fix rounds; FAIL → needs-owner)
                              ├─ preview gate (config or AskUserQuestion) ⟲ builder / architect
                              ├─ final render ──▶ out/<slug>.<lang>.mp4, out/cover.<lang>.png
                              └─ tools/prepare-upload.mjs ──▶ out/upload.<lang>.json ──▶ tools/publish-tiktok.mjs (stub) ──▶ STATUS ready
```

The main session is an **orchestrator**: it runs skills, calls tools, delegates to agents,
checks their outputs exist and are valid, and talks to the owner. It does not write scenes itself.

Agents never talk to each other directly and cannot ask the owner questions. Every hand-off is
a **file** (`BRIEF.md` → `PLAN.md` → code → `REVIEW.md`), so no context is lost between agents.
Agents do not spawn other agents (their tool lists exclude `Agent`).

## 2. Components

| Component | Type | Model | Reads | Writes |
| --- | --- | --- | --- | --- |
| `generate` | skill, owner-only (calls `topics-auto`/`topics`, `brief`, `produce`; reuses `promote` Auto mode) | session model | `config.json`, STATUS files | everything below, via the other skills; logs |
| `topics` | skill (main session) | session model | `topics.md`, `docs/storytelling.md` | `topics.md` (with scores and reference links) |
| `topics-auto` | skill, callable by `generate`; never asks the owner | session model | same as `topics` | `topics.md` (auto-picked) |
| `brief` | skill, owner or `generate` | session model | args, `topics.md` | `videos/<slug>/` (copy), `topics.md` |
| `brief-writer` | agent | Opus | `docs/*`, `docs/examples/*`, web | `BRIEF.md`, `script.*.json`, `voiceover.*.txt` |
| `produce` | skill, owner or `generate` (steps P1–P9, shared with `generate`) | session model | video folder, `config.json` | audio, timings, status, renders, upload files |
| `marketing-writer` | agent | Sonnet, low | `BRIEF.md` (fact base), `script.<lang>.json`, hash | `marketing.<lang>.json`, `MARKETING.md` |
| `video-architect` | agent | Opus, medium (no shell; ≤ 40 turns) | `BRIEF.md`, scripts, timings, `docs/*`, kit, HyperFrames docs | `PLAN.md` |
| `video-builder` | agent | Sonnet, medium | `PLAN.md`, `BRIEF.md`, `REVIEW.md`, kit | `src/`, `build/`, `out/draft/`, `out/` |
| `video-reviewer` | agent | Sonnet, medium | draft render, `BRIEF.md`, `PLAN.md`, `docs/*` | `REVIEW.md`, `review/frames/*` |
| `promote` | skill, owner-only (its Auto mode is reused as instructions by `produce` P9 when `autoPromoteKit`) | session model | `videos/<slug>/kit`, `_template/kit` | `_template/kit` |
| `tools/tts.mjs` | Node script | — | `script.<lang>.json`, `config.json`, `.env` | `audio/voice.<lang>.mp3`, `timings.<lang>.json` |
| `tools/timings-from-silence.mjs` | Node script | — | mp3, script | `timings.<lang>.json` |
| `tools/music-loop.mjs` | Node script | — | `assets/music.*`, `timings.<lang>.json` | `audio/music.loop.<lang>.mp3` |
| `tools/fake-voice.mjs` | Node script | — | `script.<lang>.json` | silent `voice.<lang>.mp3` + timings with `source: fake` (tests only, never final) |
| `tools/validate.mjs` | Node script | — | script, timings, marketing, upload files | exit code + messages |
| `tools/wiki-lookup.mjs` | Node script | — | title, `--lang` | JSON `{title, url, found}` from the Wikipedia REST summary API (follows redirects; no key); reference links for `/topics` |
| `tools/script-hash.mjs` | Node script | — | `script.<lang>.json` | sha256 of all narration on stdout |
| `tools/prepare-upload.mjs` | Node script | — | final mp4, cover, `marketing.<lang>.json`, timings | `out/upload.<lang>.json`, Cover line in `MARKETING.md`; exit 3 = stale marketing |
| `tools/publish-tiktok.mjs` | Node script (stub) | — | `out/upload.<lang>.json`, `config.json` | nothing (no network); validates and reports |
| `style-preview` | skill, owner-only | session model | `config.json → look`, specimen | `videos/_template/style/previews/`, `config.json` (`--apply`) |
| `tools/apply-look.mjs` | Node script | — | `kit/tokens.base.css`, `config.json → look` | `kit/tokens.css` (generated) |
| `tools/finish.mjs` | Node script | — | final mp4 / png, `config.json → look` | same file, finished (sharpen, grain, vignette, CRF, x264 tune) |
| `tools/style-preview.mjs` | Node script | — | specimen, look | still frames, `compare.png` / `grid.png`, `look.json` |
| `tools/new-video.mjs` | Node script | — | `videos/_template` | `videos/<slug>/` (template without build/out/audio/showcase/style folders, `STATUS` selected; used by `/brief`, needs no `rm`) |
| `tools/log.mjs` | Node script | — | args | one line in `videos/<slug>/logs/pipeline.log` or `logs/runs.log` |

## 3. Repository layout

```
CLAUDE.md  config.json  topics.md  .env (git-ignored)  .env.example  .gitignore
assets/                      # optional music.mp3 (git-ignored)
docs/  PRD.md  ARCHITECTURE.md  style-guide.md  tech-requirements.md  storytelling.md
       brief-template.md  script.schema.json  marketing.schema.json  upload.schema.json  examples/yakhchal/
tools/ tts.mjs  timings-from-silence.mjs  music-loop.mjs  fake-voice.mjs  validate.mjs  lib.mjs
       new-video.mjs  wiki-lookup.mjs  script-hash.mjs  prepare-upload.mjs  publish-tiktok.mjs  log.mjs  apply-look.mjs  finish.mjs  style-preview.mjs
logs/runs.log                # run log (git-ignored)
.claude/settings.json
.claude/skills/{topics,topics-auto,brief,produce,generate,promote,style-preview}/SKILL.md
.claude/agents/{brief-writer,video-architect,video-builder,video-reviewer,marketing-writer}.md
videos/_template/            # created by BOOTSTRAP_PROMPT.md
videos/<slug>/
```

## 4. Video folder contract

```
videos/<slug>/
  (files produced by `npx hyperframes init`, kept as-is)
  kit/                       # copied from _template: components, tokens.css, assets/
  src/                       # this video's scenes (code), built by video-builder
  build.mjs                  # data → build/<lang>/ (from _template; builder may extend)
  build/<lang>/              # generated composition per language (git-ignored)
  BRIEF.md                   # brief-writer
  script.<lang>.json         # brief-writer — ALL on-screen text + narration per language
  voiceover.<lang>.txt       # brief-writer — plain narration
  audio/voice.<lang>.mp3     # final voice used in the video (git-ignored)
  audio/voice.<lang>.raw.mp3 + voice.<lang>.alignment.json   # ElevenLabs output, reused without new API calls
  audio/voice.<lang>.source.mp3   # owner-provided original (silence fallback)
  audio/music.loop.<lang>.mp3     # tools/music-loop.mjs (git-ignored)
  KIT_CHANGES.md             # video-builder: kit changes worth promoting
  timings.<lang>.json        # tools — source of truth for timing
  PLAN.md                    # video-architect
  REVIEW.md                  # video-reviewer (latest round on top)
  review/frames/             # reviewer frame grabs (git-ignored)
  out/draft/<slug>.<lang>.mp4
  out/<slug>.<lang>.mp4  out/cover.<lang>.png
  out/upload.<lang>.json     # tools/prepare-upload.mjs (docs/upload.schema.json)
  marketing.<lang>.json      # marketing-writer (docs/marketing.schema.json); carries the narration hash
  MARKETING.md               # marketing-writer; Cover line filled by prepare-upload
  PENDING.md                 # only when STATUS = needs-owner: why the run stopped
  logs/pipeline.log          # per-video log (git-ignored)
  STATUS                     # one word, mirrors topics.md status
```

## 5. Data contracts

### 5.1 `script.<lang>.json`
Defined by `docs/script.schema.json`. Key ideas:
- `beats[]` in order; each beat has a stable `id` (`b01`, `b02`…) shared by all languages.
- Visual direction lives **only** in `BRIEF.md` storyboard (by beat id), never in scripts — scripts hold text only.
- All languages have the same beat ids in the same order; only text differs.
- On-screen strings (`badge`, `threat`, `callouts`, `gauge`, `caption overrides`) are per language.
- `keywords[]` mark words to color in karaoke captions (`yellow` important, `red` danger, `blue` cold, `orange` heat).

### 5.2 `timings.<lang>.json` (generated, never hand-written)
```json
{
  "lang": "en",
  "audio": "audio/voice.en.mp3",
  "source": "elevenlabs | silence",
  "durationSec": 98.42,
  "beats": [
    { "id": "b01", "start": 0.00, "end": 5.81,
      "words": [ { "text": "Desert.", "start": 0.00, "end": 0.62 } ] }
  ]
}
```
- `beats[i].start` = first character of that beat's narration; `end` = last character.
- A beat with empty narration (e.g. silent recap) gets `start = previous.end`, `end = start + holdSec` from the script.
- Video duration = `durationSec + config.tailSec`.

### 5.3 `config.json`
Voices per language, TTS model and settings, duration limits, music volume, `pipeline` (gate flags, `maxReviewLoops`, `asyncMarketing`, `autoPromoteKit`, `publish`, `defaultLanguages`) and `marketing` (TikTok post settings). Edited by the owner. `config-template.json` holds the default values: tools read `config.json` merged over it, so a key missing from `config.json` falls back to the default. Never regenerate `config.json` from scratch; copy the template only when the file is missing, and add new keys to the template.

## 6. Build and render pipeline (data-driven)

HyperFrames reads timing from HTML (`data-start`, `data-duration`, `data-track-index`) and
animation from a paused GSAP timeline registered in `window.__timelines`. To keep one source
for many languages:

```
src/ (scenes as code) + kit/ + script.<lang>.json + timings.<lang>.json
        └── node build.mjs <lang> ──▶ build/<lang>/  (complete HyperFrames composition)
                 └── npx hyperframes render (in build/<lang>/) ──▶ out/…/<slug>.<lang>.mp4
```

Rules:
- Scenes are written once, parameterised by beat data. A scene's start/duration = its beat's timing.
- Inside a beat, animation cues are anchored to **words** (e.g. "show the wall when the word `wall` starts"), not to fixed seconds, so they stay in sync in every language.
- Text containers must fit the longest language (RU/UK run ~10–25 % longer): auto-fit font size within limits from the style guide, never overflow.
- The exact HyperFrames CLI flags (input dir, output path) are discovered by the architect from the installed skill/CLI help and written into `PLAN.md` and `_template/TEMPLATE.md`.

## 7. Template and kit

`videos/_template/` = output of `npx hyperframes init` + the shared kit:
- `kit/tokens.base.css` — the original palette and typography as CSS variables (from `docs/style-guide.md`); never modified by tools.
- `kit/tokens.css` — **generated** from `tokens.base.css` + `config.json → look` by `tools/apply-look.mjs` (see style guide → Look parameters). Kit code uses only these variables (and, at build time, reads the same file through `kit/look.mjs`).
- `style/specimen/` — a composition with every kit asset and overlay in day / night / tense; `/style-preview` renders stills of it to tune the look without rendering a video. Final renders and covers get the look's finishing (`tools/finish.mjs`).
- `kit/components/` — `StepBadge`, `ThreatBadge`, `Callout`, `Gauge`, `FlowArrows`, `IceMeter`/`StakesMeter`, `KaraokeCaption`, `Cover`.
- `kit/assets/` — reusable low-poly SVG pieces (terrain cross-section, sky day/night, puppet character with poses, trees, rocks, water, generic props).
- `build.mjs` — the data → composition builder.
- `TEMPLATE.md` — how the template is structured and how to render.

A video copies the whole template. Improvements made inside a video's `kit/` are moved back
only through `/promote <slug>`, so videos stay independent and the template only gets reviewed changes.

## 8. Review loop

1. Builder renders a draft for the primary language (`en`) → `out/draft/<slug>.en.mp4`.
2. Reviewer extracts frames with FFmpeg (mid-point of every beat + every 2 s contact sheet), checks the checklist in its agent file, writes `REVIEW.md` with `PASS` or a numbered issue list (each: beat id, what, expected, severity).
3. If `FAIL` → builder fixes → reviewer re-checks. The reviewer always runs ≥ 1 round; up to `pipeline.maxReviewLoops` rounds may trigger builder fixes. A final `FAIL` is a hard stop (`needs-owner`, see Gates).
4. Preview gate (only after `PASS`): main session shows draft path + reviewer summary and asks **Approve / Request changes**, unless `autoApprovePreview`.
5. Owner changes are classified by the main session:
   - *small* (text, position, color, speed, timing inside a beat) → builder,
   - *structural* (add/remove/reorder scenes, change composition or concept) → architect updates `PLAN.md`, then builder.
   Then one reviewer pass and the owner gate again.
6. After approval: build and render every language and the cover. Marketing copy and the upload file follow (FR-5).

## 9. Topic lifecycle (`topics.md`)

`proposed` → `selected` → `briefed` → `voiced` → `planned` → `built` → `approved` → `rendered` → `ready`
`rendered` = final mp4 + cover exist; `ready` = marketing + `upload.<lang>.json` prepared (publishing stays manual while `pipeline.publish = "off"`).
Any time: `needs-owner` (the run stopped and waits for the owner; reason in `PENDING.md`, resume with `/generate --resume`) and `rejected` (owner said no — never propose again).
Each video folder also has `STATUS` with the same word.

## 10. Error handling

| Situation | Behaviour |
| --- | --- |
| No `.env` key and no `audio/voice.<lang>.mp3` | Stop `/produce`, tell the owner: add key to `.env` or drop an mp3 into `audio/`. |
| ElevenLabs error (quota, 401, 429) | Stop, show the HTTP status and message; never retry more than 2 times. |
| Owner-provided mp3 without timestamps | `tools/timings-from-silence.mjs` (sentence-accurate, word timing interpolated). |
| Voice longer than 120 s | Report to owner with the measured duration; suggest beats to cut; do not render. |
| Script invalid vs schema | `tools/validate.mjs` fails → main session sends the error back to brief-writer once. |
| Reviewer still FAIL after `maxReviewLoops` fix rounds | Hard stop: `STATUS needs-owner`, `PENDING.md`. No flag or `--unattended` bypasses it. |
| `prepare-upload` exit 3 (narration changed after marketing) | Rerun `marketing-writer` once, then `prepare-upload` again. |

## 11. Gates

Approval gates and the config flags that make them automatic (`config.json → pipeline`):

| Gate | Flag | Where |
| --- | --- | --- |
| topic | `autoSelectTopic` | `/generate` a): true → `/topics-auto` logic, false → `/topics` + owner pick |
| production | `autoStartProduction` | after the brief, before voice |
| plan | `autoApprovePlan` | after `PLAN.md` |
| preview | `autoApprovePreview` | after review PASS, before the final render |
| upload | `autoPrepareUpload` | after the final render and marketing, before `prepare-upload` |

- Flag true → continue automatically. Flag false → ask with AskUserQuestion: **Approve / Request changes**.
- `/generate --unattended`: for this run only, every approval gate counts as true. Never written to `config.json`. It does **not** override `publish` or `autoPromoteKit`, which always come from `config.json`.
- **Hard rule** — nothing bypasses it: last review `FAIL` after `maxReviewLoops` → stop, `STATUS needs-owner`, one-paragraph reason in `videos/<slug>/PENDING.md` (first line `Previous status: <status>`).
- `autoApprovePreview` only ever applies when the last review is `PASS`.
- `/generate --resume [<slug>]` continues from `STATUS` (slug omitted = most recently updated unfinished video). Finished steps are never redone and existing audio never costs TTS credits again. `needs-owner` + `--resume` shows the open issues and asks **Approve anyway / Request changes**; with `--unattended` a `needs-owner` video is never passed automatically.
- Before a run ends or stops, the orchestrator waits for background agents (async marketing).
- `asyncMarketing: true` starts `marketing-writer` in the background right after the brief; production never waits for it until the marketing step.
- `/produce` shares steps P1–P9 with `/generate` and follows the same gates.
- **How `/generate` uses other skills.** A skill the model *calls* (Skill tool) must not have `disable-model-invocation`; a skill whose instructions are only *reused* may keep it.
  - Called: `topics-auto` and `topics` (with `--no-brief`), `brief`, `produce` (with `--unattended` when set). None of them asks a question in an unattended run.
  - Reused: `promote` — `produce` P9 follows `promote`'s **Auto mode** (generic, backward-compatible changes only, no question) when `pipeline.autoPromoteKit` is true; the skill itself stays owner-only because it rewrites the shared template. `autoPromoteKit` is never opened by `--unattended`.
  - `/generate`, `/promote`, `/style-preview` stay owner-invoked.
- **Nothing waits on a question in an unattended run.** Besides the `needs-owner` hard rule, blocking errors (missing key, validation, tool failure) log `error`, write `PENDING.md` (STATUS unchanged) and stop; `--resume` re-runs the failed step. A voice over 120 s is trimmed automatically once (`brief-writer` revise + new TTS, credits logged) before it stops.

## 12. Logging

Two append-only logs, one line per event: `ISO timestamp with local offset | slug | step | result | details`. Written only through `node tools/log.mjs` (timestamp and run duration come from the tool, never from the model), only by the orchestrator (skills); agents never log. Both are git-ignored (`logs/`, `videos/*/logs/`).

- **Video log** `videos/<slug>/logs/pipeline.log` — detailed history of that video: start/end of every step, every gate decision (auto / owner approved / owner changes), TTS characters sent per language, review verdict per round, `needs-owner` stops, `--resume`, errors with message, final output paths.
  `node tools/log.mjs <slug> <step> <result> "<details>"`
- **Run log** `logs/runs.log` — short: start and end of every command (`/generate`, `/produce`, `/brief`, `/topics`, `/topics-auto`, `/promote`) with slug, flags (`--unattended`, `--resume`), final status and duration; plus events with no video folder yet (topic generation, early errors) with `-` as slug.
  `node tools/log.mjs --run <command> <slug|-> <result> "<details>"`

## 13. Conventions

- Slug: lowercase ASCII, hyphens (`igloo`, `japanese-katana`).
- Language codes: ISO 639-1 (`en`, `uk`, `ru`).
- English is the primary language: briefs and plans are English; drafts are reviewed in `en`.
- Agents read the docs themselves; delegation messages do not copy docs. Delegation messages must still repeat the critical rules: slug, languages, absolute paths, mode, "do not ask questions", "write results to files".
- Silent beats (empty narration + `holdSec`) get real silence inserted into the voice file by the tools, so audio and picture stay aligned.
