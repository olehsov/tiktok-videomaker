// Timings for an owner-provided voice file (no API). Sentence/beat-accurate, word timing interpolated.
// Usage: node tools/timings-from-silence.mjs <slug> <lang>
// Input:  audio/voice.<lang>.mp3 (owner's file; moved to voice.<lang>.source.mp3 on first run)
// Output: audio/voice.<lang>.mp3 (with silent-beat pauses inserted), timings.<lang>.json
import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";
import {
  config, loadScript, audioDir, parseArgs, die, run, durationSec,
  proportionalWords, insertSilentBeats, writeTimings,
} from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/timings-from-silence.mjs <slug> <lang>");

const cfg = config();
const script = loadScript(slug, lang);
const dir = audioDir(slug);
const src = join(dir, `voice.${lang}.source.mp3`);
const dst = join(dir, `voice.${lang}.mp3`);
if (!existsSync(src)) {
  if (!existsSync(dst)) die(`no audio: put the voice file at videos/${slug}/audio/voice.${lang}.mp3`);
  renameSync(dst, src);
}

const D = durationSec(src);
const { noiseDb, minSilenceSec } = cfg.timing.silenceDetect;
const r = run("ffmpeg", ["-hide_banner", "-i", src, "-af", `silencedetect=noise=${noiseDb}dB:d=${minSilenceSec}`, "-f", "null", "-"]);
const sil = [];
let cur = null;
for (const line of r.stderr.split("\n")) {
  const s = line.match(/silence_start: ([\d.]+)/);
  const e = line.match(/silence_end: ([\d.]+)/);
  if (s) cur = { start: parseFloat(s[1]) };
  if (e && cur) { cur.end = parseFloat(e[1]); sil.push(cur); cur = null; }
}
if (cur) sil.push({ start: cur.start, end: D });

const spokenBeats = script.beats.filter((b) => (b.narration || "").trim());
const speechStart = sil.length && sil[0].start < 0.05 ? sil[0].end : 0;
const last = sil[sil.length - 1];
const speechEnd = last && Math.abs(last.end - D) < 0.05 ? last.start : D;
const inner = sil.filter((s) => s.start > speechStart && s.end < speechEnd);

// initial boundary estimates by character share, then snap to the nearest unused silence (monotonic)
const lens = spokenBeats.map((b) => b.narration.trim().length);
const total = lens.reduce((a, b) => a + b, 0);
const est = [];
let acc = 0;
for (let i = 0; i < lens.length - 1; i++) { acc += lens[i]; est.push(speechStart + (acc / total) * (speechEnd - speechStart)); }

const cuts = [];
let from = 0;
for (const t of est) {
  let best = -1, bestDist = Infinity;
  for (let k = from; k < inner.length; k++) {
    const mid = (inner[k].start + inner[k].end) / 2;
    const dist = Math.abs(mid - t);
    if (dist < bestDist) { best = k; bestDist = dist; }
  }
  if (best >= 0 && bestDist < 4) { cuts.push({ end: inner[best].start, next: inner[best].end }); from = best + 1; }
  else cuts.push({ end: t, next: t }); // no pause found nearby: hard cut
}

const spoken = spokenBeats.map((b, i) => {
  const start = i === 0 ? speechStart : cuts[i - 1].next;
  const end = i === spokenBeats.length - 1 ? speechEnd : cuts[i].end;
  return { id: b.id, start, end, words: proportionalWords(b.narration.trim(), start, end) };
});

const beats = insertSilentBeats(script, spoken, src, dst);
writeTimings(slug, lang, "silence", beats, `audio/voice.${lang}.mp3`);
console.log(`Detected ${inner.length} pauses for ${spokenBeats.length} spoken beats.`);
