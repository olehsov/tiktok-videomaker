// Build the background music track of one language: seamless loop to the video length, fades, volume, ducking under the voice.
// Usage: node tools/music-loop.mjs <slug> <lang> [--no-duck]
// Source priority: videos/<slug>/audio/music.source.mp3 (music-gen.mjs or owner-placed) → assets/music.* → none (skip, exit 0).
// config.json → music: source (elevenlabs | file | off), loopCrossfadeSec, volume, fadeInSec, fadeOutSec, ducking { enabled, duckDb, attackMs, releaseMs }.
// Output: audio/music.loop.<lang>.mp3 (build.mjs keeps using it).
//
// Seamless loop: with source length L and crossfade c, the loop unit is  crossfade(tail = L-c…L, head = 0…c)  +  middle (c…L-c).
// It starts at the source's tail fading into its head and ends at L-c, i.e. exactly where the tail begins, so the repeat has no seam.
// Ducking: ffmpeg sidechaincompress keyed by audio/voice.<lang>.mp3. Threshold = measured mean voice level − 12 dB,
// ratio = 1 / (1 − |duckDb| / 12) → a voice at its typical level pulls the music down by about duckDb.
import { join } from "node:path";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { config, readJson, timingsPath, audioDir, parseArgs, die, run, findMusic, durationSec } from "./lib.mjs";

const { pos, flags } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/music-loop.mjs <slug> <lang> [--no-duck]");

const cfg = config().music ?? {};
if (cfg.source === "off") { console.log("music: off (config.json → music.source) — skipping"); process.exit(0); }

const dir = audioDir(slug);
const own = join(dir, "music.source.mp3");
const src = existsSync(own) ? own : findMusic();
if (!src) { console.log("no music (audio/music.source.mp3 and assets/music.* not found) — skipping"); process.exit(0); }

const tp = timingsPath(slug, lang);
if (!existsSync(tp)) die(`missing timings.${lang}.json — run TTS first`);
const { videoDurationSec: dur } = readJson(tp);
const volume = cfg.volume ?? 0.12, fadeIn = cfg.fadeInSec ?? 1, fadeOut = cfg.fadeOutSec ?? 2;
mkdirSync(dir, { recursive: true });
const out = join(dir, `music.loop.${lang}.mp3`);
const unitPath = join(dir, `.music-unit.${lang}.wav`);
const ff = (args, what) => { const r = run("ffmpeg", ["-y", "-v", "error", ...args]); if (r.status !== 0) die(`ffmpeg (${what}) failed: ${r.stderr}`); };

// 1. loop unit
const L = durationSec(src);
const c = Math.min(cfg.loopCrossfadeSec ?? 2, L / 4);
let unitNote;
if (c >= 0.2) {
  const g = [
    `[0:a]aformat=sample_rates=44100:channel_layouts=stereo,asplit=3[s1][s2][s3]`,
    `[s1]atrim=start=${(L - c).toFixed(3)}:end=${L.toFixed(3)},asetpts=PTS-STARTPTS[tail]`,
    `[s2]atrim=start=0:end=${c.toFixed(3)},asetpts=PTS-STARTPTS[head]`,
    `[tail][head]acrossfade=d=${c.toFixed(3)}:c1=qsin:c2=qsin[x]`,
    `[s3]atrim=start=${c.toFixed(3)}:end=${(L - c).toFixed(3)},asetpts=PTS-STARTPTS[mid]`,
    `[x][mid]concat=n=2:v=0:a=1[unit]`,
  ].join(";");
  ff(["-i", src, "-filter_complex", g, "-map", "[unit]", unitPath], "loop unit");
  unitNote = `crossfade ${c.toFixed(1)} s`;
} else {
  ff(["-i", src, "-ar", "44100", "-ac", "2", unitPath], "loop unit");
  unitNote = "no crossfade (source too short)";
}

// 2. ducking parameters
const duck = cfg.ducking ?? {};
const voice = join(dir, `voice.${lang}.mp3`);
const duckOn = duck.enabled === true && !flags["no-duck"] && existsSync(voice);
let duckNote = flags["no-duck"] ? "ducking off (--no-duck)" : "ducking off";
let filter, inputs = ["-stream_loop", "-1", "-i", unitPath];
const base = `afade=t=in:d=${fadeIn},afade=t=out:st=${Math.max(0, dur - fadeOut).toFixed(3)}:d=${fadeOut},volume=${volume}`;
if (duckOn) {
  const vd = run("ffmpeg", ["-hide_banner", "-nostats", "-i", voice, "-af", "volumedetect", "-f", "null", "-"]);
  const mean = parseFloat(/mean_volume:\s*(-?[\d.]+) dB/.exec(vd.stderr)?.[1]);
  if (!Number.isFinite(mean)) die(`cannot measure the voice level of ${voice}`);
  const duckDb = Math.abs(duck.duckDb ?? -8);
  const ratio = Math.min(20, Math.max(1.5, 1 / Math.max(0.05, 1 - duckDb / 12)));
  const thrDb = mean - 12;
  const thr = Math.min(1, Math.max(0.000977, 10 ** (thrDb / 20)));
  inputs = [...inputs, "-i", voice];
  filter = `[0:a]${base}[m];[1:a]aformat=sample_rates=44100:channel_layouts=stereo,apad[sc];` +
    `[m][sc]sidechaincompress=threshold=${thr.toFixed(5)}:ratio=${ratio.toFixed(2)}:attack=${duck.attackMs ?? 150}:release=${duck.releaseMs ?? 600}:makeup=1[out]`;
  duckNote = `ducking ${duckDb} dB (voice mean ${mean.toFixed(1)} dB, threshold ${thrDb.toFixed(1)} dB, ratio ${ratio.toFixed(1)}, attack ${duck.attackMs ?? 150} ms, release ${duck.releaseMs ?? 600} ms)`;
} else {
  filter = `[0:a]${base}[out]`;
}

// 3. render
ff([...inputs, "-filter_complex", filter, "-map", "[out]", "-t", String(dur), "-c:a", "libmp3lame", "-b:a", "128k", out], "music mix");
try { unlinkSync(unitPath); } catch { /* temp file already gone */ }
console.log(`OK audio/music.loop.${lang}.mp3 — ${dur.toFixed(1)} s from ${src.includes("assets") ? "assets/" + src.split("/").pop() : "audio/music.source.mp3"}, ${unitNote}, volume ${volume}, ${duckNote}`);
