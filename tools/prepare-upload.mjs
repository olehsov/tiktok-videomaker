// Build out/upload.<lang>.json (TikTok Content Posting API, Direct Post, FILE_UPLOAD) from the final render + marketing file.
// Usage: node tools/prepare-upload.mjs <slug> <lang>
// Exit codes: 0 ok · 1 error · 3 stale marketing (narration changed since marketing.<lang>.json was written → rerun marketing-writer)
import { statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { videoDir, loadScript, readJson, writeJson, scriptHash, durationSec, config, exists, parseArgs, die, isoLocal } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/prepare-upload.mjs <slug> <lang>");
const dir = videoDir(slug);
const mp4 = join(dir, "out", `${slug}.${lang}.mp4`);
const cover = join(dir, "out", `cover.${lang}.png`);
const mk = join(dir, `marketing.${lang}.json`);
for (const [p, what] of [[mp4, "final video"], [cover, "cover"], [mk, "marketing file"]]) if (!exists(p)) die(`missing ${what}: ${p}`);

const script = loadScript(slug, lang);
const m = readJson(mk);
if (m.scriptHash !== scriptHash(script)) {
  console.error(`STALE: marketing.${lang}.json was written for a different narration — rerun marketing-writer.`);
  process.exit(3);
}

const cfg = config().marketing;
const timings = readJson(join(dir, `timings.${lang}.json`));
const beatById = new Map(script.beats.map((b) => [b.id, b]));
const timed = timings.beats.map((t) => ({ ...t, type: beatById.get(t.id)?.type }));
const climax = timed.find((b) => b.type === "climax");
let coverMs;
if (climax) coverMs = Math.round(((climax.start + climax.end) / 2) * 1000);
else {
  const steps = timed.filter((b) => b.type === "step");
  const last = steps[steps.length - 1] || timed[timed.length - 1];
  coverMs = Math.round(last.end * 1000);
}

const hashtags = m.hashtags || [];
let title = (m.caption || "").trim();
if (!hashtags.every((h) => title.includes(h))) title = `${title}\n${hashtags.join(" ")}`.trim();
if (title.length > 2200) die(`caption is ${title.length} UTF-16 units (max 2200)`);

const upload = {
  platform: "tiktok",
  slug,
  lang,
  video_path: `out/${slug}.${lang}.mp4`,
  video_size: statSync(mp4).size,
  duration_sec: Math.round(durationSec(mp4) * 100) / 100,
  cover_path: `out/cover.${lang}.png`,
  post_info: {
    title,
    privacy_level: cfg.privacyLevel,
    disable_duet: cfg.disableDuet,
    disable_stitch: cfg.disableStitch,
    disable_comment: cfg.disableComment,
    video_cover_timestamp_ms: coverMs,
    brand_content_toggle: false,
    brand_organic_toggle: false,
    is_aigc: cfg.isAigc,
  },
  source_info: { source: "FILE_UPLOAD" },
  extras: { hashtags, keywords: m.keywords || [], pinned_comment: m.pinnedComment || "", generated_at: isoLocal() },
  status: "ready",
};
if (coverMs / 1000 > upload.duration_sec) console.warn(`WARN: cover timestamp ${coverMs} ms is beyond the video (${upload.duration_sec} s) — timings and render do not match`);
writeJson(join(dir, "out", `upload.${lang}.json`), upload);

// fill the Cover line of this language's section in MARKETING.md
const mdPath = join(dir, "MARKETING.md");
if (exists(mdPath)) {
  const lines = readFileSync(mdPath, "utf8").split("\n");
  const h = lines.findIndex((l) => new RegExp(`^##\\s+${lang}\\b`, "i").test(l));
  let done = false;
  if (h >= 0) {
    for (let i = h + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
      if (/^- \*\*Cover:\*\*/.test(lines[i])) { lines[i] = `- **Cover:** \`${upload.cover_path}\` — frame at ${coverMs} ms (${(coverMs / 1000).toFixed(1)} s)`; done = true; break; }
    }
  }
  if (done) writeFileSync(mdPath, lines.join("\n"));
  else console.warn(`WARN: no "- **Cover:**" line under "## ${lang}" in MARKETING.md`);
}
console.log(`OK out/upload.${lang}.json — ${(upload.video_size / 1e6).toFixed(1)} MB, ${upload.duration_sec} s, cover at ${coverMs} ms, title ${title.length} units`);
