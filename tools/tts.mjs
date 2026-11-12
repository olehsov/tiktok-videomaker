// Generate voice + timings for one language via ElevenLabs "with-timestamps".
// Usage: node --env-file=.env tools/tts.mjs <slug> <lang> [--force]
//   --force   regenerate even if audio/voice.<lang>.mp3 exists (spends credits)
// Without --force and with existing raw alignment, timings are rebuilt offline (no credits).
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  config, loadScript, audioDir, parseArgs, die, readJson, writeJson,
  buildFullText, charTimes, timingsFromCharTimes, insertSilentBeats, writeTimings,
} from "./lib.mjs";

const { pos, flags } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node --env-file=.env tools/tts.mjs <slug> <lang> [--force]");

const cfg = config();
const script = loadScript(slug, lang);
const dir = audioDir(slug);
mkdirSync(dir, { recursive: true });
const rawMp3 = join(dir, `voice.${lang}.raw.mp3`);
const rawAlign = join(dir, `voice.${lang}.alignment.json`);
const finalMp3 = join(dir, `voice.${lang}.mp3`);

const { text, ranges } = buildFullText(script);
if (!text) die("script has no narration");

async function callElevenLabs() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) die("ELEVENLABS_API_KEY is not set. Add it to .env (see .env.example) or drop audio/voice.<lang>.mp3 and run tools/timings-from-silence.mjs.");
  const voice = cfg.tts.voices[lang];
  if (!voice || voice.startsWith("REPLACE")) die(`no voice id for '${lang}' in config.json → tts.voices.${lang}`);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=${cfg.tts.outputFormat}`;
  const body = { text, model_id: cfg.tts.model, voice_settings: cfg.tts.voiceSettings };
  let lastErr = "";
  for (let attempt = 0; attempt <= cfg.tts.maxRetries; attempt++) {
    const res = await fetch(url, { method: "POST", headers: { "xi-api-key": key, "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return res.json();
    lastErr = `HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`;
    if (![429, 500, 502, 503, 504].includes(res.status)) break;
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  die(`ElevenLabs request failed — ${lastErr}`);
}

if (existsSync(finalMp3) && !flags.force && !existsSync(rawAlign)) {
  die(`audio/voice.${lang}.mp3 exists but has no alignment (owner-provided?). Use: node tools/timings-from-silence.mjs ${slug} ${lang}`);
}

let alignment;
if (existsSync(rawAlign) && existsSync(rawMp3) && !flags.force) {
  const saved = readJson(rawAlign);
  if (saved.text !== text) die(`narration changed since the voice was generated. Re-run with --force to regenerate (spends credits).`);
  alignment = saved.alignment;
  console.log("Using saved alignment (no API call).");
} else {
  console.log(`Calling ElevenLabs: ${text.length} characters, model ${cfg.tts.model}, lang ${lang}…`);
  const data = await callElevenLabs();
  alignment = data.alignment || data.normalized_alignment;
  if (!alignment) die("response has no alignment");
  writeFileSync(rawMp3, Buffer.from(data.audio_base64, "base64"));
  writeJson(rawAlign, { text, model: cfg.tts.model, voice: cfg.tts.voices[lang], alignment });
}

const ct = charTimes(text, alignment);
const spoken = timingsFromCharTimes(script, text, ranges, ct);
const beats = insertSilentBeats(script, spoken, rawMp3, finalMp3);
writeTimings(slug, lang, "elevenlabs", beats, `audio/voice.${lang}.mp3`);
