// Composite bow — scenes s1..s6 + the LayerInset extra. All text comes from script.<lang>.json (overlays are built by build.mjs),
// all beat-level times from timings.<lang>.json via ctx.cue / wOpt. Only durations and offsets are literal numbers.
import * as kit from "../kit/index.mjs";
import { limbBand, limbPt, limbLine, bowSvg, bowMorph, bowGeom, bowEdge, selfBow, selfBowPoints, selfBowHalves, quad, FACES } from "./bow.mjs";
import { gluePot, hideIcon, fishIcon, springIcon, bandIcon, mist, bowCase, hand, arrow, burrow } from "./props.mjs";

const { stage, sky, sun, stars, mountains, terrain, grassTufts, snowCap, rocks, fire, smoke, puppet, horse, marmot, ForceArrows, LayerInset, poly, shade, tint, tf, prng, PRESETS } = kit;

// ------------------------------------------------------------------ helpers
const r3 = (n) => Math.round(n * 1000) / 1000;
const J = JSON.stringify;
/** fromTo with immediateRender:false (the element's markup is the "before" state) */
const T = (sel, from, to, at) => `tl.fromTo(${J(sel)}, ${J(from)}, ${J({ ...to, immediateRender: false })}, ${r3(at)});`;
/** attr transform tween between two tf() strings */
const A = (sel, from, to, at, dur, ease = "power2.out") => T(sel.startsWith("#") ? sel : "#" + sel, { attr: { transform: from } }, { attr: { transform: to }, duration: dur, ease }, at);
const fadeTo = (sel, a, b, at, dur = 0.3, ease = "none") => T(sel, { opacity: a }, { opacity: b, duration: dur, ease }, at);
const popIn = (sel, at, dur = 0.3) => T(sel, { opacity: 0 }, { opacity: 1, duration: dur, ease: "power2.out" }, at);
/** clamp a planned duration so it ends 0.1 s before the next event; tiny result = snap */
const D = (planned, start, next) => { const d = Math.min(planned, next - start - 0.1); return d < 0.25 ? 0.01 : r3(d); };
const lv = (name) => Object.fromEntries(Object.entries(PRESETS[name]).map(([k, v]) => [`--${k}`, v]));
const lt = (world, a, b, at, dur, ease = "power1.inOut") => `tl.fromTo(${J(world)}, ${J(lv(a))}, ${J({ ...lv(b), duration: dur, ease, immediateRender: false })}, ${r3(at)});`;
/** nth occurrence of a word in a beat; a fallback (seconds) when another language does not contain it */
function wOpt(ctx, beatId, text, n, fallback) {
  const b = ctx.beat(beatId), ks = text.split(/\s+/).map(kit.norm), toks = b.words.map((w) => kit.norm(w.text));
  let c = 0;
  for (let k = 0; k + ks.length <= toks.length; k++) if (ks.every((x, j) => toks[k + j] === x) && ++c === n) return b.words[k].start;
  return fallback;
}
/** clip-path rect used to reveal a drawn path left to right (animate the rect's `width` attribute) */
const revealClip = (id, x, y, h) => `<clipPath id="${id}"><rect id="${id}-r" x="${x}" y="${y}" width="0" height="${h}"/></clipPath>`;
const G = (id, props, inner, style = "") => `<g id="${id}" transform="${tf(props)}"${style ? ` style="${style}"` : ""}>${inner}</g>`;
const ghostHold = (gap) => r3(Math.max(0.8, Math.min(1.3, gap - 0.45)));

// shared backdrops
const hillsGround = (Y, { hseed = 4, tseed = 7, layers = [170, 400], hh = 170, x = 0, w = 1080, h = 820 } = {}) =>
  mountains({ y: Y, height: hh, count: 6, snow: false, token: "green-mid", seed: hseed }) + terrain({ x, y: Y, w, h, layers, top: "grass", seed: tseed });
const GRASS = (Y, x = 0, w = 1080, seed = 8) => grassTufts({ x, y: Y, w, count: 14, seed });
const bowBackdrop = (I) => sky({ horizonY: 1300 }) + mountains({ y: 1300, height: 160, count: 6, snow: false, token: "green-mid" }) +
  terrain({ y: 1300, h: 620, layers: [120, 300], top: "grass" }) + grassTufts({ x: 0, y: 1300, w: 1080, count: 14 });
const BG = { x: 660, y: 930 }; // whole bow grip in s3 / s5

// ------------------------------------------------------------------ s1 steppe (b01, b02)
const s1 = {
  id: "s1", beats: ["b01", "b02"], light: "day",
  render(ctx) {
    const I = ctx.id, b1 = ctx.beat("b01"), b2 = ctx.beat("b02");
    const cLong = ctx.cue("longbow-slide-in"), cClash = ctx.cue("rider-longbow-clash"), cSnap = ctx.cue("ghost-wood-snap");
    const wCut = wOpt(ctx, "b02", "cut", 1, cSnap - 0.8), wSnaps = wOpt(ctx, "b02", "snaps", 1, cSnap + 1.0);
    const L = [];
    const GRIP = { x: 121, y: 716 }; // rider's left hand, in rider-group coordinates (horse at x 0)

    // --- b01 diorama
    const arch = puppet({ id: I("arch"), x: 330, y: 1100, s: 1.5, jacket: "earth-1" });
    const cb = bowSvg({ id: I("cb"), G: { x: 470, y: 981 }, scale: 0.41, state: "braced" });
    const lbw = G(I("lbw"), {}, selfBow({ id: I("lb"), x: 640, y: 911, h: 378, bend: 0.3, withRed: false }));
    const marker = `<line id="${I("marker")}" x1="300" y1="771" x2="700" y2="771" style="stroke:var(--snow);stroke-width:3;stroke-dasharray:12 8;opacity:0"/>`;
    L.push(A(I("lbw"), tf(), tf({ px: 640, py: 1100, sx: 1.04, sy: 1.04 }), cLong - 0.1, 0.2), A(I("lbw"), tf({ px: 640, py: 1100, sx: 1.04, sy: 1.04 }), tf(), cLong + 0.1, 0.3));
    L.push(fadeTo(`#${I("marker")}`, 0, 0.7, cLong + 0.2, 0.3));
    L.push(fadeTo(`#${I("b01g")}`, 1, 0, b2.start, 0.4));

    // --- marmot + burrow
    const mm = marmot({ id: I("mm"), x: 930, y: 1190, s: 1.5 });
    mm.moveTo(860, 1100, b1.start + 0.6, 0.7);
    mm.sitUp(b1.start + 1.3);
    const wRe = wSnaps - 0.1;
    mm.moveTo(860, 985, wRe, 0.2, "power2.out");
    mm.moveTo(860, 1100, wRe + 0.2, 0.25, "power2.in");
    mm.dive(930, 1190, ctx.t1 - 0.3, 0.25);
    const bang = `<g id="${I("bang")}" style="opacity:0">${poly([[846, 745], [876, 745], [870, 820], [852, 820]], "var(--ui-yellow)")}<circle cx="861" cy="846" r="12" style="fill:var(--ui-yellow)"/></g>`;
    L.push(T(`#${I("bang")}`, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, wRe), fadeTo(`#${I("bang")}`, 1, 0, ctx.t1 - 0.25, 0.2));

    // --- b02 rider group
    const hz = horse({ id: I("hz"), x: 0, y: 1100, s: 1 });
    const rp = puppet({ id: I("rp"), x: 10, y: 933, s: 1.5, jacket: "earth-1", shadow: false });
    rp.pose("rideHold", ctx.t0, 0.01);
    hz.act("gallop", b2.start, cClash - b2.start, 0.5, { bob: false });
    hz.pose("toss", cClash, 0.15);
    hz.pose("stand", cClash + 0.15, 0.15);
    const longInHand = G(I("rlbw"), { px: GRIP.x, py: GRIP.y }, selfBow({ id: I("rlb"), x: GRIP.x, y: GRIP.y, h: 378, bend: 0.3 }));
    const sbw = `<g id="${I("sbw")}" style="opacity:0">${selfBow({ id: I("sb"), x: GRIP.x, y: GRIP.y, h: 234, bend: 0.3 })}</g>`;
    const hand0 = { x: -100, y: 696 };
    const P0 = selfBowPoints(234, 0.3), P1 = selfBowPoints(234, 0.85, { x: hand0.x - GRIP.x, y: hand0.y - GRIP.y });
    const H1 = selfBowHalves(234, 0.85);
    const halfG = (name, pts) => G(I(name), { x: GRIP.x, y: GRIP.y }, poly([[0, 0]], "none").replace(/<polygon[^>]*\/>/, "") +
      `<polygon points="${pts}" style="fill:var(--wood);stroke:${shade("wood", 28)};stroke-width:2"/><polygon points="${pts}" style="fill:var(--ui-red);opacity:.5"/>`, "opacity:0");
    const halves = `<g id="${I("halves")}">${halfG("hu", H1.up)}${halfG("hl", H1.lo)}</g>`;
    const rng = prng(31);
    let splinters = "";
    for (let i = 0; i < 7; i++) {
      const a = rng() * Math.PI * 2, d = 60 + rng() * 60, w = 3 + rng() * 2, len = 16 + rng() * 14;
      splinters += `<g id="${I("spl" + i)}" style="opacity:0">${poly([[GRIP.x, GRIP.y - w], [GRIP.x + len * Math.cos(a), GRIP.y + len * Math.sin(a)], [GRIP.x + w, GRIP.y + w]], shade("wood", 20))}</g>`;
      L.push(T(`#${I("spl" + i)}`, { opacity: 1, x: 0, y: 0 }, { opacity: 0, x: Math.cos(a + 0.4) * d, y: Math.sin(a + 0.4) * d, duration: 0.6, ease: "power2.out" }, wSnaps));
    }
    let star = "";
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; star += `<line x1="${192 + 10 * Math.cos(a)}" y1="${885 + 10 * Math.sin(a)}" x2="${192 + 30 * Math.cos(a)}" y2="${885 + 30 * Math.sin(a)}" style="stroke:${shade("earth-3", 0)};stroke-width:5;stroke-linecap:round"/>`; }
    const starG = `<g id="${I("star")}" style="opacity:0">${star}</g>`;
    const rider = G(I("rider"), { x: -420 }, hz.svg + rp.svg + longInHand + sbw + halves + splinters + starG);
    L.push(A(I("rider"), tf({ x: -420 }), tf({ x: 400 }), b2.start, cClash - b2.start, "power1.out"));

    // failure ghost 1: the longbow hits the horse
    const hold1 = ghostHold(wCut - cClash);
    L.push(fadeTo(`#${I("rlb")}-red`, 0, 0.5, cClash, 0.15));
    L.push(A(I("rlbw"), tf({ px: GRIP.x, py: GRIP.y }), tf({ r: -22, px: GRIP.x, py: GRIP.y }), cClash, 0.25));
    L.push(T(`#${I("star")}`, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "none" }, cClash + 0.1));
    L.push(fadeTo(`#${I("star")}`, 1, 0, cClash + 0.3, 0.2));
    L.push(A(I("rlbw"), tf({ r: -22, px: GRIP.x, py: GRIP.y }), tf({ px: GRIP.x, py: GRIP.y }), cClash + hold1, 0.35, "power2.inOut"));
    L.push(fadeTo(`#${I("rlb")}-red`, 0.5, 0, cClash + hold1, 0.35));
    // the longbow is cut short
    const dCut = D(0.45, wCut, cSnap);
    L.push(A(I("rlbw"), tf({ px: GRIP.x, py: GRIP.y }), tf({ sy: 0.62, px: GRIP.x, py: GRIP.y }), wCut, dCut, "power2.inOut"));
    L.push(`tl.set(${J("#" + I("rlbw"))}, {opacity:0}, ${r3(wCut + dCut)});`, `tl.set(${J("#" + I("sbw"))}, {opacity:1}, ${r3(wCut + dCut)});`);
    // failure ghost 2: drawn too far, the wooden bow snaps
    const dDraw = D(0.9, cSnap, wSnaps);
    rp.pose("rideDraw", cSnap, dDraw);
    L.push(T(`#${I("sb")}-limb`, { attr: { points: P0.limb } }, { attr: { points: P1.limb }, duration: dDraw, ease: "power2.inOut" }, cSnap));
    L.push(T(`#${I("sb")}-red`, { opacity: 0, attr: { points: P0.limb } }, { opacity: 0.5, attr: { points: P1.limb }, duration: dDraw, ease: "power2.inOut" }, cSnap));
    L.push(T(`#${I("sb")}-str`, { attr: { points: P0.string } }, { attr: { points: P1.string }, duration: dDraw, ease: "power2.inOut" }, cSnap));
    L.push(`tl.set(${J("#" + I("sbw"))}, {opacity:0}, ${r3(wSnaps)});`, `tl.set(${J("#" + I("hu"))}, {opacity:1}, ${r3(wSnaps)});`, `tl.set(${J("#" + I("hl"))}, {opacity:1}, ${r3(wSnaps)});`);
    L.push(A(I("hu"), tf({ x: GRIP.x, y: GRIP.y }), tf({ x: GRIP.x - 10, y: GRIP.y - 30, r: -30 }), wSnaps, 0.25));
    L.push(A(I("hl"), tf({ x: GRIP.x, y: GRIP.y }), tf({ x: GRIP.x - 10, y: GRIP.y + 30, r: 30 }), wSnaps, 0.25));
    rp.pose("rideHold", wSnaps + 0.4, 0.4);
    L.push(fadeTo(`#${I("halves")}`, 1, 0, ctx.t1 - 0.4, 0.3));

    const backdrop = sky({ horizonY: 1100 }) + sun({ cx: 800, cy: 380, r: 70 }) + hillsGround(1100) + grassTufts({ x: 0, y: 1100, w: 1080, count: 14, seed: 8 }) + burrow({ id: I("burrow") });
    const html = stage(backdrop + `<g id="${I("b01g")}">${arch.svg}${cb}${lbw}${marker}</g>` + mm.svg + bang + rider);
    return {
      html, tl: [arch.tl(), mm.tl(), hz.tl(), rp.tl(), ...L].join("\n"),
      anchors: { "short-bow": { x: 410, y: 745 }, longbow: { x: 680, y: 690, at: cLong } },
    };
  },
};

// ------------------------------------------------------------------ s2 limb (b03..b07)
const s2 = {
  id: "s2", beats: ["b03", "b04", "b05", "b06", "b07"], light: "day",
  render(ctx) {
    const I = ctx.id, B = ctx.beat, L = [];
    const lbId = I("lb"), q = (n) => `#${lbId}-${n}`;
    const lb = limbBand({ id: lbId });
    const cIn = ctx.cue("force-arrows-in"), cOut = ctx.cue("force-arrows-out"), cCore = ctx.cue("core-appear");
    const cHorn = ctx.cue("horn-layer"), cSpr = ctx.cue("horn-spring-demo"), cSin = ctx.cue("sinew-layer"), cStr = ctx.cue("sinew-band-demo");
    const cSlip = ctx.cue("ghost-layers-slip"), cGlue = ctx.cue("glue-pot-bond"), cSea = ctx.cue("seasons-pass");
    const cMist = ctx.cue("mist-roll-in"), cPeel = ctx.cue("ghost-peel"), cWrap = ctx.cue("wrap-cover"), cCase = ctx.cue("bow-case");
    const wInside = wOpt(ctx, "b04", "inside", 1, B("b04").start + 0.3), wPush = wOpt(ctx, "b04", "pushes", 1, cSpr + 1.2), wSpring = wOpt(ctx, "b04", "spring", 1, B("b04").end - 0.7);
    const wOutside = wOpt(ctx, "b05", "outside", 1, B("b05").start + 0.3), wSnap5 = wOpt(ctx, "b05", "snaps", 1, cStr + 1.2), wRubber = wOpt(ctx, "b05", "rubber", 1, B("b05").end - 0.8);
    const wHide = wOpt(ctx, "b06", "hide", 1, cGlue + 1.3), wFish = wOpt(ctx, "b06", "fish", 1, cGlue + 1.8), wBlad = wOpt(ctx, "b06", "bladders", 1, cGlue + 2.0), wThen = wOpt(ctx, "b06", "then", 1, cSea - 0.6);
    const wGlue7 = wOpt(ctx, "b07", "glue", 1, cPeel - 1.9);
    const wWood = wOpt(ctx, "b03", "wood", 2, cCore - 1.2);
    const holdSlip = ghostHold(cGlue - cSlip), holdPeel = ghostHold(cWrap - cPeel);

    // ---- push-in
    const camStart = tf({ x: 253.5, y: 289, sx: 0.55, sy: 0.55 }), CK = 1.15, camEnd = tf({ px: 700, py: 935, sx: CK, sy: CK });
    const sc = (pt) => ({ x: Math.round(700 + (pt.x - 700) * CK), y: Math.round(935 + (pt.y - 935) * CK) });
    L.push(A(I("cam"), camStart, camEnd, ctx.t0, 0.55, "power2.inOut"));
    L.push(fadeTo(q("lower"), 1, 0, ctx.t0, 0.55), fadeTo(q("string"), 1, 0, ctx.t0, 0.55));
    // ---- b03
    const fin = ForceArrows({ id: I("fa-in"), tone: "blue", mode: "squeeze", path: limbLine(-40, 0.25, 0.75, 6), count: 3, len: 64, width: 16, gap: 30, at: cIn, dur: r3(cCore - cIn) });
    const fout = ForceArrows({ id: I("fa-out"), tone: "heat", mode: "stretch", path: limbLine(40, 0.25, 0.75, 6), count: 3, len: 64, width: 16, gap: 30, at: cOut, dur: r3(cCore - cOut) });
    L.push(fin.tl, fout.tl);
    L.push(fadeTo(q("slab-h"), 1, 0, cCore, 0.4), fadeTo(q("slab-s"), 1, 0, cCore, 0.4));
    L.push(fadeTo(q("slotH"), 0, 0.5, cCore, 0.4), fadeTo(q("slotS"), 0, 0.5, cCore, 0.4));
    // ---- b04 horn
    const dFlash = D(0.5, wInside, cHorn);
    L.push(fadeTo(q("slotH"), 0.5, 1, wInside, dFlash / 2), fadeTo(q("slotH"), 1, 0.5, wInside + dFlash / 2, dFlash / 2));
    L.push(T(q("horn"), { opacity: 0, x: -260, y: 0 }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power2.out" }, cHorn));
    L.push(fadeTo(q("slotH"), 0.5, 0, cHorn, 0.3));
    const blk = (id, a, b, pivot) => `<g id="${id}" transform="${tf({ px: 250, py: 860 })}" style="opacity:0">${poly([[190, 825], [250, 825], [250, 895], [190, 895]], a)}${poly([[250, 825], [310, 825], [310, 895], [250, 895]], b)}</g>`;
    const blkHorn = blk(I("blk"), FACES.HORN[0], FACES.HORN[1]);
    const sq = ForceArrows({ id: I("fa-sq"), tone: "blue", mode: "squeeze", path: [[190, 860], [310, 860]], count: 1, len: 70, width: 16, gap: 120, at: cSpr, dur: r3(wPush - cSpr), period: 1.0 });
    L.push(popIn(`#${I("blk")}`, cSpr, 0.3), sq.tl);
    L.push(A(I("blk"), tf({ px: 250, py: 860 }), tf({ px: 250, py: 860, sx: 0.75 }), cSpr + 0.3, 0.35, "power2.out"));
    L.push(A(I("blk"), tf({ px: 250, py: 860, sx: 0.75 }), tf({ px: 250, py: 860 }), wPush, 0.4, "back.out(2.2)"));
    const spring = springIcon({ id: I("spring"), x: 400, y: 860 });
    L.push(popIn(`#${I("spring")}`, wSpring, 0.3));
    const exit4 = Math.min(B("b04").end + 0.1, B("b05").start - 0.3);
    L.push(fadeTo(`#${I("blk")}`, 1, 0, exit4, 0.25), fadeTo(`#${I("spring")}`, 1, 0, exit4, 0.25));
    // ---- b05 sinew
    L.push(fadeTo(q("slotS"), 0.5, 1, wOutside, 0.25), fadeTo(q("slotS"), 1, 0.5, wOutside + 0.25, 0.25));
    for (let i = 0; i < 8; i++) L.push(T(q("strand" + i), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, cSin + i * 0.06));
    L.push(fadeTo(q("sinewband"), 0, 1, cSin + 0.5, 0.3));
    L.push(fadeTo(q("slotS"), 0.5, 0, cSin, 0.3));
    const bunW = [0, 1, 2, 3, 4].map((i) => { const y = 826 + i * 17, pts = []; for (let k = 0; k <= 10; k++) pts.push(`${180 + k * 14},${y + Math.sin(k * 1.3 + i) * 4}`); return `<polyline points="${pts.join(" ")}" style="fill:none;stroke:${shade("sand", 12)};stroke-width:9;stroke-linecap:round"/>`; }).join("");
    const bundle = `<g id="${I("bun")}" transform="${tf({ px: 250, py: 860 })}" style="opacity:0">${bunW}</g>`;
    const st = ForceArrows({ id: I("fa-st"), tone: "heat", mode: "stretch", path: [[180, 860], [320, 860]], count: 1, len: 70, width: 16, gap: 192, at: cStr, dur: r3(wSnap5 - cStr), period: 1.0 });
    L.push(popIn(`#${I("bun")}`, cStr, 0.3), st.tl);
    L.push(A(I("bun"), tf({ px: 250, py: 860 }), tf({ px: 250, py: 860, sx: 1.3 }), cStr + 0.3, 0.35, "power2.out"));
    L.push(A(I("bun"), tf({ px: 250, py: 860, sx: 1.3 }), tf({ px: 250, py: 860 }), wSnap5, 0.35, "back.out(2.2)"));
    const bandI = bandIcon({ id: I("band"), x: 400, y: 860 });
    L.push(popIn(`#${I("band")}`, wRubber, 0.3));
    const exit5 = Math.min(B("b05").end + 0.1, B("b06").start - 0.3);
    L.push(fadeTo(`#${I("bun")}`, 1, 0, exit5, 0.25), fadeTo(`#${I("band")}`, 1, 0, exit5, 0.25));
    // ---- b06 glue
    L.push(T(q("horn"), { x: 0, y: 0 }, { x: -8, y: -26, duration: 0.35, ease: "power2.out" }, cSlip));
    L.push(T(q("sinew"), { x: 0, y: 0 }, { x: 8, y: 26, duration: 0.35, ease: "power2.out" }, cSlip));
    L.push(fadeTo(q("hornred"), 0, 0.5, cSlip, 0.35), fadeTo(q("sinewred"), 0, 0.5, cSlip, 0.35));
    L.push(T(q("horn"), { x: -8, y: -26 }, { x: 0, y: 0, duration: 0.35, ease: "power2.inOut" }, cSlip + holdSlip));
    L.push(T(q("sinew"), { x: 8, y: 26 }, { x: 0, y: 0, duration: 0.35, ease: "power2.inOut" }, cSlip + holdSlip));
    L.push(fadeTo(q("hornred"), 0.5, 0, cSlip + holdSlip, 0.35), fadeTo(q("sinewred"), 0.5, 0, cSlip + holdSlip, 0.35));
    const fr = fire({ id: I("fire"), x: 250, y: 960, s: 1.1 }), sm = smoke({ id: I("smoke"), x: 250, y: 845, s: 0.8 });
    const potDur = r3(wThen - cGlue);
    const potG = `<g id="${I("potg")}" style="opacity:0">${fr.svg}${gluePot({ id: I("pot"), x: 250, y: 935 })}${sm.svg}</g>`;
    L.push(popIn(`#${I("potg")}`, cGlue, 0.3), fr.tl(cGlue, potDur), sm.tl(cGlue, potDur), fadeTo(`#${I("potg")}`, 1, 0, wThen, 0.3));
    const hideI = hideIcon({ id: I("hide"), x: 250, y: 680 }), fishI = fishIcon({ id: I("fish"), x: 250, y: 680 });
    for (const [n, t] of [["hide", wHide], ["fish", wFish]]) {
      L.push(fadeTo(`#${I(n)}`, 0, 1, t, 0.1));
      L.push(T(`#${I(n)}`, { y: 0 }, { y: 150, duration: 0.4, ease: "power2.in" }, t));
      L.push(fadeTo(`#${I(n)}`, 1, 0, t + 0.4, 0.1));
    }
    const tBond = wBlad + 0.3;
    L.push(T(q("horn"), { x: 0 }, { x: 4, duration: 0.25, ease: "power2.out" }, tBond), T(q("sinew"), { x: 0 }, { x: -4, duration: 0.25, ease: "power2.out" }, tBond));
    L.push(T(q("glue1"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "none" }, tBond), T(q("glue2"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "none" }, tBond));
    L.push(popIn(q("cord0"), wThen, 0.25), popIn(q("cord1"), wThen + 0.15, 0.25));
    // seasons: a year passes
    const two = B("b07").start - cSea >= 1.5;
    const cyc = two ? 2 : 1;
    for (let c = 0; c < cyc; c++) {
      const o = cSea + c * 0.7;
      L.push(lt(ctx.world, "day", "night", o, 0.35), lt(ctx.world, "night", "day", o + 0.35, 0.35));
      L.push(fadeTo(`#${I("stars")}`, 0, 1, o, 0.35), fadeTo(`#${I("stars")}`, 1, 0, o + 0.35, 0.35));
    }
    const snowIn = cSea + 0.35, snowOut = two ? cSea + 1.1 : cSea + 0.7;
    L.push(fadeTo(`#${I("snow")}`, 0, 1, snowIn, 0.3), fadeTo(`#${I("snow")}`, 1, 0, snowOut, 0.3));
    L.push(fadeTo(`#${I("grass")}`, 1, 0, snowIn, 0.3), fadeTo(`#${I("grass")}`, 0, 1, snowOut, 0.3));
    // ---- b07 damp air
    const ms = mist({ id: I("mist") });
    L.push(lt(ctx.world, "day", "tense", cMist, 1.2));
    for (let i = 0; i < 4; i++) {
      const t = cMist + i * 0.15;
      L.push(T(`#${I("mist")}-b${i}`, { attr: { transform: "translate(-1400 0)" } }, { attr: { transform: "translate(0 0)" }, duration: 1.6, ease: "power1.out" }, t));
      if (cWrap - (t + 1.6) > 0.3) L.push(T(`#${I("mist")}-b${i}`, { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(40 0)" }, duration: r3(cWrap - t - 1.6), ease: "none" }, t + 1.6));
    }
    L.push(fadeTo(`#${I("mistg")}`, 1, 0, cWrap, 0.8));
    L.push(fadeTo(q("glue1red"), 0, 0.5, wGlue7, 0.3), fadeTo(q("glue2red"), 0, 0.5, wGlue7, 0.3));
    const pv = limbPt(1, -37), pivT = (r) => tf({ r, px: pv.x, py: pv.y });
    L.push(A(lbId + "-horn-r", pivT(0), pivT(-12), cPeel, 0.4), fadeTo(q("hornred"), 0, 0.5, cPeel, 0.4));
    L.push(A(lbId + "-horn-r", pivT(-12), pivT(0), cPeel + holdPeel, 0.35, "power2.inOut"));
    for (const n of ["hornred", "glue1red", "glue2red"]) L.push(fadeTo(q(n), 0.5, 0, cPeel + holdPeel, 0.35));
    L.push(lt(ctx.world, "tense", "day", cWrap, 1.0));
    L.push(T(q("wrap"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.0, ease: "none" }, cWrap));
    for (let i = 0; i < 12; i++) L.push(fadeTo(q("tick" + i), 0, 1, cWrap + 1.0 + i * 0.05, 0.15));
    const cs = bowCase({ id: I("case"), x: 690, yTop: 980, h: 300, w: 180 });
    const caseG = `<g id="${I("caseg")}" transform="translate(0 1000)">${cs}</g>`;
    L.push(A(I("caseg"), "translate(0 1000)", "translate(0 0)", cCase, D(0.6, cCase, ctx.t1), "power2.out"));

    const backdrop = sky({ horizonY: 1300 }) + stars({ id: I("stars"), h: 700 }) +
      mountains({ y: 1300, height: 160, count: 6, snow: false, token: "green-mid" }) + terrain({ y: 1300, h: 620, layers: [120, 300], top: "grass" }) +
      `<g id="${I("grass")}">${grassTufts({ x: 0, y: 1300, w: 1080, count: 14 })}</g>` + `<g id="${I("snow")}" style="opacity:0">${snowCap({ x: 0, y: 1300, w: 1080, h: 30 })}</g>`;
    const cam = `<g id="${I("cam")}" transform="${camStart}">${lb.svg}${fin.svg}${fout.svg}</g>`;
    const demo = `<g id="${I("demo")}">${blkHorn}${sq.svg}${spring}${bundle}${st.svg}${bandI}${potG}${hideI}${fishI}</g>`;
    const html = stage(backdrop + cam + demo + `<g id="${I("mistg")}">${ms}</g>` + caseG);
    const slot = { x: 40, y: 1040 };
    return {
      html, tl: L.join("\n"),
      anchors: {
        core: { card: slot, target: sc(limbPt(0.72, 5)), at: wWood },
        horn: { card: slot, target: sc(limbPt(0.72, -37)), at: cHorn + 0.3 },
        sinew: { card: slot, target: sc(limbPt(0.72, 42)), at: cSin + 0.3 },
        glue: { card: slot, target: sc(limbPt(0.72, -17)), at: cGlue + 0.3 },
        "dry-time": { x: 290, y: 700, at: wThen },
        cover: { card: slot, target: sc(limbPt(0.6, 62)), at: cWrap + 0.3 },
      },
      overlays: {
        b03: { meter: [{ t: cCore }] }, b04: { meter: [{ t: cHorn }] }, b05: { meter: [{ t: cSin }] }, b06: { meter: [{ t: wBlad + 0.3 }] },
        b07: { stepAt: cWrap, meter: [{ t: cPeel + 0.2, value: 50 }, { t: cWrap }] },
      },
    };
  },
};

// ------------------------------------------------------------------ s3 bow (b08, b09)
const s3 = {
  id: "s3", beats: ["b08", "b09"], light: "day",
  render(ctx) {
    const I = ctx.id, B = ctx.beat, L = [];
    const cCurl = ctx.cue("unstrung-c-shape"), cStr = ctx.cue("string-bow"), cTens = ctx.cue("tension-arrows"), cTips = ctx.cue("tips-highlight"), cWhip = ctx.cue("siyah-whip-demo");
    const wStr = wOpt(ctx, "b08", "string", 1, cStr + 1.2), wNever = wOpt(ctx, "b09", "never", 1, cTips + 1.0), wThese = wOpt(ctx, "b09", "these", 1, cWhip - 2.4);
    const bow = I("bow"), opts = { G: BG, scale: 1 };
    const bowS = bowSvg({ id: bow, G: BG, scale: 1, state: "straight", hideString: true });
    const bowGrp = `<g id="${I("bowg")}" transform="${tf({ y: 260 })}">${bowS}</g>`;
    const caseG = `<g id="${I("caseg")}" transform="${tf()}">${bowCase({ id: I("case"), x: 660, yTop: 980, h: 520, w: 220 })}</g>`;
    L.push(A(I("bowg"), tf({ y: 260 }), tf(), ctx.t0, 0.6), A(I("caseg"), tf(), tf({ y: 1100 }), ctx.t0 + 0.35, 0.6));
    // C-shape, then stringing
    L.push(bowMorph(bow, "straight", "unstrungC", cCurl, D(0.7, cCurl, cStr)));
    const tipsC = bowGeom("unstrungC", opts), tipsB = bowGeom("braced", opts), tipsF = bowGeom("fullDraw", opts);
    const hsrc = (id, tip0, tipB) => ({ id, tip0, tipB });
    const hands = [hsrc(I("h1"), tipsC.tipU, tipsB.tipU), hsrc(I("h2"), tipsC.tipL, tipsB.tipL)];
    const handSvg = hands.map((h) => hand({ id: h.id, dir: "right" }).replace(`<g id="${h.id}"`, `<g id="${h.id}" transform="${tf({ x: 1150, y: h.tip0[1] })}"`)).join("");
    const dStr = D(1.0, cStr + 0.3, wStr + 0.1);
    for (const h of hands) {
      L.push(popIn(`#${h.id}`, cStr, 0.2));
      L.push(A(h.id, tf({ x: 1150, y: h.tip0[1] }), tf({ x: h.tip0[0], y: h.tip0[1] }), cStr, 0.3));
      L.push(A(h.id, tf({ x: h.tip0[0], y: h.tip0[1] }), tf({ x: h.tipB[0], y: h.tipB[1] }), cStr + 0.3, dStr, "power2.inOut"));
      L.push(A(h.id, tf({ x: h.tipB[0], y: h.tipB[1] }), tf({ x: 1150, y: h.tipB[1] }), wStr + 0.5, 0.35, "power2.in"));
      L.push(fadeTo(`#${h.id}`, 1, 0, wStr + 0.6, 0.25));
    }
    L.push(bowMorph(bow, "unstrungC", "braced", cStr + 0.3, dStr));
    L.push(T(`#${bow}-string`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.25, ease: "none" }, wStr));
    // tension
    const tEnd = B("b08").end + 0.3;
    const arrows = ["u", "l"].map((h) => ForceArrows({ id: I("fa-" + h), tone: "yellow", mode: "along", path: bowEdge("braced", opts, h, 22), count: 2, len: 56, width: 9, at: cTens, dur: r3(tEnd - cTens), period: 1.2 }));
    L.push(...arrows.map((a) => a.tl));
    L.push(T(`#${bow}-g-glow`, { opacity: 0 }, { opacity: 0.7, duration: 0.4, ease: "power1.out" }, cTens), fadeTo(`#${bow}-g-glow`, 0.7, 0.3, cTens + 0.4, 0.4), fadeTo(`#${bow}-g-glow`, 0.3, 0, tEnd, 0.3));
    // b09 siyahs
    L.push(fadeTo(`#${bow}-g-tip`, 0, 1, cTips, 0.25), fadeTo(`#${bow}-g-tip`, 1, 0.4, wNever, 0.25), fadeTo(`#${bow}-g-tip`, 0.4, 1, wNever + 0.25, 0.25));
    const dh = I("dh"), dhSvg = hand({ id: dh, dir: "left" }).replace(`<g id="${dh}"`, `<g id="${dh}" transform="${tf({ x: -120, y: 930 })}"`);
    const dDraw = D(1.0, wThese + 0.35, cWhip);
    L.push(popIn(`#${dh}`, wThese, 0.2), A(dh, tf({ x: -120, y: 930 }), tf({ x: 595, y: 930 }), wThese, 0.35));
    L.push(bowMorph(bow, "braced", "fullDraw", wThese + 0.35, dDraw), A(dh, tf({ x: 595, y: 930 }), tf({ x: 410, y: 930 }), wThese + 0.35, dDraw, "power2.inOut"));
    // release
    L.push(bowMorph(bow, "fullDraw", "braced", cWhip, 0.5, "power4.out"));
    const brG = (apexX) => tipsB.stringPts([apexX, 0]);
    L.push(T(`#${bow}-string`, { attr: { points: brG(-65) } }, { attr: { points: brG(-48) }, duration: 0.12, ease: "power1.out" }, cWhip + 0.5));
    L.push(T(`#${bow}-string`, { attr: { points: brG(-48) } }, { attr: { points: brG(-65) }, duration: 0.15, ease: "power1.inOut" }, cWhip + 0.62));
    L.push(A(dh, tf({ x: 410, y: 930 }), tf({ x: 410, y: 930, r: 15 }), cWhip, 0.4), fadeTo(`#${dh}`, 1, 0, cWhip, 0.4));
    const arc = (a, b, c) => `M${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
    const trailD = [arc(tipsF.tipU, tipsB.tipU, [tipsB.tipU[0] - 20, tipsF.tipU[1] + 10]), arc(tipsF.tipL, tipsB.tipL, [tipsB.tipL[0] - 20, tipsF.tipL[1] - 10])];
    const trail = `<clipPath id="${I("trclip")}"><rect id="${I("trclip")}-r" x="500" y="600" width="0" height="700"/></clipPath><g id="${I("trail")}" clip-path="url(#${I("trclip")})" style="opacity:0.7">` +
      trailD.map((d) => `<path d="${d}" style="fill:none;stroke:var(--snow);stroke-width:4;stroke-dasharray:10 8"/>`).join("") + `</g>`;
    L.push(T(`#${I("trclip")}-r`, { attr: { width: 0 } }, { attr: { width: 110 }, duration: 0.5, ease: "none" }, cWhip), fadeTo(`#${I("trail")}`, 0.7, 0, cWhip + 1.2, 0.3));

    const html = stage(bowBackdrop(I) + bowGrp + caseG + handSvg + dhSvg + trail + arrows.map((a) => a.svg).join(""));
    const slot = { x: 24, y: 1040 };
    return {
      html, tl: L.join("\n"),
      anchors: {
        reflex: { card: slot, target: { x: Math.round(tipsB.X(tipsB.centre[5].p)[0] + 8), y: Math.round(tipsB.X(tipsB.centre[5].p)[1]) }, at: cStr + 0.3 },
        siyah: { card: slot, width: 540, target: { x: 600, y: 1180 }, at: cTips + 0.3 },
      },
      overlays: { b08: { meter: [{ t: cStr + 1.3 }] }, b09: { meter: [{ t: cWhip }] } },
    };
  },
};

// ------------------------------------------------------------------ s4 gallop (b10)
const s4 = {
  id: "s4", beats: ["b10"], light: "day",
  render(ctx) {
    const I = ctx.id, L = [], GR = 1100;
    const cGal = ctx.cue("horse-gallop"), cDraw = ctx.cue("full-draw"), cFly = ctx.cue("arrow-flight");
    const wNo = wOpt(ctx, "b10", "no", 1, cFly - 2.5);
    const flyDur = r3(Math.min(1.0, ctx.t1 - cFly - 0.1));
    // parallax strips (finite repeated tweens)
    const strip = (id, sel, tiles, segs) => {
      for (const [a, b, per] of segs) {
        const n = Math.floor((b - a) / per + 1e-6);
        for (let i = 0; i < n; i++) L.push(T(sel, { attr: { transform: tf() } }, { attr: { transform: tf({ x: -1080 }) }, duration: per, ease: "none" }, a + i * per));
        const rem = b - a - n * per;
        if (rem > 0.05) L.push(T(sel, { attr: { transform: tf() } }, { attr: { transform: tf({ x: -1080 * rem / per }) }, duration: rem, ease: "none" }, a + n * per));
      }
    };
    strip("hills", `#${I("hills")}`, 4, [[ctx.t0, ctx.t1, 6]]);
    strip("gs", `#${I("gs")}`, 4, [[ctx.t0, cGal, 1.6], [cGal, ctx.t1, 0.8]]);
    const tiles = (fn) => [-1080, 0, 1080, 2160].map((x) => `<g transform="translate(${x} 0)">${fn(x)}</g>`).join("");
    const hills = `<g id="${I("hills")}" transform="${tf()}">${tiles(() => mountains({ y: GR, height: 170, count: 6, snow: false, token: "green-mid", seed: 4 }))}</g>`;
    const gs = `<g id="${I("gs")}" transform="${tf()}">${tiles(() => GRASS(GR))}</g>`;
    // rider
    const hz = horse({ id: I("hz"), x: 0, y: GR, s: 1 });
    const rp = puppet({ id: I("rp"), x: 10, y: 933, s: 1.5, jacket: "earth-1", shadow: false });
    rp.pose("rideHold", ctx.t0, 0.01);
    hz.act("gallop", ctx.t0, cGal - ctx.t0, 0.5, { bob: false });
    hz.act("gallop", cGal, ctx.t1 - cGal, 0.36, { bob: false });
    const bowG = { x: 130, y: 700 }, bowId = I("bow");
    const NHAND = [-460, 0]; // string middle (bow units) at the drawing hand
    const bow = bowSvg({ id: bowId, G: bowG, scale: 0.5, state: "braced" });
    const dDraw = D(0.9, cDraw, cFly);
    rp.pose("rideDraw", cDraw, dDraw);
    L.push(bowMorph(bowId, "braced", "fullDraw", cDraw, dDraw, "power2.inOut", { toN: NHAND }));
    const ARW = 250;
    const arwIn = `<g id="${I("arwg")}" style="opacity:0">${arrow({ id: I("arwi"), len: ARW, x: -100, y: 700 })}</g>`;
    L.push(fadeTo(`#${I("arwg")}`, 0, 1, cDraw + 0.4, 0.3), `tl.set(${J("#" + I("arwg"))}, {opacity:0}, ${r3(cFly)});`);
    // glow pulses on "no crack"
    for (let k = 0; k < 2; k++) L.push(fadeTo(`#${bowId}-g-glow`, 0, 0.8, wNo + k * 0.3, 0.15), fadeTo(`#${bowId}-g-glow`, 0.8, 0, wNo + k * 0.3 + 0.15, 0.15));
    // bob in sync with the gallop; steady while drawing
    const bobSeg = (a, b, per) => { for (let t = a; t + per <= b + 1e-6; t += per) { L.push(A(I("bob"), tf(), tf({ y: -12 }), t, per / 2, "sine.inOut"), A(I("bob"), tf({ y: -12 }), tf(), t + per / 2, per / 2, "sine.inOut")); } };
    bobSeg(ctx.t0, cGal, 0.5);
    bobSeg(cGal, cDraw, 0.36);
    L.push(bowMorph(bowId, "fullDraw", "braced", cFly, 0.3, "power4.out", { fromN: NHAND }));
    rp.pose("rideHold", cFly + 0.4, 0.4);
    // dust
    let dust = "";
    for (let i = 0; i < 3; i++) {
      const cx = 215 - i * 16, cy = GR - 12 + i * 4;
      dust += `<g id="${I("dust" + i)}" transform="${tf({ px: cx, py: cy })}" style="opacity:0"><ellipse cx="${cx}" cy="${cy}" rx="22" ry="14" style="fill:${tint("sand", 10)};opacity:.75"/></g>`;
      for (let t = cGal + i * 0.17; t + 0.5 <= ctx.t1 - 0.05; t += 0.5) {
        L.push(T(`#${I("dust" + i)}`, { opacity: 0.8, attr: { transform: tf({ px: cx, py: cy, sx: 0.6, sy: 0.6 }) } }, { opacity: 0, attr: { transform: tf({ x: -70, y: -10, px: cx, py: cy, sx: 1.4, sy: 1.4 }) }, duration: 0.5, ease: "power1.out" }, t));
      }
    }
    // arrow flight
    const P0 = [600, 700], C = [880, 610], P2 = [1250, 690];
    const ang = (t) => { const e = 0.001, a = quad(P0, C, P2, t), b = quad(P0, C, P2, Math.min(1, t + e)); return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; };
    const fly = G(I("fly"), { x: P0[0], y: P0[1], r: ang(0) }, arrow({ id: I("flyarrow"), len: ARW }), "opacity:0");
    L.push(`tl.set(${J("#" + I("fly"))}, {opacity:1}, ${r3(cFly)});`);
    const STEPS = 12;
    for (let i = 0; i < STEPS; i++) {
      const a = quad(P0, C, P2, i / STEPS), b = quad(P0, C, P2, (i + 1) / STEPS), t = cFly + (flyDur * i) / STEPS;
      L.push(A(I("fly"), tf({ x: a[0], y: a[1], r: ang(i / STEPS) }), tf({ x: b[0], y: b[1], r: ang((i + 1) / STEPS) }), t, r3(flyDur / STEPS), "none"));
      L.push(T(`#${I("flyclip")}-r`, { attr: { width: a[0] - 590 + 10 } }, { attr: { width: b[0] - 590 + 10 }, duration: r3(flyDur / STEPS), ease: "none" }, t));
    }
    const flyTrail = `${revealClip(I("flyclip"), 590, 0, 1920)}<g clip-path="url(#${I("flyclip")})"><path d="M${P0[0]} ${P0[1]} Q ${C[0]} ${C[1]} ${P2[0]} ${P2[1]}" style="fill:none;stroke:var(--snow);stroke-width:4;stroke-dasharray:14 10"/></g>`;
    const ghostArc = `${revealClip(I("gaclip"), 590, 0, 1920)}<g clip-path="url(#${I("gaclip")})" style="opacity:.6"><path d="M600 700 Q 700 650 820 1100" style="fill:none;stroke:${shade("stone", 10)};stroke-width:4;stroke-dasharray:12 9"/></g>`;
    L.push(T(`#${I("gaclip")}-r`, { attr: { width: 0 } }, { attr: { width: 240 }, duration: 0.7, ease: "none" }, cFly + 0.5));
    const stuck = G(I("stuck"), { x: 812, y: 1050, r: 80 }, arrow({ id: I("stuckarrow"), len: 60 }), "opacity:0");
    L.push(popIn(`#${I("stuck")}`, cFly + 1.2, 0.3), `tl.set(${J("#" + I("stuck"))}, {opacity:0.55}, ${r3(cFly + 1.5)});`);
    // camera pull-back
    const camS = (s) => tf({ px: 540, py: 1100, sx: s, sy: s });
    L.push(A(I("cam"), camS(1), camS(0.8), cFly + 0.6, D(1.2, cFly + 0.6, ctx.t1), "power2.inOut"));
    const riderG = `<g id="${I("rider")}" transform="${tf({ x: 440 })}"><g id="${I("bob")}" transform="${tf()}">${hz.svg}${rp.svg}${bow}${arwIn}</g></g>`;
    const world = hills + terrain({ x: -400, y: GR, w: 1880, h: 1500, layers: [170, 400], top: "grass", seed: 7 }) + gs + dust + ghostArc + riderG + flyTrail + fly + stuck;
    const html = stage(sky({ horizonY: GR }) + sun({ cx: 160, cy: 690, r: 50 }) + `<g id="${I("cam")}" transform="${camS(1)}">${world}</g>`);
    return { html, tl: [hz.tl(), rp.tl(), ...L].join("\n"), anchors: {}, overlays: { b10: { meter: [{ t: wNo }] } } };
  },
};

// ------------------------------------------------------------------ s5 recap (b11)
const s5 = {
  id: "s5", beats: ["b11"], light: "day",
  render(ctx) {
    const I = ctx.id, L = [], opts = { G: BG, scale: 1 };
    const bow = bowSvg({ id: I("bow"), G: BG, scale: 1, state: "braced" });
    const C = bowGeom("unstrungC", opts), Bw = bowGeom("braced", opts);
    const dim = `<g style="opacity:.35">` + ["u", "l"].map((h) => `<polygon points="${C.parts["glow-" + h]}" style="fill:none;stroke:${shade("stone", 10)};stroke-width:4;stroke-dasharray:10 8"/>`).join("") + `</g>`;
    const steps = ctx.script.beats.filter((b) => b.type === "step");
    const dots = [[760, 790], [540, 800], [760, 1070], [540, 1060], [745, 930], [880, 930], [540, 650]];
    const flashOf = [["core"], ["horn"], ["sinew"], ["glue1", "glue2"], ["wrap"], null, ["siyah"]];
    let dotSvg = "", flashSvg = "";
    steps.forEach((b, i) => {
      const [x, y] = dots[i], t = ctx.t0 + 0.1 + i * 0.2;
      dotSvg += `<g id="${I("dot" + i)}" transform="${tf({ px: x, py: y, sx: 0.9, sy: 0.9 })}" style="opacity:0"><circle cx="${x}" cy="${y}" r="26" style="fill:var(--ui-green);stroke:var(--ui-white);stroke-width:3"/>` +
        `<text x="${x}" y="${y + 11}" text-anchor="middle" style="font-family:var(--font-ui);font-weight:900;font-size:30px;fill:var(--ui-white)">${b.step}</text></g>`;
      L.push(T(`#${I("dot" + i)}`, { opacity: 0, attr: { transform: tf({ px: x, py: y, sx: 0.9, sy: 0.9 }) } }, { opacity: 1, attr: { transform: tf({ px: x, py: y }) }, duration: 0.18, ease: "power2.out" }, t));
      const polys = flashOf[i] ? flashOf[i].flatMap((p) => ["u", "l"].map((h) => Bw.parts[`${p}-${h}`])) : ["u", "l"].map((h) => C.parts["glow-" + h]);
      flashSvg += `<g id="${I("fl" + i)}" style="opacity:0">${polys.map((p) => `<polygon points="${p}" style="fill:none;stroke:var(--ui-yellow);stroke-width:4;stroke-linejoin:round"/>`).join("")}</g>`;
      L.push(fadeTo(`#${I("fl" + i)}`, 0, 1, t, 0.15), fadeTo(`#${I("fl" + i)}`, 1, 0, t + 0.15, 0.15));
    });
    return { html: stage(bowBackdrop(I) + dim + bow + flashSvg + dotSvg), tl: L.join("\n"), anchors: {} };
  },
};

// ------------------------------------------------------------------ s6 ending (b12)
const s6 = {
  id: "s6", beats: ["b12"], light: "sunset",
  render(ctx) {
    const I = ctx.id, L = [], GR = 1100;
    const hz = horse({ id: I("hz"), x: 320, y: GR, s: 0.85 });
    hz.pose("graze", ctx.t0, 0.01);
    hz.pose("grazeBob", ctx.t0 + 1.0, 0.3);
    hz.pose("graze", ctx.t0 + 1.3, 0.3);
    const mm = marmot({ id: I("mm"), x: 930, y: 1190 });
    mm.moveTo(860, GR, ctx.t0 + 0.3, 0.6);
    mm.sitUp(ctx.t0 + 0.9);
    const caseG = `<g transform="rotate(-12 800 1120)">${bowCase({ id: I("case"), x: 800, yTop: 900, h: 220 })}</g>`;
    const html = stage(sky({ horizonY: GR }) + sun({ cx: 300, cy: 1010, r: 80 }) + hillsGround(GR) + grassTufts({ x: 0, y: GR, w: 1080, count: 14, seed: 8 }) +
      burrow({ id: I("burrow") }) + hz.svg + caseG + rocks({ x: 700, y: GR, s: 0.9 }) + mm.svg);
    return { html, tl: [hz.tl(), mm.tl(), ...L].join("\n"), anchors: { title: { x: 540, y: 760, maxWidth: 760, max: 42 } } };
  },
};

export default [s1, s2, s3, s4, s5, s6];

// ------------------------------------------------------------------ extra: the limb cross-section inset (b03 → b11)
export const extras = [{
  id: "inset", from: "b03", to: "b11",
  render(ctx) {
    const cue = ctx.cue;
    const at = cue("core-appear");
    const ins = LayerInset({ id: ctx.id("ins"), at, dur: r3(ctx.t1 - at) });
    const cSlip = cue("ghost-layers-slip"), cGlue = cue("glue-pot-bond"), cPeel = cue("ghost-peel"), cWrap = cue("wrap-cover");
    const wBlad = wOpt(ctx, "b06", "bladders", 1, cGlue + 2.0);
    ins.add("core", at);
    ins.add("horn", cue("horn-layer"));
    ins.add("sinew", cue("sinew-layer"));
    ins.ghost("slip", cSlip, ghostHold(cGlue - cSlip));
    ins.add("glue", wBlad + 0.3);
    ins.ghost("peel", cPeel, ghostHold(cWrap - cPeel));
    ins.add("cover", cWrap);
    ["core", "horn", "sinew", "glue", "cover"].forEach((l, i) => ins.pulse(l, ctx.beat("b11").start + 0.2 + i * 0.3));
    return { html: ins.html, tl: ins.tl(), css: ins.css };
  },
}];
