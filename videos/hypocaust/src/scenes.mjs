// Hypocaust: ONE scene (bath) that gains parts beat by beat + extra recap pills. Text comes from script.<lang>.json (overlays built by
// build.mjs); every beat-level time comes from timings via ctx.cue / ctx.word. Only durations and offsets are literal numbers.
import * as kit from "../kit/index.mjs";
import { CAM, camTf, toScreen, GY, PILA_X, r3, hillsSvg, groundSvg, furnaceSvg, backWallSvg, leftWallSvg, lowerShellSvg, upperShellSvg, frigFloorSvg, glowsSvg, cavitySvg, floorSvg, flueGroupSvg, ventsSvg, roofSvg, woodpileSvg, wpRow, snowfallSvg, pizzaSvg, outline, box } from "./bath.mjs";
import { stream, coldArrows, haze } from "./fx.mjs";

const { stage, sky, stars, sun, puppet, cat, fire, smoke, ghost, lightTween, tf, poly, shade, tint, prng, RecapPills } = kit;
const J = JSON.stringify;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** tween tracker: emits fromTo(prev → next) with immediateRender:false for each (selector, property) pair; call in time order per element */
function tracker(L) {
  const st = new Map();
  const emit = (sel, from, to, at) => L.push(`tl.fromTo(${J(sel)}, ${J(from)}, ${J({ ...to, immediateRender: false })}, ${r3(at)});`);
  const api = {
    emit,
    init(sel, key, v) { st.set(sel + "|" + key, v); },
    get(sel, key) { return st.get(sel + "|" + key) ?? (key === "o" ? 0 : null); },
    op(sel, to, at, dur = 0.3, ease = "none") {
      const k = sel + "|o", prev = st.has(k) ? st.get(k) : 0;
      st.set(k, to);
      emit(sel, { opacity: prev }, { opacity: to, duration: r3(dur), ease }, at);
    },
    tf(sel, to, at, dur = 0.3, ease = "power2.out") {
      const k = sel + "|t", prev = st.has(k) ? st.get(k) : tf();
      st.set(k, to);
      emit(sel, { attr: { transform: prev } }, { attr: { transform: to }, duration: r3(dur), ease }, at);
    },
    /** up/down opacity pulse 0 → peak → 0 (n times in total time dur) */
    flash(sel, at, dur, n = 1, peak = 1) {
      const seg = dur / (2 * n);
      for (let i = 0; i < n; i++) { api.op(sel, peak, at + 2 * i * seg, seg); api.op(sel, 0, at + (2 * i + 1) * seg, seg); }
    },
  };
  return api;
}

const WISP = (id, x, y0, y1, at, dur) => stream({ id, points: [[x, y0], [x, y1]], tone: "heat", at, dur: Math.max(0.6, dur), width: 6, amp: 6 });

const bath = {
  id: "bath", beats: ["b01", "b02", "b03", "b04", "b05", "b06", "b07", "b08", "b09", "b10", "b11", "b12"], light: "day",
  render(ctx) {
    const B = ctx.beat, c = (a) => ctx.cue(a), D = ctx.t1, t0 = ctx.t0;
    const ids = ctx.script.beats.map((b) => b.id);
    const nx = (b) => { const i = ids.indexOf(b); return i + 1 < ids.length ? B(ids[i + 1]).start : D; };
    const L = [], T = tracker(L), S = [];
    const add = (o) => { S.push(o.tl); return o.svg; };

    // ------------------------------------------------------------ cues
    const cF1 = c("furnace-glow-reveal"), cW1 = c("puppet-walk-floor");
    const cG2 = c("ghost-room-fire"), cS2 = c("smoke-fill-cat-flees"), cC2 = c("cold-floor-arrows");
    const cFur = c("furnace-build"), cHA = c("heat-arrows-under");
    const cBl = c("ghost-heat-blocked"), cPR = c("pilae-rise"), cHot4 = c("hot-air-between-pilae");
    const cHS = c("ghost-hot-spot"), cBig = c("layer-big-tiles"), cCon = c("layer-concrete"), cTop = c("layer-top-tiles"), cEven = c("floor-glow-even");
    const cBF = c("ghost-smoke-backflow"), cBox = c("box-tiles-in-walls"), cUp6 = c("hot-air-up-walls"), cRoof = c("roof-vent-smoke");
    const cCool = c("air-cools-gradient"), cHotR = c("room-hot-glow"), cWarmR = c("room-warm-glow"), cColdR = c("room-cold-plain");
    const cNight = c("to-night"), cOut = c("ghost-fire-out"), cFeed = c("stoker-feeds-wood"), cWood = c("woodpile-grows");
    const cCO = c("gas-cloud-under"), cCrack = c("ghost-crack-seep"), cSeal = c("seal-joints"), cGasUp = c("gas-up-flues");
    const cWin = c("winter-outside"), cIn = c("inside-warm-glow"), cSan = c("puppet-sandals-cat");
    const R2 = B("b03").start - 0.3;

    // ------------------------------------------------------------ camera / light
    let camNow = CAM.HOOK;
    const cam = (to, at, planned, beat, ease = "power2.inOut") => {
      const dur = Math.min(planned, Math.max(0.5, nx(beat) - at - 0.05));
      T.emit("#bath-cam", { attr: { transform: camTf(camNow) } }, { attr: { transform: camTf(to) }, duration: r3(dur), ease }, at);
      camNow = to;
    };
    const light = (from, to, at, planned, beat) => L.push(lightTween(ctx.world, from, to, r3(at), r3(Math.min(planned, Math.max(0.5, nx(beat) - at - 0.05)))));

    // ------------------------------------------------------------ actors
    const bath1 = puppet({ id: "bath-p", x: 360, y: 1056, s: 0.95, jacket: "sand", tunic: "sand" });
    const bath2 = puppet({ id: "bath-p2", x: 400, y: 1044, s: 0.95, jacket: "sand", tunic: "sand", sandals: 1 });
    const stoker = puppet({ id: "bath-st", x: 118, y: 1150, s: 0.95, jacket: "earth-1", tunic: "earth-1" });
    const kitty = cat({ id: "bath-cat", x: 600, y: 1056, s: 1, flip: true });
    const furnFire = fire({ id: "bath-ff", x: 218, y: 1150, s: 0.75 });
    const tFire = fire({ id: "bath-tf", x: 470, y: 1210, s: 0.4 });
    const g2Fire = fire({ id: "bath-g2f", x: 560, y: 1140, s: 0.7 });
    const g6Smoke = smoke({ id: "bath-g6s", x: 150, y: 1080, s: 0.8 });
    const vL = smoke({ id: "bath-vL", x: 318, y: 612, s: 0.55 });
    const vA = smoke({ id: "bath-vA", x: 665, y: 546, s: 0.55 });

    // ------------------------------------------------------------ b01 hook
    T.init("#teaser", "t", tf({ px: 470, py: 1185, sx: 0.2, sy: 0.2 }));
    T.tf("#teaser", tf({ px: 470, py: 1185, sx: 2.3, sy: 2.3 }), cF1, 0.5, "back.out(1.6)");
    L.push(`tl.fromTo("#teaserGlow", {opacity:0.25}, {opacity:0.7, duration:0.35, repeat:5, yoyo:true, ease:"sine.inOut", immediateRender:false}, ${r3(cF1 + 0.3)});`);
    T.op("#teaser", 1, cF1, 0.4, "power2.out");
    S.push(tFire.tl(cF1, B("b02").start - cF1));
    T.op("#floorWarmB01", 0.25, cF1 + 0.3, 0.5);
    bath1.act("walk", cW1, 1.2, 0.5); bath1.move(470, 1056, cW1, 1.2, "none"); bath1.pose("stand", cW1 + 1.2, 0.25);
    kitty.act("shiver", t0, B("b02").start - t0, 0.2);
    T.op("#teaser", 0, B("b02").start - 0.1, 0.3); T.op("#floorWarmB01", 0, B("b02").start - 0.1, 0.3);

    // ------------------------------------------------------------ b02 attempt (whole beat is the ghost)
    {
      T.op("#bath-g2", 1, cG2, 0.3);
      S.push(g2Fire.tl(cG2, R2 - cG2));
      T.op("#veilGrey", 0.3, cG2, 0.4); T.op("#veilRed", 0.14, cG2, 0.4);
      const r = prng(41), puffs = [];
      for (let i = 0; i < 6; i++) {
        const cx = 350 + r() * 290, cy = 700 + r() * 200, rr = 60 + r() * 30;
        puffs.push({ cx, cy, rr, pts: Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85]; }) });
      }
      const puffSvg = puffs.map((p, i) => `<g id="g2-s${i}" transform="${tf({ px: p.cx, py: p.cy, sx: 0, sy: 0 })}"><g id="g2-d${i}">${poly(p.pts, tint("stone", 10), 'opacity=".85"')}</g></g>`).join("");
      puffs.forEach((p, i) => {
        const t = cS2 + 0.18 * i;
        T.emit(`#g2-s${i}`, { attr: { transform: tf({ px: p.cx, py: p.cy, sx: 0, sy: 0 }) } }, { attr: { transform: tf({ px: p.cx, py: p.cy }) }, duration: 0.4, ease: "power2.out" }, t);
        L.push(`tl.fromTo("#g2-d${i}", {y:0}, {y:40, duration:${r3(Math.max(0.5, R2 - t - 0.4))}, ease:"none", immediateRender:false}, ${r3(t + 0.4)});`);
      });
      const soot = [470, 540, 600].map((x, i) => {
        const g = `<g id="g2-k${i}" transform="${tf({ px: x, py: 670, sy: 0 })}">${poly([[x - 9, 670], [x + 9, 670], [x + 5, 780], [x - 5, 780]], shade("earth-3", 20), 'opacity=".7"')}</g>`;
        T.emit(`#g2-k${i}`, { attr: { transform: tf({ px: x, py: 670, sy: 0 }) } }, { attr: { transform: tf({ px: x, py: 670 }) }, duration: 0.6, ease: "power2.out" }, cS2 + 0.15 * i);
        return g;
      }).join("");
      S.g2 = ghost("bath-g2", g2Fire.svg + soot + puffSvg);
      bath1.act("cough", cS2, clamp(cC2 - cS2 - 0.05, 0.5, 1.5), 0.5);
      kitty.face("right", cS2); kitty.act("run", cS2, 0.7, 0.25); kitty.move(900, 1056, cS2, 0.7, "power1.in");
      S.ca2 = coldArrows({ id: "bath-ca2", xs: [430, 470, 510], y0: 1090, y1: 1132, at: cC2, dur: Math.max(0.6, B("b03").start - cC2) });
      S.push(S.ca2.tl);
      bath1.act("shiver", cC2, Math.max(0.6, B("b03").start - cC2 - 0.1), 0.24);
      T.op("#bath-g2", 0, R2, 0.35); T.op("#veilGrey", 0, R2, 0.35); T.op("#veilRed", 0, R2, 0.35);
      bath1.pose("stand", R2, 0.3);
    }

    // ------------------------------------------------------------ b03 step 1: furnace
    kitty.face("left", B("b03").start + 0.4); kitty.act("run", B("b03").start + 0.4, 1.0, 0.4); kitty.move(620, 1056, B("b03").start + 0.4, 1.0); kitty.pose("stand", B("b03").start + 1.4);
    ["furn-c0", "furn-c1", "furn-c2", "furn-c3", "furn-slab"].forEach((id, i) =>
      L.push(`tl.fromTo("#${id}", {y:30, opacity:0}, {y:0, opacity:1, duration:0.18, ease:"power2.out", immediateRender:false}, ${r3(cFur + 0.15 * i)});`));
    T.op("#furn-tunnel", 1, cFur + 0.15, 0.18, "power2.out");
    T.tf("#furnFireW", tf({ px: 218, py: 1150 }), cFur + 0.85, 0.3, "back.out(1.4)"); T.init("#furnFireW", "o", 1);
    S.push(furnFire.tl(cFur + 0.85, D - cFur - 0.85));
    T.op("#furn-glow", 0.4, cFur + 0.85, 0.3); T.init("#furnFireW", "t", tf({ px: 218, py: 1150 }));
    const sB3 = stream({ id: "bath-sB3", points: [[176, 1132], [292, 1132]], tone: "heat", at: cHA, dur: cPR + 0.9 - cHA });
    S.push(sB3.tl); T.init("#bath-sB3", "o", 1);

    // ------------------------------------------------------------ b04 step 2: pilae
    {
      const h = clamp(cPR - cBl - 0.4, 0.8, 1.2);
      T.flash("#bath-sB3-red", cBl, h, 2);
      for (let i = 0; i < 2; i++) {
        const a = cBl + (h / 2) * i, q = h / 4;
        L.push(`tl.fromTo("#bath-sB3", {scaleX:1, svgOrigin:"176 1132"}, {scaleX:0.85, svgOrigin:"176 1132", duration:${r3(q)}, ease:"sine.inOut", immediateRender:false}, ${r3(a)});`);
        L.push(`tl.fromTo("#bath-sB3", {scaleX:0.85, svgOrigin:"176 1132"}, {scaleX:1, svgOrigin:"176 1132", duration:${r3(q)}, ease:"sine.inOut", immediateRender:false}, ${r3(a + q)});`);
      }
      T.op("#blockRed", 0.45, cBl, 0.15); T.op("#veilRed", 0.14, cBl, 0.3);
      T.op("#blockRed", 0, cBl + h, 0.3); T.op("#veilRed", 0, cBl + h, 0.3);
    }
    {
      const d = Math.min(0.84, Math.max(0.2, cHot4 - cPR - 0.05));
      T.emit("#pilae", { attr: { transform: tf({ py: 1150, sy: 0 }) } }, { attr: { transform: tf({ py: 1150 }) }, duration: d, ease: "steps(7)" }, cPR);
      T.emit("#floorRise", { attr: { transform: "translate(0 84)" } }, { attr: { transform: "translate(0 0)" }, duration: d, ease: "steps(7)" }, cPR);
      T.op("#cavityBack", 1, cPR, d, "none");
      cam(CAM.CLOSE, cPR, 1.0, "b04");
      T.op("#wallMouth", 1, cPR + 0.9, 0.25); T.op("#bath-sB3", 0, cPR + 0.9, 0.3);
    }
    const sU1 = stream({ id: "bath-sU1", points: [[176, 1104], [336, 1104], [650, 1104]], tone: "heat", at: cHot4, dur: D - cHot4, amp: 14 });
    const sU2 = stream({ id: "bath-sU2", points: [[650, 1104], [928, 1104]], tone: "heat", at: cHot4 + 0.4, dur: D - cHot4 - 0.4, amp: 14 });
    S.push(sU1.tl, sU2.tl); T.init("#bath-sU1", "o", 1); T.init("#bath-sU2", "o", 1);
    T.op("#floorWarm", 0.22, cHot4 + 0.6, 0.6);
    T.op("#dimLine", 1, cPR + 1.2, 0.3); T.op("#dimLine", 0, nx("b04") - 0.1, 0.3);

    // ------------------------------------------------------------ b05 step 3: thick floor
    const wisp5 = [380, 430, 480].map((x, i) => WISP(`bath-w5${i}`, x, 1050, 990, cHS, 1.0));
    {
      const h = clamp(cBig - cHS - 0.6, 1.0, 2.5);
      T.op("#hotSpot", 0.9, cHS, 0.3); T.op("#hotSpotR", 0.5, cHS + 0.3, 0.2);
      wisp5.forEach((w) => { S.push(w.tl); });
      T.op("#veilRed", 0.14, cHS, 0.3);
      bath1.move(470, 1026, cHS, 0.15); bath1.move(560, 1056, cHS + 0.15, 0.35); bath1.pose("stand", cHS + 0.5);
      T.op("#coldRest", 0.45, cHS + 0.5, 0.4);
      kitty.act("shiver", cHS + 0.5, h - 0.5, 0.2);
      for (const s of ["#hotSpot", "#hotSpotR", "#coldRest", "#veilRed"]) T.op(s, 0, cHS + h, 0.35);
      wisp5.forEach((_, i) => { T.init(`#bath-w5${i}`, "o", 1); T.op(`#bath-w5${i}`, 0, cHS + h, 0.35); });
    }
    T.op("#flBigY", 1, cBig, 0.25); T.op("#flBigY", 0, cBig + 0.25, 0.25);
    T.op("#seamsBig", 0.3, cBig, 0.25); T.op("#seamsBig", 1, cBig + 0.25, 0.25);
    T.init("#seamsBig", "o", 1);
    T.tf("#flConc", tf({ py: 1056 }), cCon, 0.35, "power2.out");
    T.init("#ride", "t", "translate(0 0)"); T.tf("#ride", "translate(0 -20)", cCon, 0.35, "power2.out");
    T.tf("#flTop", tf({ py: 1036 }), cTop, 0.3, "power2.out");
    T.tf("#ride", "translate(0 -28)", cTop, 0.3, "power2.out");
    T.init("#flConc", "t", tf({ py: 1056, sy: 0 })); T.init("#flTop", "t", tf({ py: 1036, sy: 0 }));
    T.op("#floorWarm", 0, cEven, 0.3); T.op("#floorWarmAll", 0.28, cEven, 0.6);
    const wisp5b = [380, 520, 760, 880].map((x, i) => WISP(`bath-w5b${i}`, x, 1022, 962, cEven, nx("b05") - cEven));
    wisp5b.forEach((w, i) => { S.push(w.tl); T.init(`#bath-w5b${i}`, "o", 1); T.op(`#bath-w5b${i}`, 0, nx("b05") - 0.3, 0.3); });
    L.push(`tl.fromTo("#pizza", {opacity:0, scale:0.9, svgOrigin:"870 660"}, {opacity:1, scale:1, svgOrigin:"870 660", duration:0.18, ease:"power2.out", immediateRender:false}, ${r3(cEven + 0.2)});`);
    L.push(`tl.fromTo("#pizza", {opacity:1}, {opacity:0, duration:0.2, ease:"none", immediateRender:false}, ${r3(nx("b05") - 0.3)});`);

    // ------------------------------------------------------------ b06 step 4: wall flues
    const g6Puffs = [880, 780, 680, 580, 480].map((x, i) => {
      const cy = 1112 + (i % 2) * 8, rr = 28 + (i % 3) * 3;
      const pts = Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2; return [x + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85]; });
      return { x, cy, svg: `<g id="g6-p${i}" transform="${tf({ px: x, py: cy, sx: 0, sy: 0 })}">${poly(pts, tint("stone", 10), 'opacity=".8"')}</g>` };
    });
    {
      const h = clamp(cBox - cBF - 0.5, 1.0, 2.0);
      T.op("#bath-g6", 1, cBF, 0.3);
      g6Puffs.forEach((p, i) => T.emit(`#g6-p${i}`, { attr: { transform: tf({ px: p.x, py: p.cy, sx: 0, sy: 0 }) } }, { attr: { transform: tf({ px: p.x, py: p.cy }) }, duration: 0.3, ease: "power2.out" }, cBF + 0.15 * i));
      S.push(g6Smoke.tl(cBF + 0.3, h));
      T.op("#furnFireW", 0.45, cBF, 0.6); T.op("#streamsUnder", 0.25, cBF, 0.6); T.op("#veilRed", 0.14, cBF, 0.3);
      T.op("#bath-g6", 0, cBF + h, 0.35); T.op("#veilRed", 0, cBF + h, 0.35);
      T.op("#streamsUnder", 1, cBF + h, 0.35); T.op("#furnFireW", 0.6, cBF + h, 0.35);
    }
    for (let k = 0; k < 11; k++) for (const f of ["flueL", "flueA"]) T.op(`#${f}-t${k}`, 1, cBox + 0.04 * k, 0.12);
    T.tf("#ventL", tf({ py: 656 }), cBox + 0.5, 0.3); T.tf("#ventA", tf({ py: 586 }), cBox + 0.5, 0.3);
    T.init("#ventL", "t", tf({ py: 656, sy: 0 })); T.init("#ventA", "t", tf({ py: 586, sy: 0 }));
    const sFL = stream({ id: "bath-sFL", points: [[318, 1060], [318, 606]], tone: "heat", at: cUp6, dur: D - cUp6 });
    const sFA = stream({ id: "bath-sFA", points: [[665, 1060], [665, 540]], tone: "heat", at: cUp6, dur: D - cUp6 });
    S.push(sFL.tl, sFA.tl); T.init("#bath-sFL", "o", 1); T.init("#bath-sFA", "o", 1);
    T.op("#wallWarmL", 0.15, cUp6, 0.6); T.op("#wallWarmA", 0.15, cUp6, 0.6);
    S.push(vL.tl(cRoof, D - cRoof), vA.tl(cRoof, D - cRoof));
    T.op("#furnFireW", 1, cRoof, 0.5);

    // ------------------------------------------------------------ b07 step 5: room order
    cam(CAM.WIDE, B("b07").start, 1.2, "b07");
    const sU2w = stream({ id: "bath-sU2w", points: [[650, 1104], [928, 1104]], tone: "warm", at: cCool, dur: D - cCool, amp: 14 });
    const sU3 = stream({ id: "bath-sU3", points: [[900, 1104], [930, 1104]], tone: "cool", at: cCool + 0.2, dur: D - cCool - 0.2, width: 6, wavy: false });
    S.push(sU2w.tl, sU3.tl); T.init("#bath-sU2w", "o", 1); T.init("#bath-sU3", "o", 1);
    T.op("#bath-sU2", 0, cCool, 0.8);
    T.op("#glowC", 0.2, cHotR, 0.5);
    const wisp7 = [420, 540].map((x, i) => WISP(`bath-w7${i}`, x, 1022, 962, cHotR, nx("b07") - cHotR));
    wisp7.forEach((w, i) => { S.push(w.tl); T.init(`#bath-w7${i}`, "o", 1); T.op(`#bath-w7${i}`, 0, nx("b07") - 0.3, 0.3); });
    T.op("#glowT", 0.1, cWarmR, 0.5);
    T.op("#pool", 1, cColdR, 0.3);
    T.tf("#poolS", tf({ px: 1110, py: 1090 }), cColdR, 0.5, "power2.out"); T.init("#poolS", "t", tf({ px: 1110, py: 1090, sy: 0.15 }));
    T.op("#glowF", 0.12, cColdR, 0.5);
    const ca7 = coldArrows({ id: "bath-ca7", xs: [1000, 1200], y0: 900, y1: 990, at: cColdR, dur: nx("b07") - cColdR });
    S.push(ca7.tl);

    // ------------------------------------------------------------ b08 step 6: stoker
    cam(CAM.STOKE, B("b08").start, 1.0, "b08", "power2.inOut");
    light("day", "night", cNight, 0.8, "b08");
    T.op("#bath-stars", 1, cNight, 0.8); T.op("#bath-moon", 1, cNight, 0.8);
    T.op("#bath-p", 0, cNight, 0.3);
    T.op("#stokerW", 1, cNight + 0.3, 0.3);
    {
      const dimSel = [["#streamsUnder", 1], ["#bath-sFL", 1], ["#bath-sFA", 1], ["#floorWarmAll", 0.28], ["#glowC", 0.2], ["#glowT", 0.1], ["#wallWarmL", 0.15], ["#wallWarmA", 0.15]];
      T.op("#furnFireW", 0.15, cOut, 0.8); T.op("#furn-glow", 0.1, cOut, 0.8);
      for (const [s, v] of dimSel) T.op(s, v * 0.15, cOut, 0.8);
      T.op("#floorCold", 0.35, cOut, 0.5);
      const ca8 = coldArrows({ id: "bath-ca8", xs: [420, 520, 620], y0: 960, y1: 1010, at: cOut, dur: cFeed + 0.3 - cOut });
      S.ca8 = ca8; S.push(ca8.tl);
      T.op("#veilRed", 0.12, cOut, 0.4);
      kitty.act("shiver", cOut, cFeed - cOut, 0.2);
      stoker.act("feed", cFeed, 1.6, 0.8); stoker.pose("stand", cFeed + 1.6);
      T.op("#furnFireW", 0.55, cFeed + 0.4, 0.3); T.op("#furnFireW", 1, cFeed + 1.2, 0.3);
      T.op("#veilRed", 0, cFeed + 0.3, 0.6); T.op("#floorCold", 0, cFeed + 0.3, 0.6);
      for (const [s, v] of dimSel) T.op(s, v, cFeed + 0.3, 0.6);
      T.op("#furn-glow", 0.4, cFeed + 0.4, 0.3);
    }
    for (let r = 1; r <= 5; r++) {
      const { px, py } = wpRow(r), t = cWood + 0.08 * (r - 1);
      T.emit(`#wp-r${r}`, { attr: { transform: tf({ px, py, sx: 0, sy: 0 }) } }, { attr: { transform: tf({ px, py }) }, duration: 0.15, ease: "power2.out" }, t);
    }

    // ------------------------------------------------------------ b09 step 7: sealed joints
    light("night", "tense", B("b09").start, 1.0, "b09");
    cam(CAM.PUSH, B("b09").start, 2.5, "b09", "power1.inOut");
    const co = haze({ id: "bath-co", area: { x: 340, y: 1070, w: 580, h: 76 }, n: 5 });
    T.op("#bath-co", 1, cCO, 0.8);
    S.push(co.tl(cCO, cGasUp - cCO));
    const r9 = prng(55);
    const up = [0, 1, 2].map((i) => `<g transform="translate(520 1028)"><g id="co-up${i}" style="opacity:0">${poly(Array.from({ length: 9 }, (_, k) => { const a = (k / 9) * Math.PI * 2, q = 20 + r9() * 8; return [Math.cos(a) * q * 1.3, Math.sin(a) * q]; }), "color-mix(in srgb, color-mix(in srgb, var(--stone) 70%, var(--night-tint)) 85%, var(--ui-red))", 'opacity=".5"')}</g></g>`).join("");
    {
      T.emit("#crack", { attr: { transform: tf({ px: 520, py: 1028, sy: 0 }) } }, { attr: { transform: tf({ px: 520, py: 1028 }) }, duration: 0.25, ease: "power2.out" }, cCrack);
      [-20, 20, 80].forEach((dx, i) => L.push(`tl.fromTo("#co-up${i}", {x:0, y:0, scale:0.5, opacity:0}, {x:${dx}, y:-148, scale:1.4, opacity:0.4, duration:1.6, ease:"power1.out", immediateRender:false}, ${r3(cCrack + 0.35 * i)});`));
      kitty.pose("earsFlat", cCrack + 0.3, 0.2); kitty.move(660, 1056, cCrack + 0.3, 0.4);
      T.op("#veilRed", 0.14, cCrack, 0.3);
      T.emit("#crack", { attr: { transform: tf({ px: 520, py: 1028 }) } }, { attr: { transform: tf({ px: 520, py: 1028, sx: 0 }) }, duration: 0.3, ease: "power2.in" }, cSeal);
      T.op("#mortar", 1, cSeal, 0.3);
      T.op("#jointsY", 1, cSeal, 0.2); T.op("#jointsY", 0, cSeal + 0.2, 0.4);
      for (let i = 0; i < 3; i++) L.push(`tl.to("#co-up${i}", {opacity:0, duration:0.4, ease:"none", immediateRender:false}, ${r3(cSeal)});`);
      T.op("#veilRed", 0, cSeal, 0.4);
      kitty.pose("stand", cSeal + 0.3);
      co.blobs.forEach((b, i) => {
        const X = i % 2 ? 665 : 318, top = i % 2 ? 540 : 600, t = cGasUp + 0.12 * i;
        L.push(`tl.fromTo("#${b.id}", {x:0, y:0, scale:1}, {x:${r3(X - b.cx)}, y:${r3(1060 - b.cy)}, scale:0.35, duration:0.5, ease:"power1.inOut", immediateRender:false}, ${r3(t)});`);
        L.push(`tl.fromTo("#${b.id}", {x:${r3(X - b.cx)}, y:${r3(1060 - b.cy)}}, {y:${r3(top - b.cy)}, duration:0.9, ease:"power1.in", immediateRender:false}, ${r3(t + 0.5)});`);
        L.push(`tl.fromTo("#${b.id}", {opacity:1}, {opacity:0, duration:0.2, ease:"none", immediateRender:false}, ${r3(t + 1.2)});`);
      });
    }

    // ------------------------------------------------------------ b10 climax (winter)
    light("tense", "day", B("b10").start, 1.0, "b10");
    T.op("#bath-stars", 0, B("b10").start, 1.0); T.op("#bath-moon", 0, B("b10").start, 1.0);
    cam(CAM.CLIMAX, B("b10").start, 1.2, "b10");
    T.op("#bath2W", 1, B("b10").start + 0.3, 0.3);
    T.tf("#groundSnow", tf({ py: 1152 }), cWin, 0.4, "power2.out"); T.init("#groundSnow", "t", tf({ py: 1152, sy: 0 }));
    T.op("#roofSnow", 1, cWin, 0.5); T.op("#hillsSnow", 1, cWin, 0.5);
    const snow = snowfallSvg();
    T.op("#snowfall", 1, cWin, 0.4);
    snow.flakes.forEach((fl, i) => {
      const n = Math.max(1, Math.floor((D - cWin) / 3) - 1);
      L.push(`tl.fromTo("#flake${i}", {y:0, x:0}, {y:260, x:${r3(fl.d)}, duration:3, ease:"none", repeat:${n}, immediateRender:false}, ${r3(cWin + (i % 10) * 0.12)});`);
    });
    stoker.act("feed", cWin + 0.6, 0.8, 0.8); stoker.pose("stand", cWin + 1.4);
    T.op("#glowAmber", 0.28, cIn, 0.6); T.op("#glowT", 0.15, cIn, 0.6);
    const wisp10 = [420, 540].map((x, i) => WISP(`bath-w10${i}`, x, 1022, 962, cIn, nx("b10") - cIn));
    wisp10.forEach((w, i) => { S.push(w.tl); T.init(`#bath-w10${i}`, "o", 1); T.op(`#bath-w10${i}`, 0, nx("b10") - 0.3, 0.3); });
    {
      const wd = Math.min(1.0, Math.max(0.5, cSan - cIn - 0.05));
      bath2.act("walk", cIn, wd, 0.5); bath2.move(520, 1044, cIn, wd, "none"); bath2.pose("stand", cIn + wd);
      bath2.act("walk", cSan, 0.6, 0.3); bath2.move(560, 1044, cSan, 0.6, "none"); bath2.pose("stand", cSan + 0.6);
    }
    for (const s of ["#bath-p2-sandalYL", "#bath-p2-sandalYR"]) {
      T.op(s, 1, cSan, 0.15); T.op(s, 0.5, cSan + 0.25, 0.3); T.op(s, 1, cSan + 0.55, 0.3); T.op(s, 0, nx("b10") - 0.1, 0.1);
    }
    kitty.pose("curl", cSan, 0.5);

    // ------------------------------------------------------------ b11 recap
    cam(CAM.RECAP, B("b11").start, 0.5, "b11", "power2.inOut");
    const R = [
      [box(132, 978, 308, 1150)], [box(346, 1066, 926, 1150)], [box(336, 1028, 940, 1066)],
      [box(304, 618, 332, 1062), box(654, 552, 676, 1062)],
      [box(336, 660, 650, 1028), box(680, 660, 940, 1028), box(970, 660, 1220, 1028)], [box(-62, 1010, 98, 1150)],
    ];
    const rc = R.map((shapes, k) => outline(`rc-k${k}`, shapes));
    for (let k = 0; k < 7; k++) {
      const tk = B("b11").start + 0.3 + 0.33 * k;
      if (k < 6) { T.op(`#rc-k${k}`, 1, tk, 0.15); T.op(`#rc-k${k}`, 0.35, tk + 0.15, 0.2); }
      else T.op("#jointsY", 0.6, tk, 0.15);
    }

    // ------------------------------------------------------------ b12 ending
    cam(CAM.WIDE, B("b12").start, 0.8, "b12");
    light("day", "sunset", B("b12").start, 1.2, "b12");
    for (let k = 0; k < 6; k++) T.op(`#rc-k${k}`, 0, B("b12").start, 0.3);
    T.op("#jointsY", 0, B("b12").start, 0.3);

    // ------------------------------------------------------------ assemble (z-order back → front)
    const streamsUnder = sU1.svg + sU2.svg + sU2w.svg + sU3.svg;
    const teaser = `<g id="teaser" style="opacity:0" transform="${tf({ px: 470, py: 1185, sx: 0.2, sy: 0.2 })}">` +
      poly(Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return [470 + Math.cos(a) * 90, 1185 + Math.sin(a) * 30]; }), shade("earth-3", 40)) +
      `<ellipse id="teaserGlow" cx="470" cy="1190" rx="150" ry="55" style="fill:var(--ui-heat);opacity:0.25"/>` + tFire.svg + `</g>`;
    const ride = `<g id="ride" transform="translate(0 0)">${bath1.svg}<g id="bath2W" style="opacity:0">${bath2.svg}</g>${kitty.svg}</g>`;
    const stokerW = `<g id="stokerW" style="opacity:0">${stoker.svg}</g>`;
    const world =
      hillsSvg() + groundSvg() +
      `<rect id="blockRed" x="290" y="1140" width="650" height="50" style="fill:var(--ui-red);opacity:0"/>` + teaser +
      woodpileSvg() + furnaceSvg(furnFire.svg) + sB3.svg + stokerW +
      backWallSvg() + glowsSvg() + lowerShellSvg() + leftWallSvg() + frigFloorSvg() +
      cavitySvg(streamsUnder) +
      `<g id="dimLine" style="opacity:0"><line x1="384" y1="1066" x2="384" y2="1150" style="stroke:var(--ui-white);stroke-width:3"/><line x1="370" y1="1066" x2="398" y2="1066" style="stroke:var(--ui-white);stroke-width:3"/><line x1="370" y1="1150" x2="398" y2="1150" style="stroke:var(--ui-white);stroke-width:3"/></g>` +
      `<g id="floorRise" transform="translate(0 84)">${floorSvg()}${ride}</g>` +
      upperShellSvg() + flueGroupSvg() + ventsSvg() + roofSvg() +
      sFL.svg + sFA.svg + wisp5.map((w) => w.svg).join("") + wisp5b.map((w) => w.svg).join("") + wisp7.map((w) => w.svg).join("") + wisp10.map((w) => w.svg).join("") +
      co.svg + up + S.ca2.svg + ca7.svg + S.ca8.svg +
      vL.svg + vA.svg +
      S.g2 + ghost("bath-g6", g6Puffs.map((p) => p.svg).join("") + g6Smoke.svg) +
      rc.join("") + snow.svg;
const cloud = (x, y, k, o) => { const P = (pts, f) => poly(pts.map(([a, b]) => [x + a * k, y + b * k]), f); return `<g style="opacity:${o}">` + P([[0,40],[60,0],[140,10],[200,40]], "var(--snow)") + P([[40,40],[100,-20],[170,0],[230,40]], "var(--sky-2)") + P([[-30,50],[20,30],[240,40],[270,60]], "var(--snow)") + "</g>"; };
    const clouds = `<g id="bath-clouds">` + cloud(40, 250, 1.3, 0.8) + cloud(560, 330, 1.0, 0.7) + cloud(300, 470, 1.5, 0.6) + cloud(800, 560, 0.9, 0.7) + cloud(-300, 400, 1.1, 0.6) + cloud(1000, 240, 1.2, 0.7) + `</g>`;
    L.push(`tl.fromTo("#bath-clouds", {x:0}, {x:-160, duration:${r3(ctx.t1)}, ease:"none", immediateRender:false}, 0);`);
    const html = stage(
      sky({ id: "bath-sky", horizonY: 1300 }) + `<rect x="0" y="1316" width="1080" height="260" style="fill:var(--sky-2)"/>` +
      clouds + stars({ id: "bath-stars", n: 40, w: 1080, h: 700 }) + `<g style="opacity:1">${sun({ id: "bath-moon", kind: "moon", cx: 870, cy: 470, r: 48 })}</g>`.replace('id="bath-moon"', 'id="bath-moon" style="opacity:0"') +
      `<g id="bath-cam" transform="${camTf(CAM.HOOK)}">${world}</g>` +
      pizzaSvg() +
      `<rect id="veilGrey" x="0" y="0" width="1080" height="1920" style="fill:var(--stone);opacity:0"/><rect id="veilRed" x="0" y="0" width="1080" height="1920" style="fill:var(--ui-red);opacity:0"/>`,
    );

    // ------------------------------------------------------------ anchors / overlays
    const slot = { card: { x: 400, y: 400 }, width: 540 };
    const sc = (cam, x, y) => toScreen(cam, x, y);
    const anchors = {
      furnace: { ...slot, target: sc(CAM.HOOK, 215, 1110), at: cFur + 0.5 },
      pilae: { ...slot, target: sc(CAM.CLOSE, 504, 1108), at: cPR + 1.05 },
      "pilae-height": { x: 620, y: 1180, at: cPR + 1.2 },
      "floor-layers": { ...slot, target: sc(CAM.CLOSE, 480, 1046), at: cTop },
      tubuli: { ...slot, target: sc(CAM.CLOSE, 318, 900), at: cBox + 0.4 },
      caldarium: { ...slot, target: sc(CAM.WIDE, 493, 900), at: cHotR, until: cWarmR - 0.05 },
      tepidarium: { ...slot, target: sc(CAM.WIDE, 810, 900), at: cWarmR, until: cColdR - 0.05 },
      frigidarium: { ...slot, target: sc(CAM.WIDE, 1110, 1050), at: cColdR },
      title: { x: 540, y: 480, at: B("b12").start + 0.3, maxWidth: 900, max: 64 },
    };
    const overlays = {
      b08: { stepAt: cFeed, meter: [{ t: cOut, value: 50 }, { t: cFeed + 0.5 }] },
      b09: { stepAt: cSeal, meter: [{ t: cCrack, value: 40 }, { t: cSeal + 0.2 }] },
      b10: { stepAt: cIn },
    };
    const tl = [...L, ...S.filter((x) => typeof x === "string"), bath1.tl(), bath2.tl(), stoker.tl(), kitty.tl()].join("\n");
    return { html, tl, anchors, overlays };
  },
};

export const scenes = [bath];

export const extras = [
  {
    id: "recap", from: "b11", to: "b11",
    render(ctx) {
      const items = ctx.script.beats.filter((b) => b.type === "step").map((b) => b.onScreen.stepPlate);
      const r = RecapPills({ id: "ex-recap-p", items, x0: 60, y0: 400, colW: 880, rowH: 70, cols: 1, at: ctx.t0 + 0.3, step: 0.33, dur: ctx.dur - 0.3 });
      if (r.overflow) console.warn("WARN: recap pill text overflow — shorten the step plate strings");
      return { html: r.html, css: r.css, tl: r.tl };
    },
  },
];
