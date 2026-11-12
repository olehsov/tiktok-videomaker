---
name: topics
description: Propose 10 new, varied video topics (simple inventions, tools, survival builds) and record them in topics.md. Use when the owner asks for topics or ideas for the next video, or wants to pick or reject topics.
argument-hint: "[optional theme or category]"
---

# Propose topics

Goal: 10 topics the average TikTok viewer would stop scrolling for, each explainable in 60–120 s as a chain of **problem → consequence → solution** (see `docs/storytelling.md`).

## Steps
1. Read `topics.md` and `docs/storytelling.md` (categories, good-topic test).
2. Generate candidates. If `$ARGUMENTS` names a theme or category, bias toward it but keep variety.
3. Filter out anything already in `topics.md` with a status other than `proposed`, plus every `rejected` topic. Treat synonyms as the same topic (katana = Japanese sword; dugout = earth shelter).
4. Keep exactly 10 that pass the good-topic test, max 2 per category.
5. Show the owner one table:

   | # | Topic | Category | Hook (one line) | Problems it solves (3–5) | ~Duration |
   | --- | --- | --- | --- | --- | --- |

6. Append new rows to `topics.md` with status `proposed`, today's date, langs empty.
7. End with exactly one line: `Pick a number or name (+ languages, e.g. "3 uk ru"). "reject 2,5" removes topics for good.`

## When the owner answers
- **Pick** (`3`, `igloo`, `3 uk ru`): set that row to `selected`, store languages (`en` always included), then invoke the `brief` skill with `<topic> <langs>`.
- **Reject** (`reject 2,5`): set those rows to `rejected`. Never propose them again.
- Rows neither picked nor rejected stay `proposed` and may appear in later batches.
