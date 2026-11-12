// Video-specific bow geometry (not kit). Convention everywhere: archer on the LEFT, arrows fly RIGHT,
// so the belly (horn, squeezed) is on the left of a limb and the back (sinew, stretched) on the right: +n = right.
import { poly, shade, tint, f, pts } from "../kit/lowpoly.mjs";

export const quad = (P0, C, P2, t) => { const u = 1 - t; return [u * u * P0[0] + 2 * u * t * C[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * C[1] + t * t * P2[1]]; };
const dquad = (P0, C, P2, t) => [2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P2[0] - C[0]), 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P2[1] - C[1])];

// ---- s2 limb: tip P0 → control → grip P2, bent the way it is at full draw (concave side left)
export const LIMB = { P0: [630, 650], C: [850, 935], P2: [630, 1220] };
/** { p, n } at t (0 = tip, 1 = grip); n = unit normal pointing to the back (right) */
export const limbAt = (t) => {
  const [dx, dy] = dquad(LIMB.P0, LIMB.C, LIMB.P2, t), l = Math.hypot(dx, dy);
  return { p: quad(LIMB.P0, LIMB.C, LIMB.P2, t), n: [dy / l, -dx / l] };
};
/** point on the limb at t, shifted n px along the normal (+ = back/right) */
export const limbPt = (t, n = 0) => { const { p, n: nn } = limbAt(t); return { x: Math.round(p[0] + nn[0] * n), y: Math.round(p[1] + nn[1] * n) }; };
/** polygon points of the band between normals a and b along curveFn(t)→{p,n} */
export function band(curveFn, a, b, N = 16) {
  const A = [], B = [];
  for (let i = 0; i <= N; i++) { const { p, n } = curveFn(i / N); A.push([p[0] + n[0] * a, p[1] + n[1] * a]); B.push([p[0] + n[0] * b, p[1] + n[1] * b]); }
  return [...A, ...B.reverse()];
}
/** polyline points (array) along the limb at normal offset n, for t from t0 to t1 */
export const limbLine = (n, t0 = 0, t1 = 1, N = 14) => Array.from({ length: N + 1 }, (_, i) => { const { p, n: nn } = limbAt(t0 + ((t1 - t0) * i) / N); return [p[0] + nn[0] * n, p[1] + nn[1] * n]; });
const dPath = (a) => a.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(" ");
const mirror = (arr, y0 = 1220) => arr.map(([x, y]) => [x, 2 * y0 - y]);

const WOOD = [tint("wood", 6), shade("wood", 14)];
const HORN = [tint("stone", 38), tint("stone", 18)];
const SINEW = [tint("sand", 22), tint("sand", 4)];
const LEATHER = [shade("wood", 22), shade("wood", 34)];
export const FACES = { WOOD, HORN, SINEW, LEATHER };

/** two-tone band: light half on the left, dark half on the right */
const two = (curve, a, b, [l, d]) => {
  const m = (a + b) / 2;
  return poly(band(curve, a, m), l) + poly(band(curve, m, b), d);
};
const redBand = (id, curve, a, b) => `<g id="${id}" style="opacity:0">${poly(band(curve, a, b), "var(--ui-red)")}</g>`;
const dashOutline = (id, a, b, opacity = 0.5) =>
  `<polygon id="${id}" points="${pts(band(limbAt, a, b))}" style="fill:none;stroke:var(--snow);stroke-width:3;stroke-dasharray:10 8;opacity:${opacity}"/>`;

/**
 * s2: one upper limb as accumulating layers + the mirrored lower limb and a string (used only by the push-in).
 * Ids: ${id}-slab-h / -slab-s (plain wood slot zones), -core, -horn (outer: slides, slips) > -horn-r (peel rotation), -sinew > -sinew-r,
 * -hornred, -sinewred, -sinewband, -strand0…7, -glue1/-glue2 (+ red), -slotH / -slotS (dashed), -wrap, -tick0…11, -cord0/1, -lower, -string.
 */
export function limbBand({ id }) {
  const HORN_AB = [-57, -21], SIN_AB = [31, 57];
  const slabs = `<g id="${id}-slab-h">${two(limbAt, -57, -17, WOOD)}</g><g id="${id}-slab-s">${two(limbAt, 27, 57, WOOD)}</g>`;
  const core = `<g id="${id}-core">${two(limbAt, -17, 27, WOOD)}</g>`;
  const horn = `<g id="${id}-horn" style="opacity:0"><g id="${id}-horn-r">${two(limbAt, ...HORN_AB, HORN)}${redBand(`${id}-hornred`, limbAt, ...HORN_AB)}</g></g>`;
  const strands = Array.from({ length: 8 }, (_, i) => {
    const d = dPath(limbLine(33 + i * 3, 1, 0, 12));
    return `<path id="${id}-strand${i}" d="${d}" pathLength="1" style="fill:none;stroke:${tint("sand", 15)};stroke-width:4;stroke-linecap:butt;stroke-dasharray:1;stroke-dashoffset:1"/>`;
  }).join("");
  const sinew = `<g id="${id}-sinew"><g id="${id}-sinew-r"><g id="${id}-sinewband" style="opacity:0">${two(limbAt, ...SIN_AB, SINEW)}</g>${strands}${redBand(`${id}-sinewred`, limbAt, ...SIN_AB)}</g></g>`;
  const glueLine = (n, name) => {
    const d = dPath(limbLine(n, 1, 0, 14));
    return `<path id="${id}-${name}" d="${d}" pathLength="1" style="fill:none;stroke:${tint("sand", 45)};stroke-width:6;stroke-linecap:butt;stroke-dasharray:1;stroke-dashoffset:1"/>` +
      `<path id="${id}-${name}red" d="${d}" style="fill:none;stroke:var(--ui-red);stroke-width:6;stroke-linecap:round;opacity:0"/>`;
  };
  const glue = `<g id="${id}-glue">${glueLine(-17, "glue1")}${glueLine(27, "glue2")}</g>`;
  const wrap = `<path id="${id}-wrap" d="${dPath(limbLine(5, 1, 0, 16))}" pathLength="1" style="fill:none;stroke:${shade("wood", 28)};stroke-width:134;stroke-linecap:butt;opacity:.55;stroke-dasharray:1;stroke-dashoffset:1"/>`;
  let ticks = "";
  for (let i = 0; i < 12; i++) {
    const t = 1 - (i + 0.5) / 12, a = limbPt(t, -56), b = limbPt(t - 0.03, 62);
    ticks += `<line id="${id}-tick${i}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" style="stroke:${shade("wood", 45)};stroke-width:4;opacity:0"/>`;
  }
  let cords = "";
  [0.3, 0.7].forEach((t, i) => {
    const { p, n } = limbAt(t), tx = -n[1], ty = n[0];
    const q = (a, b) => [p[0] + n[0] * a + tx * b, p[1] + n[1] * a + ty * b];
    cords += `<g id="${id}-cord${i}" style="opacity:0">${poly([q(-62, -7), q(64, -7), q(64, 7), q(-62, 7)], shade("earth-3", 0))}</g>`;
  });
  const lower = `<g id="${id}-lower">${poly(mirror(band(limbAt, -57, 27)), WOOD[0])}${poly(mirror(band(limbAt, 27, 57)), WOOD[1])}</g>`;
  const string = `<polyline id="${id}-string" points="${pts([LIMB.P0, [380, 1220], [630, 1790]])}" style="fill:none;stroke:${tint("sand", 30)};stroke-width:3"/>`;
  return {
    svg: `<g id="${id}">${lower}${string}${slabs}${core}${dashOutline(`${id}-slotH`, -57, -17, 0)}${dashOutline(`${id}-slotS`, 27, 57, 0)}${horn}${sinew}${glue}${wrap}${ticks}${cords}</g>`,
    HORN_AB, SIN_AB,
  };
}

// ------------------------------------------------------------------ whole bow (s3, s4, s5, s1)
export const STATES = {
  straight: { c: [[0, -55], [0, -135], [0, -210]], t: [0, -290] },
  unstrungC: { c: [[0, -55], [10, -210], [120, -215]], t: [170, -155] },
  braced: { c: [[0, -55], [-15, -140], [-55, -205]], t: [-65, -290] },
  fullDraw: { c: [[0, -55], [-25, -130], [-90, -185]], t: [-150, -245] },
};
/** 12 centreline samples of the upper half in bow units (10 on the limb quadratic, K, T) with unit normals (+n = right/back) */
function centre(state) {
  const S = STATES[state] ?? (() => { throw new Error(`bow state '${state}' unknown`); })();
  const [P0, C, P2] = S.c;
  const P = [];
  for (let i = 0; i < 10; i++) P.push(quad(P0, C, P2, i / 10));
  P.push(P2, S.t);
  return P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    return { p, n: [-ty, tx] };
  });
}
const half2 = (c, i0, i1, a, b) => {
  const A = [], B = [];
  for (let i = i0; i <= i1; i++) { A.push([c[i].p[0] + c[i].n[0] * a, c[i].p[1] + c[i].n[1] * a]); B.push([c[i].p[0] + c[i].n[0] * b, c[i].p[1] + c[i].n[1] * b]); }
  return [...A, ...B.reverse()];
};
export const BOW_PARTS = ["glow", "core", "horn", "sinew", "glue1", "glue2", "wrap", "siyah", "tip"];
const SPEC = { glow: [0, 10, -21, 20], core: [0, 10, -5, 6], horn: [0, 10, -15, -5], sinew: [0, 10, 6, 14], glue1: [0, 10, -6.5, -3.5], glue2: [0, 10, 4.5, 7.5], wrap: [0, 10, -17, 16], siyah: [10, 11, -9, 9], tip: [10, 11, -13, 13] };

/** point strings for every polygon of both halves (+ the string and the key tip points). G = grip centre, scale = px per bow unit. N = string middle (bow units) in fullDraw. */
export function bowGeom(state, { G, scale = 1, N = null } = {}) {
  const c = centre(state);
  const X = (p) => [G.x + p[0] * scale, G.y + p[1] * scale];
  const Xl = (p) => [G.x + p[0] * scale, G.y - p[1] * scale];
  const parts = {};
  for (const k of BOW_PARTS) {
    const [i0, i1, a, b] = SPEC[k];
    const raw = half2(c, i0, i1, a, b);
    parts[`${k}-u`] = pts(raw.map(X));
    parts[`${k}-l`] = pts(raw.map(Xl));
  }
  const T = STATES[state].t, brT = STATES.braced.t;
  const tipU = X(T), tipL = Xl(T);
  const stringPts = (apexPt) => pts([tipU, X(apexPt), tipL]);
  // states without a string carry the braced string (hidden until drawn)
  parts.string = state === "fullDraw" ? stringPts(N ?? [-250, 0]) : state === "braced" ? stringPts([brT[0], 0]) : pts([X(brT), X([brT[0], 0]), Xl(brT)]);
  return { parts, tipU, tipL, stringPts, centre: c, X, Xl };
}
/** polyline (array of points) at normal offset n along the upper ("u") or lower ("l") limb samples 0..10 */
export function bowEdge(state, opts, half = "u", n = 0) {
  const g = bowGeom(state, opts);
  return g.centre.slice(0, 11).map((s) => { const q = [s.p[0] + s.n[0] * n, s.p[1] + s.n[1] * n]; return half === "u" ? g.X(q) : g.Xl(q); });
}

const REG = new Map();
/**
 * Whole bow SVG with stable ids `${id}-<part>-<u|l>`. layers: booleans (all on by default).
 * glow and tip outlines (yellow) start at opacity 0 inside groups `${id}-g-glow` / `${id}-g-tip`.
 */
export function bowSvg({ id, G, scale = 1, state = "braced", layers = {}, N = null, hideString = false }) {
  const geom = bowGeom(state, { G, scale, N });
  const L = { core: 1, horn: 1, sinew: 1, glue: 1, wrap: 1, siyah: 1, string: 1, glow: 1, tip: 1, ...layers };
  const present = [];
  const el = (part, style) => {
    let s = "";
    for (const h of ["u", "l"]) { present.push(`${part}-${h}`); s += `<polygon id="${id}-${part}-${h}" points="${geom.parts[`${part}-${h}`]}" style="${style}"/>`; }
    return s;
  };
  const fillStyle = (c) => `fill:${c};stroke:var(--outline-c, none);stroke-width:var(--outline-w, 0);stroke-linejoin:round`;
  let s = `<g id="${id}">`;
  if (L.glow) s += `<g id="${id}-g-glow" style="opacity:0">${el("glow", "fill:none;stroke:var(--ui-yellow);stroke-width:6;stroke-linejoin:round")}</g>`;
  if (L.core) s += el("core", fillStyle(WOOD[0]));
  if (L.horn) s += el("horn", fillStyle(HORN[0]));
  if (L.sinew) s += el("sinew", fillStyle(SINEW[0]));
  if (L.glue) s += el("glue1", `fill:${tint("sand", 45)};stroke:none`) + el("glue2", `fill:${tint("sand", 45)};stroke:none`);
  if (L.wrap) s += el("wrap", `fill:${LEATHER[0]};fill-opacity:.5;stroke:${shade("wood", 30)};stroke-width:3;stroke-linejoin:round`);
  if (L.siyah) s += el("siyah", fillStyle(shade("wood", 8)));
  if (L.tip) s += `<g id="${id}-g-tip" style="opacity:0">${el("tip", "fill:none;stroke:var(--ui-yellow);stroke-width:5;stroke-linejoin:round")}</g>`;
  s += `<rect id="${id}-grip" x="${f(G.x - 13 * scale)}" y="${f(G.y - 55 * scale)}" width="${f(26 * scale)}" height="${f(110 * scale)}" style="fill:${shade("earth-3", 0)}"/>`;
  if (L.string) { present.push("string"); s += `<polyline id="${id}-string" points="${geom.parts.string}" pathLength="1" style="fill:none;stroke:${tint("sand", 30)};stroke-width:4${hideString ? ";stroke-dasharray:1;stroke-dashoffset:1" : ""}"/>`; }
  s += `</g>`;
  REG.set(id, { G, scale, present });
  return s;
}
/** GSAP lines tweening every present part of bow `id` from state `from` to state `to` (attr points). */
export function bowMorph(id, from, to, at, dur, ease = "power2.inOut", { fromN = null, toN = null, skipString = false } = {}) {
  const r = REG.get(id) ?? (() => { throw new Error(`bowMorph: bow '${id}' not created`); })();
  const A = bowGeom(from, { G: r.G, scale: r.scale, N: fromN }), B = bowGeom(to, { G: r.G, scale: r.scale, N: toN });
  const out = [];
  for (const part of r.present) {
    if (skipString && part === "string") continue;
    if (A.parts[part] === B.parts[part]) continue;
    out.push(`tl.fromTo("#${id}-${part}", {attr:{points:"${A.parts[part]}"}}, {attr:{points:"${B.parts[part]}"}, duration:${dur}, ease:"${ease}", immediateRender:false}, ${Math.round(at * 1000) / 1000});`);
  }
  return out.join("\n");
}

// ------------------------------------------------------------------ plain self bow (s1)
/** D-shaped bow at the origin (grip), total height h; `bend` bends the tips toward the archer (left). apex = optional {x,y} of the string middle. */
export function selfBowPoints(h, bend, apex = null) {
  const H = h / 2, N = 8, w = 10;
  const cx = (u) => -0.6 * bend * H * (u / H) ** 2;
  const pL = [], pR = [];
  for (let i = 0; i <= 2 * N; i++) {
    const u = -H + (i * H) / N;
    const e = 0.5, dx = cx(u + e) - cx(u - e), len = Math.hypot(dx, 2 * e);
    const nx = (2 * e) / len, ny = -dx / len; // unit normal, + = right
    pL.push([cx(u) - nx * w, u - ny * w]); pR.push([cx(u) + nx * w, u + ny * w]);
  }
  const tipX = cx(H), ax = apex ? apex.x : tipX - Math.max(0, bend - 0.3) * 1.5 * H, ay = apex ? apex.y : 0;
  const halfPts = (a, b) => [...pL.slice(a, b + 1), ...pR.slice(a, b + 1).reverse()];
  return { limb: pts([...pL, ...[...pR].reverse()]), string: pts([[tipX, -H], [ax, ay], [tipX, H]]), up: pts(halfPts(0, N)), lo: pts(halfPts(N, 2 * N)), tipX, H };
}
/** plain wooden bow group at grip (x,y). Ids: ${id}-limb, ${id}-str, ${id}-red (limb duplicate, opacity 0). */
export function selfBow({ id, x, y, h, bend, withRed = true }) {
  const P = selfBowPoints(h, bend);
  return `<g id="${id}" transform="translate(${x} ${y})">` +
    `<polygon id="${id}-limb" points="${P.limb}" style="fill:var(--wood);stroke:${shade("wood", 28)};stroke-width:2;stroke-linejoin:round"/>` +
    (withRed ? `<polygon id="${id}-red" points="${P.limb}" style="fill:var(--ui-red);opacity:0"/>` : "") +
    `<polyline id="${id}-str" points="${P.string}" style="fill:none;stroke:${tint("sand", 30)};stroke-width:3"/>` +
    `<rect x="-6" y="-26" width="12" height="52" style="fill:${shade("earth-3", 0)}"/></g>`;
}
/** upper and lower halves (split at the grip) as polygon point strings, for the snap */
export const selfBowHalves = (h, bend) => { const P = selfBowPoints(h, bend); return { up: P.up, lo: P.lo }; };
