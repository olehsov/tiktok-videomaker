// Hypocaust bath-house: world geometry (side cut-away), camera presets, helpers. Palette tokens only.
// World units live inside one camera group #bath-cam. Screen = s·world + (x, y).
import { poly, shade, tint, tf, f, prng, pts } from "../kit/lowpoly.mjs";
import { terrain, mountains, rocks, pool } from "../kit/assets/index.mjs";

export const r3 = (n) => Math.round(n * 1000) / 1000;
export const GY = 1150;
export const PILA_X = Array.from({ length: 12 }, (_, k) => 360 + 48 * k);
export const FLOOR = { x0: 336, x1: 940 };

export const CAM = {
  HOOK: { s: 1.55, x: -139.5, y: -700 },
  CLOSE: { s: 1.55, x: -139.5, y: -567.5 },
  WIDE: { s: 0.9, x: -89, y: 180 },
  STOKE: { s: 1.3, x: 124, y: -280 },
  PUSH: { s: 1.9, x: -352, y: -1016 },
  CLIMAX: { s: 1.2, x: 0, y: -165 },
  RECAP: { s: 0.78, x: 66.8, y: 583 },
};
export const camTf = (c) => tf({ x: c.x, y: c.y, sx: c.s, sy: c.s });
export const toScreen = (cam, wx, wy) => ({ x: r3(cam.s * wx + cam.x), y: r3(cam.s * wy + cam.y) });

const rect = (x0, y0, x1, y1, fill, extra = "") => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, extra);
const frect = (id, x0, y0, x1, y1, fill, o = 0) => `<rect id="${id}" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" style="fill:${fill};opacity:${o}"/>`;
const line = (x1, y1, x2, y2, stroke, w) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" style="stroke:${stroke};stroke-width:${w};stroke-linecap:round"/>`;
const cutFace = (x0, y0, x1, y1) => rect(x0, y0, x1, y1, tint("sand", 6)) + rect(x0 + (x1 - x0) * 0.7, y0, x1, y1, shade("sand", 10));

/** yellow/world outline copy (recap, highlights): shapes = array of point lists */
export const outline = (id, shapes, w = 6) =>
  `<g id="${id}" style="opacity:0">${shapes.map((p) => `<polygon points="${pts(p)}" style="fill:none;stroke:var(--ui-yellow);stroke-width:${w};stroke-linejoin:round"/>`).join("")}</g>`;
export const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// ------------------------------------------------------------ back layers
export function hillsSvg() {
  const m = (id, snow) => `<g id="${id}" ${snow ? 'style="opacity:0"' : ""}><g transform="translate(-700 0)">${mountains({ y: GY, w: 2600, count: 6, height: 300, snow, token: "green-mid" })}</g></g>`;
  return m("bath-hills", false) + m("hillsSnow", true);
}
export function groundSvg() {
  let out = terrain({ id: "bath-ter", x: -700, y: GY, w: 2600, h: 1250, layers: [110, 360], top: "grass", seed: 7 });
  out += `<g id="groundSnow" transform="${tf({ py: 1152, sy: 0 })}">` + rect(-700, 1140, 300, 1152, "var(--snow)") + rect(1256, 1140, 1900, 1152, "var(--snow)") + `</g>`;
  const foot = (x0, x1) => rect(x0, GY, x1, 1240, shade("stone", 12)) + rect((x0 + x1) / 2, GY, x1, 1240, shade("stone", 22));
  out += foot(296, 340) + foot(936, 974) + foot(1216, 1260) + foot(136, 304);
  out += rocks({ id: "bath-rk1", x: -220, y: 1420, s: 0.7, count: 2, seed: 5 }) + rocks({ id: "bath-rk2", x: 560, y: 1560, s: 0.6, count: 2, seed: 6 }) +
    rocks({ id: "bath-rk3", x: 1080, y: 1380, s: 0.8, count: 2, seed: 8 }) + rocks({ id: "bath-rk4", x: 1500, y: 1500, s: 0.6, count: 2, seed: 9 });
  return out;
}

// ------------------------------------------------------------ furnace (praefurnium)
export function furnaceSvg(fireSvg) {
  const courses = [0, 1, 2, 3].map((i) => {
    const y1 = 1150 - 40 * i, y0 = y1 - 40;
    return `<g id="furn-c${i}" style="opacity:0">${rect(140, y0, 300, y1, "var(--stone)")}${rect(260, y0, 300, y1, shade("stone", 16))}${line(140, y0, 300, y0, shade("stone", 28), 3)}${line(i % 2 ? 190 : 240, y0, i % 2 ? 190 : 240, y1, shade("stone", 28), 3)}</g>`;
  }).join("");
  const slab = `<g id="furn-slab" style="opacity:0">${rect(132, 978, 308, 990, tint("stone", 12))}</g>`;
  const tunnel = `<g id="furn-tunnel" style="opacity:0">${poly([[140, 1150], [140, 1092], [158, 1076], [190, 1068], [300, 1068], [300, 1150]], shade("earth-3", 38))}` +
    poly([[148, 1096], [160, 1100], [162, 1140], [148, 1146]], tint("earth-1", 4)).replace(/.*/, "") +
    `<ellipse id="furn-glow" cx="220" cy="1120" rx="70" ry="26" style="fill:var(--ui-heat);opacity:0"/>` +
    // stokehole voussoirs
    [[[140, 1100], [152, 1100], [158, 1086], [146, 1090]], [[146, 1090], [158, 1086], [168, 1076], [156, 1074]], [[156, 1074], [168, 1076], [180, 1070], [176, 1068]], [[140, 1100], [140, 1092], [146, 1090], [152, 1100]], [[176, 1068], [180, 1070], [176, 1090], [170, 1086]]]
      .map((p, i) => poly(p, i % 2 ? shade("earth-1", 14) : tint("earth-1", 4))).join("") + `</g>`;
  return courses + tunnel + slab + `<g id="furnFireW" transform="${tf({ px: 218, py: 1150, sx: 0, sy: 0 })}">${fireSvg}</g>`;
}

// ------------------------------------------------------------ building shell
export function backWallSvg() {
  const win = (x0, x1) => {
    const m = (x0 + x1) / 2, w = x1 - x0;
    const p = [[x0, 800], [x0, 745], [x0 + w * 0.2, 725], [m, 718], [x1 - w * 0.2, 725], [x1, 745], [x1, 800]];
    return `<polygon points="${pts(p)}" style="fill:var(--sky-2);stroke:${shade("wood", 10)};stroke-width:4;stroke-linejoin:round"/>`;
  };
  return rect(336, 660, 1220, 1150, tint("sand", 24)) + rect(336, 960, 1220, 1150, tint("earth-1", 30)) + win(430, 500) + win(770, 830) + win(1070, 1130) + rect(336, 650, 1220, 660, shade("wood", 12));
}
export function leftWallSvg() {
  return cutFace(300, 660, 336, GY) + `<g id="wallMouth" style="opacity:0">${poly([[300, 1068], [336, 1068], [336, 1150], [300, 1150]], shade("earth-3", 38))}</g>` +
    `<g id="wallWarm">${frect("wallWarmL", 300, 660, 336, GY, "var(--ui-heat)")}${frect("wallWarmA", 650, 660, 680, 1028, "var(--ui-heat)")}</g>`;
}
/** partition lower pieces (behind the cavity), right wall, frigidarium floor */
export function lowerShellSvg() {
  return cutFace(650, 1028, 680, GY) + cutFace(940, 1028, 970, GY) + cutFace(1220, 660, 1256, GY);
}
/** partition upper pieces — drawn in front of the floor */
export function upperShellSvg() {
  return cutFace(650, 660, 680, 1028) + cutFace(940, 660, 970, 1028);
}
export function frigFloorSvg() {
  return rect(970, 1028, 1220, 1066, tint("stone", 14)) + rect(1100, 1028, 1220, 1066, shade("stone", 4)) + rect(970, 1066, 1220, 1150, "var(--earth-2)") +
    `<g id="pool" style="opacity:0"><g id="poolS" transform="${tf({ px: 1110, py: 1090, sy: 0.15 })}">${pool({ id: "bath-pool", x: 1040, y: 1028, w: 140, depth: 62 })}</g></g>`;
}
export function glowsSvg() {
  return frect("glowC", 336, 660, 650, 1028, "var(--ui-heat)") + frect("glowT", 680, 660, 940, 1028, "var(--ui-heat)") +
    frect("glowF", 970, 660, 1220, 1028, "var(--ui-blue)") +
    frect("glowAmber", 336, 660, 650, 1028, "color-mix(in srgb, var(--ui-heat) 60%, var(--ui-yellow))");
}

// ------------------------------------------------------------ cavity + floor
export function cavitySvg(streamsSvg) {
  let out = frect("cavityBack", 336, 1066, 940, 1150, shade("earth-3", 30)) + rect(336, 1150, 940, 1162, shade("stone", 18));
  out += `<g id="streamsUnder">${streamsSvg}</g>`;
  let pil = "";
  PILA_X.forEach((cx, k) => {
    let p = "";
    for (let t = 0; t < 7; t++) {
      const y1 = 1150 - 12 * t, y0 = y1 - 12;
      p += rect(cx - 14, y0, cx + 14, y1, t % 2 ? shade("earth-1", 6) : tint("earth-1", 8)) + rect(cx + 6, y0, cx + 14, y1, shade("earth-1", 20));
    }
    pil += `<g id="pila${k}">${p}</g>`;
  });
  out += `<g id="pilae" transform="${tf({ py: 1150, sy: 0 })}">${pil}</g>`;
  return out;
}
/** inner of #floorRise (without ride) */
export function floorSvg() {
  const r = prng(31);
  const segs = [336, ...PILA_X, 940];
  let big = "";
  for (let i = 0; i < segs.length - 1; i++) big += rect(segs[i], 1056, segs[i + 1], 1066, i % 2 ? shade("earth-1", 4) : tint("earth-1", 14));
  let seams = "";
  PILA_X.forEach((x) => (seams += line(x, 1056, x, 1066, shade("earth-1", 22), 2)));
  let dots = "";
  for (let i = 0; i < 14; i++) dots += `<circle cx="${f(344 + r() * 590)}" cy="${f(1040 + r() * 12)}" r="${f(2 + r() * 2.5)}" style="fill:${shade("stone", 24)}"/>`;
  let top = "";
  const nTop = Math.ceil((940 - 336) / 40);
  for (let j = 0; j < nTop; j++) top += rect(336 + 40 * j, 1028, Math.min(940, 336 + 40 * (j + 1)), 1036, j % 2 ? shade("stone", 6) : tint("stone", 22));
  let topSeams = "";
  for (let j = 1; j < nTop; j++) topSeams += line(336 + 40 * j, 1028, 336 + 40 * j, 1036, shade("stone", 6), 2);
  const yel = PILA_X.map((x) => line(x, 1028, x, 1066, "var(--ui-yellow)", 4)).join("") + Array.from({ length: nTop - 1 }, (_, j) => line(376 + 40 * j, 1028, 376 + 40 * j, 1036, "var(--ui-yellow)", 4)).join("");
  const mort = [...PILA_X, 520].map((x) => line(x, 1028, x, 1066, tint("stone", 30), 4)).join("");
  const crack = `<g id="crack" transform="${tf({ px: 520, py: 1028, sy: 0 })}">` + poly([[518, 1028], [524, 1028], [522, 1038], [526, 1046], [521, 1054], [525, 1066], [519, 1066], [517, 1056], [522, 1048], [517, 1038]], shade("earth-3", 40)) + `</g>`;
  return `<g id="flBig">${big}<g id="seamsBig">${seams}</g></g>` +
    frect("flBigY", 336, 1056, 940, 1066, "none").replace('style="fill:none;opacity:0"', 'style="fill:none;stroke:var(--ui-yellow);stroke-width:4;opacity:0"') +
    `<g id="flConc" transform="${tf({ py: 1056, sy: 0 })}">${rect(336, 1036, 940, 1056, shade("stone", 8))}${dots}</g>` +
    `<g id="flTop" transform="${tf({ py: 1036, sy: 0 })}">${top}${topSeams}</g>` +
    frect("floorWarmB01", 336, 1056, 940, 1066, "var(--ui-heat)") + frect("floorWarm", 336, 1056, 940, 1066, "var(--ui-heat)") +
    frect("floorWarmAll", 336, 1028, 940, 1066, "var(--ui-heat)") + frect("hotSpot", 336, 1056, 500, 1066, "var(--ui-heat)") + frect("hotSpotR", 336, 1056, 500, 1066, "var(--ui-red)") +
    frect("coldRest", 500, 1056, 940, 1066, "var(--ui-blue)") + frect("floorCold", 336, 1028, 940, 1036, "var(--ui-blue)") +
    crack + `<g id="mortar" style="opacity:0">${mort}</g><g id="jointsY" style="opacity:0">${yel}</g>`;
}

// ------------------------------------------------------------ flues, vents, roof
export function boxTiles(id, x0, w, n = 11) {
  const pitch = 35.5, h = 33.5;
  let out = "";
  for (let k = 0; k < n; k++) {
    const y1 = 1060 - pitch * k, y0 = y1 - h;
    out += `<g id="${id}-t${k}" style="opacity:0">${rect(x0, y0, x0 + w, y1, tint("earth-1", 6))}${rect(x0 + 4, y0 + 4, x0 + w - 4, y1 - 4, shade("earth-3", 35))}</g>`;
  }
  return `<g id="${id}">${out}</g>`;
}
export function ventsSvg() {
  const vent = (id, x0, x1, ry, top) => `<g id="${id}" transform="${tf({ py: ry, sy: 0 })}">${rect(x0, top, x1, ry + 4, shade("stone", 6))}${rect(x0 - 2, top - 6, x1 + 2, top, shade("stone", 6))}</g>`;
  return vent("ventL", 306, 330, 656, 618) + vent("ventA", 656, 674, 586, 552);
}
export function roofSvg() {
  const tri = (a, b, c, fill) => poly([a, b, c], fill);
  let out = tri([280, 660], [778, 560], [778, 660], shade("earth-1", 4)) + tri([778, 560], [1276, 660], [778, 660], shade("earth-1", 16));
  out += poly([[280, 660], [778, 560], [778, 572], [280, 672]], tint("earth-1", 10)) + poly([[778, 560], [1276, 660], [1276, 672], [778, 572]], shade("earth-1", 4));
  out += `<g id="roofSnow" style="opacity:0">` + poly([[280, 660], [778, 560], [778, 546], [280, 646]], "var(--snow)") + poly([[778, 560], [1276, 660], [1276, 646], [778, 546]], shade("snow", 10)) +
    [300, 1240, 1262].map((x) => poly([[x - 5, x < 700 ? 656 : 654], [x + 5, x < 700 ? 656 : 654], [x, 682]], tint("snow", 10))).join("") + `</g>`;
  return out;
}
export function flueGroupSvg() { return boxTiles("flueL", 306, 24) + boxTiles("flueA", 656, 18); }

// ------------------------------------------------------------ woodpile
export function woodpileSvg() {
  let out = `<g id="wpShadow"><ellipse cx="18" cy="1155" rx="85" ry="10" style="fill:var(--shade-target);opacity:var(--shadow-op,0.25)"/></g>`;
  const oct = (cx, cy, r) => Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  for (let r = 0; r < 6; r++) {
    let row = "";
    for (let i = 0; i < 6 - r; i++) {
      const cx = -60 + 13 + 26 * i + 13 * r, cy = 1150 - 13 - 22.5 * r;
      row += poly(oct(cx, cy, 13), tint("wood", 30)) + poly(oct(cx, cy, 6), shade("wood", 6)) + poly([[cx + 13 * 0.38, cy + 13 * 0.92], [cx + 13 * 0.92, cy + 13 * 0.38], [cx + 13 * 0.92, cy - 13 * 0.38], [cx + 13 * 0.38, cy + 13 * 0.92]].slice(0, 3), shade("wood", 18));
    }
    const px = -60 + 13 + 13 * r + (6 - r) * 13 - 13, py = 1150 - 22.5 * r;
    out += `<g id="wp-r${r}" transform="${tf({ px, py, sx: r ? 0 : 1, sy: r ? 0 : 1 })}">${row}</g>`;
  }
  return out;
}
export const wpRow = (r) => ({ px: -60 + 13 + 13 * r + (6 - r) * 13 - 13, py: 1150 - 22.5 * r });

// ------------------------------------------------------------ snow, pizza icon
export function snowfallSvg() {
  const r = prng(77);
  let out = "";
  const flakes = [];
  for (let i = 0; i < 40; i++) {
    const left = i % 5 === 4;
    const x = left ? -100 + r() * 390 : -100 + r() * 1500, y = left ? 640 + r() * 240 : 100 + r() * 540, s = 4 + r() * 3;
    flakes.push({ x, y, d: (r() - 0.5) * 40 });
    out += poly([[x, y - s * 1.4], [x + s, y], [x, y + s * 1.4], [x - s, y]], "var(--snow)", `id="flake${i}"`);
  }
  return { svg: `<g id="snowfall" style="opacity:0">${out}</g>`, flakes };
}
export function pizzaSvg() {
  return `<g id="pizza" style="opacity:0"><circle cx="870" cy="660" r="50" style="fill:var(--panel-bg)"/>` +
    `<ellipse cx="870" cy="680" rx="34" ry="9" style="fill:${tint("stone", 10)};stroke:${shade("stone", 14)};stroke-width:3"/>` +
    poly([[848, 672], [892, 672], [870, 646]], tint("earth-1", 20)) +
    [[862, 665], [876, 666], [869, 656]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" style="fill:var(--ui-heat)"/>`).join("") +
    [852, 870, 888].map((x) => line(x, 624, x, 636, "var(--ui-heat)", 3)).join("") + `</g>`;
}
