// Validate a video's scripts (and timings if present). No dependencies.
// Usage: node tools/validate.mjs <slug>
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { videoDir, readJson, parseArgs, die, config } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [slug] = pos;
if (!slug) die("usage: node tools/validate.mjs <slug>");
const dir = videoDir(slug);
if (!existsSync(dir)) die(`no folder videos/${slug}`);

const cfg = config();
const errors = [], warnings = [];
const files = readdirSync(dir).filter((f) => /^script\.[a-z]{2}\.json$/.test(f));
if (!files.length) die("no script.<lang>.json files");
if (!files.includes("script.en.json")) errors.push("script.en.json (primary) is missing");

const STEP_TYPES = ["hook", "attempt", "step", "threat", "night", "fact", "climax", "recap", "ending"];
let refIds = null;

for (const f of files) {
  const lang = f.split(".")[1];
  let s;
  try { s = readJson(join(dir, f)); } catch (e) { errors.push(`${f}: invalid JSON — ${e.message}`); continue; }
  const E = (m) => errors.push(`${f}: ${m}`);
  for (const k of ["slug", "lang", "title", "targetDurationSec", "finalLine", "beats", "cover", "post"]) if (s[k] === undefined) E(`missing '${k}'`);
  if (s.slug !== slug) E(`slug '${s.slug}' ≠ folder '${slug}'`);
  if (s.lang !== lang) E(`lang '${s.lang}' ≠ file name '${lang}'`);
  if (!cfg.languages.supported.includes(lang)) E(`unsupported language '${lang}'`);
  if (s.targetDurationSec < cfg.timing.minDurationSec || s.targetDurationSec > cfg.timing.maxDurationSec) E("targetDurationSec out of range");
  if (!Array.isArray(s.beats) || s.beats.length < 6) { E("needs ≥ 6 beats"); continue; }
  const ids = s.beats.map((b) => b.id);
  if (new Set(ids).size !== ids.length) E("duplicate beat ids");
  if (!refIds) refIds = ids;
  else if (ids.join() !== refIds.join()) E(`beat ids differ from ${files[0]}`);
  s.beats.forEach((b) => {
    const B = (m) => E(`${b.id}: ${m}`);
    if (!/^b\d{2}$/.test(b.id)) B("bad id");
    if (!STEP_TYPES.includes(b.type)) B(`bad type '${b.type}'`);
    if (b.type === "step" && !b.step) B("type=step needs 'step' number");
    const n = (b.narration || "").trim();
    if (!n && !b.holdSec) B("empty narration needs holdSec");
    for (const kw of b.keywords || []) if (!n.includes(kw.text)) B(`keyword '${kw.text}' not found in narration`);
    for (const c of b.cues || []) if (!n.includes(c.word)) B(`cue word '${c.word}' not found in narration`);
    if (!b.onScreen) B("missing onScreen");
  });
  const last = s.beats[s.beats.length - 1];
  if (last && last.narration.trim() !== (s.finalLine || "").trim()) E("last beat narration must equal finalLine");
  if (!s.post?.hashtags || s.post.hashtags.length < 5) E("post.hashtags needs 5–8 items");
  const words = s.beats.map((b) => b.narration).join(" ").split(/\s+/).filter(Boolean).length;
  if (lang === "en") {
    const expected = s.targetDurationSec * 2.5;
    if (Math.abs(words - expected) / expected > 0.2) warnings.push(`${f}: ${words} words vs ~${Math.round(expected)} expected for ${s.targetDurationSec} s`);
  }
  const tp = join(dir, `timings.${lang}.json`);
  if (existsSync(tp)) {
    const t = readJson(tp);
    if (t.beats.map((b) => b.id).join() !== ids.join()) E(`timings.${lang}.json beat ids do not match script`);
    if (t.videoDurationSec > cfg.timing.maxDurationSec) E(`timings.${lang}.json: video ${t.videoDurationSec}s > ${cfg.timing.maxDurationSec}s`);
    if (t.videoDurationSec < cfg.timing.minDurationSec) warnings.push(`timings.${lang}.json: video ${t.videoDurationSec}s < ${cfg.timing.minDurationSec}s`);
  }
}

warnings.forEach((w) => console.warn(`WARN: ${w}`));
if (errors.length) { errors.forEach((e) => console.error(`ERROR: ${e}`)); process.exit(1); }
console.log(`OK ${files.join(", ")}`);
