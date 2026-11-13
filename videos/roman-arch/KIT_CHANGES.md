# Kit changes (roman-arch)

| File | Change | Reason |
| --- | --- | --- |
| `build.mjs` | Copied verbatim from hypocaust (anchor at/until/width/maxWidth, overlays stepAt/meter, extras, voice loudnorm -15 LUFS, music lifted to -24 LUFS) | Plan 2.1 |
| `kit/components/{Callout,StakesMeter,RecapPills,Pill,Gauge,index}.mjs`, `kit/lighting.mjs` | Copied from hypocaust (min text 36 px, lightTween immediateRender:false) | Plan section 5 |
| `kit/lighting.mjs` | NEW preset `overcast` (grey-graded, sky mixed toward stone) | Flood beat |
| `kit/components/ForceArrows.mjs` | NEW tone `red` | Tension / flood push arrows |
| `kit/assets/puppet.mjs` | Hypocaust puppet + `mallet` key, poses/actions `push`, `knock` | Slab push, frame strike |
| `kit/assets/heron.mjs` | NEW `heron` (stand/fly, flap, move, face) | Observer character |
| `kit/assets/vehicles.mjs` | NEW `car`, `ox`, `cart` | Hook car, flood convoy |
| `kit/assets/index.mjs` | exports heron, car, ox, cart | |

Promote candidates: heron, vehicles, overcast, ForceArrows red, puppet mallet/push/knock, archRing (src/bridge.mjs).
