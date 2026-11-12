---
name: promote
description: Move improved reusable kit components (overlays, palette tokens, low-poly assets, build.mjs) from a finished video back into videos/_template so the next videos get them.
argument-hint: "<slug>"
disable-model-invocation: true
---

# Promote kit changes to the template

Logging (orchestrator): `node tools/log.mjs --run promote $ARGUMENTS start ""` first, `... <result> ""` (the tool adds the duration) at the end (use `$ARGUMENTS` as slug). When `pipeline.autoPromoteKit` is true, `/produce` (P9, also inside an unattended `/generate`) does not call this skill — it reads this file and follows **Auto mode** below. This skill keeps `disable-model-invocation` because it rewrites the shared template.

1. Read `videos/$ARGUMENTS/KIT_CHANGES.md` and diff `videos/$ARGUMENTS/kit/` and `videos/$ARGUMENTS/build.mjs` against `videos/_template/`.
2. List each change in one line: file, what changed, why (from KIT_CHANGES.md), and whether it is generic or specific to this topic. Only generic changes are candidates.
3. Ask the owner with AskUserQuestion (multi-select) which candidates to promote.
4. Copy the chosen files into `videos/_template/`. Keep backward compatibility: existing component props keep working.
5. Update `videos/_template/TEMPLATE.md` if usage changed. Commit `"template: promote from $ARGUMENTS"`.

## Auto mode (`pipeline.autoPromoteKit` = true; no owner input)
Steps 1–2 as above, then **skip step 3**: promote every change classified *generic* that is backward compatible (existing props and exports keep working, `tokens.base.css` and `tokens.css` untouched, no change to files outside `kit/`, `build.mjs`); leave topic-specific changes alone. Then steps 4–5. Log `promote auto: <n> promoted, <m> skipped` to the video log. Nothing to promote (empty or only topic-specific `KIT_CHANGES.md`) → log it and continue; never block the run.
