## Round 1 — FAIL (0 blocker, 2 major, 3 minor)
Technical: 1080x1920, 30 fps, H.264 + AAC, 92.70 s (timings 92.693, OK). Integrated -13.5 LUFS (OK).
| # | Beat | Severity | Found | Expected | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | all | major | Music bed is inaudible: audio/music.loop.en.mp3 measures -50.5 LUFS; final mix is voice only (-13.5 LUFS integrated). | Music audible under voice (config music.volume 0.12, roughly 15-20 dB below voice), voice clearly above. | audio/music.loop.en.mp3 ebur128 |
| 2 | b07-b12 | major | Camera zooms out so the scene shrinks to the lower half. Sky band y 150-600 is empty flat blue-grey (>400 px). b11/b12 are the worst, with the building about 25 % of frame height. | Plan: sky/roof fill y 150-600; no flat band taller than 200 px. | review/frames/round-1/mid_b07.png, mid_b10.png, mid_b11.png, mid_b12.png, full_55.3.png |
| 3 | b01 | minor | Hook is carried only by captions and a tiny WARMTH meter; no on-screen hook element in the first 3 s beyond the glowing furnace ghost. | Hook clearly visible. | mid_b01.png |
| 4 | b12 | minor | Final label "HYPOCAUST - 1st c. BC" is small, and the final line is only in the caption. | Final line prominent. | mid_b12.png |
| 5 | b03-b05 | minor | Callout subtitles are about 36 px (borderline); the b05 callout fades while its pointer is still drawn. | At least 36 px, clean exit. | cue_b04_hot-air-between-pilae.png |
Checks passed: plates and step order 1-7, ghosts before fixes (b02 room fire, b04 no-way-under, b05 hot spot, b06 trapped smoke, b08 fire out, b09 crack), accumulation kept, caption cue words match within 0.1 s (sampled b05, b08, b09, b10), captions at y ~1230-1460 and inside safe zones, UI colors by meaning, low-poly look consistent, puppet, cat and stoker present, recap in b11, closing line in b12.
Kit improvement candidates: music-loop gain should be verified (-50 LUFS means double attenuation or a ducking bug); the camera preset for the late beats should keep the building filling the frame.

### Round 1 fixes
Fixed: #1 (build.mjs lifts audio/music.loop.<lang>.mp3 linearly to -24 LUFS, peak -3.1 dBFS, ducking shape kept; final mix -13.3 LUFS, peak -1.0 dBFS), #2 (low-poly drifting clouds in the sky layer fill the sky band b07-b12; camera unchanged), #3 (hook fire teaser scaled 2.3x with pulsing glow), #4 (final label up to 64 px, max width 900), #5 (callout subtitle size min 38 px).
Not fixed: none. Note: the b05 callout pointer exit was not changed separately.
