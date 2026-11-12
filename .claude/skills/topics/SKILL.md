---
name: topics
description: Propose 10 new, varied, scored video topics (simple inventions, tools, survival builds) and record them in topics.md. Use when the owner asks for topics or ideas for the next video, or wants to pick or reject topics.
argument-hint: "[optional theme or category]"
---

# Propose topics

Goal: 10 topics the average TikTok viewer would stop scrolling for, each explainable in 60–120 s as a chain of **problem → consequence → solution** (see `docs/storytelling.md`).

Logging (orchestrator only, see ARCHITECTURE → Logging): `node tools/log.mjs --run topics - start "<args>"` first; at the end `node tools/log.mjs --run topics <slug|-> <result> ""` (the tool adds the duration).

## Steps
1. Read `topics.md` and `docs/storytelling.md` (categories, good-topic test).
2. Generate candidates. If `$ARGUMENTS` names a theme or category, bias toward it but keep variety.
3. Filter out anything already in `topics.md` with a status other than `proposed`, plus every `rejected` topic. Treat synonyms as the same topic (katana = Japanese sword; dugout = earth shelter).
4. Keep exactly 10 that pass the good-topic test, max 2 per category.
5. **Score** each topic 1–5 per criterion (be honest; use the whole range):
   - `hook` — would it stop the scroll;
   - `visual` — works as a side-view cross-section;
   - `depth` — number of problem→solution decisions;
   - `facts` — verifiable from ≥ 2 sources;
   - `variety` — category not used recently (compare with the most recent rows of `topics.md`; a category used by the latest video scores 1, never used scores 5).
   Total = sum (max 25).
6. Show the owner one table, sorted as generated:

   | # | Topic | Category | Hook (one line) | Problems it solves (3–5) | ~Duration | hook | visual | depth | facts | variety | Total |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

7. Append new rows to `topics.md` with status `proposed`, today's date, langs empty, and the new **Score** column as `<total> (h<n> v<n> d<n> f<n> va<n>)`.
8. End with exactly one line: `Pick a number or name (+ languages, e.g. "3 uk ru"). "reject 2,5" removes topics for good.`

## When the owner answers
- **Pick** (`3`, `igloo`, `3 uk ru`): set that row to `selected`, store languages (`en` always included), then invoke the `brief` skill with `<topic> <langs>`.
- **Reject** (`reject 2,5`): set those rows to `rejected`. Never propose them again.
- Rows neither picked nor rejected stay `proposed` and may appear in later batches.
