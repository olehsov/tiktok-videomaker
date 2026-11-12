# KIT_CHANGES (roman-aqueduct)

| File | Change | Reason |
| --- | --- | --- |
| kit/tokens.css | `--tile: #A8705E` | muted terracotta for lining, roofs, tile shards |
| kit/lighting.mjs | `tile` in `BASE`; presets `harsh`, `overcast`; `lightTween(..., ease, immediateRender=true)` | graded tile colour, b05/b09 lighting, no flash on 2nd tween in a scene |
| kit/components/Pill.mjs | text max width W-2*140-2*PAD, pill width <= W-280 | keep plates out of the right 140 px safe zone |
| kit/components/Gauge.mjs | `icon="thermo"\|"drop"` (drop: faceted drop, no level tween) | distance/volume gauge must not look like heat |
| kit/components/FlowArrows.mjs | `inline`, `fadeIn`, `fadeOut` props; inline returns `{html:"", svg, css:"", tl}` with a `<g transform>` wrapper | arrows live in world coordinates under a moving camera |
| kit/assets/puppet.mjs | `scraper` prop, poses `sight`, `scrape`, action `scrape` | b03 chorobates sighting, b10 crust scraping |
| kit/assets/profileTerrain.mjs | new: `profileTerrain`, `grassStrip`, `surfaceY` | side-view terrain clipped to a surface polyline |
| kit/assets/channel.mjs | new: channel section (back, water, mud, lining, floor, slabs, end walls) | aqueduct specus |
| kit/assets/arcade.mjs | new: multi-tier evenodd arcade | Pont du Gard |
| kit/assets/tank.mjs | new: cut-away tank (walls, back, water, mud, sand) | header/receiving/settling tanks |
| kit/assets/leadPipe.mjs | new: lead pipe with draw-on dash | siphon and city pipes |
| kit/assets/castellum.mjs, fountain.mjs, romanBuilding.mjs, chorobates.mjs, hatch.mjs | new | props |
| kit/assets/pigeon.mjs | new: puppet-like pigeon (pose/act/move) | observer |
| kit/assets/rain.mjs, cloud.mjs | new | weather |
| kit/assets/index.mjs | exports of the above | |
| build.mjs | scene results `anchors[id].at/until`, `stepAt`, `meter` overrides; `options.gauge` (tone, icon); callout/label on-screen < 1.2 s warns | cue-driven overlay timing |

Not a kit change but a build step: the loudnorm pass after rendering (see PLAN §8).
| kit/components/Callout.mjs | card width 560 to 600; title 40..32 px; subtitle 32..30 px, up to 3 lines; Label 40..32 px, maxWidth 700 | phone legibility (>= 30 px body) |
| kit/components/Gauge.mjs | text fit maxWidth 780, size 40..32 | gauge text was shrinking to ~26 px |
| kit/components/StakesMeter.mjs | default width 460; label 38..32 px | meter label was ~28 px |

## Round 2 fix
- `kit/assets/pigeon.mjs`: new optional prop `halo` (default false) draws a pale translucent ellipse behind the pigeon for contrast on dark/storm backgrounds. Backward compatible.
