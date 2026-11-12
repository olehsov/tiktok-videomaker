# Brief: Yakhchal — Ice in the Desert (`yakhchal`)

Languages: en · Target duration: 110 s · Category: cold-tech
Observer animal: lizard · Stakes meter: ICE SUPPLY (0–100)

## User story
As a TikTok viewer, I want to understand in under two minutes how Persians made and stored ice in the
desert 2,000+ years ago and why each part of a yakhchal is shaped that way, so that I see it is a chain
of simple decisions — and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of 110 s
- [ ] Hook (paradox: ice at 104°F) in the first 3 s
- [ ] 9 construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ 4 threats with "⚠" plates and failure ghosts (won't freeze, morning sun, cracks, hidden water)
- [ ] Climax stress test: July, 113°F outside, ice still in the pit
- [ ] Recap + final line "Now you know how to build a yakhchal."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- [ ] Day scenes neutral, night scenes navy; the cut-away shows the qanat, pit and drain underground at all times after they appear

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Qanat | Water is far away, desert is hot | Open canal heats and evaporates the water | Underground channel; water also runs along the shaded north side of the wall to pre-chill | [S1], [S2] |
| 2 | Shallow pools | Must freeze in one night | Deep water doesn't freeze through | ~100 × 10 m (330 × 33 ft), 40–50 cm (16–20 in) deep; thin layer, big surface loses heat fast | [S1] |
| 3 | Night freezing | Little frost | — | Clear dry night sky: water radiates heat upward, evaporation cools it further | [S1], [S2] |
| 4 | Shade wall E–W | Morning sun | Ice melts before harvest | ~10 m (up to 15 m) wall south of the pools; 15–20 °C (27–36 °F) cooler in its shade | [S1], [S2] |
| 5 | Straw on pool bed | Ground heats by day | Warm soil heats water from below | Straw covers the bed during the day, blocking heat | [S1] |
| 6 | Deep pit | Ice must last to summer | Melts in days above ground | Pit dug first, dome built over it; up to 5,000 m³ | [S1], [S2] |
| 7 | Wide wall base | Heavy dome on soil | Uneven settling, cracks, tilt, collapse in a few seasons | Walls ≥ 2 m (6.5 ft) at the base spread the load and insulate | thickness [S1]; load logic — engineering explanation, not from a source |
| 8 | Sarooj mortar | Meltwater, heat | Clay turns to mud and cracks | Sand, clay, lime, ash, egg whites, goat hair; water-resistant; hair as fibre reinforcement | recipe [S1], [S2]; "like rebar" — analogy |
| 9 | Cone dome | Warm air inside | Heat collects around the ice | Tall cone (Kerman ~18 m / 59 ft): warm air rises to the top, cold stays low | height [S1]; physics |
| 10 | Layer spacers | Months of storage | Blocks fuse into one lump | Wood, straw or mud between layers | [S1] |
| 11 | Floor drain | Meltwater at the bottom | Ice melts from below, unseen | Hole to a drainage well or back to the qanat | [S1] |

Sources (checked 2026-11-12):
- [S1] Yakhchāl — Wikipedia — https://en.wikipedia.org/wiki/Yakhch%C4%81l
- [S2] Kaveh Farrokh — 2,400-year-old yakhchals kept ice in the desert — https://www.kavehfarrokh.com/ancient-prehistory-651-a-d/achaemenids/ancient-advanced-technology-2400-year-old-yakhchals-kept-ice-in-the-desert/
Open questions: how many months ice lasted; exact pit depth — not stated in narration.

## Storyboard
| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | Wide desert cross-section, pale sun, heat haze; puppet wipes sweat; lizard hides under a rock | Gauge, meter 0 | — | day |
| b02 | attempt | simplest try fails | Bucket on sand; quick night; morning — still liquid, ripples | ⚠ WON'T FREEZE | — | day→night→day |
| b03 | step 1 | qanat | Open canal steaming (ghost) → underground tunnel appears from the mountain side, blue flow arrows | ✓ STEP 1; callout `qanat` | steaming canal | day |
| b04 | step 2 | shallow pools | Long pool dug at surface, fills from qanat; depth ruler | ✓ STEP 2; callout `pool-length`; label `pool-depth` | — | day |
| b05 | night | physics | Sky to navy, stars; red-orange arrows rise from water; ice crust grows | meter 25 | — | night |
| b06 | step 3 | shade wall | Sunrise, crust melts (ghost) → wall rises south of pool, shadow covers it; pull-back with tiny puppet for scale | ⚠ MORNING SUN; ✓ STEP 3; gauge; meter 40 | melting crust | day |
| b07 | step 4 | straw | Soil cross-section: heat arrows from below hit a straw layer on the pool bed | ✓ STEP 4 | — | day |
| b08 | step 5 | pit + wide base | Pit dug in the cut-away; narrow walls sink, tilt, crack (ghost) → wide base, yellow load arrows fan into soil | ⚠ CRACKS; ✓ STEP 5; callout `base` | sinking cracked walls | day |
| b09 | step 6 | sarooj | Bucket; ingredients drop in one by one with icons; walls get plastered | ✓ STEP 6; callout `recipe` | mud walls dripping (brief) | day |
| b10 | step 7 | cone | Cone grows ring by ring to full height; orange arrows to tip, blue settle low | ✓ STEP 7; label `cone-height` | — | day |
| b11 | step 8 | layers | Puppet carries blocks into pit; ghost: one fused lump → layers with straw spacers | ✓ STEP 8; meter 80 | fused lump | winter day (cooler grade) |
| b12 | step 9 | drain | Slow push-in to pit floor; puddle grows under ice → hole opens, water runs to a well | ⚠ HIDDEN WATER; ✓ STEP 9; meter 70 | puddle | navy (tense) |
| b13 | climax | stress test | Harsh heat outside; cool blue light inside; puppet lifts a block; lizard climbs onto the ice | gauge; ✓ ICE IN SUMMER; meter 90 | — | summer day |
| b14 | recap | checklist | Full yakhchal cross-section; step plates 1–9 blink in turn over their elements | step plates | — | day |
| b15 | ending | final line | Wide shot at sunset; lizard lies on the ice (callback) | label `title` | — | sunset |

## Scene elements
- Environment: desert ground cross-section (3 soil layers), distant mountains, sky day/night/sunset, sun, stars.
- Structure (build order): qanat tunnel, pool, shade wall, straw layer, pit, thick walls with wide base, plaster, cone dome (ring segments), ice blocks + straw spacers, floor drain + well.
- Characters: puppet builder in turban and robe — poses: stand, wipe sweat, dig, carry block, lift block.
- Observer: lizard — hide, peek, climb, lie on ice.
- Props: bucket, ingredient icons (clay, sand, lime, ash, egg, goat hair).
- Effects: water flow, steam, ice crust growth, melt drips, cracks, heat haze, arrows.
- Kit: terrain, sky, puppet, arrows exist in kit/assets (after bootstrap); qanat, cone, wall, lizard are new.

## Overlays used
StepBadge, ThreatBadge, Callout, Gauge, FlowArrows, StakesMeter, KaraokeCaption, Cover. No new components.

## Storytelling techniques used
Paradox hook (b01), simplest attempt (b02), failure ghosts (b03, b06, b08, b09, b11, b12), concrete numbers (b01, b04, b06, b08, b10, b13), physics in one sentence (b05, b10), analogy "like rebar" (b09), invisible threat (b12), stakes meter (all), day/night rhythm (b02, b05, b12), scale through a person (b06), recipe (b09), recap (b14), historical anchor (b15 label), observer callback (b01 → b13, b15).

## Post
Cover headline (en): "ICE IN THE DESERT?"
Description (en): 2,400 years ago Persians made ice in the desert, with no electricity. Every part of this building has a reason.
Hashtags: #history #engineering #ancienttech #persia #howitworks #learnontiktok
