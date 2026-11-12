// Loop assets/music.* to the video length of one language, with fades and volume.
// Usage: node tools/music-loop.mjs <slug> <lang>
// No music file in assets/ → prints "no music" and exits 0 (music is optional).
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { config, readJson, timingsPath, audioDir, parseArgs, die, run, findMusic } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/music-loop.mjs <slug> <lang>");

const music = findMusic();
if (!music) { console.log("no music (assets/music.* not found) — skipping"); process.exit(0); }

const tp = timingsPath(slug, lang);
if (!existsSync(tp)) die(`missing timings.${lang}.json — run TTS first`);
const { videoDurationSec: dur } = readJson(tp);
const { volume, fadeInSec, fadeOutSec } = config().music;
mkdirSync(audioDir(slug), { recursive: true });
const out = join(audioDir(slug), `music.loop.${lang}.mp3`);
const af = `afade=t=in:d=${fadeInSec},afade=t=out:st=${Math.max(0, dur - fadeOutSec)}:d=${fadeOutSec},volume=${volume}`;
const r = run("ffmpeg", ["-y", "-v", "error", "-stream_loop", "-1", "-i", music, "-t", String(dur), "-af", af, "-c:a", "libmp3lame", "-b:a", "128k", out]);
if (r.status !== 0) die(`ffmpeg failed: ${r.stderr}`);
console.log(`OK audio/music.loop.${lang}.mp3 — ${dur.toFixed(1)} s at volume ${volume}`);
