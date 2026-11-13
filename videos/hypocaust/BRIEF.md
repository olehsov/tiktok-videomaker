# Brief: Hypocaust — Fire Under the Floor (`hypocaust`)

Languages: en, uk · Target duration: 115 s · Category: fire-heat
Observer animal: cat (shivers on a cold floor, flees smoke, ends asleep on the warm floor) · Stakes meter: WARMTH (0–100)

## User story
As a TikTok viewer, I want to understand in under two minutes how Romans heated rooms with a fire under the
floor and why each part of a hypocaust is shaped that way, so that I see it is a chain of simple decisions —
and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of 115 s
- [ ] Hook (paradox: a fire right under the floor you walk on) in the first 3 s
- [ ] 7 construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ 6 threats with "⚠" plates and failure ghosts (smoke in the room, heat can't get under, hot spot, trapped smoke, fire out, invisible gas)
- [ ] Climax stress test: January at a fort on Hadrian's Wall, frost outside, hot room at 104°F / 40°C, wooden sandals on the hot floor
- [ ] Recap + final line "Now you know how to build a hypocaust."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- [ ] One continuous side-view cut-away of a small bath-house: furnace on the left outside the wall, under-floor cavity with pilae visible at all times after b04, three rooms in a row (hot → warm → cold, left to right), wall flues visible inside the cut walls up to roof vents
- [ ] Heat arrows (red-orange) flow from the furnace under the floor, then up the walls; they fade/cool to neutral toward the cold room
- [ ] Carbon monoxide is drawn as a faint grey-violet haze (not a bright UI colour) with a red ⚠ plate; it must read as "invisible" — dashed outline, low opacity

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Fire in the room (attempt) | Need a warm room | Smoke and soot fill the room; only the air near the fire warms, the floor stays cold | — (rejected) | engineering explanation, not from a source |
| 2 | Furnace outside (praefurnium) | Fire must not be inside the room | Smoke, soot, fire risk in the room | Furnace outside the wall, fed through a stokehole; its heat is led into a cavity under the floor | [S1], [S3], [S5], [S6] |
| 3 | Raised floor on pilae | Floor on solid ground; hot gas can't get under it | Only the furnace wall warms | Floor raised on stacks (pilae) of stone or ceramic tiles, about 2 ft (60 cm) tall; hot air circulates between them. Name: Greek hupó "under" + kaustós "burnt" — "heated from below" | stacks [S1], [S3], [S10]; height [S2], [S6], [S8]; name [S1], [S3] |
| 4 | Thick layered floor | Hot gas directly under thin tiles | Uneven floor: hot spot above the flames, cold elsewhere | Layer of tiles (2-ft tiles bridge the pilae), then concrete, then floor tiles; the floor absorbs heat and radiates it into the room | layers [S1], [S6], [S7]; 2-ft tiles [S2]; absorb/radiate [S9]; hot-spot logic and "like a pizza stone" — engineering explanation / analogy |
| 5 | Wall flues (box tiles, tubuli) | Smoke and hot gas have no exit | No draft: fire smoulders, smoke backs out of the stokehole | Hollow ceramic box tiles in the walls carry the hot gas up to outlets in the roof; walls get warm too | [S1], [S3], [S4], [S5]; draft/"pulls the fire" — engineering explanation (chimney effect) |
| 6 | Room order | One furnace, rooms need different temperatures | Every room equally hot or the far room cold | Hottest room (caldarium) next to the furnace, warm room (tepidarium) after it, cold room (frigidarium) unheated | [S1], [S3]; "air cools as it travels" — engineering explanation |
| 7 | Constant stoking | Floor cools when the fire dies | Cold floor by morning | Fire tended constantly by a stoker (often enslaved); huge amounts of firewood | [S1], [S5], [S7], [S9]; stoker enslaved [S4], [S6], [S7] |
| 8 | Sealed joints + draft | Carbon monoxide: odourless, toxic | Leaks through gaps in floor/walls into the room; can kill | Floor and walls built airtight; the flues keep gas moving up and out | leak danger [S6], [S7]; airtight [S7]; "draft pulls it out" — engineering explanation |
| 9 | Hot room temperature | — | — | Hottest room kept at roughly 40°C (104°F); air/water "well above 100°F" | [S3], [S4]; ([S5] measured ~32°C air in a reconstruction, [S6] up to 50°C) |
| 10 | Wooden sandals | Floors too hot to touch | Burnt feet | Bathers wore wooden sandals / clogs | [S3], [S4] |
| 11 | Date | — | — | Probably invented in the 1st century BC; Vitruvius describes it c. 15 BC | [S1], [S3], [S6] |
| 12 | Chesters, Hadrian's Wall | — | — | Fort bath-house with a heated hot room / hypocaust | [S1] (photo caption), [S3] |

Sources (checked 2026-11-13):
- [S1] Hypocaust — Wikipedia — https://en.wikipedia.org/wiki/Hypocaust
- [S2] Vitruvius, De architectura V.10.2 (Gwilt transl., LacusCurtius; cross-read in Morgan transl., Perseus) — https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/5*.html · https://cts.perseids.org/read/latinLit/phi1056/phi001/perseus-eng1/5.10.2-5.10.3
- [S3] English Heritage — Baths and Bathing in Roman Britain — https://www.english-heritage.org.uk/learn/story-of-england/romans/roman-bathing/
- [S4] PBS NOVA — Secrets of Lost Empires: Roman Bath, Caldarium — https://www.pbs.org/wgbh/nova/lostempires/roman/caldarium.html
- [S5] Carnuntum (Roman city museum park) — "The floor is lava" heating techniques — https://www.carnuntum.at/tr/dergi/the-floor-is-lava-heiztechniken-im-antiken-carnuntum/1723
- [S6] The Romans in Britain — Central heating (hypocaust) — https://romanobritain.org/12_innovations/inv_central_heating.php
- [S7] Vita Romae — The Roman Hypocaust — https://www.vita-romae.com/hypocaust-system.html
- [S8] Victorian Turkish Bath project — Hypocaust in a Roman house, Trier (pillars ~60 cm) — https://www.victorianturkishbath.org/2HISTORY/atozhist/Review/aapix/1PreHist/trier_c_w.htm
- [S9] Low-tech Magazine — Heat storage hypocausts — https://solar.lowtechmagazine.com/2017/03/heat-storage-hypocausts-air-heating-middle-ages.html
- [S10] Pilae stacks — Wikipedia — https://en.wikipedia.org/wiki/Pilae_stacks

Open questions: Vitruvius's sloped sub-floor ("a ball rolls back to the furnace") has only one primary source — not narrated. Inventor (Sergius Orata, c. 80 BC) is disputed — not narrated. Exact floor temperatures vary by source (20–50 °C measured at Carnuntum) — only "too hot to touch" is narrated. Heat-up time and exact firewood quantities not found — not narrated. Exact winter temperatures at Chesters not sourced — "frost outside" is a scenario, not a measured fact.

## Storyboard
| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | Cut-away of an empty room on bare ground; a glowing fire appears under the floor line (`furnace-glow-reveal`), puppet in tunic steps onto the floor (`puppet-walk-floor`); cat shivers in a corner | meter 10 | — | day (cold, grey winter) |
| b02 | attempt | simplest try fails | Fire pit in the middle of the room (`ghost-room-fire`); grey smoke fills the room, soot streaks on walls, cat flees (`smoke-fill-cat-flees`); blue cold arrows on the floor around the puppet's feet (`cold-floor-arrows`) | ⚠ SMOKE; meter 15 | whole scene is the ghost (desaturated + red tint), then fades back | day |
| b03 | step 1 | furnace outside | Furnace with arched stokehole builds outside the left wall (`furnace-build`); red-orange arrows go only right, under the floor line (`heat-arrows-under`) | ✓ STEP 1 · FURNACE; callout `furnace`; meter 25 | — | day |
| b04 | step 2 | pilae | Ghost: arrows hit solid ground under the floor and stop (`ghost-heat-blocked`) → floor lifts; tile stacks rise one tile at a time (`pilae-rise`); hot air weaves between them (`hot-air-between-pilae`); puppet next to a stack for scale | ⚠ NO WAY UNDER; ✓ STEP 2 · PILLARS; callout `pilae`; label `pilae-height` "2 ft / 60 cm"; meter 40 | arrows stopped by ground | day |
| b05 | step 3 | thick floor | Ghost: thin tiles over the flame glow red in one spot, rest blue (`ghost-hot-spot`) → three layers drop in: big tiles (`layer-big-tiles`), grey concrete (`layer-concrete`), top tiles (`layer-top-tiles`); floor glows evenly warm (`floor-glow-even`); small pizza-stone icon beside the callout | ⚠ HOT SPOT; ✓ STEP 3 · THICK FLOOR; callout `floor-layers`; meter 55 | single red hot spot | day |
| b06 | step 4 | wall flues | Ghost: smoke curls back and pours out the stokehole, flame shrinks (`ghost-smoke-backflow`) → hollow box tiles appear inside the cut walls (`box-tiles-in-walls`); arrows rise up the walls (`hot-air-up-walls`); wisps leave roof vents (`roof-vent-smoke`), flame grows | ⚠ TRAPPED SMOKE; ✓ STEP 4 · WALL FLUES; callout `tubuli`; meter 70 | smoke backflow, dying flame | day |
| b07 | step 5 | room order | Camera pulls back to show three rooms in a row; under-floor arrows fade orange → neutral left to right (`air-cools-gradient`); rooms tint hot (`room-hot-glow`), warm (`room-warm-glow`), cold room has a plain pool, no pilae (`room-cold-plain`) | ✓ STEP 5 · HOT · WARM · COLD; callouts `caldarium`, `tepidarium`, `frigidarium`; meter 75 | — | day |
| b08 | step 6 | stoker | Night (`to-night`); fire shrinks to embers, floor turns blue (`ghost-fire-out`), meter dips → stoker puppet feeds branches into the stokehole (`stoker-feeds-wood`); woodpile beside the furnace grows tall (`woodpile-grows`) | ⚠ FIRE OUT; ✓ STEP 6 · STOKER; meter 80 (dips to ~50 on the threat) | embers, cold floor | night |
| b09 | step 7 | sealed joints | Slow push-in to the floor; faint dashed grey-violet haze gathers under the floor (`gas-cloud-under`); a crack opens, haze seeps up, cat's ears flatten (`ghost-crack-seep`) → mortar fills joints, crack closes (`seal-joints`); haze drawn up the wall flues and out (`gas-up-flues`) | ⚠ INVISIBLE GAS; ✓ STEP 7 · SEALED JOINTS; meter 85 (dips to ~40 on the threat) | gas seeping through crack | navy (tense) |
| b10 | climax | stress test | Pull back: snowy ground and frost outside the bath-house (`winter-outside`), warm amber light inside (`inside-warm-glow`); puppet in wooden sandals walks the hot room; cat curls up on the warm floor (`puppet-sandals-cat`) | gauge "104°F / 40°C"; ✓ WARM IN WINTER; meter 95 | — | winter day |
| b11 | recap | checklist | Full cut-away; step plates 1–7 blink in turn over furnace, pilae, floor, flues, rooms, woodpile, sealed joints | step plates | — | day |
| b12 | ending | final line | Wide shot at dusk, smoke wisps from roof vents; cat asleep on the warm floor (callback) | label `title` "HYPOCAUST · 1st c. BC" | — | dusk |

## Scene elements
- Environment: ground cross-section (3 soil layers), winter sky day/night/dusk, snow/frost on ground (b10), distant hills. Kit: terrain, sky exist.
- Structure (build order): rooms' outer walls and roof (start as plain room on ground) → furnace with arched stokehole, outside the left wall (new) → pilae tile stacks, ~10 visible in the cut (new) → floor layers: big tiles, concrete, top tiles (new) → hollow box tiles inside the walls + roof vents (new) → three rooms in a row with partition walls, small pool in the cold room (new) → woodpile beside the furnace (new) → mortar seal effect on joints (new).
- Characters: puppet in Roman tunic — poses: stand, walk, shiver/rub arms, cough (b02), feed wood (stoker), walk in wooden sandals. Kit puppet exists; tunic and sandals are new.
- Observer: cat — shiver, flee, ears flat, curl up asleep. New.
- Props: firewood branches, wooden sandals, pizza-stone icon (small, beside callout).
- Effects: fire/embers, smoke (grey), soot streaks, heat arrows (under floor and up walls), cold arrows, crack, CO haze (dashed, low-opacity grey-violet), floor glow (even vs hot spot), frost.
- Kit: terrain, sky, puppet, arrows exist in kit/assets; furnace, pilae, box tiles, cat, Roman bath-house parts are new.

## Overlays used
StepBadge, ThreatBadge, Callout (up to 3 at once in b07 — stagger them), Gauge, FlowArrows, StakesMeter, KaraokeCaption, Cover. No new components.

## Storytelling techniques used
Paradox hook (b01), simplest attempt (b02), "But… / So you…" loop (b03–b09), failure ghosts (b02, b04, b05, b06, b08, b09), concrete numbers (b04 "two feet", b10 "a hundred and four"), physics in one sentence (b06 "hot air rises", b07 "air cools as it travels"), analogy "like a pizza stone" (b05), invisible threat (b09 carbon monoxide), stakes meter (all), day/night rhythm (b08 night, b09 tense navy, b10 winter day), scale through a person (b04 puppet beside pilae), recipe from ordinary things (b05 tiles, concrete, tiles), recap (b11), historical anchor (b12 label; b10 Hadrian's Wall), observer callback (cat b01 → b10/b12).

## Decisions
- Target 115 s with 245 English words (budget 246). Previous Roman topic (roman-aqueduct) ran 264 words → 116 s; pin-tumbler ran ~15 % short, so the budget is aimed near the top. Expected real voice ≈ 95–110 s.
- Observer animal: cat — Romans kept cats, and "cat on a warm floor" is an instantly readable payoff. Not stated in narration, visual only.
- Cut Vitruvius's sloped sub-floor (ball rolls back to the furnace): only one primary source. Cut the bronze water tank above the furnace and the Sergius Orata attribution (disputed) to keep the chain tight.
- Merged the sandals fact into the climax instead of a separate beat to stay inside the word budget.
- Temperature: used English Heritage's ~40 °C (104°F) for the hot room, backed by PBS "well above 100°F". Did not narrate floor temperatures (sources disagree: 20–50 °C measured vs 50–60 °C claimed).
- The thin-tile "hot spot" failure and the "draft pulls the fire / pulls the gas out" explanations are engineering reasoning, labelled in the Fact base.
- Climax set at Hadrian's Wall (Chesters fort has a preserved hypocaust) to contrast northern frost with a 104°F room; frost is a scenario, not a measurement.
- Historical anchor in English: "1st c. BC" (English Heritage + Wikipedia). Ukrainian label uses "2000 р. тому" to fit the 24-char label limit.
- Ukrainian uses metric (60 см, 40°C first in the gauge); "stoker" → "КОЧЕГАР"; "carbon monoxide" → "чадний газ"; final line uses "збудувати".
- Callout titles use the Latin names (PRAEFURNIUM, PILAE, CALDARIUM…) as the "term explained in the same sentence" — the narration explains each in plain words.

## Music
`music.json`: "Roman bath-house heated from below by a hidden furnace, 1st century BC to Roman Britain; lyre, tibia".

## Post
Cover headline (en): "FIRE UNDER THE FLOOR?"
Description (en): 2,000 years ago Romans heated floors with fire. No pipes, no electricity. Every pillar and tile has a reason.
Hashtags: #history #engineering #ancientrome #romanhistory #ancienttech #howitworks #learnontiktok
