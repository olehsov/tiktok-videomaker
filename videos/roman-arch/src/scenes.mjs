// Roman arch: ONE scene (br) that accumulates the bridge beat by beat + an extra recap clip. Every visible string comes from
// script.<lang>.json (overlays built by build.mjs); every beat-level time comes from timings via ctx.cue / ctx.word. Only
// durations and offsets are literal numbers.
import * as kit from "../kit/index.mjs";
import {
  CAM, camTf, toScreen, r3, C1, C2, RM, NSTONE, KEY, PILE_CX, th, layOff, stoneCentre, halfPath,
  mountainsSvg, hillsSvg, farSlopeSvg, treesSvg, floodBackSvg, bedrockSvg, mudSvg, cofBackSvg, waterSvg, banksSvg, pileSvg, gPierSvg,
  cofSvg, pierSvg, fillSvg, parapetSvg, pavingSvg, holeSvg, cracksSvg, centeringSvg, archRing, outlinesSvg, recapSvg, abutSvg, craneSvg,
  slabSvg, spoutSvg, spanDimSvg, ghostsSvg, previewSvg, convoySvg, heronWaterFront,
} from "./bridge.mjs";
import { tracker, splash, rain } from "./fx.mjs";

const { stage, sky, sun, clouds, puppet, heron, car, lightTween, tf, poly, shade, tint, ForceArrows, FlowArrows, RecapPills } = kit;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ORDER = [0, 14, 1, 13, 2, 12, 3, 11, 4, 10, 5, 9, 6, 8];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const tr = (x, y) => `translate(${r3(x)} ${r3(y)})`;
const rot = (a, cx, cy) => `rotate(${r3(a)} ${r3(cx)} ${r3(cy)})`;

function corkSvg() {
  const arrow = (pts) => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" style="fill:var(--ui-yellow);stroke:var(--ui-white);stroke-width:2"/>`;
  const wall = (m) => poly([[-70 * m, -90], [-52 * m, -90], [-40 * m, 100], [-58 * m, 100]], tint("water", 45), 'opacity=".85"');
  return `<g id="br-cork" style="opacity:0" transform="${tf({ px: 760, py: 500, sx: 0.9, sy: 0.9 })}"><g transform="translate(760 500)">` +
    `<clipPath id="br-corkClip"><circle r="116"/></clipPath><circle r="120" style="fill:var(--panel-bg);stroke:var(--ui-white);stroke-width:4"/>` +
    `<g clip-path="url(#br-corkClip)">${wall(1)}${wall(-1)}` +
    `<line x1="-70" y1="-90" x2="-110" y2="-68" style="stroke:${tint("water", 20)};stroke-width:3"/><line x1="70" y1="-90" x2="110" y2="-68" style="stroke:${tint("water", 20)};stroke-width:3"/>` +
    `<g id="br-cork-c" transform="translate(0 -14)">${poly([[-50, -60], [50, -60], [38, 40], [-38, 40]], tint("wood", 25))}${poly([[0, -60], [50, -60], [38, 40], [0, 40]], shade("wood", 5))}` +
    `<ellipse cx="0" cy="-60" rx="50" ry="8" style="fill:${tint("wood", 35)}"/></g>` +
    `<g id="br-cork-a" style="opacity:0">${arrow([[-5, -112], [5, -112], [5, -88], [13, -88], [0, -72], [-13, -88], [-5, -88]])}` +
    `${arrow([[52, -15], [62, -15], [62, -22], [76, -10], [62, 2], [62, -5], [52, -5]])}${arrow([[-52, -15], [-62, -15], [-62, -22], [-76, -10], [-62, 2], [-62, -5], [-52, -5]])}</g>` +
    `</g></g></g>`;
}
function stormSvg() {
  let s = "";
  for (let i = 0; i < 4; i++) {
    const cx = 120 + i * 280, cy = 180 + (i % 2) * 140;
    const top = [[cx - 150, cy + 50], [cx - 100, cy], [cx - 30, cy - 40], [cx + 50, cy - 8], [cx + 120, cy + 4], [cx + 160, cy + 50]];
    s += poly(top, shade("stone", 35)) + poly([top[0], top[5], [cx, cy + 70]], shade("stone", 45), 'opacity=".8"');
  }
  return `<g id="br-storm" style="opacity:0">${s}</g>`;
}

const bridge = {
  id: "br", beats: ["b01", "b02", "b03", "b04", "b05", "b06", "b07", "b08", "b09", "b10", "b11", "b12", "b13"], light: "day",
  render(ctx) {
    const B = ctx.beat, c = (a) => ctx.cue(a), w = (b, t, n) => ctx.word(b, t, n), D = ctx.t1, t0 = ctx.t0;
    const ids = ctx.script.beats.map((b) => b.id);
    const nx = (b) => { const i = ids.indexOf(b); return i + 1 < ids.length ? B(ids[i + 1]).start : D; };
    const L = [], T = tracker(L), S = [], FLOW = [], FA = [];
    let RN = null;
    const I = (s) => `#br-${s}`;

    // ------------------------------------------------------------ camera / light
    let camNow = CAM.WIDE;
    const cam = (to, at, planned, beat, ease = "power2.inOut") => {
      const dur = Math.min(planned, Math.max(0.5, nx(beat) - at - 0.05));
      T.emit("#br-cam", { attr: { transform: camTf(camNow) } }, { attr: { transform: camTf(to) }, duration: r3(dur), ease }, at);
      camNow = to;
    };
    const light = (from, to, at, planned, beat) => L.push(lightTween(ctx.world, from, to, r3(at), r3(Math.min(planned, Math.max(0.5, nx(beat) - at - 0.05)))));
    const fa = (o) => { if (o.dur < 0.6) return; const r = ForceArrows(o); FA.push(r.svg); S.push(r.tl); };
    const flow = (o) => { if (o.dur < 0.6) return; const r = FlowArrows(o); FLOW.push(r.html); S.push(r.tl); };
    const veil = (v, at, dur = 0.15) => T.op("#br-veilRed", v, at, dur);
    const spl = (id, x, y, at) => { const r = splash({ id, x, y, at }); FA.push(r.svg); S.push(r.tl); };

    // ------------------------------------------------------------ cues
    const B1 = B("b01").start, B2 = B("b02").start, B3 = B("b03").start, B4 = B("b04").start, B5 = B("b05").start, B6 = B("b06").start, B7 = B("b07").start;
    const B8 = B("b08").start, B9 = B("b09").start, B10 = B("b10").start, B11 = B("b11").start, B12 = B("b12").start, B13 = B("b13").start;
    void B1; void B4; void B5;

    // ------------------------------------------------------------ actors
    const pup = puppet({ id: "br-p", x: 40, y: 718, s: 0.35, jacket: "earth-1", tunic: "earth-1" });
    const her = heron({ id: "br-h", x: 880, y: 1160, s: 0.9, flip: true });
    const carA = car({ id: "br-car", x: -120, y: 704, s: 2.4 });

    // initial states that differ from the tracker defaults
    T.init("#br-preview", "o", 1); T.init("#br-p", "o", 1); T.init("#br-sunW", "o", 1); T.init("#br-pile", "o", 1);
    T.init("#br-ring1", "o", 1); T.init("#br-cen1", "o", 0); T.init("#br-heronWaterFront", "o", 1); T.init("#br-convoy", "o", 1);
    T.init("#br-slabFall", "o", 1); T.init("#br-slabFall", "t", "translate(0 0)");
    T.init("#br-slabL", "t", tf({ x: -1100 })); T.init("#br-slabR", "t", tf({ x: -1100 }));
    for (let k = 0; k < NSTONE; k++) { T.init(`#br-v1d-${k}`, "o", 1); T.init(`#br-v2d-${k}`, "o", 1); }
    T.init("#br-water", "t", tf({ py: 1200 })); T.init("#br-waterIn", "t", tf({ py: 1200 })); T.init("#br-mudIn", "t", tf({ py: 1272 }));
    T.init("#br-floodBack", "t", tf({ py: 1200, sy: 0 })); T.init("#br-clay", "t", tf({ py: 1268, sy: 0 })); T.init("#br-pier", "t", tf({ py: 1270, sy: 0 }));
    T.init("#br-hole", "t", tf({ px: 560, py: 845, sx: 0, sy: 0 })); T.init("#br-spout", "t", tf({ py: 872, sy: 0 })); T.init("#br-cork", "t", tf({ px: 760, py: 500, sx: 0.9, sy: 0.9 }));
    T.init("#br-bridgeShake", "t", tf());
    [[900, 960], [840, 900], [780, 840], [718, 780]].forEach(([, y1], i) => T.init(`#br-fill${i}`, "t", tf({ py: y1, sy: 0 })));
    for (let i = 0; i < 2; i++) T.init(`#br-cen1-p${i}`, "t", tf({ py: 1206, sy: 0 }));

    // ------------------------------------------------------------ b01 hook: loose stones (preview), car crossing
    cam(CAM.HOOK, t0, B2 - t0, "b01", "power1.inOut");
    {
      const wLoose = w("b01", "loose"), wMort = w("b01", "mortar."), cCar = c("car-cross");
      for (const [n, C] of [[1, C1], [2, C2]]) {
        for (let k = 0; k < NSTONE; k++) {
          const m = th(k) - 6, dx = Math.cos((m * Math.PI) / 180) * 14, dy = -Math.sin((m * Math.PI) / 180) * 14;
          T.emit(`#br-pv${n}-${k}`, { attr: { transform: tr(0, 0) } }, { attr: { transform: tr(dx, dy) }, duration: 0.35, ease: "power2.out" }, wLoose);
          T.emit(`#br-pv${n}-${k}`, { attr: { transform: tr(dx, dy) } }, { attr: { transform: tr(0, 0) }, duration: 0.22, ease: "power3.in" }, wMort);
        }
        void C;
      }
      T.op(".br-pvY", 1, wLoose, 0.25); T.op(".br-pvY", 0, wMort, 0.2);
      T.flash("#br-pvJR", wMort, 0.6, 1, 0.9);
      [[0, 4], [4, -4], [-4, 0]].forEach(([a, b], i) => T.emit("#br-preview", { attr: { transform: tr(a, 0) } }, { attr: { transform: tr(b, 0) }, duration: 0.07, ease: "none" }, wMort + 0.2 + 0.07 * i));
      const dc = B2 - 0.35 - cCar;
      T.emit("#br-car", { attr: { transform: "translate(-120 704) scale(2.4)" } }, { attr: { transform: "translate(1180 704) scale(2.4)" }, duration: r3(dc), ease: "none" }, cCar);
      for (const [wid, cx] of [["br-car-w0", 14], ["br-car-w1", 50]]) T.emit(`#${wid}`, { attr: { transform: `rotate(0 ${cx} -6)` } }, { attr: { transform: `rotate(1440 ${cx} -6)` }, duration: r3(dc), ease: "none" }, cCar);
      T.op("#br-preview", 0, B2 - 0.35, 0.4);
    }

    // ------------------------------------------------------------ b02 attempt: the slab
    {
      const cSl = c("slab-place"), cSag = c("slab-sag"), cCr = c("ghost-slab-crack"), R2 = B3 - 0.25;
      T.tf("#br-slabL", tf(), cSl, 1.2, "power2.out"); T.tf("#br-slabR", tf(), cSl, 1.2, "power2.out");
      pup.act("push", cSl, 1.2, 0.5); pup.move(70, 718, cSl, 1.2); pup.pose("stand", cSl + 1.2);
      T.tf("#br-slabL", tf({ r: 2.5, px: 96, py: 718 }), cSag, 0.6, "sine.inOut"); T.tf("#br-slabR", tf({ r: -2.5, px: 1024, py: 718 }), cSag, 0.6, "sine.inOut");
      const wBelly = w("b02", "belly");
      fa({ id: "br-fa2", tone: "red", mode: "stretch", path: [[400, 752], [720, 752]], count: 2, len: 52, width: 10, gap: 20, at: wBelly, dur: cCr + 0.2 - wBelly, period: 1.0 });
      T.op("#br-crackLine", 1, cCr, 0.08); veil(0.14, cCr);
      T.tf("#br-slabL", tf({ r: 38, px: 96, py: 718 }), cCr + 0.1, 0.45, "power2.in"); T.tf("#br-slabR", tf({ r: -38, px: 1024, py: 718 }), cCr + 0.1, 0.45, "power2.in");
      T.tf("#br-slabFall", tr(0, 260), cCr + 0.55, 0.35, "power1.in"); T.op("#br-slabFall", 0, cCr + 0.55, 0.35, "power1.in");
      spl("br-spl1", 330, 1110, cCr + 0.6); spl("br-spl2", 790, 1110, cCr + 0.6);
      pup.act("shiver", cCr + 0.2, 0.9, 0.3); pup.pose("stand", cCr + 1.15);
      her.face("right", cCr + 0.15); her.pose("fly", cCr + 0.15, 0.15); her.flap(cCr + 0.15, 1.3, 0.25); her.move(1200, 420, cCr + 0.15, 1.3, "power1.in");
      T.op("#br-heronWaterFront", 0, cCr + 0.15, 0.2);
      veil(0, R2, 0.3);
    }

    // ------------------------------------------------------------ b03 step 1: dry footing
    {
      T.op("#br-p", 0, B3, 0.25); pup.move(560, 1270, B3 + 0.3, 0.01);
      const cP = c("stones-pile"), cS = c("ghost-pier-sink"), cR = c("cofferdam-ring"), cD = c("dig-to-rock"), wPump = w("b03", "pump"), wRock = w("b03", "rock.");
      PILE_CX.forEach((cx, i) => T.emit(`#br-pile-${i}`, { attr: { transform: tf({ px: cx, py: 718, sx: 0, sy: 0 }) } }, { attr: { transform: tf({ px: cx, py: 718 }) }, duration: 0.15, ease: "back.out(1.4)" }, cP + 0.06 * i));
      cam(CAM.CLOSE, w("b03", "First,"), 1.2, "b03");
      const h = clamp(cR - cS - 0.05, 0.8, 1.3);
      T.op("#br-gPier", 1, w("b03", "mud"), 0.25);
      T.tf("#br-gPier", tf({ y: 45, r: 7, px: 560, py: 1200 }), cS, 0.7, "power1.in"); veil(0.14, cS);
      T.op("#br-gPier", 0, cS + h, 0.3); veil(0, cS + h, 0.3);
      T.op("#br-cof", 1, cR, 0.1);
      for (let i = 0; i < 4; i++) T.emit(`#br-stk${i}`, { attr: { transform: tr(0, -260) } }, { attr: { transform: tr(0, 0) }, duration: 0.25, ease: "power2.in" }, cR + 0.08 * i);
      T.op("#br-cofBack", 1, cR + 0.2, 0.3);
      T.tf("#br-clay", tf({ py: 1268 }), cR + 0.45, 0.4, "power2.out");
      T.tf("#br-waterIn", tf({ py: 1200, sy: 0 }), wPump, 0.6, "power1.in");
      const sc = (x, y) => { const p = toScreen(CAM.CLOSE, x, y); return [p.x, p.y]; };
      flow({ id: "br-pump", kind: "water", x: 0, y: 0, w: 1080, h: 1920, points: [sc(600, 1150), sc(640, 1070), sc(700, 1050)], at: wPump, dur: 0.9, width: 8 });
      T.tf("#br-mudIn", tf({ py: 1272, sy: 0 }), cD, 0.6, "power2.out");
      T.op("#br-p", 1, cD, 0.15); pup.act("dig", cD, 0.6, 0.3);
      T.flash("#br-rockLine", wRock, 0.4, 1, 1);
      pup.pose("stand", wRock + 0.25, 0.2);
      T.emit("#br-pier", { attr: { transform: tf({ py: 1270, sy: 0 }) } }, { attr: { transform: tf({ py: 1270 }) }, duration: 0.6, ease: "steps(6)" }, wRock + 0.25);
      T.op("#br-p", 0, wRock + 0.25, 0.15);
    }

    // ------------------------------------------------------------ b04 step 2: centering
    {
      const cG = c("ghost-stones-fall"), cC = c("centering-build"), h = clamp(cC - cG - 0.05, 0.8, 1.2);
      T.op("#br-gStones", 1, w("b04", "loose"), 0.2);
      for (let k = 0; k < 3; k++) {
        const [cx, cy] = stoneCentre(C1, k);
        T.emit(`#br-gst-${k}`, { attr: { transform: `${tr(0, 0)} ${rot(0, cx, cy)}` } }, { attr: { transform: `${tr(20 * k, 200)} ${rot(25 + 8 * k, cx, cy)}` }, duration: 0.55, ease: "power2.in" }, cG + 0.05 * k);
      }
      veil(0.14, cG); spl("br-spl3", 200, 1110, cG + 0.5);
      T.op("#br-gStones", 0, cG + h, 0.3); veil(0, cG + h, 0.3);
      T.op("#br-cen1", 1, cC, 0.05);
      for (let i = 0; i < 2; i++) T.tf(`#br-cen1-p${i}`, tf({ py: 1206 }), cC, 0.3, "power2.out");
      T.op("#br-cen1-b", 1, cC + 0.25, 0.2);
      for (let i = 0; i < 5; i++) T.op(`#br-cen1-s${i}`, 1, cC + 0.45 + 0.08 * i, 0.15);
      for (let i = 0; i < 6; i++) T.op(`#br-cen1-r${i}`, 1, cC + 0.85 + 0.1 * i, 0.15);
      pup.move(128, 964, cC - 0.05, 0.01); T.op("#br-p", 1, cC, 0.2); pup.pose("lift", cC + 0.2, 0.3); pup.pose("stand", cC + 1.6);
    }

    // ------------------------------------------------------------ b05 step 3: wedge stones
    {
      const cL = c("wedges-lay"), cSq = c("ghost-square-slip"), cK = c("cork-inset");
      const st = clamp((cSq - cL - 0.5) / 13, 0.08, 0.16);
      ORDER.forEach((k, i) => {
        const [dx, dy] = layOff(k, 50), t = cL + i * st;
        T.emit(`#br-v1-${k}`, { opacity: 0, attr: { transform: tr(dx, dy) } }, { opacity: 1, attr: { transform: tr(0, 0) }, duration: 0.18, ease: "power2.out" }, t);
      });
      T.op("#br-joints1", 1, cL + 13 * st + 0.1, 0.3);
      pup.act("carry", cL, Math.min(2.0, 13 * st), 0.5); pup.pose("stand", cL + Math.min(2.0, 13 * st) + 0.1);
      const h = clamp(cK - cSq - 0.6, 1.0, 1.5), sqk = range(3, 10).filter((k) => k !== KEY);
      for (const k of sqk) T.op(`#br-v1d-${k}`, 0.15, cSq, 0.2);
      T.op("#br-gSquares", 1, cSq, 0.2); veil(0.14, cSq);
      [4, 5, 6, 8, 9].forEach((k, i) => {
        const [cx, cy] = stoneCentre(C1, k);
        T.emit(`#br-gq-${i}`, { attr: { transform: `${tr(0, 0)} ${rot(0, cx, cy)}` } }, { attr: { transform: `${tr(0, 150)} ${rot(i % 2 ? -10 : 10, cx, cy)}` }, duration: 0.6, ease: "power2.in" }, cSq + 0.3);
      });
      T.op("#br-gSquares", 0, cSq + h, 0.3); for (const k of sqk) T.op(`#br-v1d-${k}`, 1, cSq + h, 0.3); veil(0, cSq + h, 0.3);
      T.op("#br-radial1", 0.85, w("b05", "wedge"), 0.4); T.op("#br-radial1", 0, B6 + 0.5, 0.3);
      T.op("#br-cork", 1, cK, 0.2); T.tf("#br-cork", tf({ px: 760, py: 500 }), cK, 0.2, "power2.out");
      T.emit("#br-cork-c", { attr: { transform: tr(0, -14) } }, { attr: { transform: tr(0, 0) }, duration: 0.3, ease: "power2.in" }, cK + 0.25);
      T.op("#br-cork-a", 1, cK + 0.55, 0.2);
      T.op("#br-cork", 0, B6 + 0.9, 0.25);
    }

    // ------------------------------------------------------------ b06 step 4: keystone
    {
      cam(CAM.KEY, B6, 1.2, "b06");
      const cG = c("gap-highlight"), cD = c("keystone-drop"), cL = c("ring-lock");
      for (let i = 0; i < 3; i++) { T.op("#br-gapY", 1, cG + 0.6 * i, 0.3); T.op("#br-gapY", 0.4, cG + 0.6 * i + 0.3, 0.3); }
      T.op("#br-gapY", 0, cD + 0.3, 0.2);
      T.op("#br-crane", 1, cG, 0.3);
      T.op("#br-ks1Drop", 1, cG + 0.6, 0.25);
      const lower = Math.max(0.3, cD - (cG + 0.6));
      T.emit("#br-ks1Drop", { attr: { transform: tr(0, -70) } }, { attr: { transform: tr(0, -36) }, duration: r3(lower), ease: "sine.inOut" }, cG + 0.6);
      T.emit("#br-rope", { attr: { y2: 668 } }, { attr: { y2: 702 }, duration: r3(lower), ease: "sine.inOut" }, cG + 0.6);
      T.emit("#br-ks1Drop", { attr: { transform: tr(0, -36) } }, { attr: { transform: tr(0, 0) }, duration: 0.3, ease: "power2.in" }, cD);
      T.emit("#br-ks1Drop", { attr: { transform: tr(0, 0) } }, { attr: { transform: tr(0, -4) }, duration: 0.06, ease: "power1.out" }, cD + 0.3);
      T.emit("#br-ks1Drop", { attr: { transform: tr(0, -4) } }, { attr: { transform: tr(0, 0) }, duration: 0.06, ease: "power1.in" }, cD + 0.36);
      T.emit("#br-rope", { attr: { y2: 702 } }, { attr: { y2: 738 }, duration: 0.3, ease: "power2.in" }, cD);
      T.op("#br-rope", 1, cD, 0.01); T.op("#br-rope", 0, cD + 0.6, 0.2);
      T.op("#br-crane", 0, B7, 0.3);
      for (let k = 0; k < NSTONE; k++) {
        if (k === KEY) continue;
        const t = cL + 0.05 * Math.abs(k - KEY);
        T.op(`#br-ring1Y-${k}`, 1, t, 0.12); T.op(`#br-ring1Y-${k}`, 0.25, t + 0.12, 0.25); T.op(`#br-ring1Y-${k}`, 0, B7 + 0.2, 0.3);
      }
    }

    // ------------------------------------------------------------ b07 threat: strike the frame
    {
      light("day", "tense", B7, 0.8, "b07"); cam(CAM.CLOSE, B7, 1.0, "b07");
      const cS = c("frame-strike"), cE = c("ghost-early-collapse"), cA = c("arch-stands"), wAfter = w("b07", "After");
      pup.act("knock", cS, 1.0, 0.4); pup.pose("stand", cS + 1.05);
      for (const t of [cS + 0.2, cS + 0.6]) { L.push(`tl.fromTo("#br-cen1-w", {x:0}, {x:4, duration:0.1, ease:"none", immediateRender:false}, ${r3(t)});`); L.push(`tl.to("#br-cen1-w", {x:0, duration:0.1, ease:"none"}, ${r3(t + 0.1)});`); }
      const h = clamp(cA - cE - 1.0, 1.0, 2.0);
      for (const s of ["#br-ring1", "#br-ks1Drop", "#br-cen1"]) T.op(s, 0.15, cE, 0.2);
      T.op("#br-gCollapse", 1, cE, 0.15); veil(0.14, cE);
      [...range(0, 6), ...range(8, 14)].forEach((k) => {
        const [cx, cy] = stoneCentre(C1, k), m = ((th(k) - 6) * Math.PI) / 180, sn = Math.sin(m), cs = Math.cos(m);
        T.emit(`#br-gc-${k}`, { attr: { transform: `${tr(0, 0)} ${rot(0, cx, cy)}` } }, { attr: { transform: `${tr(-40 * cs, 60 + 160 * sn)} ${rot((k < KEY ? 1 : -1) * 25 * sn, cx, cy)}` }, duration: 0.7, ease: "power2.in" }, cE + 0.2);
      });
      spl("br-spl4", 320, 1110, cE + 0.85);
      pup.act("shiver", cE, 1.6, 0.3); pup.pose("stand", cE + 1.65);
      T.op("#br-gCollapse", 0, cE + h, 0.35); veil(0, cE + h, 0.35);
      for (const s of ["#br-ring1", "#br-ks1Drop", "#br-cen1"]) T.op(s, 1, cE + h, 0.35);
      L.push(`tl.fromTo("#br-cen1-w", {y:0}, {y:220, duration:0.8, ease:"power2.in", immediateRender:false}, ${r3(wAfter)});`);
      T.op("#br-cen1", 0, wAfter, 0.8, "power2.in");
      light("tense", "day", cA - 0.2, 0.8, "b07");
      const dur = B8 + 1.5 - cA;
      fa({ id: "br-ld7a", tone: "yellow", mode: "along", path: halfPath(C1, "L"), count: 4, len: 46, width: 10, at: cA, dur, period: 0.8 });
      fa({ id: "br-ld7b", tone: "yellow", mode: "along", path: halfPath(C1, "R"), count: 4, len: 46, width: 10, at: cA, dur, period: 0.8 });
      for (let k = 0; k < NSTONE; k++) if (k !== KEY) { T.op(`#br-ring1Y-${k}`, 0.6, cA, 0.25); T.op(`#br-ring1Y-${k}`, 0, cA + 0.25, 0.25); }
    }

    // ------------------------------------------------------------ b08 step 5: abutments
    {
      cam(CAM.WIDE, B8, 1.2, "b08");
      T.op("#br-cof", 0, B8, 0.4); T.op("#br-cofBack", 0, B8, 0.4);
      T.tf("#br-waterIn", tf({ py: 1200 }), B8, 0.4, "power1.inOut"); T.tf("#br-mudIn", tf({ py: 1272 }), B8, 0.4, "power1.inOut");
      T.op("#br-pile", 0, B8, 0.3);
      T.op("#br-p", 0, B8, 0.2); pup.move(40, 718, B8 + 0.25, 0.01); T.op("#br-p", 1, B8 + 0.6, 0.3);
      T.op("#br-cen2", 1, B8 + 0.3, 0.25);
      ORDER.forEach((k, i) => {
        const [dx, dy] = layOff(k, 50);
        T.emit(`#br-v2-${k}`, { opacity: 0, attr: { transform: tr(dx, dy) } }, { opacity: 1, attr: { transform: tr(0, 0) }, duration: 0.15, ease: "power2.out" }, B8 + 0.5 + 0.06 * i);
      });
      T.emit("#br-ks2Drop", { opacity: 0, attr: { transform: tr(0, -40) } }, { opacity: 1, attr: { transform: tr(0, 0) }, duration: 0.15, ease: "power2.in" }, B8 + 0.5 + 0.06 * ORDER.length);
      T.op("#br-joints2", 1, B8 + 1.5, 0.3);
      L.push(`tl.fromTo("#br-cen2-w", {y:0}, {y:220, duration:0.6, ease:"power2.in", immediateRender:false}, ${r3(B8 + 1.9)});`);
      T.op("#br-cen2", 0, B8 + 1.9, 0.6, "power2.in");

      const cT = c("thrust-arrows"), cG = c("ghost-spread"), cA = c("abutment-build"), wSo = w("b08", "So"), wEach = w("b08", "each"), wDay = w("b08", "day");
      [["br-t1", [[160, 905], [70, 905]]], ["br-t2", [[480, 905], [555, 905]]], ["br-t3", [[640, 905], [565, 905]]], ["br-t4", [[960, 905], [1050, 905]]]]
        .forEach(([id, path]) => fa({ id, tone: "yellow", mode: "along", path, count: 1, len: 64, width: 12, period: 1.0, at: cT, dur: B9 - 0.1 - cT }));
      const h = clamp(wSo - cG - 0.2, 1.0, 1.8);
      const dim = [...range(0, 6).map((k) => `#br-v1d-${k}`), "#br-ks1Drop", ...range(8, 14).map((k) => `#br-v2d-${k}`), "#br-ks2Drop"];
      for (const s of dim) T.op(s, 0.15, cG, 0.2);
      T.op("#br-gSpread", 1, cG, 0.15); veil(0.14, cG);
      const kc1 = stoneCentre(C1, KEY), kc2 = stoneCentre(C2, KEY);
      T.tf("#br-gsL", tf({ x: -30, r: -6, px: 108, py: 960 }), cG + 0.15, 0.7, "power2.in");
      T.tf("#br-gsR", tf({ x: 30, r: 6, px: 1012, py: 960 }), cG + 0.15, 0.7, "power2.in");
      T.tf("#br-gsK1", tf({ y: 70, r: 5, px: kc1[0], py: kc1[1] }), cG + 0.15, 0.7, "power2.in");
      T.tf("#br-gsK2", tf({ y: 70, r: 5, px: kc2[0], py: kc2[1] }), cG + 0.15, 0.7, "power2.in");
      T.op("#br-gSpread", 0, cG + h, 0.35); veil(0, cG + h, 0.35); for (const s of dim) T.op(s, 1, cG + h, 0.35);
      for (let i = 0; i < 5; i++) for (const sd of ["L", "R"]) T.emit(`#br-ab${sd}-c${i}`, { opacity: 0, attr: { transform: tr(0, 20) } }, { opacity: 1, attr: { transform: tr(0, 0) }, duration: 0.18, ease: "power2.out" }, wEach + 0.14 * i);
      for (const sd of ["L", "R"]) { T.op(`#br-abut${sd}Y`, 1, cA, 0.25); T.op(`#br-abut${sd}Y`, 0.35, cA + 0.25, 0.25); T.op(`#br-abut${sd}Y`, 0, B9, 0.3); }
      T.op("#br-spanDim", 1, wDay, 0.2); T.op("#br-spanDim", 0, cG - 0.05 - 0.2, 0.2);
    }

    // ------------------------------------------------------------ b09 step 6: flat road
    {
      const cF = c("fill-rise"), wFlat = w("b09", "flat"), cQ = c("squeeze-arrows");
      [960, 900, 840, 780].forEach((y1, i) => T.tf(`#br-fill${i}`, tf({ py: y1 }), cF + 0.4 * i, 0.45, "power1.out"));
      T.op("#br-paving", 1, wFlat, 0.3); T.op("#br-parapet", 1, wFlat + 0.2, 0.3);
      pup.move(40, 704, wFlat + 0.1, 0.2);
      const dur = B10 - 0.1 - cQ;
      flow({ id: "br-sq1", kind: "load", dir: "down", x: 150, y: 600, w: 340, h: 110, count: 3, at: cQ, dur });
      flow({ id: "br-sq2", kind: "load", dir: "down", x: 630, y: 600, w: 340, h: 110, count: 3, at: cQ, dur });
      [["br-ld9a", C1, "L"], ["br-ld9b", C1, "R"], ["br-ld9c", C2, "L"], ["br-ld9d", C2, "R"]]
        .forEach(([id, C, sd]) => fa({ id, tone: "yellow", mode: "along", path: halfPath(C, sd), count: 3, len: 40, width: 9, period: 0.8, at: cQ, dur }));
      for (const j of ["#br-joints1", "#br-joints2"]) L.push(`tl.fromTo("${j}", {strokeWidth:5}, {strokeWidth:1.5, duration:0.6, ease:"power1.inOut", immediateRender:false}, ${r3(cQ + 0.3)});`);
    }

    // ------------------------------------------------------------ b10 step 7: flood hole
    {
      light("day", "overcast", B10, 1.0, "b10"); T.op("#br-sunW", 0.3, B10, 1.0);
      cam(CAM.FLOOD, B10, 1.0, "b10"); T.op("#br-p", 0, B10, 0.2);
      const cF = c("flood-push"), cS = c("ghost-shove"), cH = c("pier-hole"), cT = c("flood-through");
      T.tf("#br-water", tf({ py: 1200, sy: 2.444 }), cF, 0.8, "power1.out"); T.op("#br-waterBrown", 0.85, cF, 0.8);
      T.tf("#br-floodBack", tf({ py: 1200, sy: 1 }), cF, 0.8, "power1.out");
      fa({ id: "br-fp1", tone: "red", mode: "along", path: [[330, 940], [480, 940]], count: 2, len: 56, width: 12, period: 0.8, at: cF + 0.3, dur: cH + 0.3 - (cF + 0.3) });
      fa({ id: "br-fp2", tone: "red", mode: "along", path: [[790, 940], [640, 940]], count: 2, len: 56, width: 12, period: 0.8, at: cF + 0.3, dur: cH + 0.3 - (cF + 0.3) });
      const h = clamp(cH - cS - 0.15, 0.8, 1.4);
      for (let i = 0; i < 6; i++) T.tf("#br-bridgeShake", tf({ x: i % 2 ? -8 : 8, r: i % 2 ? -0.6 : 0.6, px: 560, py: 1270 }), cS + 0.13 * i, 0.13, "none");
      T.op("#br-cracksR", 1, cS + 0.3, 0.15); veil(0.14, cS);
      T.tf("#br-bridgeShake", tf(), cS + h, 0.3, "power2.out"); T.op("#br-cracksR", 0, cS + h, 0.3); veil(0, cS + h, 0.3);
      T.op("#br-hole", 1, cH, 0.05); T.tf("#br-hole", tf({ px: 560, py: 845 }), cH, 0.35, "back.out(1.4)");
      for (let k = 0; k < 10; k++) T.op(`#br-hr-${k}`, 1, cH + 0.03 * k, 0.15);
      T.op("#br-holeWater", 1, cH + 0.35, 0.2);
      T.tf("#br-floodBack", tf({ py: 1200, sy: 0.947 }), cH + 0.3, 0.6, "power1.inOut");
      T.op("#br-spout", 1, cT, 0.05); T.tf("#br-spout", tf({ py: 872 }), cT, 0.35, "power2.out");
      const dur = B11 - 0.1 - cT;
      flow({ id: "br-ft1", kind: "water", x: 0, y: 0, w: 1080, h: 1920, points: [[560, 858], [566, 900], [570, 955]], width: 8, at: cT, dur });
      flow({ id: "br-ft2", kind: "water", x: 0, y: 0, w: 1080, h: 1920, points: [[300, 845], [310, 900], [330, 960]], width: 8, at: cT, dur });
      flow({ id: "br-ft3", kind: "water", x: 0, y: 0, w: 1080, h: 1920, points: [[820, 845], [810, 900], [790, 960]], width: 8, at: cT, dur });
    }

    // ------------------------------------------------------------ b11 climax
    {
      light("overcast", "tense", B11, 0.8, "b11"); cam(CAM.WIDE, B11, 1.0, "b11");
      const cR = c("flood-roar"), cC = c("carts-cross"), cH = c("heron-land");
      T.op("#br-storm", 1, B11, 0.8); T.op("#br-sunW", 0, B11, 0.5);
      RN = rain({ id: "br-rain", at: B11, dur: cH + 0.6 - B11 });
      S.push(RN.tl); T.op("#br-rain", 0.7, B11, 0.4);
      T.tf("#br-water", tf({ py: 1200, sy: 2.611 }), cR, 0.6, "power1.out"); T.tf("#br-floodBack", tf({ py: 1200, sy: 0.974 }), cR, 0.6, "power1.out");
      const n = Math.floor((B12 - (cR + 0.6)) / 0.6);
      for (let i = 0; i < n; i++) {
        T.tf("#br-water", tf({ y: -4, py: 1200, sy: 2.611 }), cR + 0.6 + 0.6 * i, 0.3, "sine.inOut");
        T.tf("#br-water", tf({ py: 1200, sy: 2.611 }), cR + 0.9 + 0.6 * i, 0.3, "sine.inOut");
      }
      const fdur = B12 - 0.1 - cR;
      [["br-fr1", [[560, 858], [566, 900], [570, 955]]], ["br-fr2", [[300, 845], [310, 900], [330, 960]]], ["br-fr3", [[820, 845], [810, 900], [790, 960]]]]
        .forEach(([id, points]) => flow({ id, kind: "water", x: 0, y: 0, w: 1080, h: 1920, points, width: 8, at: cR, dur: fdur }));
      const dc = cH - 0.2 - cC;
      T.emit("#br-convoy", { attr: { transform: "translate(-220 704)" } }, { attr: { transform: "translate(1000 704)" }, duration: r3(dc), ease: "power1.out" }, cC);
      for (const id of ["br-cv-c1-wheel", "br-cv-c2-wheel"]) T.emit(`#${id}`, { attr: { transform: "rotate(0 0 -16)" } }, { attr: { transform: "rotate(1080 0 -16)" }, duration: r3(dc), ease: "power1.out" }, cC);
      for (const id of ["br-cv-o1-body", "br-cv-o2-body"]) L.push(`tl.fromTo("#${id}", {y:0}, {y:-2, duration:0.2, ease:"sine.inOut", repeat:${Math.max(1, 2 * Math.floor(dc / 0.4) - 1)}, yoyo:true, immediateRender:false}, ${r3(cC)});`);
      pup.move(-170, 704, cC - 0.1, 0.01); T.op("#br-p", 1, cC - 0.1, 0.2);
      pup.act("walk", cC, dc, 0.4); pup.move(1050, 704, cC, dc, "power1.out"); pup.pose("stand", cC + dc);
      [["br-ld11a", C1, "L"], ["br-ld11b", C1, "R"], ["br-ld11c", C2, "L"], ["br-ld11d", C2, "R"]]
        .forEach(([id, C, sd]) => fa({ id, tone: "yellow", mode: "along", path: halfPath(C, sd), count: 3, len: 40, width: 9, period: 1.0, at: cC, dur: B12 - 0.1 - cC }));
      her.move(1180, 380, cH - 1.05, 0.01); her.face("left", cH - 1.05);
      her.pose("fly", cH - 1.0, 0.15); her.flap(cH - 1.0, 1.0, 0.25); her.move(320, 682, cH - 1.0, 1.0, "power2.out"); her.pose("stand", cH, 0.2);
      light("tense", "day", cH, Math.min(1.0, nx("b11") - cH - 0.05), "b11");
      T.op("#br-rain", 0, cH, 0.6); T.op("#br-storm", 0, cH, 0.6); T.op("#br-sunW", 1, cH, 0.6);
    }

    // ------------------------------------------------------------ b12 recap
    {
      cam(CAM.RECAP, B12, 0.5, "b12");
      T.tf("#br-water", tf({ py: 1200 }), B12, 0.8, "power1.inOut"); T.op("#br-waterBrown", 0, B12, 0.8); T.tf("#br-floodBack", tf({ py: 1200, sy: 0 }), B12, 0.8, "power1.inOut"); T.op("#br-spout", 0, B12, 0.8);
      T.op("#br-convoy", 0, B12, 0.4); T.op("#br-p", 0, B12, 0.2); pup.move(40, 704, B12 + 0.5, 0.01);
      for (let k = 0; k < 7; k++) { const tk = B12 + 0.3 + 0.3 * k; T.op(`#br-rc${k}`, 1, tk, 0.15); T.op(`#br-rc${k}`, 0.35, tk + 0.15, 0.2); }
    }

    // ------------------------------------------------------------ b13 ending
    {
      cam(CAM.WIDE, B13, 0.8, "b13"); light("day", "sunset", B13, 1.2, "b13");
      T.tf("#br-sunW", tr(0, 140), B13, D - B13, "none");
      for (let k = 0; k < 7; k++) T.op(`#br-rc${k}`, 0, B13, 0.3);
      T.op("#br-p", 1, B13, 0.3);
      T.op("#br-ks1Y2", 1, B13 + 0.8, 0.25); T.op("#br-ks1Y2", 0.5, B13 + 1.05, 0.25);
    }

    // sky drift
    L.push(`tl.fromTo("#br-cloudsA", {x:0}, {x:80, duration:${r3(D)}, ease:"none", immediateRender:false}, 0);`);
    L.push(`tl.fromTo("#br-cloudsB", {x:0}, {x:80, duration:${r3(D)}, ease:"none", immediateRender:false}, 0);`);

    // ------------------------------------------------------------ assemble (z-order back → front)
    const r1 = archRing(1, C1), r2 = archRing(2, C2);
    const shakeGroup = `<g id="br-bridgeShake" transform="${tf()}">` + pierSvg() + fillSvg() + parapetSvg() + holeSvg() +
      centeringSvg(1, C1, true) + centeringSvg(2, C2, false) + r1.ring + r1.ks + r1.joints + r2.ring + r2.ks + r2.joints + outlinesSvg() + cracksSvg() + `</g>`;
    const world =
      mountainsSvg() + hillsSvg() + farSlopeSvg() + treesSvg() + floodBackSvg() + bedrockSvg() + mudSvg() + cofBackSvg() + waterSvg() + banksSvg() +
      pileSvg() + gPierSvg() + cofSvg() + `<line id="br-rockLine" x1="470" y1="1270" x2="650" y2="1270" style="stroke:var(--ui-yellow);stroke-width:5;opacity:0"/>` +
      shakeGroup + ghostsSvg() + slabSvg() + craneSvg() + spoutSvg() + spanDimSvg() + abutSvg() + pavingSvg() + recapSvg() +
      convoySvg() + pup.svg + `<g id="br-heronW">${her.svg}</g>` + heronWaterFront() + previewSvg(carA.svg) + FA.join("");
    const html = stage(
      sky({ id: "br-sky", horizonY: 1000 }) +
      `<g id="br-sunW" transform="translate(0 0)">${sun({ cx: 860, cy: 330, r: 70 })}</g>` +
      `<g id="br-cloudsA">${clouds({ x: 180, y: 250, s: 1, count: 3, seed: 6 })}</g><g id="br-cloudsB">${clouds({ x: 420, y: 420, s: 0.8, count: 2, seed: 4 })}</g>` +
      stormSvg() + `<g id="br-cam" transform="${camTf(CAM.WIDE)}">${world}</g>` + RN.svg + corkSvg() +
      `<rect id="br-veilRed" x="0" y="0" width="1080" height="1920" style="fill:var(--ui-red);opacity:0"/>`,
    ) + FLOW.join("");

    // ------------------------------------------------------------ anchors / overlays
    const slot = { card: { x: 400, y: 400 }, width: 540 };
    const sc = (cm, x, y) => toScreen(cm, x, y);
    const anchors = {
      cofferdam: { ...slot, target: sc(CAM.CLOSE, 458, 1090), at: c("cofferdam-ring") + 0.6 },
      centering: { ...slot, target: sc(CAM.CLOSE, 320, 798), at: c("centering-build") + 0.8 },
      voussoir: { ...slot, target: sc(CAM.CLOSE, 178.1, 832.2), at: w("b05", "wider"), until: c("cork-inset") - 0.05 },
      keystone: { ...slot, target: sc(CAM.KEY, 320, 759), at: w("b06", "keystone.") },
      abutment: { ...slot, target: sc(CAM.WIDE, 60, 880), at: w("b08", "massive") },
      "flood-hole": { ...slot, target: sc(CAM.FLOOD, 560, 845), at: c("pier-hole") + 0.4 },
      span: { x: 320, y: 1040, at: w("b08", "day"), until: c("ghost-spread") - 0.05 },
      title: { x: 540, y: 520, at: B13 + 0.3, maxWidth: 900, max: 64 },
    };
    const overlays = {
      b03: { stepAt: c("cofferdam-ring") },
      b07: { meter: [{ t: c("ghost-early-collapse"), value: 45 }, { t: c("arch-stands") }] },
      b08: { stepAt: w("b08", "So"), meter: [{ t: c("abutment-build") }] },
      b10: { stepAt: c("pier-hole"), meter: [{ t: c("ghost-shove"), value: 75 }, { t: c("pier-hole") + 0.3 }] },
      b11: { stepAt: w("b11", "Not") },
    };
    const tl = [...L, ...S, pup.tl(), her.tl()].join("\n");
    return { html, tl, anchors, overlays };
  },
};

export const scenes = [bridge];

export const extras = [
  {
    id: "recap", from: "b12", to: "b12",
    render(ctx) {
      const items = ctx.script.beats.filter((b) => b.type === "step").map((b) => b.onScreen.stepPlate);
      const r = RecapPills({ id: "ex-recap-p", items, x0: 80, y0: 450, colW: 860, rowH: 62, cols: 1, at: ctx.t0 + 0.3, step: 0.25, dur: ctx.dur - 0.3 });
      if (r.overflow) console.warn("WARN: recap pill text overflow — shorten the step plate strings");
      return { html: r.html, css: r.css, tl: r.tl };
    },
  },
];
