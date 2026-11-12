---
name: promote
description: Move improved reusable kit components (overlays, palette tokens, low-poly assets, build.mjs) from a finished video back into videos/_template so the next videos get them.
argument-hint: "<slug>"
disable-model-invocation: true
---

# Promote kit changes to the template

Logging (orchestrator): `node tools/log.mjs --run promote $ARGUMENTS start ""` first, `... <result> ""` (the tool adds the duration) at the end (use `$ARGUMENTS` as slug). When `pipeline.autoPromoteKit` is true, `/produce` runs these steps itself and skips the owner question for generic changes only.

1. Read `videos/$ARGUMENTS/KIT_CHANGES.md` and diff `videos/$ARGUMENTS/kit/` and `videos/$ARGUMENTS/build.mjs` against `videos/_template/`.
2. List each change in one line: file, what changed, why (from KIT_CHANGES.md), and whether it is generic or specific to this topic. Only generic changes are candidates.
3. Ask the owner with AskUserQuestion (multi-select) which candidates to promote.
4. Copy the chosen files into `videos/_template/`. Keep backward compatibility: existing component props keep working.
5. Update `videos/_template/TEMPLATE.md` if usage changed. Commit `"template: promote from $ARGUMENTS"`.
