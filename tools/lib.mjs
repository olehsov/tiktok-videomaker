// Shared helpers for tools/*.mjs. Node 22+, no npm dependencies. Requires ffmpeg/ffprobe on PATH.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export const writeJson = (p, data) => {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
};
export const exists = existsSync;
export const config = () => readJson(join(ROOT, "config.json"));
export const videoDir = (slug) => join(ROOT, "videos", slug);
export const scriptPath = (slug, lang) => join(videoDir(slug), `script.${lang}.json`);
export const timingsPath = (slug, lang) => join(videoDir(slug), `timings.${lang}.json`);
export const audioDir = (slug) => join(videoDir(slug), "audio");

export function die(msg, code = 1) {
  console.error(`ERROR: ${msg}`);
  process.exit(code);
}

export function parseArgs(argv) {
  const pos = [], flags = {};
  for (const a of argv) {
    if (a.startsWith("--")) flags[a.slice(2)] = true;
    else pos.push(a);
  }
  return { pos, flags };
}

export function loadScript(slug, lang) {
  const p = scriptPath(slug, lang);
  if (!existsSync(p)) die(`missing ${p}`);
  return readJson(p);
}

export function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) die(`${cmd} not found or failed to start: ${r.error.message}`);
  return r;
}

export function durationSec(file) {
  const r = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  const d = parseFloat(r.stdout.trim());
  if (!isFinite(d)) die(`cannot read duration of ${file}: ${r.stderr}`);
  return d;
}

/** Spoken beats joined into one text, with char ranges per beat. Silent beats are skipped here. */
export function buildFullText(script) {
  let text = "";
  const ranges = [];
  for (const b of script.beats) {
    const n = (b.narration || "").trim();
    if (!n) continue;
    if (text) text += " ";
    const start = text.length;
    text += n;
    ranges.push({ id: b.id, start, end: text.length }); // end exclusive
  }
  return { text, ranges };
}

/**
 * Map every char of `text` to [start,end] seconds using ElevenLabs alignment
 * ({characters, character_start_times_seconds, character_end_times_seconds}).
 * Tolerates small differences between the sent text and the aligned characters.
 */
export function charTimes(text, alignment) {
  const ch = alignment.characters;
  const st = alignment.character_start_times_seconds;
  const en = alignment.character_end_times_seconds;
  const out = new Array(text.length).fill(null);
  if (ch.join("") === text) {
    for (let i = 0; i < text.length; i++) out[i] = [st[i], en[i]];
    return out;
  }
  let j = 0;
  for (let i = 0; i < text.length && j < ch.length; i++) {
    let k = j, found = -1;
    while (k < ch.length && k < j + 6) {
      if (ch[k] === text[i]) { found = k; break; }
      k++;
    }
    if (found >= 0) { out[i] = [st[found], en[found]]; j = found + 1; }
  }
  // interpolate gaps
  let last = 0;
  for (let i = 0; i < out.length; i++) {
    if (out[i]) { last = out[i][1]; continue; }
    let n = i + 1;
    while (n < out.length && !out[n]) n++;
    const next = n < out.length ? out[n][0] : last;
    const span = n - i + 1;
    for (let m = i; m < n; m++) {
      const t = last + ((next - last) * (m - i + 1)) / span;
      out[m] = [t, t];
    }
    i = n - 1;
  }
  return out;
}

/** Words with char offsets. */
export function tokenize(text) {
  const words = [];
  for (const m of text.matchAll(/\S+/g)) words.push({ text: m[0], cStart: m.index, cEnd: m.index + m[0].length });
  return words;
}

const r2 = (x) => Math.round(x * 1000) / 1000;

/** Build timings from per-char times. */
export function timingsFromCharTimes(script, text, ranges, ct) {
  const words = tokenize(text).map((w) => ({ ...w, start: ct[w.cStart][0], end: ct[w.cEnd - 1][1] }));
  const spoken = ranges.map((r) => {
    const ws = words.filter((w) => w.cStart >= r.start && w.cEnd <= r.end);
    return {
      id: r.id,
      start: r2(ws[0].start),
      end: r2(ws[ws.length - 1].end),
      words: ws.map((w) => ({ text: w.text, start: r2(w.start), end: r2(w.end) })),
    };
  });
  return spoken;
}

/** Proportional word timing inside [start,end] (used by the silence fallback). */
export function proportionalWords(narration, start, end) {
  const ws = tokenize(narration);
  const total = ws.reduce((s, w) => s + w.text.length + 1, 0);
  let t = start;
  return ws.map((w) => {
    const d = ((w.text.length + 1) / total) * (end - start);
    const o = { text: w.text, start: r2(t), end: r2(t + d * 0.92) };
    t += d;
    return o;
  });
}

/**
 * Silent beats (empty narration + holdSec) need real silence in the audio.
 * Given spoken beat timings, compute insert points, rebuild the audio with ffmpeg,
 * and return the full beat list (spoken + silent) with shifted times.
 */
export function insertSilentBeats(script, spokenBeats, srcAudio, dstAudio) {
  const byId = new Map(spokenBeats.map((b) => [b.id, b]));
  const inserts = []; // {at, dur} in source time
  const result = [];
  let prevEnd = 0, shift = 0;
  const beats = script.beats;
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const sp = byId.get(b.id);
    if (sp) {
      const s = { ...sp, start: r2(sp.start + shift), end: r2(sp.end + shift), words: sp.words.map((w) => ({ ...w, start: r2(w.start + shift), end: r2(w.end + shift) })) };
      result.push(s);
      prevEnd = sp.end;
      continue;
    }
    if (!b.holdSec) die(`beat ${b.id} has empty narration but no holdSec`);
    const next = beats.slice(i + 1).map((x) => byId.get(x.id)).find(Boolean);
    const at = next ? (prevEnd + next.start) / 2 : prevEnd + 0.2;
    inserts.push({ at, dur: b.holdSec });
    result.push({ id: b.id, start: r2(at + shift), end: r2(at + shift + b.holdSec), words: [] });
    shift += b.holdSec;
  }
  if (!inserts.length) {
    if (srcAudio !== dstAudio) run("ffmpeg", ["-y", "-v", "error", "-i", srcAudio, "-c", "copy", dstAudio]);
    return result;
  }
  // Build ffmpeg concat graph: [seg0][sil0][seg1][sil1]...[segN]
  const parts = [];
  const labels = [];
  let from = 0;
  inserts.forEach((ins, k) => {
    parts.push(`[0:a]atrim=start=${from}:end=${ins.at},asetpts=PTS-STARTPTS[s${k}]`);
    parts.push(`anullsrc=r=44100:cl=mono,atrim=duration=${ins.dur}[z${k}]`);
    labels.push(`[s${k}]`, `[z${k}]`);
    from = ins.at;
  });
  parts.push(`[0:a]atrim=start=${from},asetpts=PTS-STARTPTS[s${inserts.length}]`);
  labels.push(`[s${inserts.length}]`);
  // normalise all inputs to mono 44.1k before concat
  const norm = labels.map((l, i) => `${l}aresample=44100,aformat=channel_layouts=mono[n${i}]`);
  const graph = [...parts, ...norm, `${labels.map((_, i) => `[n${i}]`).join("")}concat=n=${labels.length}:v=0:a=1[out]`].join(";");
  const r = run("ffmpeg", ["-y", "-v", "error", "-i", srcAudio, "-filter_complex", graph, "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "128k", dstAudio]);
  if (r.status !== 0) die(`ffmpeg silence insert failed: ${r.stderr}`);
  return result;
}

export function writeTimings(slug, lang, source, beats, audioRel) {
  const cfg = config();
  const audioAbs = join(videoDir(slug), audioRel);
  const d = durationSec(audioAbs);
  const data = { lang, audio: audioRel, source, durationSec: r2(d), videoDurationSec: r2(d + cfg.timing.tailSec), beats };
  writeJson(timingsPath(slug, lang), data);
  const { minDurationSec: min, maxDurationSec: max } = cfg.timing;
  const total = d + cfg.timing.tailSec;
  console.log(`OK timings.${lang}.json — ${beats.length} beats, video ${total.toFixed(1)} s (source: ${source})`);
  if (total > max) console.warn(`WARN: video ${total.toFixed(1)} s > ${max} s — cut beats before rendering.`);
  if (total < min) console.warn(`WARN: video ${total.toFixed(1)} s < ${min} s.`);
  return data;
}

export function findMusic() {
  const dir = join(ROOT, "assets");
  if (!existsSync(dir)) return null;
  const f = readdirSync(dir).find((n) => /^music\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(n));
  return f ? join(dir, f) : null;
}
