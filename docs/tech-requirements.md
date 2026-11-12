# Technical requirements (every video)

## Output
- Container/codec: MP4, H.264 video + AAC audio.
- Resolution: 1080×1920 (9:16), 30 fps.
- Duration: 60–120 s. Target is chosen per topic in `BRIEF.md`; the real duration follows the voice (`timings.<lang>.json`) + `config.tailSec`.
- One MP4 per language: `out/<slug>.<lang>.mp4`.
- Cover: `out/cover.<lang>.png`, 1080×1920, the most telling frame of the finished build + the cover headline from the script; text inside the safe zone.
- Post text: `out/post.<lang>.txt` — description (≤ 150 characters) + 5–8 hashtags, from the script.

## Safe zones (TikTok UI)
- Keep key text out of the top 150 px, the bottom 400 px and the right 140 px.
- Captions sit at ~68–72 % height; step plates at ~10–14 % height.

## Stack
- HyperFrames (HTML + CSS + GSAP; seek-based deterministic rendering in headless Chrome + FFmpeg).
- Node.js 22+ and FFmpeg on the owner's machine. No Python.
- Scene graphics: SVG polygons in the low-poly style; Three.js only if `PLAN.md` justifies it.
- All animation in one paused GSAP timeline registered in `window.__timelines` (HyperFrames convention).

## Data-driven i18n
- All visible text comes from `script.<lang>.json`; all timing from `timings.<lang>.json`.
- Scenes anchor animation cues to beat starts and to specific words, never to hard-coded seconds.
- Text boxes must fit the longest language: auto-fit font size, max 2 lines for callouts, never overflow or clip.
- Supported languages: `en` (primary), `uk`, `ru`. Adding a language must not require code changes.

## Audio
- Voice: ElevenLabs `POST /v1/text-to-speech/{voice_id}/with-timestamps`, model from `config.json` (default `eleven_multilingual_v2`). One request per language with the full narration; character alignment → words → beats (`tools/tts.mjs`).
- If the owner drops `audio/voice.<lang>.mp3` manually, it is used as-is and timings come from `tools/timings-from-silence.mjs`.
- Music (optional): if `assets/music.*` exists (a 10–30 s loop), `tools/music-loop.mjs` loops it to the video length with fade-in/out. Mixed at `config.music.volume` (default 0.12) under the voice. No music file → no music.
- Loudness target for the final mix: about −14 LUFS integrated; voice must stay clearly above music.

## Performance and hygiene
- Draft renders go to `out/draft/`; final renders to `out/`. Both git-ignored.
- `build/` is generated and git-ignored.
- Do not regenerate TTS when `audio/voice.<lang>.mp3` exists, unless `/produce` was called with `--revoice`.
