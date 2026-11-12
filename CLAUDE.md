# TikTok Videomaker

This repo turns a topic ("igloo", "katana", "yakhchal") into a finished 1–2 minute
vertical explainer video (MP4) about how a simple invention or survival build works:
every design detail is shown as **problem → what breaks without it → solution**.

The owner gives a topic and approves the final preview. Everything else is automated.

## Workflow (skills = slash commands)

| Step | Command | What happens | Stops for owner? |
| --- | --- | --- | --- |
| 1 | `/topics` | Propose 10 new, varied topics; owner picks one | yes — pick a topic |
| 2 | `/brief <topic> [langs]` | `brief-writer` agent researches facts, writes `BRIEF.md` + `script.<lang>.json`; creates `videos/<slug>/` from `_template` | ends; owner runs step 3 |
| 3 | `/produce <slug> [langs]` | voice (ElevenLabs) → `video-architect` plan → `video-builder` build → `video-reviewer` QA (≤ `pipeline.maxReviewLoops` fix rounds) → preview → final render, cover → marketing → `upload.<lang>.json` → `ready` | per gates in `config.json` |
| — | `/promote <slug>` | Copy improved reusable components from a video back into `videos/_template/kit/` | owner-invoked |
| — | `/generate [--unattended] [--resume [<slug>]]` | One video, topic → brief → produce → `ready`; stops only at gates that `config.json → pipeline` leaves closed | per config |
| — | `/topics-auto` | Like `/topics` but picks the best-scored topic and briefs it | no |

Default language is `en`. Extra languages (`uk`, `ru`) are optional and named at step 2.

## Where things live

- `docs/PRD.md` — what this system must do (requirements, acceptance criteria).
- `docs/ARCHITECTURE.md` — how it is built: components, data flow, file contracts. **Read before changing any skill, agent or tool.**
- `docs/style-guide.md` — visual style, palette, captions. Identical for every video.
- `docs/tech-requirements.md` — format, duration, safe zones, i18n, audio rules.
- `docs/storytelling.md` — narrative rules and techniques.
- `docs/brief-template.md` — the exact structure of every `BRIEF.md`.
- `docs/script.schema.json` — contract for `script.<lang>.json`.
- `docs/examples/yakhchal/` — a reference brief + script showing the expected quality.
- `config.json` — voices, TTS model, duration limits, music settings, `pipeline` gate flags, `marketing` post settings.
- `topics.md` — registry of every topic ever proposed, with status.
- `tools/` — Node scripts (no npm deps): TTS with timestamps, silence-based timings, music loop.
- `videos/_template/` — HyperFrames project + shared kit (overlay components, palette tokens, low-poly assets).
- `videos/<slug>/` — one folder per video (copy of `_template`).

## Hard rules

- Video stack is **HyperFrames** only. Use the HyperFrames skills (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`). Do not use the `faceless-explainer` pipeline — this repo has its own.
- Output: MP4, 1080×1920, 30 fps, H.264 + AAC, **60–120 s** (brief-writer picks the target per topic).
- All text visible in a video comes from `script.<lang>.json`. Never hard-code on-screen text or timings in markup.
- Timings always come from the voice audio (`timings.<lang>.json`), never from the brief.
- Facts must have sources in `BRIEF.md`. Engineering explanations not found in sources are labelled as such.
- Never print, log, commit or write the ElevenLabs key anywhere. Tools read it from `.env` via `node --env-file=.env`. Do not read `.env`.
- No time or effort estimates in briefs or plans.
- Python is not used in this repo. Tools are Node 22 + FFmpeg only.
- Update `topics.md` status at every step (see ARCHITECTURE → Topic lifecycle).
- Logs: only skills write them, via `node tools/log.mjs` (video log `videos/<slug>/logs/pipeline.log`, run log `logs/runs.log`); agents never log. Both are git-ignored.
- A final review FAIL after `pipeline.maxReviewLoops` always stops the run (`needs-owner`); no flag or `--unattended` bypasses it.
- Commit after each completed step with a message like `igloo: brief`, `igloo: rendered`. Never commit `.env`, audio or renders.

## Model routing

- Main session: orchestration only (skills). Keep heavy work in agents.
- `brief-writer`: Opus. `video-architect`: Opus, medium effort, no shell. `video-builder`, `video-reviewer`: Sonnet, medium effort. `marketing-writer`: Sonnet, low effort, no web, no shell.
