// Validate a video's scripts (and timings if present). No dependencies.
// Usage: node tools/validate.mjs <slug>
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { videoDir, readJson, parseArgs, die, config, scriptHash } from "./lib.mjs";

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
    const budget = (s.targetDurationSec - 8) * 2.3, hard = (s.targetDurationSec - 8) * 2.4;
    if (words > hard) E(`${words} words > ${Math.round(hard)} (= (targetDurationSec − 8) × 2.4) — cut narration or raise targetDurationSec`);
    else if (words > budget) warnings.push(`${f}: ${words} words > budget ${Math.round(budget)} (= (targetDurationSec − 8) × 2.3)`);
  }
  const tp = join(dir, `timings.${lang}.json`);
  if (existsSync(tp)) {
    const t = readJson(tp);
    if (t.beats.map((b) => b.id).join() !== ids.join()) E(`timings.${lang}.json beat ids do not match script`);
    if (t.videoDurationSec > cfg.timing.maxDurationSec) E(`timings.${lang}.json: video ${t.videoDurationSec}s > ${cfg.timing.maxDurationSec}s`);
    if (t.videoDurationSec < cfg.timing.minDurationSec) warnings.push(`timings.${lang}.json: video ${t.videoDurationSec}s < ${cfg.timing.minDurationSec}s`);
  }
}

// marketing.<lang>.json and upload.<lang>.json (only when present)
const PRIVACY = ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"];
for (const f of files) {
  const lang = f.split(".")[1];
  const mp = join(dir, `marketing.${lang}.json`);
  if (existsSync(mp)) {
    const E = (m) => errors.push(`marketing.${lang}.json: ${m}`);
    try {
      const m = readJson(mp);
      if (m.lang !== lang) E(`lang '${m.lang}' ≠ '${lang}'`);
      if (!/^[0-9a-f]{64}$/.test(m.scriptHash || "")) E("scriptHash missing or malformed");
      else if (m.scriptHash !== scriptHash(readJson(join(dir, f)))) warnings.push(`marketing.${lang}.json is stale (narration changed) — rerun marketing-writer`);
      if (typeof m.caption !== "string" || !m.caption.trim()) E("caption missing");
      else if (m.caption.length > 2200) E(`caption ${m.caption.length} UTF-16 units > 2200`);
      else if (m.caption.length > 300) warnings.push(`marketing.${lang}.json: caption ${m.caption.length} chars (aim ≤ 300)`);
      const tags = m.hashtags;
      if (!Array.isArray(tags) || tags.length < 3 || tags.length > 6) E("hashtags needs 3–6 items");
      else for (const h of tags) if (!/^#[\p{L}\p{N}_]+$/u.test(h)) E(`bad hashtag ${h}`);
      if (!Array.isArray(m.keywords) || m.keywords.length < 5 || m.keywords.length > 8) E("keywords needs 5–8 items");
      if (!m.pinnedComment) E("pinnedComment missing");
    } catch (e) { E(`invalid JSON — ${e.message}`); }
  }
  const up = join(dir, "out", `upload.${lang}.json`);
  if (existsSync(up)) {
    const E = (m) => errors.push(`upload.${lang}.json: ${m}`);
    try {
      const u = readJson(up), p = u.post_info || {};
      if (u.platform !== "tiktok") E("platform must be tiktok");
      if (!Number.isInteger(u.video_size) || u.video_size < 1) E("video_size must be a positive integer");
      if (!(u.duration_sec > 0)) E("duration_sec missing");
      for (const k of ["video_path", "cover_path"]) if (!u[k] || !existsSync(join(dir, u[k]))) E(`${k} does not exist`);
      if (typeof p.title !== "string" || !p.title || p.title.length > 2200) E("post_info.title missing or > 2200");
      if (!PRIVACY.includes(p.privacy_level)) E("post_info.privacy_level invalid");
      for (const k of ["disable_duet", "disable_stitch", "disable_comment", "brand_content_toggle", "brand_organic_toggle", "is_aigc"]) if (typeof p[k] !== "boolean") E(`post_info.${k} must be boolean`);
      if (!Number.isInteger(p.video_cover_timestamp_ms) || p.video_cover_timestamp_ms < 0) E("post_info.video_cover_timestamp_ms invalid");
      if (u.source_info?.source !== "FILE_UPLOAD") E("source_info.source must be FILE_UPLOAD");
      if (!["ready", "published"].includes(u.status)) E("status invalid");
    } catch (e) { E(`invalid JSON — ${e.message}`); }
  }
}

// music.json (topic for the music prompt): required for videos still at selected/briefed, a warning for older ones
{
  const mp = join(dir, "music.json");
  const statusFile = join(dir, "STATUS");
  const status = existsSync(statusFile) ? readFileSync(statusFile, "utf8").trim() : "";
  const early = status === "" || status === "selected" || status === "briefed";
  if (!existsSync(mp)) (early ? errors : warnings).push("music.json is missing — brief-writer writes { \"topic\": \"<≤ 25 words>\" }");
  else {
    try {
      const t = readJson(mp).topic;
      const n = typeof t === "string" ? t.trim().split(/\s+/).filter(Boolean).length : 0;
      if (!n) errors.push("music.json: 'topic' must be a non-empty string");
      else if (n > 25) errors.push(`music.json: topic has ${n} words (max 25)`);
    } catch (e) { errors.push(`music.json: invalid JSON — ${e.message}`); }
  }
}

warnings.forEach((w) => console.warn(`WARN: ${w}`));
if (errors.length) { errors.forEach((e) => console.error(`ERROR: ${e}`)); process.exit(1); }
console.log(`OK ${files.join(", ")}`);
