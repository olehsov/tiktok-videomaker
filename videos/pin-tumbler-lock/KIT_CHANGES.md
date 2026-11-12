# Kit changes (pin-tumbler-lock)

| File | Change | Reason |
| --- | --- | --- |
| `build.mjs` | Ported from composite-bow: anchor `at` for callouts/labels, `overlays` (`stepAt`, `meter` frames), `extras`; NEW: `stepAt` also applies to beats that have only a step plate | Plates/meters at cue words; step plate at "Your" in b09 |
| `kit/components/Callout.mjs`, `StakesMeter.mjs` | Taken from composite-bow (card 640 wide, text >= 34 px, optional `width`) | Readable text size |
| `kit/assets/house.mjs` | NEW `houseFront`: wall, frame, door group `${id}-door`, ground | House / door scenes |
| `kit/assets/magpie.mjs` | NEW `magpie` (head group `${id}-head`, hop group `${id}-hop`, tf-form transforms) | Callback character |
| `kit/assets/puppet.mjs` | `key` field, pose `holdKey`, key shape inside `armR` | Puppet holds a key |
| `kit/components/RecapPills.mjs` | NEW green recap pills, column-major, popping in order | Recap beat |
| `kit/assets/index.mjs`, `kit/components/index.mjs` | exports for the above | |
