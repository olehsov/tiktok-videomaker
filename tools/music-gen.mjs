// Generate the background music of one video with ElevenLabs Music. One track per video (not per language).
// Usage: node --env-file=.env tools/music-gen.mjs <slug> [--force]
//   --force   regenerate even if audio/music.source.mp3 exists (spends credits)
// Reads config.json → music (source, model, lengthSec, promptTemplate) and videos/<slug>/music.json ({ "topic": "…" }).
// Writes audio/music.source.mp3 and audio/music.meta.json. NEVER blocks the pipeline: any problem prints the reason,
// then "music: fallback" and exits 0 (music-loop.mjs then uses assets/music.* or no music).
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config, readJson, writeJson, loadScript, audioDir, videoDir, parseArgs, isoLocal } from "./lib.mjs";

const { pos, flags } = parseArgs(process.argv.slice(2));
const [slug] = pos;
if (!slug) { console.error("usage: node --env-file=.env tools/music-gen.mjs <slug> [--force]"); process.exit(1); }

const fallback = (why) => { console.log(`music: fallback — ${why}`); process.exit(0); };
const music = config().music ?? {};
if ((music.source ?? "off") !== "elevenlabs") { console.log(`music: skipped (source=${music.source ?? "off"})`); process.exit(0); }

const dir = audioDir(slug);
const out = join(dir, "music.source.mp3");
if (existsSync(out) && !flags.force) { console.log("music: reused audio/music.source.mp3 (no credits)"); process.exit(0); }

// prompt = template with {{topic}}
let topic = "";
const mj = join(videoDir(slug), "music.json");
if (existsSync(mj)) { try { topic = String(readJson(mj).topic ?? "").trim(); } catch { /* handled below */ } }
if (!topic) {
  try { topic = loadScript(slug, "en").title; console.warn("WARN: music.json has no topic — using the script title"); }
  catch { fallback("no music.json topic and no script title"); }
}
const template = music.promptTemplate;
if (!template) fallback("config.json → music.promptTemplate is empty");
const prompt = template.replaceAll("{{topic}}", topic);

const key = process.env.ELEVENLABS_API_KEY;
if (!key) fallback("ELEVENLABS_API_KEY is not set (run with: node --env-file=.env tools/music-gen.mjs <slug>)");

const body = { prompt, music_length_ms: Math.round((music.lengthSec ?? 30) * 1000), model_id: music.model ?? "music_v2", force_instrumental: true };
console.log(`music: calling ElevenLabs Music (${body.model_id}, ${music.lengthSec ?? 30} s) for: ${topic}`);
let res;
try {
  res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST", headers: { "xi-api-key": key, "content-type": "application/json" }, body: JSON.stringify(body),
  });
} catch (e) { fallback(`request failed: ${e.message}`); }
if (!res.ok) {
  const text = (await res.text()).replace(/\s+/g, " ").slice(0, 300);
  const hint = { 401: "bad API key", 402: "payment / plan required", 403: "forbidden (plan without Music access?)", 422: "request rejected", 429: "rate limited" }[res.status] ?? (res.status >= 500 ? "server error" : "error");
  fallback(`HTTP ${res.status} (${hint}) ${text}`);
}
const bytes = Buffer.from(await res.arrayBuffer());
if (bytes.length < 10_000) fallback(`response too small (${bytes.length} bytes)`);

mkdirSync(dir, { recursive: true });
writeFileSync(out, bytes);
writeJson(join(dir, "music.meta.json"), { prompt, model: body.model_id, lengthSec: music.lengthSec ?? 30, generatedAt: isoLocal() });
console.log(`music: generated audio/music.source.mp3 (${(bytes.length / 1e6).toFixed(2)} MB)`);
