// More low-poly pieces: trees, bushes, grass, clouds, roots, snow cap, logs, wall, fire, smoke, lizard, crow, leaves, pool.
// (x, y) = base on the ground line, s = scale. Colours: palette tokens only (fire may use --ui-heat / --ui-yellow, as the style guide allows).
import { poly, shade, tint, prng, f, groundShadow } from "../lowpoly.mjs";

const G = (id, inner, extra = "") => `<g ${id ? `id="${id}"` : ""}${extra ? " " + extra : ""}>${inner}</g>`;
const dim = (depth) => (depth ? `style="opacity:calc(1 - var(--depth-fade, 0) * ${(depth * 0.6).toFixed(2)})"` : "");
const r3 = (n) => Math.round(n * 1000) / 1000;

/** Broad-leaf tree: trunk + canopy of faceted blobs. ~250 px tall at s=1. */
export function deciduousTree({ id = "", x = 0, y = 0, s = 1, depth = 0 } = {}) {
  const P = (px, py) => [x + px * s, y + py * s];
  let out = groundShadow(x, y, 130 * s);
  out += poly([P(-11, 0), P(11, 0), P(8, -120), P(-8, -120)], shade("wood", 4));
  out += poly([P(0, 0), P(11, 0), P(8, -120), P(0, -120)], shade("wood", 22));
  out += poly([P(0, -70), P(34, -112), P(30, -122), P(0, -88)], shade("wood", 14));
  const blobs = [[-52, -150, 60], [50, -158, 58], [0, -200, 74], [-8, -140, 66]];
  blobs.forEach(([cx, cy, r], i) => {
    const hex = Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2 + i; return P(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.82); });
    out += poly(hex, i % 2 ? "var(--green-mid)" : "var(--green-dark)");
    out += poly([P(cx, cy), hex[0], hex[1], hex[2]], tint(i % 2 ? "green-mid" : "green-dark", 16), 'opacity=".7"');
    out += poly([P(cx, cy), hex[4], hex[5], hex[6]], shade(i % 2 ? "green-mid" : "green-dark", 24), 'opacity=".7"');
  });
  return G(id, out, dim(depth));
}

/** Palm: leaning segmented trunk + 7 fronds. ~260 px tall at s=1. */
export function palmTree({ id = "", x = 0, y = 0, s = 1, depth = 0 } = {}) {
  const P = (px, py) => [x + px * s, y + py * s];
  let out = groundShadow(x + 20 * s, y, 110 * s);
  const seg = [[0, 0], [10, -55], [24, -110], [36, -165], [42, -215]];
  for (let i = 0; i < seg.length - 1; i++) {
    const [ax, ay] = seg[i], [bx, by] = seg[i + 1], w0 = 13 - i * 1.6, w1 = 13 - (i + 1) * 1.6;
    out += poly([P(ax - w0, ay), P(ax + w0, ay), P(bx + w1, by), P(bx - w1, by)], i % 2 ? shade("wood", 6) : "var(--wood)");
    out += poly([P(ax, ay), P(ax + w0, ay), P(bx + w1, by), P(bx, by)], shade("wood", 22), 'opacity=".8"');
  }
  const [tx, ty] = seg[seg.length - 1];
  const fronds = [[-120, -20], [-95, -62], [-40, -92], [40, -92], [95, -62], [120, -20], [0, -100]];
  fronds.forEach(([dx, dy], i) => {
    const tip = P(tx + dx, ty + dy + 30), a = P(tx, ty), mid1 = P(tx + dx * 0.5, ty + dy * 0.5 - 30), mid2 = P(tx + dx * 0.5, ty + dy * 0.5 + 6);
    out += poly([a, mid1, tip, mid2], i % 2 ? "var(--green-mid)" : "var(--green-dark)");
    out += poly([a, mid1, tip], shade(i % 2 ? "green-mid" : "green-dark", 22), 'opacity=".6"');
  });
  out += poly([P(tx - 8, ty + 6), P(tx + 2, ty + 2), P(tx + 6, ty + 18), P(tx - 6, ty + 20)], shade("wood", 40));
  return G(id, out, dim(depth));
}

/** Low bush: 3 overlapping faceted mounds. ~70 px tall at s=1. */
export function bush({ id = "", x = 0, y = 0, s = 1, seed = 4 } = {}) {
  const r = prng(seed);
  let out = groundShadow(x, y, 110 * s);
  [[-30, 44], [0, 58], [32, 46]].forEach(([dx, h], i) => {
    const w = 46 + r() * 8;
    const pts = [[x + (dx - w) * s, y], [x + (dx - w * 0.6) * s, y - h * 0.7 * s], [x + dx * s, y - h * s], [x + (dx + w * 0.6) * s, y - h * 0.7 * s], [x + (dx + w) * s, y]];
    out += poly(pts, i % 2 ? "var(--green-mid)" : "var(--green-dark)");
    out += poly([pts[1], pts[2], [x + dx * s, y - h * 0.4 * s]], tint("green-mid", 20), 'opacity=".7"');
    out += poly([pts[2], pts[3], pts[4], [x + dx * s, y]], shade("green-dark", 24), 'opacity=".6"');
  });
  return G(id, out);
}

/** Grass tufts along the ground: count tufts of 3–5 blades each across w px. */
export function grassTufts({ id = "", x = 0, y = 0, w = 300, count = 6, s = 1, seed = 8 } = {}) {
  const r = prng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const cx = x + ((i + 0.5) / count) * w + (r() - 0.5) * 20, n = 3 + Math.floor(r() * 3);
    for (let b = 0; b < n; b++) {
      const bx = cx + (b - n / 2) * 7 * s, h = (24 + r() * 22) * s, lean = (r() - 0.5) * 22 * s;
      out += poly([[bx - 4 * s, y + 2], [bx + 4 * s, y + 2], [bx + lean, y - h]], b % 2 ? "var(--green-mid)" : "var(--green-dark)");
    }
  }
  return G(id, out);
}

/** Faceted clouds (snow tint, slightly transparent). (x,y) = centre. ~260 px wide at s=1. */
export function clouds({ id = "", x = 0, y = 0, s = 1, count = 1, seed = 6 } = {}) {
  const r = prng(seed);
  let out = "";
  for (let c = 0; c < count; c++) {
    const cx = x + c * 360 * s, cy = y + (c % 2) * 50 * s, w = (200 + r() * 70) * s;
    const top = [[cx - w / 2, cy + 26 * s], [cx - w * 0.32, cy - 18 * s], [cx - w * 0.08, cy - 46 * s], [cx + w * 0.2, cy - 24 * s], [cx + w * 0.42, cy - 8 * s], [cx + w / 2, cy + 26 * s]];
    out += poly(top, tint("snow", 12), 'opacity=".88"');
    out += poly([top[1], top[2], [cx - w * 0.1, cy + 6 * s]], "var(--snow)", 'opacity=".9"');
    out += poly([[cx + w * 0.2, cy - 24 * s], top[4], top[5], [cx, cy + 26 * s]], shade("snow", 10), 'opacity=".55"');
  }
  return G(id, out);
}

/** Roots grown into the soil under a tree: tapering branches from the trunk base (x,y) downward. */
export function roots({ id = "", x = 0, y = 0, depth = 200, spread = 150, s = 1 } = {}) {
  const arms = [[-1, 0.9, 1], [-0.45, 1.0, 0.8], [0.35, 0.95, 0.9], [1, 0.7, 1]];
  let out = "";
  arms.forEach(([dx, dd, wd], i) => {
    const tx = x + dx * spread * s, ty = y + depth * dd * s, mx = x + dx * spread * 0.45 * s, my = y + depth * 0.45 * s, w = 12 * wd * s;
    out += poly([[x - w, y], [x + w, y], [mx + 5 * s, my], [tx, ty], [mx - 5 * s, my + 8 * s]], i % 2 ? shade("wood", 18) : shade("wood", 4));
    out += poly([[mx, my], [mx + dx * 40 * s, my + 40 * s], [mx + dx * 14 * s, my + 10 * s]], shade("wood", 28));
  });
  return G(id, out);
}

/** Snow cap lying on top of something wide: (x,y) = left end of the top edge, w wide, h tall at the middle. */
export function snowCap({ id = "", x = 0, y = 0, w = 120, h = 26 } = {}) {
  const n = Math.max(3, Math.round(w / 34));
  const top = Array.from({ length: n + 1 }, (_, i) => [x + (w * i) / n, y - h * Math.sin((i / n) * Math.PI) * (i % 2 ? 0.82 : 1)]);
  const drips = Array.from({ length: n }, (_, i) => [x + (w * (i + 0.5)) / n, y + (i % 2 ? 12 : 5)]);
  const edge = [];
  for (let i = n; i >= 0; i--) { edge.push([x + (w * i) / n, y + 2]); if (i) edge.push(drips[i - 1]); }
  let out = poly([...top, ...edge], "var(--snow)");
  out += poly([top[0], top[1], [x + w * 0.2, y]], tint("snow", 25), 'opacity=".8"');
  out += poly([top[n - 1], top[n], [x + w * 0.9, y + 2]], shade("snow", 14), 'opacity=".7"');
  return G(id, out);
}

/** A stack of logs (end grain faces right). count 1–6, pyramid. ~44 px log diameter at s=1. */
export function logs({ id = "", x = 0, y = 0, s = 1, count = 3 } = {}) {
  const d = 44 * s, len = 120 * s;
  let out = groundShadow(x + len / 2, y, len * 1.25);
  const rows = count >= 3 ? [[0, 0], [1, 0], [0.5, 1]] : [[0, 0], [1, 0]];
  const cells = count > 3 ? [[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1], [1, 2]].slice(0, count) : rows.slice(0, count);
  cells.forEach(([cx, row], i) => {
    const bx = x + cx * (d + 4 * s) * 0.5, by = y - row * d * 0.86;
    const lx = bx, ly = by - d / 2;
    out += poly([[lx, ly - d / 2], [lx + len, ly - d / 2], [lx + len, ly + d / 2], [lx, ly + d / 2]], i % 2 ? "var(--wood)" : shade("wood", 8));
    out += poly([[lx, ly], [lx + len, ly], [lx + len, ly + d / 2], [lx, ly + d / 2]], shade("wood", 22), 'opacity=".7"');
    const ring = Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return [lx + len + Math.cos(a) * d * 0.28, ly + Math.sin(a) * d * 0.5]; });
    out += poly(ring, tint("wood", 38));
    out += poly(ring.map(([px, py]) => [lx + len + (px - lx - len) * 0.5, ly + (py - ly) * 0.5]), shade("wood", 6));
  });
  return G(id, out);
}

/** Dry-stone wall: courses of faceted blocks. (x,y) = bottom-left. Ids: `${id}` group. */
export function stoneWall({ id = "", x = 0, y = 0, w = 120, h = 240, course = 52 } = {}) {
  const top = y - h;
  let out = groundShadow(x + w / 2, y, w * 1.25);
  out += poly([[x, y], [x + w, y], [x + w, top], [x, top]], "var(--stone)");
  out += poly([[x + w * 0.5, y], [x + w, y], [x + w, top], [x + w * 0.5, top]], shade("stone", 16));
  out += poly([[x, top], [x + w * 0.5, top], [x, top + h * 0.35]], tint("stone", 18), 'opacity=".6"');
  let row = 0;
  for (let yy = y - course; yy > top; yy -= course, row++) {
    out += `<line x1="${x}" y1="${f(yy)}" x2="${x + w}" y2="${f(yy)}" style="stroke:${shade("stone", 28)};stroke-width:3"/>`;
    const off = row % 2 ? w * 0.3 : w * 0.62;
    out += `<line x1="${f(x + off)}" y1="${f(yy)}" x2="${f(x + off)}" y2="${f(yy + course)}" style="stroke:${shade("stone", 28)};stroke-width:3"/>`;
  }
  return G(id, out);
}

/** Campfire: logs + flames + embers. Returns { svg, tl(at, dur) } — flames flicker, embers rise (finite loops). Bright colours allowed (heat). */
export function fire({ id, x = 0, y = 0, s = 1 } = {}) {
  const P = (px, py) => [x + px * s, y + py * s];
  let out = groundShadow(x, y, 120 * s);
  out += poly([P(-50, 0), P(-44, -16), P(40, -4), P(50, 0)], shade("wood", 10)) + poly([P(-48, -4), P(44, -18), P(52, -4), P(-40, 6)], "var(--wood)");
  out += `<g id="${id}-flame" style="transform-box:fill-box;transform-origin:50% 100%">` +
    poly([P(-38, -10), P(-30, -70), P(-14, -44), P(0, -112), P(16, -50), P(30, -78), P(38, -10)], "var(--ui-heat)") +
    poly([P(-20, -10), P(-10, -44), P(0, -70), P(12, -40), P(22, -10)], "var(--ui-yellow)") +
    poly([P(-8, -10), P(0, -34), P(8, -10)], tint("ui-yellow", 55)) + `</g>`;
  let em = "";
  for (let i = 0; i < 5; i++) em += poly([P(-26 + i * 14, -80 - (i % 2) * 18), P(-22 + i * 14, -90 - (i % 2) * 18), P(-18 + i * 14, -80 - (i % 2) * 18)], "var(--ui-heat)", `id="${id}-e${i}" opacity="0"`);
  const tl = (at, dur) => {
    let t = `tl.fromTo("#${id}-flame", {scaleY:1, scaleX:1}, {scaleY:1.12, scaleX:0.94, duration:0.28, ease:"sine.inOut", yoyo:true, repeat:${Math.max(1, Math.floor(dur / 0.28) - 1)}, immediateRender:false}, ${r3(at)});`;
    for (let i = 0; i < 5; i++) {
      for (let c = 0, k = at + i * 0.22; k + 1.1 <= at + dur; c++, k += 1.3) {
        t += `\ntl.fromTo("#${id}-e${i}", {y:0, opacity:0.9}, {y:${-90 - i * 14}, x:${(i % 2 ? 1 : -1) * 18}, opacity:0, duration:1.1, ease:"power1.out", immediateRender:false}, ${r3(k)});`;
      }
    }
    return t;
  };
  return { svg: G(id, out + em), tl };
}

/** Smoke: 4 soft puffs rising and fading. Returns { svg, tl(at, dur) }. */
export function smoke({ id, x = 0, y = 0, s = 1 } = {}) {
  let out = "";
  for (let i = 0; i < 4; i++) {
    const cx = x + (i % 2 ? 10 : -8) * s, cy = y - i * 8 * s, r = (18 + i * 7) * s;
    out += `<g id="${id}-p${i}" style="opacity:0">` + poly(Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85]; }), tint("stone", 30), 'opacity=".75"') + `</g>`;
  }
  const tl = (at, dur) => {
    let t = "";
    for (let i = 0; i < 4; i++) for (let k = at + i * 0.6; k + 2.4 <= at + dur; k += 2.4) {
      t += `${t ? "\n" : ""}tl.fromTo("#${id}-p${i}", {y:0, x:0, scale:0.6, opacity:0.7}, {y:${-170 * s}, x:${(i % 2 ? 30 : -24) * s}, scale:1.5, opacity:0, duration:2.4, ease:"power1.out", immediateRender:false}, ${r3(k)});`;
    }
    return t;
  };
  return { svg: G(id, out), tl };
}

/** Lizard on a surface (side view). ~70 px long at s=1. flip mirrors. */
export function lizard({ id = "", x = 0, y = 0, s = 1, flip = false } = {}) {
  const m = flip ? -1 : 1, P = (px, py) => [x + px * m * s, y + py * s];
  let out = groundShadow(x, y, 80 * s, 5 * s);
  out += poly([P(-50, -4), P(-20, -14), P(20, -16), P(34, -10), P(20, -2), P(-18, 0)], "var(--green-mid)");
  out += poly([P(-20, -14), P(20, -16), P(34, -10), P(0, -8)], tint("green-mid", 20), 'opacity=".7"');
  out += poly([P(-50, -4), P(-80, 2), P(-96, -6), P(-60, -8)], shade("green-mid", 14));
  out += poly([P(34, -10), P(52, -16), P(62, -8), P(50, -2)], "var(--green-mid)") + poly([P(52, -16), P(62, -8), P(56, -12)], shade("green-mid", 28));
  out += `<circle cx="${f(P(52, -12)[0])}" cy="${f(P(52, -12)[1])}" r="2.4" style="fill:var(--earth-3)"/>`;
  out += poly([P(-4, -2), P(8, -2), P(14, 6), P(2, 6)], shade("green-mid", 22)) + poly([P(-34, -2), P(-22, -2), P(-16, 6), P(-30, 6)], shade("green-mid", 22));
  return G(id, out);
}

/** Crow perched (side view, facing right unless flip). ~80 px tall at s=1. */
export function crow({ id = "", x = 0, y = 0, s = 1, flip = false } = {}) {
  const m = flip ? -1 : 1, P = (px, py) => [x + px * m * s, y + py * s];
  const ink = (p) => shade("earth-3", p);
  let out = groundShadow(x, y, 56 * s, 5 * s);
  out += poly([P(-4, 0), P(2, -26), P(8, 0)], ink(55)) + poly([P(0, -1), P(-8, 4), P(8, 4)], ink(50));
  out += poly([P(-44, -22), P(-14, -50), P(22, -52), P(34, -30), P(10, -8), P(-20, -10)], ink(52));
  out += poly([P(-14, -50), P(22, -52), P(34, -30), P(4, -34)], ink(36), 'opacity=".8"');
  out += poly([P(-44, -22), P(-70, -4), P(-52, -14), P(-60, 8), P(-30, -12)], ink(62));
  out += poly([P(22, -52), P(40, -62), P(52, -52), P(40, -40), P(30, -40)], ink(52));
  out += poly([P(48, -56), P(70, -50), P(48, -46)], "var(--sand)");
  out += `<circle cx="${f(P(42, -54)[0])}" cy="${f(P(42, -54)[1])}" r="2.6" style="fill:var(--snow)"/>`;
  return G(id, out);
}

/** Falling leaves. Returns { svg, tl(at, dur) }; seeded, finite sway. Leaves start across [x0,x1] at y0 and fall to y1. */
export function leaves({ id, x0 = 0, x1 = 1080, y0 = 300, y1 = 980, n = 7, seed = 12 } = {}) {
  const r = prng(seed), items = [];
  let out = "";
  for (let i = 0; i < n; i++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0) * 0.5, sz = 9 + r() * 7;
    out += `<g id="${id}-l${i}" transform="translate(${f(cx)} ${f(cy)})"><g id="${id}-r${i}">` + poly([[0, -sz], [sz * 0.7, 0], [0, sz], [-sz * 0.7, 0]], i % 3 ? "var(--earth-1)" : "var(--green-mid)") + poly([[0, -sz], [sz * 0.7, 0], [0, 0]], tint(i % 3 ? "earth-1" : "green-mid", 24), 'opacity=".7"') + `</g></g>`;
    items.push({ cx, cy, d: r() > 0.5 ? 1 : -1, dur: 3.2 + r() * 1.6, fall: (y1 - cy) * (0.5 + r() * 0.4) });
  }
  const tl = (at, dur) => items.map((it, i) =>
    `tl.fromTo("#${id}-l${i}", {attr:{transform:"translate(${f(it.cx)} ${f(it.cy)})"}}, {attr:{transform:"translate(${f(it.cx + it.d * 90)} ${f(it.cy + it.fall)})"}, duration:${r3(Math.min(it.dur, dur))}, ease:"sine.inOut", immediateRender:false}, ${r3(at + i * 0.12)});\n` +
    `tl.fromTo("#${id}-r${i}", {attr:{transform:"rotate(0)"}}, {attr:{transform:"rotate(${it.d * 240})"}, duration:${r3(Math.min(it.dur, dur))}, ease:"none", immediateRender:false}, ${r3(at + i * 0.12)});`).join("\n");
  return { svg: G(id, out), tl };
}

/** Pool dug into the ground with water: (x,y) = ground line at the left rim. */
export function pool({ id = "", x = 0, y = 0, w = 260, depth = 90, seed = 13 } = {}) {
  const r = prng(seed), inset = w * 0.12;
  const rim = [[x, y - 2], [x + w, y - 2]], bot = [[x + w - inset, y + depth], [x + inset, y + depth]];
  let out = poly([...rim, ...bot], shade("earth-3", 30));
  out += poly([[x, y - 2], [x + w * 0.4, y - 2], [x + inset + 10, y + depth]], shade("earth-3", 12), 'opacity=".8"');
  const wl = y + 14, n = Math.max(3, Math.round(w / 55));
  const top = Array.from({ length: n + 1 }, (_, i) => [x + (w - 2 * 2) * (i / n) + 2, wl + (r() - 0.5) * 4]);
  const body = poly([...top, [x + w - inset - 4, y + depth - 4], [x + inset + 4, y + depth - 4]], "var(--water)");
  let facets = "";
  for (let i = 0; i < n; i++) facets += poly([top[i], top[i + 1], [(top[i][0] + top[i + 1][0]) / 2, wl + depth * 0.5]], i % 2 ? tint("water", 18) : shade("water", 14), 'opacity=".6"');
  return G(id, out + body + facets);
}
