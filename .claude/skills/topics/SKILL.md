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
6. **Reference link** for each of the 10 topics, so the owner can see what it is:
   - Run `node tools/wiki-lookup.mjs "<best English Wikipedia article title>"` (prints `{ title, url, found }`).
   - `found: false` (not found or a disambiguation page) → try 1–2 alternative titles.
   - Still nothing → one `WebSearch` for a single reliable reference page (encyclopedia, museum, university) and mark it `(related)`.
   - Never invent, guess or build a URL by hand: only a `url` printed by the tool or a result of the search.
7. Show the owner one table, sorted as generated:

   | # | Topic | Wiki | Category | Hook (one line) | Problems it solves (3–5) | ~Duration | hook | visual | depth | facts | variety | Total |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

   **Wiki** = markdown link `[<title>](<url>)`, followed by ` (related)` for a search fallback.
8. Append new rows to `topics.md` with status `proposed`, today's date, langs empty, the **Score** column as `<total> (h<n> v<n> d<n> f<n> va<n>)` and the **Link** column as the bare URL (with ` (related)` appended when it is a search fallback).
9. End with exactly one line: `Pick a number or name (+ languages, e.g. "3 uk ru"). "reject 2,5" removes topics for good.`

## When the owner answers
- **Pick** (`3`, `igloo`, `3 uk ru`): set that row to `selected`, store languages (`en` always included), then invoke the `brief` skill with `<topic> <langs>`.
- **Reject** (`reject 2,5`): set those rows to `rejected`. Never propose them again.
- Rows neither picked nor rejected stay `proposed` and may appear in later batches.
