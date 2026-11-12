# BRIEF.md template

Copy this structure exactly. English only. No time/effort estimates. No exact timings
(timings come from the voice). Keep it specific: numbers, names, beat ids.

---

```markdown
# Brief: <Title> (`<slug>`)

Languages: en[, uk, ru] · Target duration: <60|75|90|105|120> s · Category: <category>
Observer animal: <animal> · Stakes meter: <what it measures>

## User story
As a TikTok viewer, I want to understand in <N> seconds how <thing> is built and why each part
is shaped that way, so that I see it is a chain of simple decisions — and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of the target
- [ ] Hook (paradox) in the first 3 s
- [ ] <N> construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ <K> threats with "⚠" plates and failure ghosts
- [ ] Climax stress test: <describe>
- [ ] Recap + final line "Now you know how to build a/an <thing>."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- <topic-specific criteria>

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | ... | ... | ... | ... | [S1] |

Sources (checked YYYY-MM-DD):
- [S1] <title> — <url>
Open questions: <facts not found; therefore not stated in narration>

## Storyboard
One row per beat. Beat ids must match script.<lang>.json.

| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | ... | Gauge "104°F / 40°C" | — | day |
| b02 | attempt | simplest try fails | ... | ⚠ WON'T FREEZE | ... | day→night |
| b03 | step | Step 1 · <name> | ... | ✓ STEP 1 · <NAME>; Callout "<title>" | ... | day |
| ... | threat / step / night / climax / recap / ending | | | | | |

## Scene elements
Low-poly elements this video needs, grouped: environment, structure parts (in build order),
characters (puppet poses), observer animal, props, effects (water, smoke, ice, cracks).
Mark which exist in kit/assets and which are new.

## Overlays used
List of kit components used and any new component needed (with a one-line spec).

## Storytelling techniques used
Which of docs/storytelling.md techniques appear and in which beats.

## Decisions
Non-obvious choices made without asking (duration, cut elements, analogy choices, unit choices).

## Music
Written as a separate file `music.json` (not inside BRIEF.md): `{ "topic": "<≤ 25 words: what the video is about + era/region + 1–2 traditional instruments that fit>" }`, e.g. `Ancient Persian desert ice-house, ~400 BC, Iranian plateau; santur, ney`. `tools/music-gen.mjs` puts it into `config.json → music.promptTemplate` (`{{topic}}`). Mention it here in one line.

## Post
Cover headline (en): "<3–5 WORDS?>"
Description (en): <≤150 chars>
Hashtags: #... (5–8)
```
