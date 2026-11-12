## Round 3 — FAIL

Technical: 1080x1920, 30 fps, H.264 + AAC, 88.333 s (timings 88.331), -15.3 LUFS (OK). `hyperframes lint`: 0 errors, 0 warnings; `hyperframes check`: passed. Frames: review/frames/round-3/.

Round 2 verification: #1 head/cap fragment near the inset fixed (mid_b05.png clean). #1 tan block at about (330,930) NOT fixed (mid_b09.png, also visible in sheet.png row 7). #2 SIYAH card fixed (card ends x 564, bow tip clear, mid_b09.png). #3 sun fixed (now at about (160,690), clear of HUD, mid_b10.png). #4 marmot reaction: improved in sheet.png row 1; acceptable.

| # | Beat | Severity | Found | Expected | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | b09 (and the b08-b09 stretch) | major | A two-tone tan/beige rectangle (about 285-380 x 912-948) floats in empty sky left of the bow, unlabeled and unrelated to any storyboard element. Looks like a leftover prop (reflex-beat block or string tail). | No stray objects. | mid_b09.png, sheet.png row 7 tiles 4-6 |

Checked OK: all 12 beats' plates, ghosts before fixes, inset accumulation, recap dots, final line, captions in safe zones, cue-word colors, palette.

Kit improvement candidates: a teardown helper that hides all prop parts at beat exit; a debug overlay listing visible elements per beat.

## Round 2 — FAIL

Technical: 1080x1920, 30 fps, H.264 + AAC, 88.333 s (timings 88.331), -15.3 LUFS (OK). `hyperframes lint`: 0 errors, 0 warnings; `hyperframes check`: passed (info only: audio_none). Frames: review/frames/round-2/.

Round 1 verification: #1 fixed (both bows at 0.5 s, t_0.5.png); #2 fixed (callout subtitles and labels about 36 px, mid_b05.png); #3 fixed (faceted horse, grounded shadow, mid_b02.png, mid_b10.png); #4 fixed (mid_b12.png); #5 fixed (dots 1-7, mid_b11.png); #6 fixed (mid_b03.png); #7 fixed (label above head, t_0.5.png); #8 not clearly visible (marmot sits up, no visible snap reaction).

| # | Beat | Severity | Found | Expected | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | b04-b11 | major | A stray head/hat fragment (brown cap + skin block) floats at about (580, 460) against the left edge of the layer inset for the whole step build (b04 to b11); in b09 a second stray brown/tan block floats at about (330, 930). Look like leftover puppet parts that were not hidden. | No stray objects; only planned elements visible. | mid_b05.png, mid_b09.png, mid_b11.png, f_58.png |
| 2 | b09 | minor | SIYAH callout card (y 1040-1190) covers the lower bow limb and its tip. | Callout must not hide the part it labels. | mid_b09.png |
| 3 | b10 | minor | Sun disc shows behind the BOW POWER meter / gauge area at about (260, 520). | Sun clear of HUD. | mid_b10.png |
| 4 | b02 | minor | Marmot reaction at SNAP still not clearly visible at phone size. | Visible observer reaction. | sheet.png row 1 |

Checked OK: whip trails, dust and flashes at full size; cue words highlighted with correct colors; step plates 1-7, FULL DRAW plate, threat plates with ghosts before fixes; inset accumulates; recap dots 1-7 and final line; captions and plates inside safe zones.

Kit improvement candidates: puppet teardown helper that hides all parts at beat exit; callout placement that avoids the subject's bounding box.

## Round 1 — FAIL

Technical: 1080x1920, 30 fps, H.264 + AAC, 88.333 s (timings 88.331), loudness -15.3 LUFS (OK). Frames: review/frames/round-1/.

| # | Beat | Severity | Found | Expected | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | b01 | major | Longbow only appears at ~3.0 s (cue "longbow"); frames at 0-2.9 s show the short bow alone. | BRIEF: both bows side by side, to scale, in the first 3 s. | sheet_1.png (first 3 tiles), cue_b01_longbow.png |
| 2 | b03-b06, b10 | major | Callout subtitles ("takes the squeeze"), "1 YEAR DRYING" label and "BOW POWER" label render about 26-28 px at 1080 width. | No text under ~36 px on a phone. | r2.png, mid_b01.png |
| 3 | b02, b10 | major | Horse and rider are crude: the horse is a slab with legs, its shadow floats under the belly (detached from the hooves), and the rider is small. Reads poorly at phone size. | Puppet and mount consistent with the low-poly look; grounded shadow. | s1.png, r1.png |
| 4 | b11-b12 | minor | b12 horse is cut off by the left frame edge; its muzzle and the case sit close to the title label (no overlap). | Composition fully inside the frame. | s2.png (3rd tile) |
| 5 | b11 | minor | At 83 s the recap shows dots 1-5 only (5 dimmed); 6-7 not confirmed in the sampled frames. | Dots 1-7 from the script's step fields. | s2.png (2nd tile) |
| 6 | b03, b05 | minor | Bow layers look thin; b03 force arrows are tiny; the sinew band demo is faint. | Layers and arrows readable at phone size. | r2.png |
| 7 | b01 | minor | "4 ft / 1.2 m" label sits on the archer's shoulder and bow. | Label clear of the puppet. | mid_b01.png |
| 8 | b02 | minor | The marmot's reaction at the snap is barely visible. | Observer reacts visibly. | s1.png (3rd tile) |

Checked OK: cue words highlighted at cue times (squeezes blue, stretches orange-red, snaps red, horn yellow); step plates 1-7 and the FULL DRAW plate; threat plates SNAP / LAYERS SLIP / DAMP AIR with ghosts before fixes; inset accumulates layers from b03; unstrung C opposite to the strung bow; gauge 800+ yd / 730+ m; recap and final line present; captions inside the safe zones; plates below y 150.

Kit improvement candidates: a real horse puppet with a grounded shadow and gallop cycle; a minimum font size for callout subtitles and labels; a helper that clamps puppets inside the frame.
