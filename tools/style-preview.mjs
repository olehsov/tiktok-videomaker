// Render still frames of the style specimen (day / night / tense) for a look, without rendering a video.
// Usage: node tools/style-preview.mjs [key=value ...] [key=v1,v2,v3] [--neutral] [--apply] [--guides]
//   key=value      temporary look override (config.json is NOT changed unless --apply)
//   key=v1,v2,v3   grid.png: one column per value (day + night rows). Only one such key.
//   --neutral      baseline: all look values neutral (original palette), config.look ignored
//   --apply        write the overrides into config.json "look" and regenerate kit/tokens.css
//   --guides       draw TikTok safe-zone guides on the stills
// Output: videos/_template/style/previews/<YYYY-MM-DD_HHMM>/{day,night,tense,compare,grid}.png + look.json
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, run, finishFilters, readJson, writeJson, die, isoLocal } from "./lib.mjs";
import { effectiveLook, generate, NEUTRAL, KIT } from "./apply-look.mjs";

const TPL = join(ROOT, "videos", "_template");
const PREVIEWS = join(TPL, "style", "previews");
const HF = "hyperframes@0.9.36";
const TIMES = { day: 2.0, night: 6.0, tense: 10.0 }; // 1.7 s into each state: all caption words lit, crack ghost visible

// ---------------------------------------------------------------- args
const over = {}, multi = {}; let neutral = false, apply = false, guides = false;
for (const a of process.argv.slice(2)) {
  if (a === "--neutral") neutral = true;
  else if (a === "--apply") apply = true;
  else if (a === "--guides") guides = true;
  else if (a.startsWith("--")) die(`unknown flag ${a}`);
  else {
    const [k, ...v] = a.split("="), val = v.join("=");
    if (!k || !val) die(`bad argument '${a}' (use key=value or key=v1,v2,v3)`);
    if (val.includes(",")) multi[k] = val.split(",").map((x) => x.trim()); else over[k] = val;
  }
}
const multiKeys = Object.keys(multi);
if (multiKeys.length > 1) die("only one key=v1,v2,v3 grid per run");
if (apply && multiKeys.length) die("--apply needs single values, not a v1,v2,v3 grid");
if (apply && neutral) die("--apply with --neutral would overwrite config.look with neutral values; run them separately");

// ---------------------------------------------------------------- helpers
const baseCss = readFileSync(join(KIT, "tokens.base.css"), "utf8");
const FONT = ["/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"].find(existsSync);
const esc = (t) => t.replace(/[\\:'%]/g, (c) => "\\" + c);
const label = (t, size = 26) => (FONT ? `drawtext=fontfile=${FONT}:text='${esc(t)}':x=12:y=12:fontsize=${size}:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=8` : "null");
const ff = (args) => { const r = run("ffmpeg", ["-y", "-v", "error", ...args]); if (r.status !== 0) die(`ffmpeg failed: ${r.stderr}`); };
const shortLook = (look) => Object.entries(look).filter(([k, v]) => v !== NEUTRAL[k]).map(([k, v]) => `${k} ${v}`).join(" · ") || "neutral";

/** Build the specimen for `look` into `dir/build` and return the raw snapshot PNG paths by state. */
function snapshots(look, dir, states) {
  mkdirSync(dir, { recursive: true });
  const tokens = join(dir, "tokens.css");
  writeFileSync(tokens, generate(baseCss, look));
  const env = { ...process.env, KIT_TOKENS: tokens, SPECIMEN_GUIDES: guides ? "1" : "0", SPECIMEN_LABEL: shortLook(look) };
  const build = join(dir, "build");
  let r = run("node", [join(TPL, "build.mjs"), "en", "--root", join(TPL, "style", "specimen"), "--no-voice", "--out", build], { cwd: TPL, env });
  if (r.status !== 0) die(`specimen build failed:\n${r.stdout}${r.stderr}`);
  const raw = join(dir, "raw");
  rmSync(raw, { recursive: true, force: true });
  const times = states.map((s) => TIMES[s]);
  r = run("npx", ["--yes", HF, "snapshot", build, "--at", times.join(","), "--no-end", "-o", raw], { cwd: TPL, env });
  if (r.status !== 0) die(`snapshot failed:\n${r.stdout}${r.stderr}`);
  const files = readdirSync(raw).filter((n) => /^frame-.*\.png$/.test(n)).sort();
  if (files.length !== states.length) die(`expected ${states.length} snapshots, got ${files.length}`);
  return Object.fromEntries(states.map((s, i) => [s, join(raw, files[i])]));
}
/** Same finishing as the final render (sharpen / grain / vignette), applied to a still. */
function finishStill(src, dst, look) {
  const vf = finishFilters(look);
  ff(["-i", src, ...(vf ? ["-vf", vf] : []), "-frames:v", "1", dst]);
}
function run2(look, dir, states) {
  const raw = snapshots(look, dir, states), out = {};
  for (const s of states) { out[s] = join(dir, `${s}.png`); finishStill(raw[s], out[s], look); }
  return out;
}

// ---------------------------------------------------------------- run
mkdirSync(PREVIEWS, { recursive: true });
const d = new Date(), p2 = (n) => String(n).padStart(2, "0");
let stamp = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}_${p2(d.getHours())}${p2(d.getMinutes())}`;
for (let n = 2; existsSync(join(PREVIEWS, stamp)); n++) stamp = stamp.replace(/_(\d{4})(_\d+)?$/, `_$1_${n}`);
const previous = readdirSync(PREVIEWS).filter((n) => existsSync(join(PREVIEWS, n, "day.png"))).sort().pop();
const dir = join(PREVIEWS, stamp);
const result = { folder: dir, files: [] };

if (multiKeys.length) {
  // grid: one column per value, rows day + night
  const key = multiKeys[0], cols = [];
  for (const v of multi[key]) {
    const look = effectiveLook({ ...over, [key]: v }, { neutral });
    const sub = join(dir, "grid-cells", `${key}-${v}`);
    const imgs = run2(look, sub, ["day", "night"]);
    cols.push({ v, ...imgs });
  }
  const args = [], fc = [];
  cols.forEach((c, i) => args.push("-i", c.day, "-i", c.night));
  cols.forEach((c, i) => {
    fc.push(`[${i * 2}:v]scale=360:-1,${label(`${key}=${c.v} · day`, 24)}[d${i}]`, `[${i * 2 + 1}:v]scale=360:-1,${label(`${key}=${c.v} · night`, 24)}[n${i}]`);
  });
  const row = (p) => cols.map((_, i) => `[${p}${i}]`).join("") + `hstack=inputs=${cols.length}[${p}row]`;
  fc.push(row("d"), row("n"), "[drow][nrow]vstack=inputs=2[out]");
  ff([...args, "-filter_complex", fc.join(";"), "-map", "[out]", "-frames:v", "1", join(dir, "grid.png")]);
  rmSync(join(dir, "grid-cells"), { recursive: true, force: true });
  writeJson(join(dir, "look.json"), { preview: stamp, grid: { [key]: multi[key] }, overrides: over, neutral, look: effectiveLook({ ...over }, { neutral }) });
  result.files.push(join(dir, "grid.png"), join(dir, "look.json"));
  result.summary = `grid ${key}=${multi[key].join(",")}${Object.keys(over).length ? ` with ${JSON.stringify(over)}` : ""}`;
} else {
  const look = effectiveLook(over, { neutral });
  const imgs = run2(look, dir, ["day", "night", "tense"]);
  rmSync(join(dir, "raw"), { recursive: true, force: true });
  writeJson(join(dir, "look.json"), { preview: stamp, overrides: over, neutral, guides, look });
  result.files.push(imgs.day, imgs.night, imgs.tense, join(dir, "look.json"));
  result.summary = `${neutral ? "NEUTRAL baseline" : "look"}: ${shortLook(look)}`;
  if (previous) {
    const prevLook = readJson(join(PREVIEWS, previous, "look.json")).look;
    const states = ["day", "night", "tense"], args = [], fc = [];
    states.forEach((s) => args.push("-i", join(PREVIEWS, previous, `${s}.png`), "-i", imgs[s]));
    states.forEach((s, i) => {
      fc.push(`[${i * 2}:v]scale=480:-1,${label(`PREV ${s}`, 26)}[a${i}]`, `[${i * 2 + 1}:v]scale=480:-1,${label(`THIS ${s}`, 26)}[b${i}]`, `[a${i}][b${i}]hstack[r${i}]`);
    });
    fc.push("[r0][r1][r2]vstack=inputs=3[out]");
    ff([...args, "-filter_complex", fc.join(";"), "-map", "[out]", "-frames:v", "1", join(dir, "compare.png")]);
    result.files.push(join(dir, "compare.png"));
    result.summary += ` — compared with ${previous} (${shortLook(prevLook)})`;
    const changed = Object.keys(NEUTRAL).filter((k) => prevLook[k] !== look[k]);
    result.changed = changed;
  }
}

// ---------------------------------------------------------------- --apply
if (apply) {
  const cfgPath = join(ROOT, "config.json"), cfg = existsSync(cfgPath) ? readJson(cfgPath) : {};
  const look = effectiveLook(over), changed = [];
  cfg.look = { ...(cfg.look || {}) };
  for (const k of Object.keys(over)) { if (cfg.look[k] !== look[k]) changed.push(k); cfg.look[k] = look[k]; }
  writeJson(cfgPath, cfg);
  writeFileSync(join(KIT, "tokens.css"), generate(baseCss, effectiveLook()));
  result.applied = changed;
  result.summary += ` — APPLIED to config.json: ${changed.join(", ") || "(no change)"}`;
}
console.log("RESULT " + JSON.stringify(result, null, 2));
