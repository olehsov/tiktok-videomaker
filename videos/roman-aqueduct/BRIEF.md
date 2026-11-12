# Brief: Roman Aqueduct — A River With No Pump (`roman-aqueduct`)

Languages: en · Target duration: 115 s · Category: water
Observer animal: pigeon · Stakes meter: WATER IN TOWN (0–100)

## User story
As a TikTok viewer, I want to understand in under two minutes how the Romans moved a river 31 miles
into a city with no pump and why each part of an aqueduct is shaped that way, so that I see it is a chain
of simple decisions — and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of 115 s (never above 120 s)
- [ ] Hook (paradox: 31 miles of flowing water, no pump) in the first 3 s
- [ ] 9 construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ 6 threats with "⚠" plates and failure ghosts (water stops, sun & dirt, valley, too deep, mud, limestone crust)
- [ ] Climax stress test: autumn storm — river in flood under the arches, muddy runoff caught by the settling tank, fountains in town still running
- [ ] Recap + final line "Now you know how to build a Roman aqueduct."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- [ ] The slope is exaggerated on screen but always reads as "downhill all the way": the water line never rises anywhere from spring (left) to city (right), except inside the sealed siphon pipe
- [ ] The underground part (buried channel, tunnel, siphon pipe at valley bottom) stays visible in the cut-away after it appears
- [ ] Water in the scene flows left → right in every beat from b03 on (blue FlowArrows along the channel)

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Gravity + tiny slope | No pumps; water only moves downhill | Too flat/uphill: water stalls and pools. Too steep: fast water scours and damages the channel | Constant gentle fall. Nîmes aqueduct: ~50 km (31 mi), average ~0.25–0.34 m/km (≈1.3–1.8 ft per mile → "under two feet per mile"); total drop 11–17 m (sources differ, all under 60 ft). Vitruvius gives a minimum fall for channels | length [S2], [S3], [S7], [S8]; gradient 0.25 m/km [S7], [S8], 1 in 3,000 [S2], [S3]; Vitruvius rule [S4], [S1]; erosion reason "probably" [S1] + engineering explanation |
| 2 | Chorobates (survey level) | A slope this small is invisible to the eye | Builders lose the fall; a section ends up uphill | ~20-ft wooden frame with a water level and plumb lines to check level | [S4], [S1] |
| 3 | Route around hills / tunnels | A hill blocks the straight line | Water cannot go over a rise | Route follows the land around hills (Nîmes: ~20 km / 12 mi straight line, ~50 km route; long detours were normal) or tunnels through, keeping the same fall; Vitruvius: shafts every 120 ft over tunnels | detours [S3], [S6]; tunnels [S4], [S1], [S3] |
| 4 | Buried, covered channel (specus) | Open ditch in the sun | Sun heats the water, evaporation, dirt/leaves fall in, easy to damage | Channel buried and roofed with slabs or a vault; "arched over… that the sun may strike on the water as little as possible". Most of the length underground (Rome: 269 of 315 mi per [S6]; ~47 of ~800 km above ground per [S1]; Nîmes ~35 of 50 km [S3]) | covering [S4], [S1], [S6]; underground share [S1], [S6], [S3]; dirt/evaporation — engineering explanation |
| 5 | Waterproof lining (opus signinum) | Soil and stone joints leak | Water soaks away along the route | Lining of lime mortar with crushed tile/pottery; waterproof, smooth | [S6], [S9], [S1]; "like a bathtub" — analogy |
| 6 | Arches over valleys | Valley in the way | Channel dips in and water can't climb out; a solid wall would need far more stone and block the river | Arcades carry the channel level across; arches send the load down into the piers. Pont du Gard: 3 tiers, ~49 m (160 ft) high, ~50 AD | height/tiers [S2], [S7]; date [S2], [S7]; arches only where needed [S6], [S1]; load path + "solid wall" — engineering explanation |
| 7 | Inverted siphon | Valley too deep for a bridge | Arcade would be impractically tall | Header tank → sealed lead pipes down, across, up → receiving tank slightly lower; water rises because the water behind it pushes ("seeks its own level") | [S1], [S4], [S10]; "seeks its own level" — physics, engineering explanation |
| 8 | Settling tank | Muddy water after rain; sand and grit | Grit settles in pipes and fountains, blocks them | Wide basin: water slows, heavy particles sink | tanks [S1], [S5], [S6]; muddy after rain [S5]; clog consequence + slowing physics — engineering explanation |
| 9 | Access hatches + cleaning crews | Hard spring water deposits calcium carbonate | Crust narrows the channel, flow shrinks year after year (Nîmes flow fell from ~35,000 to ~10,000 m³/day — [S8] only, not stated on screen) | Inspection/access covers at intervals; workers clean the walls; repairs scheduled for low-demand seasons | deposits [S1], [S3], [S5], [S11]; access covers [S1], shafts [S4]; crews [S3], [S6]; "like kettle scale" — analogy |
| 10 | Distribution tank (castellum) | One stream must serve the whole city | Uncontrolled, one user takes everything | Tank splits the flow into separate pipes: Vitruvius — three pipes for fountains, baths, private houses; Nîmes castellum: round basin 5.5 m across | [S4], [S1], [S3] |
| 11 | Output | — | — | Nîmes: ~30,000–40,000 m³ (up to ~10 million US gal) per day; worked for centuries | flow [S2], [S7], [S8]; "for centuries" [S7], [S8], [S3], [S11] |

Sources (checked 2026-11-12):
- [S1] Roman aqueduct — Wikipedia — https://en.wikipedia.org/wiki/Roman_aqueduct
- [S2] Pont du Gard — Wikipedia — https://en.wikipedia.org/wiki/Pont_du_Gard
- [S3] Nîmes aqueduct — Wikipedia — https://en.wikipedia.org/wiki/N%C3%AEmes_aqueduct
- [S4] Vitruvius, The Ten Books on Architecture, Book VIII (ch. 5–6), LacusCurtius, University of Chicago — https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/8*.html
- [S5] Frontinus, De aquis (transl. R. H. Rodgers), LacusCurtius, University of Chicago — https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Frontinus/De_Aquis/Rodgers/2**.html
- [S6] National Geographic History — Aqueducts: Quenching Rome's Thirst — https://www.nationalgeographic.com/history/history-magazine/article/roman-aqueducts-engineering-innovation
- [S7] Pont du Gard official site — The monument — https://pontdugard.fr/en/discover/monument
- [S8] ROMAQ Roman aqueducts database — Nîmes — https://www.romaq.org/the-project/aqueducts/178
- [S9] Opus signinum — Wikipedia — https://en.wikipedia.org/wiki/Opus_signinum
- [S10] Aqueduct of the Gier — Wikipedia — https://en.wikipedia.org/wiki/Gier_aqueduct
- [S11] Discover Magazine — 300 years of aqueduct deposits may link the Plague of Cyprian to the decline of Roman Nîmes (JGU Mainz study) — https://www.discovermagazine.com/300-years-of-aqueduct-deposits-may-link-the-plague-of-cyprian-to-the-decline-of-roman-n-mes-49702

Open questions (not stated in narration):
- Exact total drop of the Nîmes aqueduct: 11.2 m [S8], 12.6 m (travel sites), 17 m [S2], [S3]. Narration avoids the number; "under two feet per mile" holds for all.
- How long water reached Nîmes: ~5 centuries [S7], [S8] vs. supply to Nîmes ending ~AD 270 [S11]. Narration says only "for centuries".
- Pont du Gard date: ~40–60 AD [S2], [S7] vs. 19 BC [S6]. Overlay uses "~50 AD" (majority, official site).
- Siphon depths/pressures (Gier, Beaunant ~122 m) only in single non-authoritative sources — no numbers on screen.
- Water travel time (~27 h) and 6-ton blocks — single source family [S2]/[S3]; not used.

## Storyboard
Scene layout: one long side-view profile strip across the vertical frame, spring in green hills on the left, city
on the right, compressed horizontally. Above ground: hills, valleys, river, sky. Below ground: 3-layer soil cut-away
showing the buried channel, tunnel and siphon pipe. Each step is a slow push-in on its stretch of the profile, then a
pull-back so the growing line stays readable (accumulating frame). Slope is drawn exaggerated (Decision 4).

| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | Wide profile: spring bubbling in the hills far left, dry Roman town far right with an empty fountain; pigeon pecks at the dry fountain; cue `city-reveal` pans/pushes to the town then back | Gauge "31 mi / 50 km"; meter 0 | — | day |
| b02 | attempt | simplest try fails | Puppet digs a straight ditch (`ditch-dig`); terrain rises; water stops at the foot of a rise and spreads into a puddle (`ghost-pool-at-hill`) | ⚠ WATER STOPS | puddle at the rise | day |
| b03 | step 1 | tiny slope | Ghosts: steep channel with whitewater tearing stones loose (`ghost-scour`), flat channel with still water (`ghost-stall`); then a straight, gently tilted channel line from spring to town (`slope-tilt`); puppet sights along a long wooden chorobates | ✓ STEP 1 · TINY SLOPE; callout `chorobates`; label `slope`; meter 10 | scouring / stalled water | day |
| b04 | step 2 | around or through | A hill rises across the line (`hill-rise`); ghost: channel climbing the hill, water sliding back (`ghost-uphill`); fix: dashed detour hint around the hill + a tunnel bored through the hill's cut-away at the same fall (`tunnel-bore`) | ✓ STEP 2 · AROUND OR THROUGH; callout `tunnel` | water sliding back | day |
| b05 | step 3 | covered channel | Open ditch: hot sun, orange heat arrows, steam wisps, leaves and dirt drop in (`ghost-sun-evaporation`); channel sinks into the soil (`channel-bury`), stone slabs drop on top one by one (`slab-roof`) | ⚠ SUN & DIRT; ✓ STEP 3 · COVERED CHANNEL; callout `specus`; meter 20 | steaming, dirty ditch | harsh day → neutral day |
| b06 | step 4 | waterproof lining | Close-up cross-section of the channel: water seeps into soil as dark drips (`ghost-leak`); bucket; crushed tile shards (`ingredient-tiles`) and lime (`ingredient-lime`) drop in; walls get a pinkish-red coat (`lining-coat`), drips stop | ✓ STEP 4 · WATERPROOF LINING; callout `lining`; meter 30 | seeping walls | day |
| b07 | step 5 | arches | Valley opens in the profile with a river (`valley-reveal`); ghost: channel dips in, water pools at the bottom (`ghost-valley-dip`); three tiers of arches rise (`arches-rise`); yellow load arrows run down through each arch into the piers (`load-arrows`); pull-back with a tiny puppet at the river for scale, pigeon lands on the top tier (`scale-pullback`) | ⚠ VALLEY; ✓ STEP 5 · ARCHES; callout `arch`; label `pdg-height`; meter 45 | water trapped in the dip | day |
| b08 | step 6 | siphon | A much deeper valley; ghost: an absurdly tall stack of arches wobbling (`ghost-too-tall`); header tank on the near rim, lead pipes run down, along the valley bottom, up to a slightly lower tank (`siphon-pipes`); blue arrows push water down then up (`siphon-flow`); far tank fills (`tank-fill`); thin dashed level line connects both tanks | ⚠ TOO DEEP; ✓ STEP 6 · SIPHON; callout `siphon`; meter 55 | wobbling giant arcade | day |
| b09 | step 7 | settling tank | Rain clouds, brown water in the channel (`rain-muddy`); ghost: town pipe end choked with sand (`ghost-clog`); a wide basin appears in the line (`tank-build`); flow arrows slow and spread, sand grains drift to the floor (`sand-settle`), clear water exits | ⚠ MUD; ✓ STEP 7 · SETTLING TANK; meter 65 | sand-choked pipe | overcast → day |
| b10 | step 8 | access hatches | Slow push-in to the buried channel: white crust grows on the walls, ring by ring (`crust-grow`); flow arrows thin to a trickle (`flow-thin`); meter dips; a hatch in the slabs opens (`hatch-open`); puppet climbs in and scrapes crust off (`crew-scrape`), flow widens | ⚠ LIMESTONE CRUST; ✓ STEP 8 · ACCESS HATCHES; callout `crust`; meter 70 (shown dipping to ~50 on `flow-thin`, then up) | narrowing channel | navy (tense, underground) → day |
| b11 | step 9 | distribution | Town: a round tank receives the channel (`castellum-build`); pipes branch to a fountain, a bathhouse and houses (`pipes-to-city`) | ✓ STEP 9 · SPLITTER TANK; callout `castellum`; meter 85 | — | day |
| b12 | climax | stress test | Dark storm (`storm`): the river under the arches rises and roars; rain on the hills; brown water reaches the settling tank and leaves clear (`tank-catches-mud`); arches stand firm, yellow load arrows pulse (`arches-hold`); storm clears, town fountain gushes, pigeon drinks and splashes (`fountain-flow-pigeon`) | ✓ NO PUMP NEEDED; gauge "10M gal / 40,000 m³ a day"; meter 100 | — | storm (navy) → clear day |
| b13 | recap | checklist | Full profile from spring to town; step plates 1–9 blink in turn over their elements | step plates | — | day |
| b14 | ending | final line | Wide shot at sunset of the Pont du Gard tiers with water glinting along the top; pigeon on the fountain rim (callback) | label `title` | — | sunset |

Cue action ids (from script.en.json): city-reveal, ditch-dig, ghost-pool-at-hill, ghost-scour, ghost-stall, slope-tilt, hill-rise, ghost-uphill, tunnel-bore, ghost-sun-evaporation, channel-bury, slab-roof, ghost-leak, ingredient-tiles, ingredient-lime, lining-coat, valley-reveal, ghost-valley-dip, arches-rise, load-arrows, scale-pullback, ghost-too-tall, siphon-pipes, siphon-flow, tank-fill, rain-muddy, ghost-clog, tank-build, sand-settle, crust-grow, flow-thin, hatch-open, crew-scrape, castellum-build, pipes-to-city, storm, tank-catches-mud, arches-hold, fountain-flow-pigeon.

## Scene elements
- Environment: long terrain profile with 3 soil layers (kit `terrain` — new long-profile variant), green hills with spring (left), two valleys (one shallow with a river, one deep), Mediterranean scrub/cypress trees (kit `pineTree` recoloured), distant mountains (kit `mountains`), sky day/storm/sunset (kit `sky`), sun (kit `sun`), rain + storm clouds (new), rocks (kit `rocks`).
- Structure (build order): straight ditch (attempt), sloped channel line, hill + tunnel bore, buried channel with stone-slab roof (new), channel lining coat (new), three-tier arcade (new, low-poly, Pont du Gard proportions: 6 / 11 / many small arches), header tank + lead siphon pipes + receiving tank (new), settling basin (new), access hatches in the slab roof (new), round distribution tank + branching pipes (new), town: fountain, bathhouse, 2–3 houses (new).
- Characters: puppet builder in tunic — poses: stand, dig, sight along the chorobates, carry slab, climb into hatch, scrape (kit `puppet` + new poses).
- Observer: pigeon — peck at dry fountain, perch on arch, flinch in storm, drink/splash at fountain (new).
- Props: chorobates (long wooden frame with water trough and plumb bobs, new), bucket (kit `bucket`), tile shards and lime sack icons (new), scraper tool (new).
- Effects: water flow along the channel (kit `waterSurface` + FlowArrows), whitewater scour, puddles, steam wisps, falling leaves/dirt, seep drips, muddy water tint, settling sand grains, limestone crust rings, rain, rising river, fountain spray.
- Kit: terrain, sky, sun, mountains, rocks, pineTree, puppet, bucket, waterSurface, FlowArrows exist in kit/assets; arcade, siphon, tanks, slabs, chorobates, town buildings, pigeon are new.

## Overlays used
StepBadge, ThreatBadge, Callout, Gauge, FlowArrows (water: blue along the channel; loads: yellow down the arches; heat: orange on the open ditch), StakesMeter, KaraokeCaption, Cover. No new components.

## Storytelling techniques used
Paradox hook (b01), simplest attempt (b02), failure ghosts (b02, b03, b04, b05, b06, b07, b08, b09, b10), concrete numbers (b01 31 miles, b03 under two feet per mile, b07 three tiers / 160 ft, b12 ten million gallons), physics in one sentence (b03 "water only flows downhill", b08 "water seeks its own level", b09 "water slows, sand sinks"), everyday analogies (b06 "like a bathtub", b10 "like kettle scale"), invisible threat (b10 limestone crust), stakes meter (all beats), day/night-style mood shifts (b05 harsh sun, b10 navy underground, b12 storm → clear, b14 sunset), scale through a person (b07 pull-back), recipe from ordinary things (b06 crushed tiles + lime), recap (b13), historical anchor (b07 "Pont du Gard" + b14 label), observer callback (b01 dry fountain → b07 perch → b12/b14 drinking at the fountain).

## Decisions
- **Duration 115 s, 281 words.** Nine steps justify near-maximum length; 115 rather than 120 leaves room for the 2.5 s silent recap and the 1.5 s tail so the real video stays under the 120 s hard cap.
- **31 miles, not 50.** The topic says "50 miles", but the story follows the Nîmes aqueduct / Pont du Gard (50 km = 31 mi), the best-documented single example with the famous arches. Narration uses the true 31 miles; the cover reads "31 MILES. NO PUMP?". The 85-km (53-mi) Gier aqueduct was considered, but its features are less documented and less recognisable.
- **Composite build.** The viewer builds a generic Roman aqueduct. Numbers come from Nîmes (length, slope, Pont du Gard, output). The inverted siphon is not used at Nîmes; it comes from Roman practice elsewhere (Gier at Lyon, Vitruvius), so narration never says the siphon is at Pont du Gard.
- **Slope stated as "under two feet per mile".** Sources disagree (0.25 vs ~0.34 m/km; total drop 11.2 / 12.6 / 17 m). This phrasing is true for every source. The on-screen slope is exaggerated so the viewer can see it, and the label carries the real number.
- **"For centuries", not "for 500 years".** The official site and ROMAQ give ~5 centuries, but the 2026 JGU Mainz deposit study says water stopped reaching Nîmes around AD 270. "Centuries" is true either way.
- **Date overlay "~50 AD".** Official site and Wikipedia (40–60 AD) win over National Geographic's 19 BC.
- **Cut elements:** the chorobates gets a callout, not a narrated step (on-screen only, to save words). Vitruvius' exact gradient is not stated because translations disagree (1:200 vs 1:4800). Boundary-stone protection zones, laws and fines, the 27-hour travel time and the Gier lead tonnage were cut (off the visual chain or single-sourced). Stone blocks without mortar were also cut.
- **Terms on screen only.** Specus, opus signinum, inverted siphon and castellum appear only as callout or plate text; narration stays in plain words ("stone slabs", "crushed tiles and lime", "lead pipes", "round tank").
- **Step 9 plate "SPLITTER TANK"** instead of "CASTELLUM" so the plate is self-explaining; the Latin term sits in the callout.
- **Observer animal: pigeon.** It ties the town fountain (dry in b01, flowing in b12) to the arches (perch in b07), and Roman cities had pigeons/doves.
- **Stakes meter "WATER IN TOWN"** rises step by step and dips only on the limestone threat (b10), the one problem that hits a finished, working aqueduct.
- **Climax storm** is dramatised, not a specific historical event: it stress-tests three fixes at once (settling tank, arches, covered channel).
- **Units:** imperial in narration; overlays show both where it matters (31 mi / 50 km, 160 ft / 49 m, slope label, daily output).

## Post
Cover headline (en): "31 MILES. NO PUMP?"
Description (en): Romans moved a river 31 miles with no pump, just a slope you can barely see. Every part has a reason.
Hashtags: #history #engineering #ancientrome #aqueduct #howitworks #learnontiktok #pontdugard
