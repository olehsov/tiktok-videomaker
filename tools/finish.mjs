// Final-render finishing: sharpen, grain, vignette (+ CRF and x264 tune) from config.json "look".
// Usage: node tools/finish.mjs <in.mp4|in.png> [<out>] [--set key=value ...] [--neutral]
//   .mp4: one ffmpeg re-encode  -vf <finish chain> -c:v libx264 -crf <crf> -tune <x264Tune> -preset medium -pix_fmt yuv420p -c:a copy
//   .png: the same filter chain on the still (so stills match final videos)
//   no <out> → in place. Drafts are not finished. Idempotence is NOT guaranteed: run once per render.
import { renameSync, existsSync } from "node:fs";
import { extname } from "node:path";
import { run, finishFilters, die } from "./lib.mjs";
import { effectiveLook } from "./apply-look.mjs";

const argv = process.argv.slice(2), pos = [], over = {}; let neutral = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--neutral") neutral = true;
  else if (argv[i] === "--set") { const [k, ...v] = (argv[++i] ?? "").split("="); over[k] = v.join("="); }
  else pos.push(argv[i]);
}
const [inp, outArg] = pos;
if (!inp) die("usage: node tools/finish.mjs <in.mp4|in.png> [<out>] [--set key=value] [--neutral]");
if (!existsSync(inp)) die(`missing ${inp}`);
const look = effectiveLook(over, { neutral });
const vf = finishFilters(look);
const out = outArg ?? inp, tmp = out + ".finish" + extname(out);
const isVideo = /\.(mp4|mov|m4v)$/i.test(inp);

const args = ["-y", "-v", "error", "-i", inp];
if (isVideo) {
  args.push("-map", "0:v:0", "-map", "0:a?");
  if (vf) args.push("-vf", vf);
  args.push("-c:v", "libx264", "-crf", String(look.crf));
  if (look.x264Tune !== "none") args.push("-tune", look.x264Tune);
  args.push("-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart");
} else {
  if (vf) args.push("-vf", vf);
  args.push("-frames:v", "1");
}
args.push(tmp);
const r = run("ffmpeg", args);
if (r.status !== 0) die(`ffmpeg failed: ${r.stderr}`);
renameSync(tmp, out);
console.log(`OK ${out} — finish: ${vf || "none"}${isVideo ? `, crf ${look.crf}, tune ${look.x264Tune}` : ""}`);
