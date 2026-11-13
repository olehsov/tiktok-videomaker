# Brief: Roman Arch — A Bridge of Loose Stones (`roman-arch`)

Languages: en · Target duration: 110 s · Category: craft-material
Observer animal: heron · Stakes meter: STABILITY (0–100)

## User story
As a TikTok viewer, I want to understand in under two minutes how the Romans spanned a river with loose,
unglued stones and why each part of a stone arch bridge is shaped that way, so that I see it is a chain
of simple decisions — and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of 110 s (never above 120 s)
- [ ] Hook (paradox: loose stones, no mortar, still carrying cars after ~1,900 years) in the first 3 s
- [ ] 7 construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ 5 threats with "⚠" plates and failure ghosts (slab cracks, pier sinks, stones slip out, frame pulled too early, sides spread, flood)
- [ ] Climax stress test: spring flood under the finished bridge while loaded carts cross on top; not one stone moves
- [ ] Recap + final line "Now you know how to build a Roman arch."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- [ ] Arch shape is a true semicircle; every joint between wedge stones points to the circle's centre (radial joints), so the wedge shape reads clearly
- [ ] Load arrows (yellow) always follow the ring of stones down into piers/abutments — never straight down through the empty opening
- [ ] The river cross-section (water, riverbed, rock under the mud) stays visible below the bridge in every beat after b03

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Many small stones instead of one slab (attempt) | A flat beam sags under load; its underside is in tension | Stone is weak in tension; a long slab cracks in the middle, so a lintel can only span a short gap | An arch carries the load in compression and can span wider with smaller, manageable pieces than a lintel of the same material | tension in lintel [S2]; arch span/small pieces [S1]; compression only [S4], [S1]; "stone hates stretching" — plain-word simplification of "weak in tension" [S1] |
| 2 | Dry footing — cofferdam (Step 1) | The pier must stand in the river | Built on soft river mud, the pier settles and the arch on it fails | Ring of oak piles with clay rammed between double walls; water pumped out (screw pumps / water wheels); foundation dug down to solid ground; Roman bridges built this way in the dry season | Vitruvius V.12 [S8]; bridge cofferdams [S3]; "pier sinks" consequence — engineering explanation |
| 3 | Centering (Step 2) | Until the arch is closed, it has no strength | Loose stones fall | Temporary timber frame following the arch's inner curve holds every stone in place during building | [S5], [S1], [S3], [S4] |
| 4 | Wedge stones — voussoirs (Step 3) | Load must pass from stone to stone | Square blocks with no wedge action slip/drop out (early Egyptian non-wedge bricks held only by mortar were prone to collapse) | Each stone is a wedge, upper edge wider than the lower; downward load pushes them together, each passes the weight to its neighbour, down to the supports | [S6], [S4], [S1]; "like a cork" — analogy |
| 5 | Keystone (Step 4) | One gap is left at the crown | The arch cannot support itself until the last stone is in | Keystone = wedge at the apex, placed last; locks all stones in position | [S7], [S6], [S5], [S3] |
| 6 | Striking the centering (threat beat) | The frame must come out | Struck too early (before keystone / before the ring is seated) → settlement or collapse | Frame is removed only after the keystone is set; then the arch stands on its own | [S1], [S3], [S4] |
| 7 | Abutments (Step 5) | An arch pushes sideways (thrust) all the time — "the arch never sleeps" | Unsupported sides spread apart and the crown drops | Heavy abutments at the ends; in a row of arches neighbours push against each other, only end arches need buttressing; flatter arches push harder | thrust/saying [S1]; arcades & end buttressing [S1]; large abutments for bridges [S4]; Alcántara end arches buttressed [S9]; "crown drops" — engineering explanation consistent with [S1] (failure shifts to haunches/abutments) |
| 8 | Fill up to a flat road (Step 6) | The deck needs a level surface over a curved ring | — (would be a hump only) | Stone fill over the arch up to road level; its weight presses the wedges together, keeping the ring in compression | arch "stabilised by gravity acting on their weight to hold them in compression" [S4]; extra fill weight tightening the ring — engineering explanation, not from a source |
| 9 | Flood opening in the pier (Step 7) | Floods pile water up against the bridge | Bridge risks being swept away | Openings through the piers let flood water pass (Pons Fabricius, 62 BC: relief opening 6 m / 20 ft above the pier — used as extra waterway in floods) | [S3], [S10]; 6 m height single-sourced [S10] — not narrated |
| 10 | Historical anchor | — | — | Alcántara Bridge, Spain: AD 104–106 under Trajan, architect C. Julius Lacer; granite without mortar; 6 semicircular arches; ~45 m (148 ft) high; largest span 28.8 m (94 ft); still carries traffic | dates/architect [S11], [S9]; no mortar [S9] + Pont du Gard parallel "no mortar, friction and gravity" [S12]; height/span [S11], [S9]; traffic [S9], load limit 52 t [S11] |
| 11 | Semicircular arch | — | — | Romans relied heavily on the semicircular arch from the 4th century BC | [S1], [S3] |

Sources (checked 2026-11-13):
- [S1] Arch — Wikipedia — https://en.wikipedia.org/wiki/Arch
- [S2] Post and lintel — Wikipedia — https://en.wikipedia.org/wiki/Post_and_lintel
- [S3] Roman bridge — Wikipedia — https://en.wikipedia.org/wiki/Roman_bridge
- [S4] Arch construction — Designing Buildings Wiki (UK construction industry reference) — https://www.designingbuildings.co.uk/wiki/Arch_construction
- [S5] Centring — Wikipedia — https://en.wikipedia.org/wiki/Centring
- [S6] Voussoir — Wikipedia — https://en.wikipedia.org/wiki/Voussoir
- [S7] Keystone (architecture) — Wikipedia — https://en.wikipedia.org/wiki/Keystone_(architecture)
- [S8] Vitruvius, The Ten Books on Architecture, Book V ch. 12, LacusCurtius, University of Chicago — https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Vitruvius/5*.html
- [S9] Carole Raddato, Following Hadrian — Alcántara Bridge — https://followinghadrianphotography.com/2018/03/04/alcantara-bridge/
- [S10] Pons Fabricius — Wikipedia — https://en.wikipedia.org/wiki/Pons_Fabricius
- [S11] Alcántara Bridge — Wikipedia — https://en.wikipedia.org/wiki/Alc%C3%A1ntara_Bridge
- [S12] Pont du Gard — Wikipedia — https://en.wikipedia.org/wiki/Pont_du_Gard

Open questions (not stated in narration):
- Alcántara height: 45 m [S11] vs 48 m (O'Connor, cited in [S11]) vs "more than 40 m" [S9]. Overlay uses "148 ft / 45 m".
- Alcántara's original mortar-free build is explicit in [S9] and secondary search results; [S11] says only that the 1860 rebuild used mortared masonry. Narration says "no mortar" about the bridge as built; Pont du Gard [S12] confirms the Roman dry-stone practice.
- Ratio of stone's tensile to compressive strength (~1/10–1/20) found only in a search snippet — not used.
- How Romans struck centering (wedges, sand boxes) — [S1] describes it as general/modern practice, not Roman-specific — not narrated.
- Cutwaters on upstream pier faces — only [S3]; cut.
- Pont du Gard 6-ton blocks — [S12] only; not used.

## Storyboard
Scene layout: fixed side view across a river valley. Left and right: rocky banks in cross-section (3 soil layers over
grey bedrock). Centre: river with water surface, muddy bed and bedrock under it, always cut-away. One pier rises from
the river; the bridge is built as one large semicircular arch from the left bank to the pier (focus arch), with a
second arch from the pier to the right bank added during b08 so the "neighbours push on each other" reads. Camera: a
slow push-in on the arch for b05–b07, pull-back for b08 and b11 with a tiny puppet on the bank for scale.

| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | Finished bridge silhouette over the river (preview), a tiny low-poly car rolls across (`car-cross`); heron stands in the shallows; then fade to the empty river valley | Gauge "1,900 YEARS"; meter "STABILITY" 0 | — | day |
| b02 | attempt | simplest try fails | Puppet slides one long stone slab across the river onto the banks (`slab-place`); slab bows down, red tension arrows on its underside (`slab-sag`); crack opens at mid-span, halves drop in a splash (`ghost-slab-crack`); heron flaps away | ⚠ SLAB CRACKS | slab cracks and falls | day |
| b03 | step 1 | dry footing | Pile of small cut stones appears on the bank (`stones-pile`); ghost: a pier on mud tilts and sinks (`ghost-pier-sink`); a ring of oak stakes with brown clay fill rises around the pier spot (`cofferdam-ring`); water inside drains, puppet digs to grey bedrock (`dig-to-rock`); pier rises from the rock | ⚠ PIER SINKS; ✓ STEP 1 · DRY FOOTING; callout `cofferdam`; meter 15 | sinking, tilting pier | day |
| b04 | step 2 | centering | Ghost: a few stones hang at the springing, then drop (`ghost-stones-fall`); a timber half-circle frame grows between bank and pier (`centering-build`) | ✓ STEP 2 · CENTERING; callout `centering`; meter 25 | stones falling | day |
| b05 | step 3 | wedge stones | Stones laid on the frame from both sides up (`wedges-lay`); ghost: square blocks in the ring tilt and slip out downward (`ghost-square-slip`); inset: cork in a bottle neck — wide top stuck (`cork-inset`); dashed radial lines show joints pointing to the centre | ✓ STEP 3 · WEDGE STONES; callout `voussoir`; meter 40 | square blocks slipping out | day |
| b06 | step 4 | keystone | Slow push-in to the crown: one empty slot (`gap-highlight`); keystone lowered by a simple crane/rope and drops in (`keystone-drop`); a quick yellow ripple runs along the whole ring (`ring-lock`) | ✓ STEP 4 · KEYSTONE; callout `keystone`; meter 60 | — | day |
| b07 | threat | strike the frame | Puppet knocks the timber frame away (`frame-strike`); ghost: frame pulled before the keystone — ring caves in (`ghost-early-collapse`); real: frame drops away, the arch stands alone, yellow load arrows run around the ring into the supports (`arch-stands`) | ⚠ NO SUPPORT; meter dips to ~45 then 70 | ring caving in | navy (tense) → day |
| b08 | step 5 | abutments | Orange-yellow sideways thrust arrows at both feet (`thrust-arrows`); ghost: the sides slide apart, crown sags and drops (`ghost-spread`); massive stone shoulder built into the left bank, second arch rises on the right of the pier and its thrust arrow meets the first (`abutment-build`); pull-back with tiny puppet on the bank | ⚠ SIDES SPREAD; ✓ STEP 5 · ABUTMENTS; callout `abutment`; label `span`; meter 80 | sides spreading, crown dropping | day |
| b09 | step 6 | fill to a road | Stone fill rises layer by layer over the arches to a flat deck (`fill-rise`); yellow arrows press down on the ring, joint gaps visibly close (`squeeze-arrows`) | ✓ STEP 6 · FLAT ROAD; meter 90 | — | day |
| b10 | step 7 | flood opening | River rises, brown water piles up against the pier, red push arrows (`flood-push`); ghost: pier shoved, bridge shudders (`ghost-shove`); a round hole opens through the pier above normal water (`pier-hole`); blue flow arrows pass through it (`flood-through`) | ⚠ FLOOD; ✓ STEP 7 · FLOOD HOLE; callout `flood-hole`; meter dips to ~75 then 95 | bridge shuddering in the current | overcast |
| b11 | climax | stress test | Storm sky; river high and brown, water roars under the arches and through the pier hole (`flood-roar`); carts and a puppet cross the deck (`carts-cross`); yellow load arrows pulse steady; heron lands on the parapet (`heron-land`) | ✓ STILL STANDING; gauge "148 ft / 45 m"; meter 100 | — | storm (navy) → clearing |
| b12 | recap | checklist | Full bridge cross-section; step plates 1–7 blink in turn over their elements (footing, frame outline ghost, wedges, keystone, abutment, fill, flood hole) | step plates | — | day |
| b13 | ending | final line | Wide shot at sunset, calm river; heron stands on the keystone (callback) | label `title` | — | sunset |

Cue action ids (from script.en.json): car-cross, slab-place, slab-sag, ghost-slab-crack, stones-pile, ghost-pier-sink, cofferdam-ring, dig-to-rock, ghost-stones-fall, centering-build, wedges-lay, ghost-square-slip, cork-inset, gap-highlight, keystone-drop, ring-lock, frame-strike, ghost-early-collapse, arch-stands, thrust-arrows, ghost-spread, abutment-build, fill-rise, squeeze-arrows, flood-push, ghost-shove, pier-hole, flood-through, flood-roar, carts-cross, heron-land.

## Scene elements
- Environment: river valley cross-section — two rocky banks with 3 soil layers over grey bedrock (kit `terrain`, new valley variant), river water surface (kit `waterSurface`) with muddy bed and bedrock below, distant hills (kit `mountains`), sky day/overcast/storm/sunset (kit `sky`), sun (kit `sun`), rocks (kit `rocks`), a few Mediterranean trees (kit `pineTree` recoloured).
- Structure (build order): long stone slab (attempt only), pile of cut stones, cofferdam ring of oak stakes + clay (new), pier on bedrock (new), timber centering frame (new), wedge stones ×~15 per arch with radial joints (new), keystone (new, slightly larger), left abutment/stone shoulder (new), second arch to the right bank (same parts), stone fill + flat road deck with low parapet (new), round flood hole in the pier (new).
- Characters: puppet builder in a tunic — poses: stand, push slab, dig, carry stone, pull rope, knock frame with a mallet, walk with cart (kit `puppet` + new poses).
- Observer: heron — stand in shallows, flap away, glide, land on parapet, stand on keystone (new).
- Props: simple crane/rope hoist (new), mallet (new), ox cart (new), tiny modern car silhouette for the hook (new), cork-and-bottle inset icon (new).
- Effects: red tension arrows, crack + split, splash, sinking/tilting ghost, draining water, falling stones, yellow load/thrust arrows (kit `ForceArrows`), blue flow arrows (kit `FlowArrows`), brown flood water tint, rain, joint gaps closing.
- Kit: terrain, sky, sun, mountains, rocks, pineTree, puppet, waterSurface, ForceArrows, FlowArrows exist; arch stones, centering, cofferdam, pier, abutment, deck, crane, cart, car, heron are new.

## Overlays used
StepBadge, ThreatBadge, Callout, Gauge, ForceArrows (loads/thrust: yellow; tension: red), FlowArrows (flood water: blue), StakesMeter, KaraokeCaption, LayerInset (cork-in-bottle analogy in b05), Cover. No new components.

## Storytelling techniques used
Paradox hook (b01), simplest attempt (b02), failure ghosts (b02, b03, b04, b05, b07, b08, b10), concrete numbers (b01 "nineteen hundred years"; overlays b01, b08 span "94 ft / 29 m", b11 "148 ft / 45 m"), physics in one sentence (b02 "stone hates stretching", b08 "an arch never sleeps — it pushes sideways", b09 weight squeezes the wedges), everyday analogy (b05 "like a cork"), invisible threat (b08 constant sideways thrust), stakes meter (all beats), day/night-style mood shifts (b07 tense navy, b10 overcast, b11 storm, b13 sunset), scale through a person (b08 pull-back, b11), recipe from ordinary things (b03 oak stakes + clay), recap (b12), historical anchor (b13 label "ALCÁNTARA · AD 106", b11 gauge), observer callback (heron: b01 shallows → b02 flees → b11 lands → b13 on the keystone).

## Decisions
- **Duration 110 s, 234 words (240 before a trim of filler words and dashes).** Seven steps plus the frame-strike threat and the flood climax give 11 spoken beats (~9–10 s each); 110 rather than ≤ 100 keeps every problem → fix chain intact. With the owner's calibration (voice often 10–20 % shorter), the real video should land near 95–105 s, safely under 120 s.
- **Anchor = Alcántara, not Pont du Gard.** Pont du Gard was already the anchor of `roman-aqueduct`; Alcántara (AD 104–106) is a road bridge, mortar-free granite, and still carries traffic — it fits the hook "cars still cross it". "Nineteen hundred years" = 106 → 2026 ≈ 1,920 years.
- **Composite build.** The viewer builds a generic Roman arch bridge. The flood hole in the pier is from Pons Fabricius (62 BC) and Roman practice ([S3]); Alcántara itself is not claimed to have one.
- **Two arches, one pier** on screen instead of Alcántara's six — enough to show a pier in the river, an end abutment and two neighbouring arches pushing on each other, and readable in a vertical frame.
- **"No glue, no mortar"** refers to the bridge as built; the 1860 rebuild of damaged parts used mortar (noted in the Fact base, not narrated).
- **Terms in plain words.** Narration names only "centering" and "keystone" (each explained in the same sentence). "Voussoir", "abutment", "cofferdam" appear only in callouts; narration says "wedges", "stone shoulder", "oak stakes and clay".
- **Step plates:** "WEDGE STONES" (not VOUSSOIRS) and "FLOOD HOLE" so plates explain themselves.
- **Frame-strike is a threat beat, not a step.** It has no new part, but it is the most dramatic moment of real construction and proves the keystone works.
- **"Weight squeezes the wedges tighter" (b09)** is our engineering explanation of the cited "gravity holds the arch in compression" [S4]; labelled as such in the Fact base.
- **Cut elements:** cutwaters (single source), striking wedges/sand boxes (not Roman-specific in sources), iron clamps, 6-ton blocks, numbered stones and the triumphal arch on Alcántara — all off the visual chain or single-sourced.
- **Observer animal: heron** — a river bird that stands still for long stretches, reads clearly in silhouette, and can end perched on the keystone.
- **Stakes meter "STABILITY"** rises with each step, dips on the frame strike (b07) and the flood (b10).
- **Units:** imperial in narration; overlays show both (148 ft / 45 m, 94 ft / 29 m).

## Music
`music.json` topic: "Roman stone arch bridge over a river, 2nd century AD, Roman Spain; cithara, frame drum".

## Post
Cover headline (en): "NO GLUE. 1,900 YEARS?"
Description (en): A Roman bridge of loose stones, no mortar, still carrying cars after 1,900 years. One wedge holds it all.
Hashtags: #history #engineering #ancientrome #architecture #howitworks #learnontiktok #romanbridge
