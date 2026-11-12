// Silent placeholder voice + synthetic timings (2.5 words/s) for testing without spending TTS credits.
// Usage: node tools/fake-voice.mjs <slug> <lang>
// Never use for a final render: timings.<lang>.json gets "source": "fake" and /produce refuses to render it as final.
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { loadScript, audioDir, parseArgs, die, run, buildFullText, charTimes, timingsFromCharTimes, insertSilentBeats, writeTimings } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/fake-voice.mjs <slug> <lang>");

const script = loadScript(slug, lang);
const { text, ranges } = buildFullText(script);
const st = [], en = [];
let t = 0.3;
for (const c of text) {
  st.push(t);
  t += c === " " ? 0.07 : 0.055;
  if (".!?".includes(c)) t += 0.35;
  else if (",;:—".includes(c)) t += 0.15;
  en.push(t);
}
const dir = audioDir(slug);
mkdirSync(dir, { recursive: true });
const raw = join(dir, `voice.${lang}.fake.raw.mp3`);
const r = run("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", `anullsrc=r=44100:cl=mono`, "-t", String(t + 0.4), "-c:a", "libmp3lame", "-b:a", "64k", raw]);
if (r.status !== 0) die(r.stderr);
const ct = charTimes(text, { characters: [...text], character_start_times_seconds: st, character_end_times_seconds: en });
const spoken = timingsFromCharTimes(script, text, ranges, ct);
const beats = insertSilentBeats(script, spoken, raw, join(dir, `voice.${lang}.mp3`));
writeTimings(slug, lang, "fake", beats, `audio/voice.${lang}.mp3`);
