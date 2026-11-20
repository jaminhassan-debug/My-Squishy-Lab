# Dream Mould Studio test environment

Open `/experiments/dream-mould/` from a static server at the repository root.

This isolated prototype does not modify the main game, mobile bundle entry point, production save data or billing. It uses no network generation service and makes no purchases.

Implemented: continuous finger/mouse drawing, heart/star/cloud starters, undo/clear, closed-outline validation, bounded resampling and smoothing, matching custom cavity within a generic silicone tray, colour/material/filling options, animated pour with pause/resume, reveal state, poke/drag/squeeze/stretch and material recovery, and a reusable browser-local test shelf (24 creations).

Geometry is a shaded 2D outline with simulated thickness and deformation. This is not yet integrated into the main game's 3D volume solver, all sixteen scenes, native apps, cloud saves or store purchases. Reveal currently switches from the filled mould to the squishy; a silicone peeling animation is future work. Portrait uses a vertically scrolling studio so drawing and controls stay usable on phones.

Saves use the separate `squishy-dream-mould-test-v1` key. Names are rendered as text. Invalid, crossed, open and extremely thin outlines get actionable messages. Starter shapes provide an alternative to freehand drawing. Storage failures are shown in the UI. No prompts or drawings leave the browser.

Run checks with Node:

```
node experiments/dream-mould/geometry.test.cjs
node experiments/dream-mould/runtime.test.cjs
```

Browser verified: starter to pour/reveal/play/save, reload persistence and saved mould reuse; portrait at 390 × 844 without horizontal overflow. Automated runtime checks also exercise a non-preset freehand outline, pause/resume, local save deletion, safe names, and unavailable storage. Physical touchscreen and native-device QA remain pending.
