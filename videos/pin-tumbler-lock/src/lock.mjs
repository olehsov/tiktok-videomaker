// Pin tumbler lock: geometry, side cut-away drawing, tween tracker (lift / ride / flash) and props.
// Palette tokens only. All times are passed in by the scenes (derived from timings).
import { poly, shade, tint, tf, f, pts, ghost } from "../kit/lowpoly.mjs";

export const r3 = (n) => Math.round(n * 1000) / 1000;
export const J = JSON.stringify;
export const SEAM = 1010;
export const PX = [300, 420, 540, 660, 780];
export const KL = [62, 92, 50, 80, 70];
export const TIP = 1125;
export const KT = KL.map((l) => TIP - l);
export const DT = KT.map((k) => k - 100);
export const SL = DT.map((d) => d - 820);
export const DL = KT.map((k) => k - SEAM); // correct lift per pin
export const V = DL.map((d) => TIP - d); // correct key valleys
export const VWRONG = V.map((v, i) => (i === 3 ? 1070 : v));
export const BOLT = { x0: 870, x1: 1070, y0: 1130, y1: 1180 };
export const CAM = { x: 875, y: 1090 };
export const ORDER = [2, 1, 0, 3, 4];

const rect = (x0, y0, x1, y1, fill, extra = "") => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, extra);
const outline = (points, color, w = 4) => `<polygon points="${pts(points)}" style="fill:none;stroke:${color};stroke-width:${w};stroke-linejoin:round"/>`;

// ---- shapes relative to the pin centre x
export const kpFlatPts = (x, i) => [[x - 18, KT[i]], [x + 18, KT[i]], [x + 18, TIP], [x - 18, TIP]];
export const kpRoundPts = (x, i) => [[x - 18, KT[i]], [x + 18, KT[i]], [x + 18, TIP - 14], [x + 10, TIP - 3], [x, TIP], [x - 10, TIP - 3], [x - 18, TIP - 14]];
const kpRoundHalf = (x, i) => [[x, KT[i]], [x + 18, KT[i]], [x + 18, TIP - 14], [x + 10, TIP - 3], [x, TIP]];
export const drvPts = (x, i) => [[x - 18, DT[i]], [x + 18, DT[i]], [x + 18, KT[i]], [x - 18, KT[i]]];
export const spoolPts = (x, i) => { const t = DT[i]; return [[x - 18, t], [x + 18, t], [x + 18, t + 26], [x + 9, t + 34], [x + 9, t + 66], [x + 18, t + 74], [x + 18, t + 100], [x - 18, t + 100], [x - 18, t + 74], [x - 9, t + 66], [x - 9, t + 34], [x - 18, t + 26]]; };
const spoolHalf = (x, i) => { const t = DT[i]; return [[x, t], [x + 18, t], [x + 18, t + 26], [x + 9, t + 34], [x + 9, t + 66], [x + 18, t + 74], [x + 18, t + 100], [x, t + 100]]; };

// ---- key
export function keyTop(Vs) {
  const p = [[150, 1048]];
  PX.forEach((x, i) => { const v = Vs[i], s = (v - 1048) * 0.7; p.push([x - 10 - s, 1048], [x - 10, v], [x + 10, v], [x + 10 + s, 1048]); });
  p.push([800, 1048], [840, 1110]);
  return p;
}
/** blade top y at key-local x (Infinity outside the blade) */
export function profileY(Vs, xl) {
  if (xl < 150 || xl > 840) return Infinity;
  const p = keyTop(Vs);
  for (let k = 0; k + 1 < p.length; k++) {
    const [x0, y0] = p[k], [x1, y1] = p[k + 1];
    if (xl >= x0 && xl <= x1) return x1 === x0 ? Math.min(y0, y1) : y0 + ((xl - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 1048;
}
export const liftAt = (Vs, ox, i) => Math.max(0, TIP - profileY(Vs, PX[i] - ox));

/** key group (translate(ox 0)); mode "brass-less steel" or the magpie's shiny one */
export function keySvg(id, Vs, { shiny = false } = {}) {
  const blade = [[150, 1152], ...keyTop(Vs), [840, 1152]];
  const bow = [[50, 1050], [130, 1050], [150, 1070], [150, 1150], [130, 1170], [50, 1170], [30, 1150], [30, 1070]];
  const base = shiny ? "var(--snow)" : tint("stone", 45), low = shiny ? tint("stone", 30) : tint("stone", 30), bowC = shiny ? "var(--snow)" : tint("stone", 38);
  return `<g id="${id}" transform="translate(-900 0)" style="opacity:0">` +
    poly(blade, base) + rect(150, 1120, 840, 1152, low) + poly(bow, bowC) +
    `<circle cx="90" cy="1110" r="14" style="fill:${shade("earth-3", 30)}"/>` +
    (shiny ? poly([[50, 1062], [90, 1058], [70, 1082]], tint("snow", 60)) + poly([[300, 1060], [340, 1056], [320, 1070]], tint("snow", 60)) : "") +
    `<g id="${id}Red" style="opacity:0">${poly(blade, "var(--ui-red)")}</g></g>`;
}

// ---- the lock
export function lockSvg(id, { state = "empty" } = {}) {
  const fin = state === "final";
  const O = (v) => `style="opacity:${v}"`;
  const bolt = `<g id="${id}-bolt" transform="translate(0 0)">${rect(BOLT.x0, BOLT.y0, BOLT.x1, BOLT.y1, tint("stone", 8))}${rect(BOLT.x0, BOLT.y0, BOLT.x1, BOLT.y0 + 15, tint("stone", 25))}</g>`;
  const cam = `<g id="${id}-camL" transform="${tf({ px: CAM.x, py: CAM.y })}"><circle cx="${CAM.x}" cy="${CAM.y}" r="28" style="fill:${shade("stone", 10)}"/>${poly([[875, 1090], [905, 1120], [895, 1135], [870, 1110]], shade("stone", 18))}</g>`;
  const shell = rect(180, 800, 860, 1010, shade("stone", 22)) + rect(656, 800, 860, 1010, shade("stone", 30)) + rect(180, 800, 860, 816, tint("stone", 5)) +
    rect(180, 1170, 860, 1200, shade("stone", 22)) + rect(656, 1170, 860, 1200, shade("stone", 30));
  const plug = rect(180, 1010, 860, 1170, tint("stone", 28)) + rect(180, 1120, 860, 1170, tint("stone", 15)) + rect(150, 990, 180, 1190, tint("stone", 12));
  const keyway = rect(150, 1040, 860, 1160, shade("earth-3", 25));
  let holes = "", springs = "", stacks = "", axes = "";
  PX.forEach((x, i) => {
    const sp = [[x, 820]];
    for (let j = 0; j < 9; j++) sp.push([x + (j % 2 ? 14 : -14), 820 + (j + 0.5) * (SL[i] / 9)]);
    sp.push([x, DT[i]]);
    const spoly = (stroke, extra = "") => `<polyline points="${pts(sp)}" style="fill:none;stroke:${stroke};stroke-width:4;stroke-linejoin:round;stroke-linecap:round" ${extra}/>`;
    holes +=
      `<g id="${id}-hole${i}" transform="${tf({ px: x, py: 820, sy: fin ? 1 : 0.02 })}" ${O(fin ? 1 : 0)}>` +
      `<g id="${id}-up${i}" transform="translate(0 0)">${rect(x - 22, 820, x + 22, SEAM, shade("earth-3", 35))}` +
      `<g id="${id}-sp${i}" transform="${tf({ px: x, py: 820 })}" ${O(fin ? 1 : 0)}>${spoly("var(--snow)")}</g>` +
      (fin ? `<g id="${id}-spY${i}" style="opacity:0">${spoly("var(--ui-yellow)")}</g>` : "") + `</g>` +
      rect(x - 22, SEAM, x + 22, 1040, shade("earth-3", 35)) + `</g>`;
    const pin2 = i === 2 && !fin;
    const half = (pp) => poly(pp, shade("sand", 14));
    stacks +=
      `<g id="${id}-st${i}" transform="translate(0 0)" ${O(fin ? 1 : 0)}>` +
      (pin2 ? `<g id="${id}-st${i}-oneP">${poly([[x - 18, DT[i]], [x + 18, DT[i]], [x + 18, KT[i]], [x - 18, KT[i]]], "var(--sand)")}${half([[x, DT[i]], [x + 18, DT[i]], [x + 18, KT[i]], [x, KT[i]]])}</g>` : "") +
      `<g id="${id}-st${i}-drv" transform="translate(0 0)" ${O(pin2 || fin ? 0 : 1)}>${poly(drvPts(x, i), tint("stone", 8))}${poly([[x, DT[i]], [x + 18, DT[i]], [x + 18, KT[i]], [x, KT[i]]], shade("stone", 6))}</g>` +
      `<g id="${id}-st${i}-spool" ${O(fin ? 1 : 0)}>${poly(spoolPts(x, i), tint("stone", 8))}${poly(spoolHalf(x, i), shade("stone", 6))}</g>` +
      `<g id="${id}-st${i}-kpFlat" ${O(fin ? 0 : 1)}>${poly(kpFlatPts(x, i), "var(--sand)")}${half([[x, KT[i]], [x + 18, KT[i]], [x + 18, TIP], [x, TIP]])}</g>` +
      `<g id="${id}-st${i}-kpRound" ${O(fin ? 1 : 0)}>${poly(kpRoundPts(x, i), "var(--sand)")}${half(kpRoundHalf(x, i))}</g>` +
      `<line id="${id}-st${i}-split" x1="${x - 18}" y1="${KT[i]}" x2="${x + 18}" y2="${KT[i]}" style="stroke:${shade("earth-3", 30)};stroke-width:3;opacity:${pin2 ? 0 : 1}"/>` +
      `<g id="${id}-st${i}-kpRed" style="opacity:0">${poly(kpRoundPts(x, i), "var(--ui-red)")}</g>` +
      `<g id="${id}-st${i}-drvRed" style="opacity:0">${poly(drvPts(x, i), "var(--ui-red)")}</g>` +
      `<g id="${id}-st${i}-spoolRed" style="opacity:0">${poly(spoolPts(x, i), "var(--ui-red)")}</g>` +
      `<g id="${id}-st${i}-kpY" style="opacity:0">${outline(kpRoundPts(x, i), "var(--ui-yellow)")}</g>` +
      `<g id="${id}-st${i}-drvY" style="opacity:0">${outline(drvPts(x, i), "var(--ui-yellow)")}</g>` +
      `<g id="${id}-st${i}-stY" style="opacity:0">${outline([[x - 21, DT[i] - 3], [x + 21, DT[i] - 3], [x + 21, TIP + 3], [x - 21, TIP + 3]], "var(--ui-yellow)")}</g>` +
      `<g id="${id}-st${i}-wY" style="opacity:0">${outline([[x - 14, DT[i] + 28], [x + 14, DT[i] + 28], [x + 14, DT[i] + 72], [x - 14, DT[i] + 72]], "var(--ui-yellow)", 3)}</g>` +
      `</g>`;
    const ax = (cls, y0, y1) => `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" style="stroke:var(--snow);stroke-width:2;stroke-dasharray:8 6"/>`;
    axes += `<g id="${id}-axS${i}" transform="translate(0 0)" style="opacity:0">${ax("s", 830, 1160)}</g><g id="${id}-axP${i}" style="opacity:0">${ax("p", 830, 1160)}</g>`;
  });
  const seam = `<line id="${id}-seam" x1="180" y1="${SEAM}" x2="860" y2="${SEAM}" style="stroke:${shade("stone", 45)};stroke-width:2;opacity:${fin ? 1 : 0}"/>`;
  const glow = `<line id="${id}-seamGlow" x1="180" y1="${SEAM}" x2="860" y2="${SEAM}" style="stroke:var(--ui-yellow);stroke-width:5;stroke-dasharray:16 10;opacity:0"/>`;
  const red = rect(150, 800, 1070, 1200, "var(--ui-red)").replace("<polygon", `<polygon id="${id}-lockRed"`).replace('style="', 'style="opacity:0;');
  const ring = `<circle id="${id}-clickRing" cx="${CAM.x}" cy="${CAM.y}" r="20" style="fill:none;stroke:var(--ui-yellow);stroke-width:5;opacity:0"/>`;
  return `<g id="${id}-lk">${bolt}${cam}${shell}${plug}${keyway}${holes}${seam}${stacks}@@KEYS@@${axes}@@TOOLS@@${red}${glow}${ring}</g>`;
}

// ---- tween tracker: emits fromTo(prev → next) with immediateRender:false for each (selector, property) pair
export function tracker(L) {
  const st = new Map();
  const emit = (sel, from, to, at) => L.push(`tl.fromTo(${J(sel)}, ${J(from)}, ${J({ ...to, immediateRender: false })}, ${r3(at)});`);
  const lifts = PX.map(() => 0);
  const api = {
    L, emit,
    init(sel, key, v) { st.set(sel + "|" + key, v); },
    op(sel, to, at, dur = 0.3, ease = "none") {
      const k = sel + "|o", prev = st.has(k) ? st.get(k) : 0;
      st.set(k, to);
      emit(sel, { opacity: prev }, { opacity: to, duration: dur, ease }, at);
    },
    tf(sel, to, at, dur = 0.3, ease = "power2.out") {
      const k = sel + "|t", prev = st.has(k) ? st.get(k) : tf();
      st.set(k, to);
      emit(sel, { attr: { transform: prev } }, { attr: { transform: to }, duration: dur, ease }, at);
    },
    /** both opacity and transform in one tween (e.g. pop with scale) */
    lift(i, value, at, dur = 0.25, ease = "power2.out") {
      const cur = lifts[i];
      if (Math.abs(cur - value) < 0.01) return;
      lifts[i] = value;
      emit(`#${api.id}-st${i}`, { attr: { transform: `translate(0 ${f(-cur)})` } }, { attr: { transform: `translate(0 ${f(-value)})` }, duration: dur, ease }, at);
      emit(`#${api.id}-sp${i}`, { attr: { transform: tf({ px: PX[i], py: 820, sy: (SL[i] - cur) / SL[i] }) } }, { attr: { transform: tf({ px: PX[i], py: 820, sy: (SL[i] - value) / SL[i] }) }, duration: dur, ease }, at);
    },
    liftOf: (i) => lifts[i],
    /** key rides from ox0 to ox1 over dur; pins in idxs follow the profile Vs in steps */
    ride(keySel, idxs, Vs, ox0, ox1, at, dur, steps = 14) {
      api.tf(keySel, `translate(${ox1} 0)`, at, dur, "none");
      for (let k = 1; k <= steps; k++) {
        const ox = ox0 + ((ox1 - ox0) * k) / steps;
        for (const i of idxs) api.lift(i, r3(liftAt(Vs, ox, i)), at + (dur * (k - 1)) / steps, dur / steps, "none");
      }
    },
    flash(sel, color, at, hold = 0.35, peak = 0.6) {
      emit(sel, { opacity: 0 }, { opacity: peak, duration: 0.1, ease: "none" }, at);
      emit(sel, { opacity: peak }, { opacity: 0, duration: 0.15, ease: "none" }, at + hold);
    },
    /** 0 → 1 → 0 pulse */
    pulse(sel, at, up = 0.2, down = 0.2, peak = 1) {
      emit(sel, { opacity: 0 }, { opacity: peak, duration: up, ease: "none" }, at);
      emit(sel, { opacity: peak }, { opacity: 0, duration: down, ease: "none" }, at + up);
    },
  };
  api.id = "s2";
  return api;
}
export const clampEnd = (t, d, limit) => (t + d > limit ? Math.max(0.01, limit - t) : d);

// ---- props (ids are prefixed with the scene id)
const woodHandle = () => poly([[-60, 1080], [120, 1080], [120, 1130], [-60, 1130]], "var(--wood)") + poly([[30, 1080], [120, 1080], [120, 1130], [30, 1130]], shade("wood", 14));
export const screwdriver = (id) => ghost(id, `<g id="${id}-m" transform="translate(-400 0)">${woodHandle()}${rect(120, 1096, 620, 1114, tint("stone", 20))}${poly([[620, 1094], [630, 1094], [630, 1116], [620, 1116]], tint("stone", 35))}</g>`);
export const stick = (id) => ghost(id, `<g id="${id}-m" transform="translate(-500 0)"><polyline points="-200,1150 560,1130" style="fill:none;stroke:var(--wood);stroke-width:10;stroke-linecap:round"/><polyline points="120,1146 190,1100" style="fill:none;stroke:var(--wood);stroke-width:6;stroke-linecap:round"/></g>`);
export const twig = (id) => ghost(id, `<g id="${id}-m" transform="translate(-380 0)"><g id="${id}-r" transform="${tf({ px: 175, py: 1147 })}"><polyline points="175,1147 560,1130" style="fill:none;stroke:var(--wood);stroke-width:7;stroke-linecap:round"/></g></g>`);
export function drill(id) {
  let g = "";
  for (let k = 0; k < 9; k++) g += `<line x1="525" y1="${740 + k * 30}" x2="555" y2="${754 + k * 30}" style="stroke:${shade("stone", 30)};stroke-width:3"/>`;
  return `<clipPath id="${id}-clip"><rect x="525" y="720" width="30" height="300"/></clipPath>` +
    `<g id="${id}" transform="translate(0 -900)" style="opacity:0">${rect(525, 720, 555, 1020, tint("stone", 35))}${poly([[525, 1020], [555, 1020], [540, 1040]], tint("stone", 35))}` +
    `<g clip-path="url(#${id}-clip)"><g id="${id}-gr" transform="translate(0 0)">${g}</g></g></g>`;
}
const tensionShape = (c) => poly([[150, 1150], [160, 1150], [160, 1195], [150, 1195]], c) + poly([[150, 1150], [300, 1150], [300, 1158], [150, 1158]], c);
export const tensionG = (id) => ghost(id, `<g id="${id}-m" transform="translate(-300 0)">${tensionShape(tint("stone", 20))}</g>`);
export const tensionN = (id) => `<g id="${id}" style="opacity:0"><g id="${id}-m" transform="translate(-300 0)">${tensionShape(tint("stone", 20))}</g></g>`;
const pickShape = () => `<polyline points="-300,1142 318,1142 330,1128" style="fill:none;stroke:${tint("stone", 40)};stroke-width:4;stroke-linejoin:round;stroke-linecap:round"/>`;
export const pick = (id) => `<g id="${id}" transform="translate(-600 0)" style="opacity:0"><g id="${id}-n">${pickShape()}</g>` + ghost(`${id}-g`, pickShape()) + `</g>`;
export const tick = (id, x) => `<line id="${id}" x1="${x - 12}" y1="${SEAM}" x2="${x + 12}" y2="${SEAM}" style="stroke:var(--ui-yellow);stroke-width:5;stroke-linecap:round;opacity:0"/>`;
export const cutLine = (id) => `<line id="${id}" x1="516" y1="1075" x2="564" y2="1075" style="stroke:var(--snow);stroke-width:4;stroke-linecap:round;opacity:0"/>`;
/** bottle cap, centred at (0,0) */
export function bottleCap(id, x, y) {
  const star = [];
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, r = k % 2 ? 12 : 15; star.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
  return `<g id="${id}">${poly(star, shade("water", 30))}<circle cx="${x}" cy="${y}" r="10" style="fill:${shade("water", 10)}"/></g>`;
}
/** key for the s1 fan: drawn from the pivot (0,0) pointing up, 260 long */
export function fanKey(id, a) {
  const bow = [[-10, -4], [10, -4], [26, -20], [26, -40], [10, -56], [-10, -56], [-26, -40], [-26, -20]];
  const blade = [[-8, -56], [8, -56], [8, -260], [-8, -260]];
  const teeth = [[8, -120], [20, -112], [8, -104]], t2 = [[8, -150], [20, -142], [8, -134]], t3 = [[8, -180], [20, -172], [8, -164]];
  const keyP = poly(bow, tint("stone", 30)) + `<circle cx="0" cy="-30" r="9" style="fill:${shade("stone", 10)}"/>` + poly(blade, tint("stone", 30)) + poly([[0, -56], [8, -56], [8, -260], [0, -260]], shade("stone", 10)) + poly(teeth, shade("stone", 10)) + poly(t2, shade("stone", 10)) + poly(t3, shade("stone", 10));
  const ol = `<g id="${id}-ol" style="opacity:0"><polygon points="${pts(bow)}" style="fill:none;stroke:var(--ui-yellow);stroke-width:6;stroke-linejoin:round"/><polygon points="${pts(blade)}" style="fill:none;stroke:var(--ui-yellow);stroke-width:6;stroke-linejoin:round"/></g>`;
  return `<g transform="translate(540 1180) rotate(${a})"><g id="${id}w" transform="${tf()}"><g id="${id}" style="opacity:0"><g id="${id}-in" transform="${tf({ sx: 0.9, sy: 0.9 })}">${keyP}</g></g>${ol}</g></g>`;
}
