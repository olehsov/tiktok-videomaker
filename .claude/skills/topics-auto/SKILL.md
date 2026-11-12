---
name: topics-auto
description: Generate and score 10 topics exactly like /topics, auto-pick the highest total, record why, and continue to the brief with pipeline.defaultLanguages. Use when no owner pick is wanted.
argument-hint: "[optional theme or category] [--no-brief]"
---

# Propose, score and auto-pick a topic

Logging: `node tools/log.mjs --run topics-auto - start "<args>"`; at the end `node tools/log.mjs --run topics-auto <slug> <result> ""` (the tool adds the duration).

1. Run steps 1–8 of the `topics` skill (generate, filter, score, look up reference links, show the table with the Wiki column, append rows with scores and links to `topics.md`). Do not ask the owner to pick.
2. Pick the highest **Total**. Tie → the topic whose category was used least recently (the longest time since a non-`proposed` row of that category; never used wins). Still tied → the first in the table.
3. Set its row to `selected`, langs = `config.pipeline.defaultLanguages`, and write `auto-picked: <reason>` into its Notes (e.g. `auto-picked: total 21, highest; hook 5`).
4. Tell the owner the pick in one line. Unless `$ARGUMENTS` contained `--no-brief`, invoke the `brief` skill with `<slug> <langs from config>`. With `--no-brief` (how `/generate` calls this skill) return the slug and languages and stop: the caller runs the brief.

No step of this skill asks the owner anything, so it is safe in an unattended run. It is model-invocable (no `disable-model-invocation`) because `/generate` calls it.
