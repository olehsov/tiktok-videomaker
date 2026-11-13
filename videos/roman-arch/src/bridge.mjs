// Roman arch bridge: world geometry (river valley cut-away), camera presets, helpers. Palette tokens only.
// World units live inside one camera group #br-cam. Screen = s·world + (x, y).
import { poly, shade, tint, tf, f, prng, pts, ghost, groundShadow } from "../kit/lowpoly.mjs";
import { terrain, mountains, rocks, pineTree } from "../kit/assets/index.mjs";
import { ox, cart } from "../kit/assets/index.mjs";

export const r3 = (n) => Math.round(n * 1000) / 1000;
export const GY = 718, ROAD = 704, S = 960, WATER = 1110, MUD = 1200, ROCK = 1270;
export const C1 = [320, 960], C2 = [800, 960];
export const RI = 170, RE = 212, RM = 191, RK = 222;
export const NSTONE = 15, KEY = 7;

export const CAM = {
  WIDE: { s: 1, x: 0, y: 0 },
  HOOK: { s: 1.08, x: -64.8, y: -20.3 },
  CLOSE: { s: 1.6, x: -68, y: -576.8 },
  KEY: { s: 2.2, x: -164, y: -972 },
  FLOOD: { s: 1.3, x: -188, y: -266.6 },
  RECAP: { s: 1, x: 0, y: 180 },
};
export const camTf = (c) => tf({ x: c.x, y: c.y, sx: c.s, sy: c.s });
export const toScreen = (cam, wx, wy) => ({ x: r3(cam.s * wx + cam.x), y: r3(cam.s * wy + cam.y) });

const rad = (d) => (d * Math.PI) / 180;
/** point at radius rho and angle th (deg, 0 = right, 90 = up) around c */
export const pt = (c, rho, th) => [c[0] + rho * Math.cos(rad(th)), c[1] - rho * Math.sin(rad(th))];
const rect = (x0, y0, x1, y1, fill, extra = "") => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, extra);
const line = (x1, y1, x2, y2, stroke, w, extra = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" style="stroke:${stroke};stroke-width:${w};stroke-linecap:round" ${extra}/>`;
const mirror = (p) => p.map(([x, y]) => [1120 - x, y]);
const outlineP = (p, w, extra = "") => `<polygon points="${pts(p)}" style="fill:none;stroke:var(--ui-yellow);stroke-width:${w};stroke-linejoin:round" ${extra}/>`;
const wrapG = (id, style, inner, extra = "") => `<g ${id ? `id="br-${id}"` : ""} ${style ? `style="${style}"` : ""} ${extra}>${inner}</g>`;

// ------------------------------------------------------------ arch rings
export const th = (k) => 180 - 12 * k;
/** quad of stone k (points) with outer radius Ro */
export const stoneQuad = (c, k, Ro = RE) => [pt(c, RI, th(k)), pt(c, RI, th(k + 1)), pt(c, Ro, th(k + 1)), pt(c, Ro, th(k))];
/** radial laying offset of stone k */
export const layOff = (k, d) => off(k, d);
const off = (k, d) => { const m = th(k) - 6; return [d * Math.cos(rad(m)), -d * Math.sin(rad(m))]; };
export const stoneCentre = (c, k, rho = RM) => pt(c, rho, th(k) - 6);
export function stoneArt(c, k) {
  const key = k === KEY, Ro = key ? RK : RE;
  const fill = key ? tint("stone", 14) : k % 2 ? tint("stone", 8) : "var(--stone)";
  const bandF = key ? shade("stone", 8) : shade("stone", 12);
  const a = th(k), b = th(k + 1);
  const band = [pt(c, Ro - 12, a), pt(c, Ro - 12, b), pt(c, Ro, b), pt(c, Ro, a)];
  const hl = [pt(c, RI, a), pt(c, RM, a - 6), pt(c, Ro, a)];
  return poly(stoneQuad(c, k, Ro), fill) + poly(band, bandF) + poly(hl, tint("stone", 16), 'opacity=".5"');
}
const jointLines = (c, w, id) => {
  let s = "";
  for (let k = 1; k < NSTONE; k++) {
    const rho = k === 7 || k === 8 ? RK : RE;
    const [x1, y1] = pt(c, RI, th(k)), [x2, y2] = pt(c, rho, th(k));
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" style="stroke:${shade("stone", 45)};stroke-linecap:round"/>`;
  }
  return `<g ${id ? `id="${id}" ` : ""}style="${id ? "opacity:0;" : ""}stroke-width:${w}">${s}</g>`;
};
/** build ring n (1|2) around c: stones (laying), keystone drop group, joints */
export function archRing(n, c) {
  let stones = "";
  for (let k = 0; k < NSTONE; k++) {
    if (k === KEY) continue;
    const [dx, dy] = off(k, 50);
    stones += `<g id="br-v${n}d-${k}"><g id="br-v${n}-${k}" transform="translate(${f(dx)} ${f(dy)})" style="opacity:0">${stoneArt(c, k)}</g></g>`;
  }
  const ks = `<g id="br-ks${n}Drop" transform="translate(0 -70)" style="opacity:0"><g id="br-ks${n}">${stoneArt(c, KEY)}</g></g>`;
  return { ring: `<g id="br-ring${n}">${stones}</g>`, ks, joints: jointLines(c, 5, `br-joints${n}`) };
}
/** static finished ring for the hook preview; each stone movable (#br-pv<n>-k), with a yellow outline (class br-pvY) */
function previewRing(n, c) {
  let s = "";
  for (let k = 0; k < NSTONE; k++) {
    const Ro = k === KEY ? RK : RE;
    s += `<g id="br-pv${n}-${k}">${stoneArt(c, k)}<polygon class="br-pvY" points="${pts(stoneQuad(c, k, Ro))}" style="fill:none;stroke:var(--ui-yellow);stroke-width:5;stroke-linejoin:round;opacity:0"/></g>`;
  }
  return s;
}
export const stoneOutline = (c, k, w = 4, extra = "") => outlineP(stoneQuad(c, k, k === KEY ? RK : RE), w, extra);

/** yellow load path along the ring: from the crown to the springing, then straight down into the support */
export function halfPath(C, side) {
  const out = [];
  if (side === "L") for (let a = 90; a <= 180; a += 10) out.push(pt(C, RM, a));
  else for (let a = 90; a >= 0; a -= 10) out.push(pt(C, RM, a));
  out.push([C[0] + (side === "L" ? -RM : RM), 1050]);
  return out;
}

// ------------------------------------------------------------ polygon F (fill between rings)
export function polyF() {
  const p = [[96, 718], [1024, 718], [1012, 960]];
  for (let a = 0; a <= 180; a += 6) p.push(pt(C2, RE, a));
  p.push([532, 960]);
  for (let a = 0; a <= 180; a += 6) p.push(pt(C1, RE, a));
  p.push([108, 960], [96, 718]);
  return p;
}

// ------------------------------------------------------------ back layers
export const mountainsSvg = () => `<g transform="translate(-400 0)">${mountains({ y: 718, w: 1880, count: 7, height: 360, snow: false, token: "stone", seed: 3 })}</g>`;
export const hillsSvg = () => `<g transform="translate(-400 0)">${mountains({ y: 718, w: 1880, count: 9, height: 180, snow: false, token: "green-mid", seed: 9 })}</g>`;
/** far valley slope seen through the arch openings, between the hills and the river */
export function farSlopeSvg() {
  const r = prng(17), xs = [];
  for (let x = -400; x <= 1480; x += 120) xs.push(x);
  const base = "color-mix(in srgb, var(--green-mid) 78%, var(--sky-2))";
  let s = poly([[-400, 790], [100, 748], [420, 800], [700, 752], [1000, 800], [1480, 756], [1480, 1114], [-400, 1114]], "color-mix(in srgb, var(--green-mid) 55%, var(--sky-2))") +
    poly([[-400, 880], [200, 840], [560, 890], [900, 845], [1480, 880], [1480, 1114], [-400, 1114]], "color-mix(in srgb, var(--green-mid) 66%, var(--sky-2))");
  s += poly([[-400, 1010], [100, 940], [420, 975], [700, 930], [1000, 965], [1480, 920], [1480, 1114], [-400, 1114]], base);
  const lines = [960, 1010, 1060, 1114];
  for (let j = 0; j < lines.length - 1; j++) {
    for (let i = 0; i < xs.length - 1; i++) {
      const y0 = lines[j] + (r() - 0.5) * 30, y1 = lines[j + 1] + (r() - 0.5) * 30;
      s += poly([[xs[i], y0], [xs[i + 1], y0 + (r() - 0.5) * 20], [(xs[i] + xs[i + 1]) / 2, y1]], (i + j) % 2 ? shade(base, 10) : tint(base, 8), 'opacity=".5"');
    }
  }
  return s;
}
export const treesSvg = () => pineTree({ x: -40, y: 640, s: 0.5 }) + pineTree({ x: 1100, y: 650, s: 0.55 }) + pineTree({ x: 1160, y: 660, s: 0.45 });
export const floodBackSvg = () => `<g id="br-floodBack" transform="${tf({ py: 1200, sy: 0 })}">${rect(-400, 820, 1480, 1200, "color-mix(in srgb, var(--water) 35%, var(--earth-2))")}</g>`;

/** three bedrock strata with wavy faceted boundaries, plus rocks */
export function bedrockSvg() {
  const r = prng(31), xs = [];
  for (let x = -400; x <= 1480; x += 90) xs.push(x);
  const edge = (base, amp) => xs.map((x) => [x, base + (r() - 0.5) * amp]);
  const band = (up, lo, fill, light, dark) => {
    let s = poly([...up, ...[...lo].reverse()], fill);
    for (let i = 0; i < up.length - 1; i++) {
      const mid = [(up[i][0] + up[i + 1][0]) / 2 + (r() - 0.5) * 30, (up[i][1] + lo[i][1]) / 2 + (r() - 0.5) * 30];
      s += poly([up[i], up[i + 1], mid], i % 2 ? light : dark, 'opacity=".55"');
      s += poly([lo[i], lo[i + 1], mid], i % 2 ? dark : light, 'opacity=".45"');
    }
    return s;
  };
  const b0 = xs.map((x) => [x, 1270]), b1 = edge(1420, 60), b2 = edge(1620, 60), b3 = xs.map((x) => [x, 2000]);
  return band(b0, b1, "var(--stone)", tint("stone", 10), shade("stone", 14)) +
    band(b1, b2, shade("stone", 10), tint("stone", 10), shade("stone", 24)) +
    band(b2, b3, shade("stone", 20), tint("stone", 6), shade("stone", 32)) +
    rocks({ x: 300, y: 1500, s: 0.8, count: 2, seed: 5 }) + rocks({ x: 760, y: 1680, s: 1, count: 2, seed: 6 }) +
    rocks({ x: 1000, y: 1450, s: 0.7, count: 2, seed: 8 }) + rocks({ x: 80, y: 1800, s: 0.9, count: 2, seed: 9 });
}

function mudBody(x0, x1, seed, npeb) {
  const r = prng(seed);
  let s = rect(x0, 1200, x1, 1272, "var(--earth-2)");
  for (let x = x0; x < x1; x += 80) s += poly([[x, 1200], [Math.min(x + 80, x1), 1200 + (r() - 0.5) * 8], [x + 40, 1272]], r() > 0.5 ? tint("earth-2", 8) : shade("earth-2", 14), 'opacity=".5"');
  for (let i = 0; i < npeb; i++) {
    const cx = x0 + r() * (x1 - x0), cy = 1212 + r() * 52, rr = 4 + r() * 3;
    s += poly(Array.from({ length: 6 }, (_, k) => [cx + Math.cos((k / 6) * Math.PI * 2) * rr, cy + Math.sin((k / 6) * Math.PI * 2) * rr]), shade("stone", 6));
  }
  return s;
}
export const mudSvg = () => mudBody(-400, 1480, 41, 12) + `<g id="br-mudIn" transform="${tf({ py: 1272 })}">${mudBody(470, 650, 43, 3)}</g>`;

export function cofBackSvg() {
  let s = "";
  for (let i = 0; i < 9; i++) {
    const x = 470 + i * 20;
    s += poly([[x, 1200], [x, 1068], [x + 7, 1060], [x + 14, 1068], [x + 14, 1200]], "var(--wood)") + rect(x + 9, 1066, x + 14, 1200, shade("wood", 14));
  }
  return `<g id="br-cofBack" style="opacity:0">${s}</g>`;
}

function waterShape(x0, x1, fill, seed) {
  const r = prng(seed), n = Math.max(2, Math.round((x1 - x0) / 60));
  const top = Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, WATER + (r() - 0.5) * 6]);
  let s = poly([...top, [x1, MUD], [x0, MUD]], fill);
  for (let i = 0; i < n; i++) s += poly([top[i], top[i + 1], [x0 + ((x1 - x0) * (i + 0.5)) / n, 1155]], i % 2 ? tint(fill, 18) : shade(fill, 14), 'opacity=".6"');
  return s;
}
export function waterSvg() {
  const brown = "color-mix(in srgb, var(--water) 40%, var(--earth-1))";
  return `<g id="br-water" transform="${tf({ py: 1200 })}">` +
    `<g id="br-waterL">${waterShape(-400, 470, "var(--water)", 5)}</g>` +
    `<g id="br-waterIn" transform="${tf({ py: 1200 })}">${waterShape(470, 650, "var(--water)", 6)}</g>` +
    `<g id="br-waterR">${waterShape(650, 1480, "var(--water)", 7)}</g>` +
    `<g id="br-waterBrown" style="opacity:0">${waterShape(-400, 470, brown, 5)}${waterShape(470, 650, brown, 6)}${waterShape(650, 1480, brown, 7)}</g></g>`;
}

const BL = [[-400, 680], [98, 680], [104, 964], [150, 964], [178, 1200], [178, 1272], [-400, 1272]];
const BR = mirror(BL).map(([x, y]) => [x, y]);
export function banksSvg() {
  const face = (p, seed) => {
    const r = prng(seed);
    let s = `<polyline points="${pts(p)}" style="fill:none;stroke:${shade("stone", 8)};stroke-width:12;stroke-linejoin:round"/>`;
    for (let i = 0; i < 3; i++) { const q = p[1 + (i % 3)], x = q[0], y = q[1] - 40 - r() * 80; s += poly([[x - 8, y], [x + 8, y + 10], [x - 4, y + 22]], tint("stone", 16), 'opacity=".6"'); }
    return s;
  };
  const left = BL.slice(1, 5), right = BR.slice(1, 5);
  return `<clipPath id="br-clipBL"><polygon points="${pts(BL)}"/></clipPath><clipPath id="br-clipBR"><polygon points="${pts(BR)}"/></clipPath>` +
    `<g clip-path="url(#br-clipBL)">${terrain({ x: -400, y: 718, w: 1000, h: 560, layers: [150, 330], top: "grass", seed: 7 })}</g>` +
    `<g clip-path="url(#br-clipBR)">${terrain({ x: 520, y: 718, w: 1000, h: 560, layers: [150, 330], top: "grass", seed: 8 })}</g>` +
    face(left, 61) + face(right, 62) + rect(104, 962, 150, 970, tint("stone", 6)) + rect(970, 962, 1016, 970, tint("stone", 6));
}

export const PILE_CX = [[4, 10], [3, 21], [2, 32]].flatMap(([cnt, x0]) => Array.from({ length: cnt }, (_, j) => x0 + j * 22 + 12));
export function pileSvg() {
  const rows = [[4, 10, 0], [3, 21, 1], [2, 32, 2]];
  let s = "", i = 0;
  for (const [cnt, x0, row] of rows) {
    for (let j = 0; j < cnt; j++) {
      const x = x0 + j * 22, y = 718 - 16 * (row + 1), cx = x + 12, by = 718;
      s += `<g id="br-pile-${i}" transform="${tf({ px: cx, py: by, sx: 0, sy: 0 })}">` +
        rect(x, y, x + 24, y + 16, (i % 2 ? tint("stone", 10) : "var(--stone)")) + rect(x + 17, y, x + 24, y + 16, shade("stone", 16)) + `</g>`;
      i++;
    }
  }
  return `<g id="br-pile">${s}</g>`;
}

const pierShape = (x0, y0, x1, y1) => rect(x0, y0, x1, y1, "var(--stone)") + rect(x0 + (x1 - x0) * 0.6, y0, x1, y1, shade("stone", 16));
export const gPierSvg = () => ghost("br-gPier", pierShape(490, 960, 630, 1200));

export function cofSvg() {
  const stake = (id, x0) => `<g id="br-${id}" transform="translate(0 -260)">${poly([[x0, 1062], [x0 + 8, 1062], [x0 + 8, 1268], [x0 + 4, 1276], [x0, 1268]], "var(--wood)")}${rect(x0 + 4, 1062, x0 + 8, 1268, shade("wood", 14))}</g>`;
  const wales = [1090, 1160].map((y) => rect(446, y, 474, y + 6, shade("wood", 22)) + rect(650, y, 674, y + 6, shade("wood", 22))).join("");
  const clay = `<g id="br-clay" transform="${tf({ py: 1268, sy: 0 })}">${rect(454, 1062, 462, 1268, tint("earth-1", 10))}${rect(658, 1062, 666, 1268, tint("earth-1", 10))}${poly([[454, 1100], [462, 1130], [454, 1170]], shade("earth-1", 10))}${poly([[666, 1100], [658, 1130], [666, 1170]], shade("earth-1", 10))}</g>`;
  return `<g id="br-cof" style="opacity:0">${stake("stk0", 446)}${stake("stk1", 462)}${clay}${stake("stk2", 666)}${stake("stk3", 650)}${wales}</g>`;
}

export function pierSvg(ids = true) {
  const h = 310 / 6;
  let s = "";
  for (let i = 0; i < 6; i++) {
    const y1 = 1270 - h * i, y0 = y1 - h;
    s += pierShape(490, y0, 630, y1) + line(490, y0, 630, y0, shade("stone", 28), 3) + line(i % 2 ? 540 : 580, y0, i % 2 ? 540 : 580, y1, shade("stone", 28), 3);
  }
  return ids ? `<g id="br-pier" transform="${tf({ py: 1270, sy: 0 })}">${s}</g>` : `<g>${s}</g>`;
}

export function fillSvg(ids = true) {
  const r = prng(51), bands = [[900, 960], [840, 900], [780, 840], [718, 780]];
  const cid = ids ? "br-clipF" : "br-clipF2";
  let s = "";
  bands.forEach(([y0, y1], i) => {
    let b = rect(96, y0, 1024, y1, i % 2 ? tint("sand", 4) : shade("stone", 6));
    for (let j = 0; j < 8; j++) {
      const cx = 96 + r() * 928, cy = y0 + 6 + r() * (y1 - y0 - 12), rr = 6 + r() * 4;
      b += poly(Array.from({ length: 5 }, (_, k) => [cx + Math.cos((k / 5) * Math.PI * 2) * rr, cy + Math.sin((k / 5) * Math.PI * 2) * rr]), shade("stone", 18));
    }
    s += ids ? `<g id="br-fill${i}" transform="${tf({ py: y1, sy: 0 })}">${b}</g>` : `<g>${b}</g>`;
  });
  return `<clipPath id="${cid}"><polygon points="${pts(polyF())}"/></clipPath><g ${ids ? 'id="br-fill"' : ""} clip-path="url(#${cid})">${s}</g>`;
}
export const parapetSvg = (ids = true) => `<g ${ids ? 'id="br-parapet" style="opacity:0"' : ""}>${rect(96, 682, 1024, 704, shade("stone", 10))}${rect(96, 682, 1024, 688, tint("stone", 20))}</g>`;
export function pavingSvg(ids = true) {
  let s = rect(-400, 704, 1480, 718, tint("stone", 14));
  for (let x = -400; x < 1480; x += 40) s += line(x, 704, x, 718, shade("stone", 6), 2);
  return `<g ${ids ? 'id="br-paving" style="opacity:0"' : ""}>${s}</g>`;
}

export function holeSvg() {
  const [cx, cy] = [560, 845];
  const wedge = (k) => {
    const a = k * 36, b = (k + 1) * 36;
    return `<g id="br-hr-${k}" style="opacity:0">${poly([pt([cx, cy], 33, a), pt([cx, cy], 33, b), pt([cx, cy], 45, b), pt([cx, cy], 45, a)], k % 2 ? tint("stone", 8) : "var(--stone)")}${line(...pt([cx, cy], 33, a), ...pt([cx, cy], 45, a), shade("stone", 40), 2)}</g>`;
  };
  return `<g id="br-hole" style="opacity:0" transform="${tf({ px: cx, py: cy, sx: 0, sy: 0 })}">` +
    `<circle cx="${cx}" cy="${cy}" r="30" style="fill:var(--sky-2)"/>` +
    `<path id="br-holeWater" d="M 530.4 840 A 30 30 0 1 0 589.6 840 Z" style="fill:color-mix(in srgb, var(--water) 35%, var(--earth-2));opacity:0"/>` +
    `<circle cx="${cx}" cy="${cy}" r="31.5" style="fill:none;stroke:${shade("earth-3", 30)};stroke-width:3"/>` +
    `<g id="br-holeRing">${Array.from({ length: 10 }, (_, k) => wedge(k)).join("")}</g></g>`;
}
export const cracksSvg = () => `<g id="br-cracksR" style="opacity:0">` +
  [[[560, 972], [548, 1020], [572, 1070], [556, 1130]], [[500, 990], [520, 1030], [506, 1080]], [[540, 790], [556, 820], [538, 860], [552, 890]]]
    .map((p) => `<polyline points="${pts(p)}" style="fill:none;stroke:var(--ui-red);stroke-width:4;stroke-linejoin:round;stroke-linecap:round"/>`).join("") + `</g>`;

export function centeringSvg(n, c, anim) {
  const cx = c[0], o = anim ? "opacity:0" : "";
  const posts = [cx - 104, cx + 90].map((x, i) => `<g id="br-cen${n}-p${i}" ${anim ? `transform="${tf({ py: 1206, sy: 0 })}"` : ""}>${rect(x, 974, x + 14, 1206, shade("wood", 14))}</g>`).join("");
  const beam = `<g id="br-cen${n}-b" style="${o}">${rect(cx - 170, 960, cx + 170, 974, shade("wood", 6))}</g>`;
  let struts = "", rib = "";
  [30, 60, 90, 120, 150].forEach((a, i) => {
    const e = pt(c, 154, a), d = [Math.cos(rad(a)), -Math.sin(rad(a))], nrm = [-d[1] * 4, d[0] * 4];
    struts += `<g id="br-cen${n}-s${i}" style="${o}">${poly([[c[0] + nrm[0], c[1] + nrm[1]], [e[0] + nrm[0], e[1] + nrm[1]], [e[0] - nrm[0], e[1] - nrm[1]], [c[0] - nrm[0], c[1] - nrm[1]]], tint("wood", 6))}</g>`;
  });
  for (let i = 0; i < 6; i++) {
    const a = 180 - 30 * i, b = a - 30;
    rib += `<g id="br-cen${n}-r${i}" style="${o}">${poly([pt(c, 154, a), pt(c, 154, b), pt(c, RI, b), pt(c, RI, a)], i % 2 ? shade("wood", 12) : "var(--wood)")}</g>`;
  }
  return `<g id="br-cen${n}" style="opacity:0"><g id="br-cen${n}-w">${posts}${beam}${struts}${rib}</g></g>`;
}

export function outlinesSvg() {
  let s = "";
  for (let k = 0; k < NSTONE; k++) if (k !== KEY) s += `<g id="br-ring1Y-${k}" style="opacity:0">${stoneOutline(C1, k, 4)}</g>`;
  s += `<g id="br-gapY" style="opacity:0">${stoneOutline(C1, KEY, 5, 'stroke-dasharray="12 8"')}</g>`;
  let rad1 = "";
  for (let k = 1; k < NSTONE; k++) { const [x, y] = pt(C1, 224, th(k)); rad1 += `<line x1="${C1[0]}" y1="${C1[1]}" x2="${f(x)}" y2="${f(y)}" style="stroke:var(--ui-yellow);stroke-width:3;stroke-dasharray:10 8"/>`; }
  s += `<g id="br-radial1" style="opacity:0">${rad1}<circle cx="${C1[0]}" cy="${C1[1]}" r="6" style="fill:var(--ui-yellow)"/></g>`;
  return s;
}
export function recapSvg() {
  const arc = (c, rr, extra = "") => `<path d="M ${c[0] - rr} 960 A ${rr} ${rr} 0 0 1 ${c[0] + rr} 960" style="fill:none;stroke:var(--ui-yellow);stroke-width:5" ${extra}/>`;
  const ringP = (c) => `<path d="M ${c[0] - RI} 960 A ${RI} ${RI} 0 0 1 ${c[0] + RI} 960 L ${c[0] + RE} 960 A ${RE} ${RE} 0 0 0 ${c[0] - RE} 960 Z" style="fill:none;stroke:var(--ui-yellow);stroke-width:5;stroke-linejoin:round"/>`;
  const g = (k, inner) => `<g id="br-rc${k}" style="opacity:0">${inner}</g>`;
  return g(0, outlineP([[490, 1200], [630, 1200], [630, 1270], [490, 1270]], 5)) + g(1, arc(C1, 162, 'stroke-dasharray="12 8"')) +
    g(2, ringP(C1) + ringP(C2)) + g(3, stoneOutline(C1, KEY, 5) + stoneOutline(C2, KEY, 5)) +
    g(4, outlineP(ABUT_L, 5) + outlineP(ABUT_R, 5)) + g(5, outlineP(polyF(), 5) + line(0, 704, 1080, 704, "var(--ui-yellow)", 5)) +
    g(6, `<circle cx="560" cy="845" r="46" style="fill:none;stroke:var(--ui-yellow);stroke-width:5"/>`) +
    `<g id="br-ks1Y2" style="opacity:0">${stoneOutline(C1, KEY, 5)}</g>`;
}

export const ABUT_L = [[0, 722], [96, 718], [104, 964], [150, 964], [160, 1060], [0, 1060]];
export const ABUT_R = mirror(ABUT_L);
export function abutSvg() {
  const bands = [[990, 1060], [922, 990], [854, 922], [786, 854], [718, 786]];
  const side = (tag, poly0, mir) => {
    const X = (x) => (mir ? 1120 - x : x);
    let s = "";
    bands.forEach(([y0, y1], i) => {
      const xa = mir ? 1120 - 170 : 0, xb = mir ? 1120 : 170;
      const jx = X(i % 2 ? 40 : 90);
      s += `<g id="br-ab${tag}-c${i}" transform="translate(0 20)" style="opacity:0">${rect(xa, y0, xb, y1, tint("stone", 6))}${rect(mir ? xa : xb - 51, y0, mir ? xa + 51 : xb, y1, shade("stone", 12))}` +
        line(xa, y0, xb, y0, shade("stone", 30), 3) + line(jx, y0, jx, y1, shade("stone", 30), 3) + line(X(i % 2 ? 110 : 60), y0, X(i % 2 ? 110 : 60), y1, shade("stone", 30), 3) + `</g>`;
    });
    return `<clipPath id="br-clipA${tag}"><polygon points="${pts(poly0)}"/></clipPath><g id="br-abut${tag}" clip-path="url(#br-clipA${tag})">${s}</g>`;
  };
  return side("L", ABUT_L, false) + side("R", ABUT_R, true) +
    `<g id="br-abutLY" style="opacity:0">${outlineP(ABUT_L, 5)}</g><g id="br-abutRY" style="opacity:0">${outlineP(ABUT_R, 5)}</g>`;
}

export function craneSvg() {
  return `<g id="br-crane" style="opacity:0">` +
    rect(66, 640, 78, 718, "var(--wood)") + rect(72, 640, 78, 718, shade("wood", 12)) + rect(66, 640, 340, 652, "var(--wood)") + rect(66, 646, 340, 652, shade("wood", 12)) +
    line(78, 700, 200, 652, shade("wood", 12), 5) + `<circle cx="320" cy="660" r="8" style="fill:${shade("wood", 25)}"/>` +
    `<line id="br-rope" x1="320" y1="668" x2="320" y2="668" style="stroke:${shade("earth-3", 20)};stroke-width:3"/></g>`;
}
export function slabSvg() {
  const half = (id, x0, x1) => `<g id="br-${id}" transform="${tf({ x: -1100 })}">${rect(x0, 678, x1, 718, "var(--stone)")}${rect((x0 + x1) / 2, 678, x1, 718, shade("stone", 10))}${rect(x0, 678, x1, 686, tint("stone", 12))}` +
    [0.2, 0.4, 0.6, 0.8].map((k) => line(x0 + (x1 - x0) * k, 690, x0 + (x1 - x0) * k, 712, shade("stone", 22), 3)).join("") + `</g>`;
  return `<g id="br-slabFall" transform="translate(0 0)">${half("slabL", 60, 560)}${half("slabR", 560, 1060)}` +
    `<polyline id="br-crackLine" points="560,678 552,696 568,712 556,730 562,742" style="fill:none;stroke:${shade("earth-3", 40)};stroke-width:4;opacity:0"/></g>`;
}
export const spoutSvg = () => `<g id="br-spout" transform="${tf({ py: 872, sy: 0 })}" style="opacity:0">${poly([[548, 872], [572, 872], [580, 930], [576, 975], [552, 975], [546, 930]], tint("water", 25), 'opacity=".85"')}</g>`;
export const spanDimSvg = () => `<g id="br-spanDim" style="opacity:0">${line(150, 1076, 490, 1076, "var(--ui-white)", 3)}${line(150, 1068, 150, 1084, "var(--ui-white)", 3)}${line(490, 1068, 490, 1084, "var(--ui-white)", 3)}</g>`;

// ------------------------------------------------------------ ghosts
export function ghostsSvg() {
  const st = (c, ks) => ks.map((k) => stoneArt(c, k)).join("");
  const gStones = ghost("br-gStones", [0, 1, 2].map((k) => `<g id="br-gst-${k}">${stoneArt(C1, k)}</g>`).join(""));
  const sq = [4, 5, 6, 8, 9].map((k, i) => { const [x, y] = stoneCentre(C1, k); return `<g id="br-gq-${i}">${rect(x - 20, y - 20, x + 20, y + 20, tint("stone", 8))}</g>`; }).join("");
  const gSquares = ghost("br-gSquares", sq);
  const gc = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14].map((k) => `<g id="br-gc-${k}">${stoneArt(C1, k)}</g>`).join("");
  const gCollapse = ghost("br-gCollapse", gc);
  const gSpread = ghost("br-gSpread",
    `<g id="br-gsL">${st(C1, [0, 1, 2, 3, 4, 5, 6])}</g><g id="br-gsK1">${stoneArt(C1, KEY)}</g><g id="br-gsR">${st(C2, [8, 9, 10, 11, 12, 13, 14])}</g><g id="br-gsK2">${stoneArt(C2, KEY)}</g>`);
  return gStones + gSquares + gCollapse + gSpread;
}

// ------------------------------------------------------------ hook preview (finished bridge)
export function previewSvg(carSvg) {
  return `<g id="br-preview" transform="translate(0 0)">` +
    pierSvg(false) + fillSvg(false) + parapetSvg(false) + pavingSvg(false) +
    previewRing(1, C1) + previewRing(2, C2) +
    `<g id="br-pvJR" style="opacity:0">${jointLines(C1, 4, "").replace(/stroke:[^;]*;/g, "stroke:var(--ui-red);")}${jointLines(C2, 4, "").replace(/stroke:[^;]*;/g, "stroke:var(--ui-red);")}</g>` +
    `<g>${[ABUT_L, ABUT_R].map((p) => poly(p, tint("stone", 6))).join("")}</g>` +
    `<g>${jointLines(C1, 1.5, "")}${jointLines(C2, 1.5, "")}</g>` +
    carSvg + `</g>`;
}

// ------------------------------------------------------------ convoy
export function convoySvg() {
  const o1 = ox({ id: "br-cv-o1", x: 0, y: 0 }), o2 = ox({ id: "br-cv-o2", x: -200, y: 0 });
  const c1 = cart({ id: "br-cv-c1", x: -90, y: 0 }), c2 = cart({ id: "br-cv-c2", x: -290, y: 0 });
  return `<g id="br-convoy" transform="translate(-220 704)" >${c2.svg}${o2.svg}${c1.svg}${o1.svg}</g>`;
}
export const heronWaterFront = () => `<g id="br-heronWaterFront"><rect x="850" y="1118" width="60" height="44" style="fill:var(--water)"/></g>`;
void groundShadow; void wrapG; void line;
