#!/usr/bin/env node
// Data → HyperFrames composition.   node build.mjs <lang> [--root <dir>] [--out <dir>] [--no-voice] [--cover [--at <sec>]]
//
//   <root>/script.<lang>.json + <root>/timings.<lang>.json + <root>/src/scenes.mjs + ./kit
//        └──▶ <out>/index.html (+ assets/voice.mp3, assets/music.mp3)      default out: <root>/build/<lang>
//
// One root composition, ONE paused GSAP timeline registered as window.__timelines["main"].
// Scenes → full-frame clips. Overlays (plates, callouts, gauge, meter, labels) and karaoke captions are
// generated from the script. All timing comes from timings.<lang>.json; cues are resolved word → seconds.
// Details: TEMPLATE.md.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import * as kit from "./kit/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GSAP_SRC = "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js";
const HF = "hyperframes@0.9.36";
const { W, H } = kit;
const r3 = (n) => Math.round(n * 1000) / 1000;

// ---------------------------------------------------------------- args
const pos = [], opt = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) { pos.push(a); continue; }
  const k = a.slice(2);
  if (["root", "out", "at"].includes(k)) opt[k] = process.argv[++i];
  else opt[k] = true;
}
const die = (m) => { console.error(`ERROR: ${m}`); process.exit(1); };
const lang = pos[0];
if (!lang) die("usage: node build.mjs <lang> [--root <dir>] [--out <dir>] [--no-voice] [--cover [--at <sec>]]");
const ROOT = resolve(opt.root ?? ".");
const COVER = !!opt.cover;
const OUT = resolve(opt.out ?? join(ROOT, "build", COVER ? `${lang}-cover` : lang));
const readJson = (p) => { if (!existsSync(p)) die(`missing ${p}`); return JSON.parse(readFileSync(p, "utf8")); };

const script = readJson(join(ROOT, `script.${lang}.json`));
const timings = readJson(join(ROOT, `timings.${lang}.json`));
const warnings = [];
const warn = (m) => { warnings.push(m); console.warn(`WARN: ${m}`); };

// ---------------------------------------------------------------- data checks
const sIds = script.beats.map((b) => b.id), tIds = timings.beats.map((b) => b.id);
if (sIds.join() !== tIds.join()) die(`beat ids differ: script [${sIds}] vs timings [${tIds}]`);
if (timings.source === "fake") warn("timings source is 'fake' — test render only, never final");
const D = r3(timings.videoDurationSec ?? timings.durationSec + 1.5);
const tOf = new Map(timings.beats.map((b) => [b.id, b]));
const sOf = new Map(script.beats.map((b) => [b.id, b]));

// ---------------------------------------------------------------- cue resolution (word → seconds)
// A cue names a word (or phrase) of that language's narration; we find its Nth occurrence in the beat's timed words
// (case-, punctuation- and Unicode-normalised) and use that word's start. A cue that cannot be found fails the build.
const cueErrors = [];
function resolveCues(sb, tb) {
  const toks = tb.words.map((w) => kit.norm(w.text));
  const out = [];
  for (const c of sb.cues ?? []) {
    const ks = c.word.split(/\s+/).map(kit.norm).filter(Boolean);
    let n = 0, hit = null;
    for (let i = 0; i + ks.length <= toks.length && !hit; i++) {
      if (ks.every((k, j) => toks[i + j] === k) && ++n === (c.occurrence ?? 1)) hit = { start: tb.words[i].start, end: tb.words[i + ks.length - 1].end };
    }
    if (!hit) cueErrors.push(`beat ${sb.id}: cue word "${c.word}" (occurrence ${c.occurrence ?? 1}, action "${c.action}") not found in timed words`);
    else out.push({ action: c.action, ...hit });
  }
  return out.sort((a, b) => a.start - b.start);
}
const cuesOf = new Map(script.beats.map((sb) => [sb.id, resolveCues(sb, tOf.get(sb.id))]));
if (cueErrors.length) die(cueErrors.join("\n"));

// ---------------------------------------------------------------- scenes
const mod = await import(pathToFileURL(join(ROOT, "src", "scenes.mjs")).href);
const scenes = mod.scenes ?? mod.default;
if (!Array.isArray(scenes) || !scenes.length) die("src/scenes.mjs must export default (or `scenes`): an array of { id, beats, render(ctx) }");
const flat = scenes.flatMap((s) => s.beats);
if (flat.join() !== sIds.join()) die(`scenes must cover every beat once, in order.\n  scenes: [${flat}]\n  script: [${sIds}]`);

const starts = scenes.map((s, i) => (i === 0 ? 0 : tOf.get(s.beats[0]).start));
const cssSet = new Set();
const tlParts = [];
const sceneHtml = [];
const anchorsByBeat = new Map();

scenes.forEach((sc, i) => {
  const t0 = r3(starts[i]), t1 = r3(starts[i + 1] ?? D), dur = r3(t1 - t0);
  const beats = sc.beats.map((id) => ({ id, script: sOf.get(id), start: tOf.get(id).start, end: tOf.get(id).end, words: tOf.get(id).words, cues: cuesOf.get(id) }));
  const find = (action) => beats.flatMap((b) => b.cues).find((c) => c.action === action);
  const ctx = {
    lang, script, timings, kit, t0, t1, dur, beats,
    id: (s) => `${sc.id}-${s}`,
    world: `#sc-${sc.id}-world`,
    beat: (id) => beats.find((b) => b.id === id) ?? die(`scene ${sc.id}: no beat ${id}`),
    /** absolute seconds of the cue's word; throws if the script has no such cue */
    cue: (action) => find(action)?.start ?? die(`scene ${sc.id}: script has no cue with action "${action}"`),
    /** same, but null when absent (optional cue) */
    cueOpt: (action) => find(action)?.start ?? null,
    /** absolute seconds of the Nth occurrence of a word in a beat (for scene-internal timing) */
    word: (beatId, text, occ = 1) => {
      const b = ctx.beat(beatId);
      const ks = text.split(/\s+/).map(kit.norm);
      const toks = b.words.map((w) => kit.norm(w.text));
      let n = 0;
      for (let k = 0; k + ks.length <= toks.length; k++) if (ks.every((x, j) => toks[k + j] === x) && ++n === occ) return b.words[k].start;
      return die(`scene ${sc.id}: word "${text}" #${occ} not found in beat ${beatId}`);
    },
  };
  const r = sc.render(ctx);
  if (r.css) cssSet.add(r.css);
  if (r.tl) tlParts.push(`// scene ${sc.id}\n${r.tl}`);
  for (const b of sc.beats) anchorsByBeat.set(b, r.anchors ?? {});
  sceneHtml.push(
    `<div id="sc-${sc.id}" class="clip kit-abs" data-start="${t0}" data-duration="${dur}" data-track-index="1" style="left:0;top:0;width:${W}px;height:${H}px;z-index:1">` +
      `<div id="sc-${sc.id}-world" class="kit-world" data-layout-allow-overflow style="${kit.lightingStyle(sc.light ?? "day")}">${r.html}</div></div>`,
  );
});

// ---------------------------------------------------------------- overlays (from script data)
const ovHtml = [];
const addOv = (c) => { ovHtml.push(c.html); if (c.css) cssSet.add(c.css); if (c.tl) tlParts.push(c.tl); if (c.overflow) warn(`text overflow in ${c.html.match(/id="([^"]+)"/)?.[1]} — shorten the script string`); };
const meters = new Map();

if (!COVER) {
  script.beats.forEach((sb, bi) => {
    const tb = tOf.get(sb.id);
    const bs = tb.start;
    const next = timings.beats[bi + 1]?.start ?? D;
    // overlays stay readable until just before the next beat (last beat: to the end)
    const hide = r3(Math.min(Math.max(tb.end + 0.3, bs + 1.0, next - 0.1), D));
    const os = sb.onScreen ?? {};
    const cues = cuesOf.get(sb.id);
    const anchors = anchorsByBeat.get(sb.id) ?? {};
    const pid = `ov-${sb.id}`;

    // plates: threat at beat start; step at the first non-ghost cue when both are present
    if (os.threatPlate && os.stepPlate) {
      const c = cues.find((x) => !/^ghost/.test(x.action));
      const stepAt = r3(Math.max(c ? c.start : (bs + hide) / 2, bs + 0.8));
      addOv(kit.ThreatBadge({ id: `${pid}-threat`, text: os.threatPlate, at: bs, dur: r3(stepAt - bs) }));
      addOv(kit.StepBadge({ id: `${pid}-step`, text: os.stepPlate, at: stepAt, dur: r3(hide - stepAt) }));
    } else {
      if (os.threatPlate) addOv(kit.ThreatBadge({ id: `${pid}-threat`, text: os.threatPlate, at: bs, dur: r3(hide - bs) }));
      if (os.stepPlate) addOv(kit.StepBadge({ id: `${pid}-step`, text: os.stepPlate, at: bs, dur: r3(hide - bs) }));
    }

    // callouts: at cue "callout-<id>" if the script has it, else staggered after the beat start
    (os.callouts ?? []).forEach((c, j) => {
      const cue = cues.find((x) => x.action === `callout-${c.id}`);
      const at = r3(Math.min(cue ? cue.start : bs + 0.35 + 0.4 * j, hide - 0.8));
      const a = anchors[c.id];
      if (!a) warn(`beat ${sb.id}: scene gave no anchor for callout "${c.id}" — placed at a default spot, no leader line`);
      const card = a?.card ?? { x: 48, y: 640 + j * 190 };
      addOv(kit.Callout({ id: `${pid}-co-${c.id}`, title: c.title, subtitle: c.subtitle, card, target: a?.target ?? null, at, dur: r3(hide - at) }));
    });

    // in-scene labels
    (os.labels ?? []).forEach((l, j) => {
      const a = anchors[l.id];
      if (!a) warn(`beat ${sb.id}: scene gave no anchor for label "${l.id}" — placed at screen center`);
      const at = r3(bs + 0.3 + 0.2 * j);
      addOv(kit.Label({ id: `${pid}-lb-${l.id}`, text: l.text, x: a?.x ?? W / 2, y: a?.y ?? H / 2, at, dur: r3(hide - at) }));
    });

    if (os.gauge) addOv(kit.Gauge({ id: `${pid}-gauge`, text: os.gauge, x: 48, y: 330, at: r3(bs + 0.15), dur: r3(hide - bs - 0.15), tone: /°?\s*[−-]|cold|cool|ice/i.test(os.gauge) ? "cold" : "heat" }));

    if (os.meter) {
      const m = meters.get(os.meter.label) ?? meters.set(os.meter.label, { label: os.meter.label, at: r3(bs + 0.15), frames: [] }).get(os.meter.label);
      m.frames.push({ t: r3(m.frames.length ? bs + 0.3 : m.at), value: os.meter.value });
    }
  });
  let mi = 0;
  for (const m of meters.values()) {
    addOv(kit.StakesMeter({ id: `ov-meter${mi}`, label: m.label, x: 48, y: 470 + mi * 100, keyframes: m.frames, at: m.at, dur: r3(D - m.at) }));
    mi++;
  }
}

// ---------------------------------------------------------------- captions / cover
let capHtml = "";
if (!COVER) {
  const cap = kit.KaraokeCaption({
    id: "cap", lang, endAt: D,
    beats: script.beats.map((sb) => ({ words: tOf.get(sb.id).words, keywords: sb.keywords })),
  });
  capHtml = cap.html;
  cssSet.add(cap.css);
  tlParts.push(cap.tl);
  if (cap.overflow) warn("a caption group does not fit at the minimum font size");
}
let coverAt = null;
if (COVER) {
  coverAt = r3(opt.at != null ? Number(opt.at) : Math.min(D - 0.1, tOf.get(sIds[sIds.length - 1]).start + 0.5));
  addOv(kit.Cover({ headline: script.cover.headline, lang, start: 0, dur: D }));
}

// ---------------------------------------------------------------- audio
const audioHtml = [];
mkdirSync(join(OUT, "assets"), { recursive: true });
if (!opt["no-voice"] && !COVER) {
  const src = join(ROOT, timings.audio ?? `audio/voice.${lang}.mp3`);
  if (!existsSync(src)) die(`voice file missing: ${src} (use --no-voice for a silent build)`);
  copyFileSync(src, join(OUT, "assets/voice.mp3"));
  audioHtml.push(`<audio id="voice" class="clip" src="assets/voice.mp3" data-start="0" data-duration="${r3(Math.min(D, timings.durationSec))}" data-track-index="0" data-volume="1"></audio>`);
  const music = join(ROOT, "audio", `music.loop.${lang}.mp3`);
  if (existsSync(music)) {
    let vol = 0.12;
    for (let d = ROOT, n = 0; n < 5; d = dirname(d), n++) if (existsSync(join(d, "config.json"))) { vol = JSON.parse(readFileSync(join(d, "config.json"), "utf8")).music?.volume ?? vol; break; }
    copyFileSync(music, join(OUT, "assets/music.mp3"));
    audioHtml.push(`<audio id="music" class="clip" src="assets/music.mp3" data-start="0" data-duration="${D}" data-track-index="-1" data-volume="${vol}"></audio>`);
  }
}

// ---------------------------------------------------------------- assemble
const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--canvas-bg)}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:var(--font-ui)}
.kit-abs{position:absolute;z-index:5}
.kit-world{position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;background:var(--sky)}
.kit-stage{position:absolute;left:0;top:0}
`;
const tokens = kit.TOKENS_CSS; // generated by tools/apply-look.mjs (KIT_TOKENS overrides the file)
const body = [...sceneHtml, ...ovHtml, capHtml, ...audioHtml].join("\n");
const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<script src="${GSAP_SRC}"></script>
<style>
${tokens}
${BASE_CSS}
${[...cssSet].join("\n")}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${D}" data-width="${W}" data-height="${H}">
${body}
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
${tlParts.join("\n")}
tl.set({}, {}, ${D});
window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) die(`duplicate element ids in composition: ${[...new Set(dup)].join(", ")}`);

writeFileSync(join(OUT, "index.html"), html);
for (const f of ["hyperframes.json", "meta.json"]) if (existsSync(join(HERE, f))) copyFileSync(join(HERE, f), join(OUT, f));
console.log(`OK ${OUT}/index.html — ${scenes.length} scenes, ${script.beats.length} beats, ${D} s${COVER ? `, cover frame at ${coverAt} s` : ""}${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);

// ---------------------------------------------------------------- cover snapshot
if (COVER) {
  writeFileSync(join(OUT, "cover.json"), JSON.stringify({ at: coverAt }) + "\n");
  const tmp = join(ROOT, "out", ".cover-tmp");
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const r = spawnSync("npx", ["--yes", HF, "snapshot", OUT, "--at", String(coverAt), "--no-end", "-o", tmp], { stdio: "inherit" });
  if (r.status !== 0) die("hyperframes snapshot failed");
  const png = readdirSync(tmp).find((n) => n.endsWith(".png"));
  if (!png) die("snapshot produced no PNG");
  copyFileSync(join(tmp, png), join(ROOT, "out", `cover.${lang}.png`));
  rmSync(tmp, { recursive: true, force: true });
  console.log(`OK out/cover.${lang}.png`);
}
