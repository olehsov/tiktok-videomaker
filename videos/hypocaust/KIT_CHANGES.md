# Kit changes (hypocaust)

| File | Change | Reason |
| --- | --- | --- |
| `build.mjs` | Ported from pin-tumbler-lock (anchor `at`, `overlays` stepAt/meter, `extras`); NEW anchor `until` (callouts and labels, min 1.2 s); pass-through `width`/`maxWidth`; `METER` (48,300) and `GAUGE` (48,400); voice two-pass linear loudnorm (-15 LUFS, measured mix -14) to `assets/voice.wav`; music at `data-volume` 1 | Plan 2.1 |
| `kit/components/Callout.mjs`, `StakesMeter.mjs`, `RecapPills.mjs` | From pin-tumbler-lock; all minimum text sizes 36 px | Readable text |
| `kit/components/Pill.mjs`, `Gauge.mjs` | `fitFont` min 36 | Readable text |
| `kit/lighting.mjs` | `lightTween` adds `immediateRender:false` | Several light tweens on one world |
| `kit/assets/puppet.mjs` | Options `tunic`, `sandals` (+ yellow outlines `-sandalYL/YR`), `branch`; poses shiver/cough/feed/standSandals; action walk/shiver/cough/feed | Bath-house characters |
| `kit/assets/cat.mjs` | NEW `cat` (pose stand/earsFlat/run/curl, act shiver/run, move, face) | Observer callback |
| `kit/assets/index.mjs`, `kit/components/index.mjs` | exports | |

- kit/components/Callout.mjs: callout subtitle fit raised to max 40 / min 38 px (round 1 #5, legibility).
- Idea for the shared kit: tools/music-loop.mjs output is about -50 LUFS; videos must re-normalise it (see build.mjs music block).
