# Brief: Pin Tumbler Lock — Why Only One Key Turns It (`pin-tumbler-lock`)

Languages: en · Target duration: 100 s · Category: everyday-object
Observer animal: magpie (a "thief" that loves shiny keys) · Stakes meter: SECURITY (0–100)

## User story
As a TikTok viewer, I want to understand in 100 seconds how a pin tumbler lock is built and why each part
is shaped that way, so that I see it is a chain of simple decisions — and believe complex things are achievable.

## Acceptance criteria
- [ ] Follows docs/tech-requirements.md and docs/style-guide.md
- [ ] Duration within 60–120 s and within ±15 % of 100 s
- [ ] Hook (paradox: thumb-sized, yet only one key of thousands turns it) in the first 3 s
- [ ] 6 construction steps, each with a "✓ STEP N" plate
- [ ] Each step states problem + consequence + fix in plain words
- [ ] ≥ 5 threats with "⚠" plates and failure ghosts (any tool opens it, any stick lifts it, upside down, lock pick; plus the unplated ghosts "one pin guessed" and "key snags")
- [ ] Climax stress test: a key one cut off fails, a pick fails (false set), the right key lines up five gaps and the bolt opens
- [ ] Recap + final line "Now you know how to build a pin tumbler lock."
- [ ] All on-screen text from script.<lang>.json; fits in every language
- [ ] Facts match the Fact base; unsourced explanations labelled
- [ ] The lock is shown as a lengthwise side cut-away (keyway left, cam/bolt right; shell on top with 5 pin chambers, plug below); the shear line is a visible thin seam from b04 onward and every pin stack stays visible once added
- [ ] Plug rotation is readable without 3D: a small end-view inset (round plug in shell, keyway slot rotating) plus the bolt sliding at the right edge
- [ ] Pin colours stay consistent: key pins brass-like (`--sand` tones), driver pins steel (`--stone`), springs thin zig-zag lines; spool drivers have a visibly narrow waist

## Fact base
| # | Element | Problem | Without the fix | Solution — why it works | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Plug in a shell | The bolt must move only for the owner | A plain turning plug turns with any flat tool (screwdriver) | Rotating plug inside a fixed housing; a cam at the back retracts the bolt | parts [S1], [S5]; screwdriver failure — engineering explanation, not from a source |
| 2 | Pin across the gap | Something must stop the plug turning | Plug turns freely | Holes drilled through shell and plug; a pin crossing the boundary blocks rotation. Ancient Egypt used wooden pins lifted by a key, ~2000 BC (~4,000 years ago) | mechanism [S1], [S3]; date [S1], [S2], [S3], [S4] |
| 3 | Split pin + shear line | A one-piece pin can simply be shoved up and out of the plug | Any stick lifts it clear and the plug turns | Each pin is split into a key pin (bottom) and driver pin (top). The plug turns only when the split sits exactly on the shear line: too low → driver crosses the line, too high → key pin crosses it | split pins and shear line [S1], [S2], [S5]; "one-piece pin can be shoved out" — engineering explanation (Wikipedia notes the Egyptian lock could be defeated by lifting all pins past the unlatching point [S1], single source, so not stated as history) |
| 4 | Springs | Pins must fall back into the plug when the key is withdrawn, in any orientation | Lock mounted upside down/sideways: gravity does not return the pins, the plug stays free | Springs above each stack push the driver pins down into the plug | springs push drivers down [S1], [S3], [S9]; orientation argument — engineering explanation, not from a source |
| 5 | Several pins of different lengths | One pin has few possible heights | Guessed in a few tries | Typically 5–6 pin stacks, key pins of varying lengths; the key's serrated edge lifts each to its own height. Number of possible keys "runs into the thousands" | 5–6 pins [S1], [S2]; varying lengths [S1], [S4]; "thousands" [S2] + arithmetic: even 5 heights × 5 pins = 5⁵ = 3,125 (own calculation, labelled) |
| 6 | Rounded key-pin tips | The key's cuts must slide under the pins | Flat-ended pins snag on the cuts | Key pins are rounded so the key slides over them | [S1], [S9] |
| 7 | Spool (security) pins | Manufacturing is never perfect: holes slightly off, pins slightly undersized | Under turning pressure pins bind one at a time, so a picker sets them one by one without a key | Some drivers have a narrow waist (spool). When the waist reaches the shear line the plug turns slightly and stops — a "false set" that misleads the picker | binding one at a time [S5], [S6]; spools/false set [S1], [S7], [S8] |
| 8 | Wrong key | — | — | A wrong key leaves some pins across the shear line; the plug cannot turn | [S1], [S5] |
| 9 | Yale cylinder (anchor) | — | — | Linus Yale Jr. patented the pin tumbler cylinder lock with a small flat serrated key; key patent US 48,475, 27 June 1865 (earlier work 1861; father Linus Yale Sr. built a pin-tumbler lock in 1848) | 1865 [S2], [S4]; flat key [S1], [S4]; 1848 [S1], [S2] |

Sources (checked 2026-11-12):
- [S1] Pin tumbler lock — Wikipedia — https://en.wikipedia.org/wiki/Pin_tumbler_lock
- [S2] The Lock on Your Front Door Copies a Design the Egyptians Used Four Thousand Years Ago — Great Patent — https://greatpatent.com/the-yale-lock-copies-a-four-thousand-year-old-egyptian-design
- [S3] Locks — Explain that Stuff (Chris Woodford) — https://www.explainthatstuff.com/yalelock.html
- [S4] Linus Yale Jr. — ASME — https://www.asme.org/topics-resources/content/linus-yale-jr
- [S5] MIT Guide to Lock Picking, ch. 2 "How a Key Opens a Lock" and ch. 4 — https://www.lysator.liu.se/mit-guide/chapter2.html , https://www.lysator.liu.se/mit-guide/chapter4.html
- [S6] Why Locks Are Pickable — LockLab University — https://locklab.com/locklab-university/why-locks-are-pickable/
- [S7] Anti-Picking Design — LockLab University — https://locklab.com/locklab-university/anti-picking-design/
- [S8] Lock picking — Wikipedia — https://en.wikipedia.org/wiki/Lock_picking
- [S9] US Patent 2,555,316 "Pin tumbler lock structure" — https://patents.google.com/patent/US2555316

Open questions (not stated in narration): exact number of depths per pin and real combination counts (only forum sources: Schlage 10 depths, Kwikset ~6–7); hole tolerance figure (±0.003 in, single source [S6]); exact Yale patent sequence (sources disagree: [S3] cites an 1844 patent and "the 1860s", [S4] and [S2] give 1865); whether the Egyptian weakness of "lift all pins too high" is historically documented beyond [S1].

## Storyboard
| Beat | Type | Purpose | Visual (scene) | Overlays | Failure ghost | Lighting |
| --- | --- | --- | --- | --- | --- | --- |
| b01 | hook | paradox | Wide: house door, puppet holding a key next to the knob (scale: lock tiny); magpie on the door frame eyeing the shiny key. Push-in to the lock (`pullback-door-to-lock` = start wide, move in); fan of grey keys, one glows (`keys-fan-one-glows`) | Gauge "1 KEY OF 1,000s"; meter 0 | — | day |
| b02 | attempt | simplest try fails | Cut-away appears: shell (top), plug (bottom), keyway left, cam + bolt right. Plug turns (end-view inset), bolt slides (`plug-turns-bolt-slides`). Ghost: screwdriver in keyway turns it too (`ghost-screwdriver-opens`) | ⚠ ANY TOOL OPENS IT; callout `plug`; meter 5 | screwdriver opens | day |
| b03 | step 1 | pin | Drill bit bores one hole through shell + plug (`drill-hole`); one long pin drops in (`pin-drop`); inset plug tries to turn, jams (`plug-jams`). Small inset of a wooden Egyptian bolt with pegs (`egypt-wooden-lock-inset`) | ✓ STEP 1 · PIN; callout `pin`; label `egypt`; meter 20 | — | day |
| b04 | step 2 | split pin + shear line | Ghost: stick pushes the whole pin up into the shell, plug turns (`ghost-stick-lifts-pin`). Pin splits in two with a cut line (`pin-split`). Stack too low: driver crosses seam, red flash (`stack-too-low`); too high: key pin crosses seam (`stack-too-high`); then seam glows yellow as a dashed line (`shear-line-glow`) | ⚠ ANY STICK LIFTS IT; ✓ STEP 2 · SPLIT PIN; callout `shear-line`; meter 35 | stick lifts pin, plug turns | day |
| b05 | step 3 | springs | Ghost: whole cut-away flips 180°, pins slide out of the plug and stay out, plug turns (`ghost-flip-pins-stay-out`); flip back; springs appear above the stack, yellow force arrows down (`springs-push-down`) | ⚠ UPSIDE DOWN; ✓ STEP 3 · SPRINGS; meter 45 | flipped lock opens | day |
| b06 | step 4 | five heights | Ghost: magpie pokes a twig, one stack lines up in 3 tries (`ghost-one-pin-guessed`); five stacks appear left→right with different key-pin lengths (`five-stacks-appear`); key slides in, each cut lifts its stack, gaps line up (`key-slides-in`) | ✓ STEP 4 · FIVE HEIGHTS; gauge "5 PINS"; callout `key-cuts`; meter 70 | single pin guessed | day |
| b07 | step 5 | rounded tips | Close-up on key tip and first stack. Ghost: flat pin bottoms catch on a cut, key stops with a red jolt (`ghost-key-snags`); tips morph to rounded (`tips-round`); key glides, pins bob up and down like a car over speed bumps (`key-rides-pins`) | ✓ STEP 5 · ROUNDED TIPS; callout `rounded-tip`; meter 75 | key snags | day |
| b08 | step 6 | spool pins | Grade to navy (`to-night-tense`), magpie with a wire pick. Slow push-in: holes shown slightly offset (exaggerated) (`holes-offset-zoom`); ghost: pick sets pins one at a time while a tension tool holds the plug, bolt starts moving (`ghost-pick-sets-pins`); drivers swap to spools (`spool-drivers`); plug turns a few degrees in the inset then stops — false set; magpie tilts head (`false-set`) | ⚠ LOCK PICK; ✓ STEP 6 · SPOOL PINS; callout `spool`; meter 50 on the threat → 90 | pick opens the lock | night (tense) |
| b09 | climax | stress test | Still night. Magpie's shiny key with one cut too shallow: one driver across the seam, red flash (`wrong-key-blocked`); pick: false set again (`pick-blocked`); dawn light, puppet's key slides in (`right-key-in`), five gaps align on the glowing seam, plug turns, bolt retracts (`plug-turns-bolt-opens`) | ✓ ONLY ONE KEY; meter 100 | — | night → dawn |
| b10 | recap | checklist | Full cut-away; plates STEP 1–6 blink in turn over pin, seam, springs, stacks, tips, spools | step plates | — | day |
| b11 | ending | final line | Pull back to the door; it swings open; magpie perches on the open door, holding a bottle cap instead (callback) | label `title` | — | morning |

## Scene elements
- Environment: house front wall + wooden door (b01, b11), sky day/night/dawn, plain neutral backdrop behind the lock close-up.
- Structure (build order): shell/housing block (cut-away), plug cylinder with keyway slot, cam + bolt, drilled hole, single pin, split pin (key pin + driver pin), shear-line seam, springs, five pin stacks with different key-pin lengths, rounded key-pin tips, spool driver pins.
- Inset: end view of the round plug in the shell with a rotating keyway slot (shows rotation, jamming, false set).
- Characters: puppet homeowner — poses: stand, hold key, insert/turn key.
- Observer: magpie — eye the key, poke a twig, hold a wire pick, tilt head (confused), perch with a bottle cap.
- Props: key (flat blade with 5 cuts; wrong key with one shallow cut), screwdriver, stick/twig, drill bit, wire pick + tension tool, Egyptian wooden bolt with pegs (small inset), bottle cap.
- Effects: red flash on a blocking pin, yellow glowing seam, force arrows on springs, small "click" pulse, bolt sliding.
- Kit: puppet, sky, stars, sun exist in kit/assets; door/house wall, lock cut-away (shell, plug, pins, springs, spools, key), end-view inset, magpie, tools are new.

## Overlays used
StepBadge, ThreatBadge, Callout, Gauge, ForceArrows (springs), StakesMeter, LayerInset (end-view plug inset, Egyptian lock inset), KaraokeCaption, Cover. No new components.

## Storytelling techniques used
Paradox hook (b01), simplest attempt (b02), failure ghosts (b02, b04, b05, b06, b07, b08), concrete numbers (b01 thousands, b03 four thousand years, b06 five pins), physics in one sentence (b04 "the gap must sit right on the seam"), analogies ("a password of heights" b06, "like speed bumps" b07), invisible threat (b08 factory imperfection), stakes meter (all), day/night rhythm (b08–b09 night, dawn on the right key), scale through a person (b01 puppet + tiny lock), recap (b10), historical anchors (b03 label Egypt, b11 label Yale 1865), observer callback (magpie b01 → b06/b08/b09 → b11).

## Decisions
- Duration 100 s, not the suggested ~75 s: 6 steps + hook, attempt, climax and ending need ~211 words; 75 s would allow only ~154 and would force cutting the springs or spool step, which carry the "why".
- English narration is 211 words, the budget for 100 s is 211.6. Em-dashes were removed from the narration because the validator counts them as words.
- Cut the keyway/warding profile (zig-zag slot): it is only visible from the front, not in the side cut-away, and words were tight. Its role (wards stop wrong-profile keys, keep key pins in) stays in research [S1], [S5].
- Cut bumping, master keying (spacer pins) and serrated pins: extra threats with the same "fix" type, would overload 100 s.
- The "any stick shoves the one-piece pin out" and "upside down" threats are engineering reasoning, labelled as such; narration does not claim them as history.
- "Thousands of keys" is backed by [S2] plus a conservative own calculation (5 heights × 5 pins = 3,125); no specific depth count is spoken because only forum sources give them.
- No tolerance number is spoken ("holes sit slightly off") because ±0.003 in has one source only.
- Historical anchor uses 1865 (US 48,475) — two sources agree; [S3]'s 1844/1860s dating noted in Open questions.
- Magpie as observer: the folk "thief" bird that loves shiny things fits a lock video; it plays the would-be burglar and ends with a harmless bottle cap.
- No imperial/metric units needed; the only numbers are counts and years.
- Plate "⚠ UPSIDE DOWN" kept short; recipe-from-ordinary-things technique not used (a lock has no natural recipe moment).
- Music topic leans on music box + clarinet: a clockwork/mechanical feel, 19th-century New England (Yale's workshop) rather than an ethnic tradition.

## Music
`music.json` → "How a pin tumbler door lock works, from Egyptian wooden locks to Yale's 1865 cylinder, New England workshop; music box, clarinet" (21 words).

## Post
Cover headline (en): "WHY ONLY ONE KEY?"
Description (en): Five tiny pins, one hidden seam. Why only your key turns your lock, built step by step from a 4,000-year-old idea.
Hashtags: #howitworks #engineering #locks #lockpicking #everydayscience #learnontiktok #mechanism
