## Round 2 — FAIL
Technical: 1080x1920, 30 fps, H.264, 116.17 s (timings 116.151) OK. Audio stream is MISSING (ffprobe lists only the video stream; ebur128 reports audio:0KiB, no loudness). Frames in review/frames/round-2/ (14 beat mids, cue frames b01/b02/b03/b04/b07/b08/b09/b12, sheet1.jpg 2 s contact sheet). Not every cue word was inspected.

Round-1 verification: #1 fixed (gauge about 40 px, mid/cue-b12-running.jpg). #2 fixed (meter label ~38 px; card title ~40 px, body ~32 px on 600 px cards; mid-b08, mid-b11). #3 fixed (slope/chorobates and tunnel callouts persist across 3+ contact-sheet frames, about 6 s). #4 fixed (valley sides now terrain brown, muted; mid-b08, cue-b12-running). #5 NOT fixed. #6-#8 remain minor.

| # | Beat | Severity | Found | Expected | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | all | blocker | Draft MP4 has no audio stream (loudnorm re-render dropped it); loudness cannot be measured. | H.264 + AAC, about -14 LUFS, voice synced to captions. | ffprobe / ffmpeg ebur128 output |
| 2 | b12 | major | At the "running:" cue the camera is on the valley/arches; the pigeon at the fountain is off-screen (only visible in b11 as a small grey speck at the right of the fountain). No observer animal readable at the cue. | Pigeon visible and drinking at "running:". | review/frames/round-2/cue-b12-running.jpg, mid-b11.jpg |
| 3 | b01 | minor | Hook has no puppet/animal in first 3 s (unchanged #6). | Visible subject. | sheet1.jpg row 1 |
| 4 | b07 | minor | Unchanged #7 (not re-verified frame-exact). | Arches rise at cue. | cue-b07-arches.jpg |
| 5 | b09 | minor | Rain desaturation, STEP 7 plate washed out (unchanged #8). | Plate legible. | sheet1.jpg row 8 |

No regressions seen from kit changes: cards (x 48-648, y 590-770) sit below the meter (y 470-560) with no overlap; gauge, meter, plate and captions (baseline ~y 1380) stay inside safe zones; no clipping.
Kit improvement candidates: add an audio-stream assertion after render (ffprobe) in the build; keep observer animal in frame for the camera path at its cue.

### Round 2 fixes
Fixed: #1 (cause: the earlier loudnorm pass dropped the audio; the raw render has H.264 + AAC. Now loudnorm runs with explicit `-map 0:v:0 -map 0:a:0`; ffprobe: h264 video + aac audio, 116.17 s, ebur128 integrated -14.8 LUFS), #2 (camera pans to the fountain from cue-0.6 s over 0.8 s, pigeon drawn at 2.6x with a new pale halo for contrast; at "running:" it is large on screen; frames review/frames/round-3/runs.jpg; no b12 callouts exist, meter/plate unchanged), #4 (frame-checked at the cue word: plate fades in at 53.46 s, arches rise by 53.8 s; review/frames/round-3/archs.jpg), #5 (STEP 7 plate and caption read clearly at 80.2 s; review/frames/round-3/b09end.jpg).
Not fixed: #3 (b01 has no puppet/animal in the first 3 s; the pigeon is a speck in the wide shot and a puppet would restructure the opening composition).

## Round 1 — FAIL
Technical: 1080x1920, 30 fps, H.264 + AAC, 116.17 s (timings 116.151), integrated -14.8 LUFS: all OK. 53 frames (14 beat mids + 39 cue words) and a 2 s contact sheet extracted to review/frames/round-1/ (sheet1.jpg, mids.jpg, four.jpg). Cue frames sampled at word start +0.05 s; not every cue was inspected individually.

| # | Beat | Severity | Found | Expected | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | b12 (also b01) | major | Gauge text ("10M GAL / 40,000 M3 A DAY", "31 MI / 50 KM") renders about 26 px. | Text >= ~36 px on phone. | review/frames/round-1/mid-b12.jpg, cue-b01-city.jpg |
| 2 | all | major | "WATER IN TOWN" meter label about 28 px; callout card body text (INVERTED SIPHON, CASTELLUM, LIMESTONE CRUST, CHOROBATES) about 20-24 px; too small for a phone. | Body text >= ~36 px, or shorter/larger cards. | mids.jpg (b08, b11), four.jpg |
| 3 | b03, b04 | major | Slope label (1.79 s) and tunnel callout (1.47 s) flagged line_unread; tunnel card small and short. | Readable for the time shown (longer or larger). | cue-b04-tunnel.jpg, sheet1.jpg |
| 4 | b07, b08, b09, b12, b14 | major | Valley "far ground" in wide shots is a saturated green funnel/wedge that reads as a stray bright colour and a different object from the muted brown terrain. | Muted scene palette; valley sides in terrain tones. | mid-b07.jpg, mid-b12.jpg, mid-b14.jpg |
| 5 | b12 | major | No pigeon visible at cue "running:" or in the b12 mid; observer animal not seen in any beat mid (only a tiny speck in b07). | Pigeon drinks after "running:"; observer animal readable. | four.jpg (3rd panel), mid-b12.jpg |
| 6 | b01 | minor | Hook at 4.3 s shows no puppet or animal; distant wide with a tiny city; hook carried by captions and gauge only. | Visible hook subject in first 3 s. | cue-b01-city.jpg |
| 7 | b07 | minor | At cue "arches" (+0.05 s) the valley is still empty; confirm the rise starts within 0.3 s. | Arches rise at "arches". | four.jpg (1st panel) |
| 8 | b09 | minor | Rain/overcast heavily desaturated; STEP 7 plate fades and reads washed out at b09 end. | Plate fully legible. | sheet1.jpg |

Checked OK: captions inside safe zones (baseline about y 1340, above the bottom 400 px), keyword colors, step/warning plates switch at fix cues, accumulation (tunnel, channel, arches, siphon, tank remain), lighting arcs (b10 night, b12 storm, b14 sunset), meter ends full, recap markers 1-9 and final line present.

Kit improvement candidates: enforce a 36 px minimum for gauge/meter/callout text; terrain-toned valley far-ground token; keep callouts >= 2 s.

### Round 1 fixes
Fixed: #1 (gauge text now 40 px max, min 32, was ~26), #2 (meter label 38 px in a 460 px meter; callout title 40 px, body 32 px on 600 px cards, cards moved to x 340 where needed; Label text 40 px), #3 (slope label now starts at the "slope" cue and is moved below the chorobates card; tunnel callout now appears at hill-rise+0.9 s instead of the bore cue, about 3 s on screen), #4 (far ground uses terrain tones FARG/FARG2/FARG3 in world.mjs instead of green-mid), #5 (pigeon placed at the fountain from scene start, drinks from the "running:" cue, camera starts moving 0.3 s earlier, pigeon drawn at 1.8x in b12).
Not fixed: #6 (hook has no visible subject in first 3 s; scene change out of scope for this round), #7 (not changed; arches tween already starts at the cue), #8 (b09 overcast desaturation left as is).
Draft re-rendered: out/draft/roman-aqueduct.en.mp4 (loudnorm applied); hyperframes check ok.
