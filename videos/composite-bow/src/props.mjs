// Video-specific props (low-poly SVG strings, palette tokens only).
import { poly, shade, tint, prng, f, pts } from "../kit/lowpoly.mjs";

/** cauldron on legs, centred on x, its feet at y. 120×90 at s=1 */
export function gluePot({ id, x, y, s = 1 }) {
  const P = (a, b) => [x + a * s, y + b * s];
  const body = [P(-60, -60), P(-40, -90), P(40, -90), P(60, -60), P(60, -30), P(40, -6), P(-40, -6), P(-60, -30)];
  const left = [P(-60, -60), P(-40, -90), P(0, -90), P(0, -6), P(-40, -6), P(-60, -30)];
  return `<g id="${id}">` +
    poly([P(-40, -6), P(-30, 0), P(-18, 0), P(-22, -6)], shade("stone", 42)) + poly([P(22, -6), P(18, 0), P(30, 0), P(40, -6)], shade("stone", 42)) +
    poly(body, shade("stone", 42)) + poly(left, shade("stone", 30)) +
    `<ellipse cx="${f(x)}" cy="${f(y - 90 * s)}" rx="${f(46 * s)}" ry="${f(10 * s)}" style="fill:${shade("stone", 20)}"/>` +
    `<ellipse cx="${f(x)}" cy="${f(y - 90 * s)}" rx="${f(36 * s)}" ry="${f(7 * s)}" style="fill:${tint("sand", 10)}"/></g>`;
}
/** flat hide scrap, 70×50, centred */
export const hideIcon = ({ id, x, y }) =>
  `<g id="${id}" style="opacity:0">${poly([[x - 35, y - 12], [x - 14, y - 25], [x + 18, y - 22], [x + 35, y - 4], [x + 22, y + 24], [x - 22, y + 20]], tint("earth-1", 15))}${poly([[x - 14, y - 25], [x + 18, y - 22], [x + 8, y], [x - 20, y + 4]], tint("earth-1", 30))}</g>`;
/** fish, 80×36, centred */
export const fishIcon = ({ id, x, y }) =>
  `<g id="${id}" style="opacity:0">${poly([[x - 40, y], [x - 12, y - 18], [x + 22, y - 6], [x + 22, y + 6], [x - 12, y + 18]], tint("water", 20))}${poly([[x + 20, y], [x + 40, y - 16], [x + 40, y + 16]], shade("water", 10))}<circle cx="${x - 24}" cy="${y - 3}" r="3" style="fill:var(--earth-3)"/></g>`;
/** spring zigzag 60×24 with end bars */
export function springIcon({ id, x, y }) {
  const p = [[x - 30, y]];
  for (let i = 0; i < 6; i++) p.push([x - 30 + (i + 0.5) * 10, y + (i % 2 ? 12 : -12)]);
  p.push([x + 30, y]);
  return `<g id="${id}" style="opacity:0"><polyline points="${pts(p)}" style="fill:none;stroke:${tint("stone", 20)};stroke-width:6;stroke-linejoin:round;stroke-linecap:round"/>` +
    `<line x1="${x - 34}" y1="${y - 16}" x2="${x - 34}" y2="${y + 16}" style="stroke:${tint("stone", 20)};stroke-width:6;stroke-linecap:round"/><line x1="${x + 34}" y1="${y - 16}" x2="${x + 34}" y2="${y + 16}" style="stroke:${tint("stone", 20)};stroke-width:6;stroke-linecap:round"/></g>`;
}
/** rubber band loop 70×30 */
export const bandIcon = ({ id, x, y }) =>
  `<g id="${id}" style="opacity:0"><ellipse cx="${x}" cy="${y}" rx="35" ry="15" style="fill:none;stroke:${tint("earth-1", 10)};stroke-width:6"/></g>`;

/** four horizontal mist bands (1400 wide), at y 700/850/1000/1150. Groups `${id}-b0…b3`. */
export function mist({ id }) {
  const r = prng(17);
  let out = "";
  [700, 850, 1000, 1150].forEach((y, i) => {
    const h = 70 + r() * 50, top = [], bot = [];
    for (let k = 0; k <= 14; k++) { const x = (k * 1400) / 14; top.push([x, y - h / 2 - r() * 18]); bot.push([x, y + h / 2 + r() * 18]); }
    out += `<g id="${id}-b${i}" transform="translate(-1400 0)">${poly([...top, ...bot.reverse()], tint("water", 45), `opacity="${(0.35 + r() * 0.15).toFixed(2)}"`)}</g>`;
  });
  return out;
}
/** leather sheath: top 170 wide, bottom 110, rounded bottom, centred on x, top at yTop */
export function bowCase({ id, x, yTop, h, w = 170 }) {
  const wb = w * 0.65, r = wb / 2;
  const L = [[x - w / 2, yTop], [x, yTop], [x, yTop + h], [x - wb / 2 + 8, yTop + h], [x - wb / 2, yTop + h - 14]];
  const R = [[x, yTop], [x + w / 2, yTop], [x + wb / 2, yTop + h - 14], [x + wb / 2 - 8, yTop + h], [x, yTop + h]];
  return `<g id="${id}">${poly(L, shade("wood", 22))}${poly(R, shade("wood", 34))}` +
    `<polyline points="${pts([[x + w * 0.3, yTop + 30], [x + wb * 0.3, yTop + h - 20]])}" style="fill:none;stroke:${tint("sand", 10)};stroke-width:3;stroke-dasharray:8 7"/>` +
    poly([[x - w / 2 - 2, yTop + 16], [x + w / 2 + 2, yTop + 16], [x + w / 2 + 1, yTop + 36], [x - w / 2 - 1, yTop + 36]], "var(--earth-3)") + `</g>`;
}
/** block hand with its tip at the origin of (x,y). dir 'right': sleeve extends to the right (comes in from the right); 'left' mirrored. */
export function hand({ id, x = 0, y = 0, dir = "right" }) {
  const m = dir === "right" ? 1 : -1;
  const R = (a, b, c, d) => [[x + m * a, y + b], [x + m * c, y + b], [x + m * c, y + d], [x + m * a, y + d]];
  return `<g id="${id}" style="opacity:0">${poly(R(0, -18, 34, 18), tint("sand", 22))}${poly(R(34, -18, 94, 18), shade("earth-1", 10))}</g>`;
}
/** arrow with its nock (tail) at the origin, pointing right: shaft, head, fletching */
export function arrow({ id, len = 150, x = 0, y = 0, extra = "" }) {
  return `<g id="${id}" ${extra}>` +
    poly([[x, y - 2.5], [x + len, y - 2.5], [x + len, y + 2.5], [x, y + 2.5]], "var(--wood)") +
    poly([[x + len - 4, y - 8], [x + len + 18, y], [x + len - 4, y + 8]], "var(--stone)") +
    poly([[x, y], [x - 4, y - 11], [x + 22, y]], tint("sand", 20)) + poly([[x, y], [x - 4, y + 11], [x + 22, y]], tint("sand", 20)) + `</g>`;
}
/** burrow: spoil mound by the hole at (860,1100), tunnel down to the chamber (930,1190) */
export function burrow({ id }) {
  return `<g id="${id}">` +
    poly([[815, 1100], [832, 1086], [852, 1082], [872, 1100]], "var(--earth-1)") +
    poly([[848, 1098], [872, 1098], [972, 1180], [950, 1214], [900, 1206]], shade("earth-3", 10)) +
    `<ellipse cx="930" cy="1190" rx="70" ry="34" style="fill:${shade("earth-3", 10)}"/>` +
    `<ellipse cx="860" cy="1100" rx="20" ry="6" style="fill:${shade("earth-3", 30)}"/></g>`;
}
