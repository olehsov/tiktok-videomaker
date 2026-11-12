# Brief: Composite Bow — Short Bow, Long Shot (`composite-bow`)

Languages: en · Target duration: 95 s · Category: weapon-tool
Observer animal: steppe marmot · Stakes meter: BOW POWER (0–100)

## User story
As a TikTok viewer, I want to understand in 95 seconds how a four-foot bow of wood, horn and sinew
could outshoot a six-foot longbow and why each layer and curve is there, so that I see it is a chain
of simple decisions — and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of 95 s
- [ ] Hook (paradox: 4 ft bow outshoots a 6 ft longbow, both shown side by side to scale) in the first 3 s
- [ ] 7 construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ 4 threats with "⚠" plates and failure ghosts (snap, layers slip, damp air; plus the longbow that won't fit on a horse)
- [ ] Climax stress test: full gallop, full draw, no crack; arrow flies off-frame, gauge "800+ yd / 730+ m"
- [ ] Recap + final line "Now you know how to build a composite bow."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- [ ] A limb cross-section inset (sandwich: horn inside / wood core / sinew outside) stays on screen from b04 to b10 and gains each layer as it is added; inside (belly, archer side) is always drawn on the same side as the archer
- [ ] Force arrows: compression (squeeze) on the belly in `--ui-blue`, tension (stretch) on the back in `--ui-heat`; the same two colours are used for the caption keywords "squeezes" / "stretches"
- [ ] The unstrung C-shape (b08) is visibly bent the *opposite* way to the strung bow

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Short length | Mounted archers need a bow they can swing over a horse | A longbow (~6 ft / 1.8 m; Mary Rose bows avg 6 ft 6 in) is taller than the archer and hard to shoot from horseback | Composite bows are small and light: Turkish bows 41–51.5 in, up to 52 in / 132 cm; "about four feet" in narration | longbow length [S5], [S2]; composite length [S2], [S4], [S1]; mounted use [S1], [S2], [S7] |
| 2 | Why short wood fails | A short limb must bend much more sharply | A wooden bow of the same shape, length and draw weight "would break before full draw" | Bending puts the belly (archer side) in compression and the back in tension; wood alone cannot take both at that strain | break [S1]; compression/tension sides [S2], [S6], [S3]; "can't take both" — engineering explanation, not from a source |
| 3 | Wood core | Something must give the bow its shape and hold the layers | — | Thin wooden core (maple common in Turkish bows; bamboo/mulberry in China) carries the shape; horn and sinew carry the power | [S1], [S2], [S3], [S8] |
| 4 | Horn belly | Belly is squeezed at full draw | Wood belly crushes and takes a set / cracks | Water-buffalo (or antelope) horn glued on the belly; horn stores more energy in compression than wood. "Like a spring" — analogy | horn & placement [S1], [S2], [S3], [S4]; wood-crush consequence — engineering explanation |
| 5 | Sinew back | Back is stretched at full draw | Wood back splinters | Sinew (tendon) in glue, laid along the limb on the back; resists tension and stretches more without breaking. "Like a rubber band" — analogy | [S1], [S2], [S3], [S6] |
| 6 | Animal glue + drying | Three materials must act as one | Layers shear/slide apart under load (delamination; cow horn is noted to delaminate) | Hide glue and/or fish-bladder glue; then long drying — about a year held in shape (Aramco: ≥ 1 year, ~1.5 years total; others: "up to a year or longer", "might take a year") | glue [S1], [S2], [S3], [S4]; drying [S2], [S3], [S6]; "slide apart" — engineering explanation (delamination term from [S1]) |
| 7 | Waterproof skin + case | Animal glue absorbs moisture | Glue loses strength in humid air; bows "couldn't endure Western European humidity" | Limbs covered with bark or leather (or lacquer/paint); Byzantine *Strategikon* advised keeping bows in leather cases | humidity [S1], [S4], [S6]; covering [S1], [S3], [S6]; case [S1]; "peels apart" — engineering explanation |
| 8 | Reflex / recurve | Short limbs have a short stroke to store energy in | Less energy per pull | Unstrung, the limbs curl forward into a "C" (tips may touch); strung, they are bent back — the bow is already under tension, higher draw weight early in the draw, more total energy | [S1], [S7], [S8] |
| 9 | Siyahs (stiff tips) | Tips of a short limb would just flex and waste energy | — | Non-bending, stiff, light tips (siyahs) form the recurved ends; they do not flex and add power. "Stiff levers that whip the string" — engineering explanation, not from a source | [S1], [S2], [S7] |
| 10 | Range (climax) | — | — | Ottoman flight records: ≥ 874 yd [S9]; 930 yd (early 1500s) [S4]; 963 yd / 888.8 m (Selim III) [S2] → narration "over eight hundred yards". Longbow comparison: Mary Rose replica 359 yd [S5]; heavy war bows 330–350 yd with flight arrows [S10] | [S2], [S4], [S9]; longbow [S5], [S10] |
| 11 | Age (anchor) | — | — | Composite bows from the 3rd millennium BC (Aramco); several in Tutankhamun's tomb (d. 1324 BCE) → label "3,000+ YRS" | [S1], [S2] |

Sources (checked 2026-11-12):
- [S1] Composite bow — Wikipedia — https://en.wikipedia.org/wiki/Composite_bow
- [S2] "History's S-Curve" — AramcoWorld, May/June 2003 — https://archive.aramcoworld.com/issue/200305/history.s.curve.htm
- [S3] The Horn Bow — Archery Historian — https://archeryhistorian.com/the-horn-bow/
- [S4] Performance of Turkish Bows — ATARN (Asian Traditional Archery Research Network) — https://www.atarn.org/islamic/Performance/Performance_of_Turkish_bows.htm
- [S5] English longbow — Wikipedia — https://en.wikipedia.org/wiki/English_longbow
- [S6] Chinese bows were superior, too — China Digital Times (citing Needham / *Chou Li*) — https://chinadigitaltimes.net/2011/01/chinese-bows-were-superior-too/
- [S7] Recurve bow — Wikipedia — https://en.wikipedia.org/wiki/Recurve_bow
- [S8] Turkish archery — Wikipedia — https://en.wikipedia.org/wiki/Turkish_archery
- [S9] Turkish Flight Arrows — TurkishCulture.org — https://www.turkishculture.org/lifestyle/turkish-culture-portal/turkish-flight-arrows-554.htm?type=1
- [S10] Heavy bows — Longbow Archers — https://longbow-archers.com/heavybows.html

Open questions (not stated in narration):
- Exact flight record and its year differ between sources (874 / 930 / 953 / 963 / 972 yd; 1788 vs 1798; Selim III vs Tozkoparan). Narration only says "over eight hundred yards", which all checked sources support.
- Flight records were set with special flight bows and arrows on foot, not with war bows on horseback. Narration keeps the record as a separate sentence about "Ottoman archers", not about the gallop shot.
- "Hide glue reaches full strength after 10 years" — single source [S2]; not used.
- Glue-line scoring adds ~40 % contact area — single source [S2]; not used.
- Draw weights (Turkish 90–160 lb common [S4]) — not needed for the story; not used.

## Storyboard
| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | Steppe cross-section (grass, soil layers, distant hills). Puppet archer stands; a short recurved bow next to him reaches his chest; `longbow-slide-in`: a 6 ft longbow slides in beside it, taller than the puppet (scale through a person). Marmot pops up from its burrow in the cut-away | labels `short-bow`, `longbow`; meter 0 | — | day |
| b02 | attempt | simplest try fails | `rider-longbow-clash`: puppet on a low-poly horse; the longbow's lower tip hits the horse's neck / ground. `ghost-wood-snap`: puppet holds a short plain wooden bow, draws — it snaps in the middle with splinters. Marmot dives into burrow | ⚠ SNAP | longbow clash, wood snap | day |
| b03 | step 1 | physics + core | Camera pushes in to a big side view of one bent limb. `force-arrows-in`: blue arrows press on the inner (archer-side) curve; `force-arrows-out`: orange arrows pull along the outer curve. `core-appear`: the limb fades to a thin maple core; cross-section inset (circle, upper-right) shows only the wood strip | ✓ STEP 1 · WOOD CORE; callout `core`; meter 15 | — | day |
| b04 | step 2 | horn belly | `horn-layer`: grey-cream horn strip glues onto the inner face; inset adds the horn layer. `horn-spring-demo`: a small horn block squeezed by blue arrows, bounces back with a spring icon | ✓ STEP 2 · HORN BELLY; callout `horn`; meter 35 | — | day |
| b05 | step 3 | sinew back | `sinew-layer`: pale fibres laid along the outer face in strands; inset adds the sinew layer. `sinew-band-demo`: a fibre bundle stretched by orange arrows snaps back with a rubber-band icon | ✓ STEP 3 · SINEW BACK; callout `sinew`; meter 55 | — | day |
| b06 | step 4 | glue + drying | `ghost-layers-slip`: limb bends, the three layers slide past each other at the ends (red tint). `glue-pot-bond`: glue pot over a small fire, icons drop in (hide, fish); layers snap together. `seasons-pass`: bow tied in a curve, hung in a yurt doorway while sky cycles day/night several times, snow, then grass (day/night rhythm) | ⚠ LAYERS SLIP; ✓ STEP 4 · ANIMAL GLUE; callout `glue`; label `dry-time`; meter 70 | layers sliding | day → night cycles → day |
| b07 | step 5 | invisible threat: humidity | `mist-roll-in`: blue mist rolls across the steppe (tense navy grade). `ghost-peel`: glue lines in the inset glow red, horn strip peels away at a tip. `wrap-cover`: limbs wrapped in bark/leather; `bow-case`: bow slides into a leather case on the saddle | ⚠ DAMP AIR; ✓ STEP 5 · SEALED SKIN; callout `cover`; meter 50 → 75 | peeling layer | navy (tense) → day |
| b08 | step 6 | reflex | `unstrung-c-shape`: bow out of case, unstrung — limbs curl forward into a "C". `string-bow`: puppet bends it the other way, string clicks on. `tension-arrows`: yellow load arrows glow along limbs before any draw | ✓ STEP 6 · REFLEX; callout `reflex`; meter 85 | — | day |
| b09 | step 7 | siyahs | `tips-highlight`: both stiff tips outlined. `siyah-whip-demo`: slow-motion release — limbs flex, tips stay straight and swing like levers, string snaps forward | ✓ STEP 7 · SIYAHS; callout `siyah`; meter 95 | — | day |
| b10 | climax | stress test | `horse-gallop`: horse at full gallop across the steppe, dust. `full-draw`: puppet draws to the ear; limb glows, no cracks. `arrow-flight`: arrow leaves, long arc off-frame; pull-back with the longbow silhouette's arc falling short far behind | ✓ FULL DRAW, NO CRACK; gauge; meter 100 | — | late day |
| b11 | recap | checklist | Big finished bow in side view with the limb inset; step plates 1–7 blink in turn over core, horn, sinew, glue lines, wrap, C-curve, tips | step plates | — | day |
| b12 | ending | final line | Sunset steppe; horse grazing; marmot sits up on its burrow next to the cased bow (callback) | label `title` | — | sunset |

## Scene elements
- Environment: steppe ground cross-section (grass top, 3 soil layers with marmot burrow), low distant hills, sky day/night/sunset/tense navy, sun, stars, mist.
- Structure (build order): plain wooden short bow (ghost, snaps), maple core strip, horn belly strip, sinew strands on the back, glue lines, bark/leather wrap, leather case, string, stiff siyah tips; limb cross-section inset (circle) that mirrors each layer.
- Characters: puppet archer in a steppe coat and cap — poses: stand, hold bow, draw (half, full), string bow (bending), ride, ride-and-draw, tie bow. Low-poly horse — stand, gallop, graze.
- Observer: steppe marmot — pop up, dive into burrow, peek, sit up (callback).
- Props: 6 ft longbow, glue pot + small fire, ingredient icons (hide, fish), spring icon, rubber-band icon, yurt doorway, arrow.
- Effects: force arrows (blue squeeze, orange stretch, yellow load), splinters/snap, layer slide, peel, mist, dust, arrow arc trail, seasons cycle.
- Kit: terrain, sky, sun, stars, mountains (as hills), nature (grass), rocks, puppet exist in kit/assets; horse, marmot, bow parts, limb inset, longbow, glue pot, yurt doorway, bow case, mist are new.

## Overlays used
StepBadge, ThreatBadge, Callout, Gauge, FlowArrows (force arrows), StakesMeter, KaraokeCaption, Cover. New: **LayerInset** — circular inset (upper-right, inside safe zone) showing a stacked cross-section of the limb; layers added by id (`core`, `horn`, `sinew`, `glue`, `cover`), each layer can tint red for ghosts. Could be built in-scene instead of as a kit component; the architect decides.

## Storytelling techniques used
Paradox hook with scale through a person (b01), simplest attempt (b02), failure ghosts (b02, b06, b07), concrete numbers (b01, b02, b06, b10), physics in one sentence (b03), everyday analogies "like a spring" (b04) and "like a rubber band" (b05), invisible threat — damp air (b07), stakes meter (all), day/night rhythm (b06 seasons, b07 navy, b12 sunset), recipe from ordinary things — hide, fish bladders, horn, tendon (b04–b06), recap (b11), historical anchor "3,000+ YRS" (b12 label) and Ottoman archers (b10), observer callback marmot (b01 → b02 → b12).

## Decisions
- Target 95 s (not 90): 7 steps + hook, attempt, climax need ~200 words; 90 s would allow only 188. Narration is 200 words against a budget of 200.
- Steps chosen: core, horn, sinew, glue (+drying), sealed skin, reflex, siyahs. Cut: string bridge (small effect, one source), bone stiffeners vs. wooden siyahs (historical detail, not needed), glue-line scoring (one source), heat treatment.
- "Four feet" for the composite bow is a rounded figure from Turkish bows of 41–51.5 in [S4] and up to 52 in [S2]; Scythian bows were even shorter (< 30 in, [S1]). Longbow "six-foot" from [S5] and "taller than the archer" [S2].
- Range: narration says "over eight hundred yards" because sources disagree on the exact record (874–972 yd). It is attributed to "Ottoman archers" as a separate sentence so it does not claim the record was shot from horseback. The hook's "outshoots" rests on the flight record vs. the longbow's ~330–450 yd [S5], [S10]; it is a flight-distance comparison, not a war-bow comparison. The climax gauge shows "800+ yd / 730+ m".
- Glue: narration names both "hide or fish bladders" because sources list both and bowyers blended them [S2].
- Humidity fix: "bark or leather" + a case. Lacquer [S6] and paint [S3] are left out to keep the sentence short.
- Siyahs as "levers that whip the string" is labelled engineering explanation; sources only say they are stiff, don't flex, form the recurve and add power.
- "Short wood can't take both" and "layers slide apart" / "peels apart" are engineering explanations of sourced facts (wood bow breaks before full draw; animal glue loses strength in damp; delamination).
- Observer animal: steppe marmot — native to the Eurasian steppe where horse archers rode, and it lives in a burrow that the cut-away can show.
- Stakes meter: BOW POWER rises with each layer; drops to 50 during the damp-air ghost (b07, visual only), then 75.
- Final line keeps the fixed formula "build"; "make" would read slightly more naturally, but the formula is fixed by docs/storytelling.md.
- Units: imperial in narration and labels with metric next to them on overlays (4 ft / 1.2 m, 6 ft / 1.8 m, 800+ yd / 730+ m).
- Historical anchor label "COMPOSITE BOW · 3,000+ YRS": composite bows in Tutankhamun's tomb (1324 BCE) [S1] and the 3rd millennium BC origin [S2].

## Post
Cover headline (en): "SHORT BOW, LONGER SHOT?"
Description (en): Four feet of wood, horn and sinew that outshot a six-foot longbow. Every layer solves one problem.
Hashtags: #history #engineering #archery #ancienttech #howitworks #learnontiktok #bowmaking
