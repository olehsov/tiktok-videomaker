# Style guide (identical for every video)

## Animation style

- **Low-poly 3D look with flat shading.** Objects are built from simple geometric shapes, no textures, no fine detail. Each face is one flat color; light and shadow are 2–3 tones of the same hue. Lighting is soft and even; shadows are barely visible.
  - Implementation: SVG polygons (faux-3D). The camera is a fixed side view, so true 3D is not needed. Use Three.js only if a plan explicitly needs rotation or real depth.
- **Static side view, cut-away diorama.** The camera barely moves (allowed: one slow push-in or pull-back per scene for emphasis or scale). The scene is "sliced", so the outside and the inner structure are visible at the same time — above ground and below ground, outside walls and inside rooms.
- **Accumulating frame.** The same cross-section gains elements step by step; things built earlier stay visible.
- **Puppet characters** built from block parts (head, torso, arms, legs as rectangles/polygons). Minimal animation that shows only key actions: dig, carry, chop, wipe sweat, sleep, eat. No lip-sync, no facial animation beyond 2–3 expressions.
- **Recurring observer animal** (crow, lizard, fox…) chosen per topic: reacts to problems early, ends calm/happy as a callback.
- **Failure ghost.** Before a fix, show 1–1.5 s of what goes wrong without it (crack, melt, tilt, flood), then rewind/fade back and build the correct version. Ghost elements use desaturated tones plus a red tint.

## Infographic layer (on top of the scene)

- **Step plate** — green pill at top center: `✓ STEP N · NAME`.
- **Threat plate** — red pill: `⚠ NAME`, appears together with the failure ghost.
- **Callout** — white card with a yellow left bar, bold title + small subtitle, dashed leader line ending in a dot on the object.
- **Process arrows** — animated arrows for flows: heat (red-orange, wavy, rising), cold (blue, straight, sinking), water (blue, along the path), forces/loads (yellow).
- **Icons and counters** — thermometer gauge, day counter, stakes meter (e.g. "ice supply", "warmth") in a corner.
- Plates and callouts enter with a short pop (scale 0.9→1, 150–200 ms) and leave with a fade. No bouncing, no spinning.

## Captions (karaoke)

- Big, bold, UPPERCASE sans-serif (e.g. Montserrat ExtraBold / Inter Black), white with a soft dark shadow.
- 2–4 words on screen at a time, centered at ~68–72 % of frame height.
- The current word is bright white; already spoken words in the group stay white; upcoming words are grey (`--text-muted`).
- Key words are colored by meaning (table below). Numbers are always yellow.
- Font size auto-fits so a group never exceeds 90 % of frame width.

## Color palette

**Base (scene): muted, natural, slightly cool, low saturation.**

| Token | Hex | Use |
| --- | --- | --- |
| `--bg-sky-day` | `#9FB3BF` | calm day sky |
| `--bg-sky-night` | `#1E2A3D` | night / tense scenes |
| `--earth-1` | `#8A6E52` | soil, cross-section |
| `--earth-2` | `#6B5440` | deeper soil |
| `--earth-3` | `#4E3D2F` | deepest soil, shadows |
| `--sand` | `#B9A68A` | desert, light ground |
| `--stone` | `#8C9196` | rocks, walls |
| `--snow` | `#E3E8EC` | snow, ice surfaces |
| `--green-dark` | `#3F5A4A` | trees, vegetation |
| `--green-mid` | `#56735F` | foliage highlights |
| `--wood` | `#7A5A3E` | logs, beams |
| `--water` | `#5E8FA3` | water (muted in scene) |

**Mood by lighting:** a lighter, neutral palette for calm scenes; a deep navy grade (`--bg-sky-night`, scene colors darkened ~35 % and shifted blue) for night or tense scenes.

**UI colors (bright, only in overlays, one meaning each):**

| Token | Hex | Meaning |
| --- | --- | --- |
| `--ui-green` | `#2FA84F` | success / step |
| `--ui-red` | `#E5484D` | danger / threat |
| `--ui-yellow` | `#F5C518` | important / numbers / callout bar |
| `--ui-blue` | `#3BA3FF` | cold |
| `--ui-heat` | `#FF6A3D` | heat |
| `--ui-white` | `#FFFFFF` | caption text, cards |
| `--text-muted` | `#B8BEC6` | upcoming caption words |

**Core principle:** calm background, high-contrast infographics — attention goes straight to the explanation. A bright color never appears in the scene itself, except fire/embers (`--ui-heat`) and glowing ice/cold highlights (`--ui-blue`) when they carry the same meaning.
