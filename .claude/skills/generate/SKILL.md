---
name: generate
description: Make one video end to end - topic, brief, voice, plan, build, review, preview, final render, marketing, upload file - stopping only at the approval gates set in config.json. Use for a whole video in one command, or to resume an interrupted one.
argument-hint: "[--unattended] [--remusic] [--resume [<slug>]]"
disable-model-invocation: true
---

# Generate one video

Arguments: `$ARGUMENTS` → flags `--unattended`, `--remusic` (passed on to `produce`; ignored with `--resume`), `--resume [<slug>]`. One video per run.
Read `docs/ARCHITECTURE.md` **Gates** and **Logging** first. Gate rules, the hard needs-owner rule and logging are defined in the `produce` skill
("Gates", "Logging", "Resume") and apply here unchanged. `--unattended` makes every **approval gate** true for this run only (topic, production, plan, preview, upload);
it is never written to `config.json`, and it does not override `pipeline.publish` or `pipeline.autoPromoteKit`.

Run log: `node tools/log.mjs --run generate - start "<flags>"` (slug `-` until known, then use the slug); at the end `node tools/log.mjs --run generate <slug> <final STATUS> "<flags> "`.
Before ending (success, stop or error) wait for any background agent.

## Which skills are called, which are reused
- **Called** with the Skill tool (so they must not have `disable-model-invocation`): `topics-auto`, `topics`, `brief`, `produce`.
- **Reused as instructions** (read the file, follow it; the skill keeps `disable-model-invocation`): `promote` — through `produce` P9 → Auto mode, only when `pipeline.autoPromoteKit` is true.
- `/generate` itself stays owner-invoked. Nothing it calls asks a question in an unattended run; the only stops are the hard `needs-owner` rule and blocking errors (both write `PENDING.md`; `--resume` continues).

## Resume
`--resume [<slug>]` → follow "Resume" in the `produce` skill (slug omitted = the most recently updated unfinished video). Log `resume` in the video log.
Skip every step before the one the `STATUS` points to; run the rest below from there. `needs-owner` + `--unattended` → never pass automatically: report and stop.
A video whose `STATUS` is before `briefed` (e.g. `selected`) resumes at step b.

## Steps
a) **Topic.** `pipeline.autoSelectTopic` (or `--unattended`) true → **call the `topics-auto` skill** (Skill tool) with `--no-brief` (generate, score, find reference links, pick the highest total, record `auto-picked: <reason>`; returns the slug and languages).
   False → **call the `topics` skill** with `--no-brief`: it shows the scored table and the owner picks (that is the gate); it returns the slug and languages.
   Log `topic <slug> picked auto|owner`.
b) **Brief.** **Call the `brief` skill** (template copy via `tools/new-video.mjs`, `brief-writer`, validate, status, commit) with languages = `pipeline.defaultLanguages` (plus any the owner named when picking).
c) **Marketing, async.** `pipeline.asyncMarketing` true → right now, per language run `node tools/script-hash.mjs <slug> L` and start `marketing-writer` **in the background** (delegation: slug, languages, folder path, hash per language, `config.marketing.alsoShortsAndReels`, "Do not ask questions; write `marketing.<lang>.json` and `MARKETING.md`"). Log `marketing start (async)`.
d) **Production gate** (`autoStartProduction`). Request changes → `brief-writer` revise mode with the notes, validate, restart the marketing-writer if it was started (hashes change), gate again.
e–l) **Produce.** **Call the `produce` skill** for this slug, passing `<slug>` plus `--unattended` / `--remusic` when given, starting at P1 (or at the resume point). It covers: voice + music (e: the voice for every language, then `music-gen` once per video and `music-loop` per language), plan + plan gate (f), build ⇄ review (g), preview gate + final render + cover (h), marketing — it waits for the async run, or runs now when `asyncMarketing` is false (i), upload gate + `prepare-upload` with the exit-3 retry (j), publish stub → `ready` (k), kit promotion or the `/promote` suggestion (l).
   Do not repeat any of those steps here.

## Report
Final STATUS, output paths per language, durations, open minor issues, anything the owner still has to do (e.g. upload `upload.<lang>.json` manually, or the `needs-owner` reason from `PENDING.md`).
