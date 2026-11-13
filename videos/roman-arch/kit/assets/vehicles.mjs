import { poly, shade, tint, f } from "../lowpoly.mjs";

const oct = (cx, cy, r) => Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const G = (id, x, y, s, inner) => `<g ${id ? `id="${id}" ` : ""}transform="translate(${f(x)} ${f(y)}) scale(${s})">${inner}</g>`;

/** Small car (origin = rear bottom, faces right). Wheel groups `${id}-w0`, `${id}-w1` for rotation. */
export function car({ id = "", x = 0, y = 0, s = 1 } = {}) {
  const body = poly([[0, -6], [64, -6], [64, -17], [54, -19], [46, -27], [22, -27], [14, -19], [0, -17]], shade("water", 10)) +
    poly([[14, -19], [22, -27], [46, -27], [54, -19]], tint("water", 8)) +
    poly([[24, -25], [44, -25], [50, -19], [18, -19]], "var(--sky-2)");
  const wheel = (k, cx) => `<g id="${id}-w${k}" transform="rotate(0 ${cx} -6)">${poly(oct(cx, -6, 6), shade("earth-3", 30))}<line x1="${cx - 5}" y1="-6" x2="${cx + 5}" y2="-6" style="stroke:var(--stone);stroke-width:2"/></g>`;
  return { svg: G(id, x, y, s, body + wheel(0, 14) + wheel(1, 50)), wheels: [[`${id}-w0`, 14, -6], [`${id}-w1`, 50, -6]] };
}

/** Ox, feet at y 0, x -34…46, faces right. Body group `${id}-body` (bob). */
export function ox({ id = "", x = 0, y = 0, s = 1 } = {}) {
  const leg = (lx) => poly([[lx, -22], [lx + 7, -22], [lx + 7, 0], [lx, 0]], shade("earth-1", 20));
  const body = poly([[-34, -22], [-30, -46], [20, -48], [30, -36], [28, -22]], "var(--earth-1)") + poly([[-30, -46], [20, -48], [24, -42], [-26, -40]], tint("earth-1", 12));
  const head = poly([[26, -44], [44, -40], [46, -28], [34, -24], [26, -30]], shade("earth-1", 8)) + poly([[32, -46], [38, -58], [40, -46]], tint("sand", 20));
  const tail = `<line x1="-34" y1="-40" x2="-40" y2="-18" style="stroke:${shade("earth-1", 30)};stroke-width:3;stroke-linecap:round"/>`;
  return { svg: G(id, x, y, s, [-26, -14, 12, 22].map(leg).join("") + `<g id="${id}-body">${body}${head}${tail}</g>`) };
}

/** Cart, wheel centre (0,-16). Wheel group `${id}-wheel`. */
export function cart({ id = "", x = 0, y = 0, s = 1 } = {}) {
  const wheel = `<g id="${id}-wheel" transform="rotate(0 0 -16)">${poly(oct(0, -16, 16), "var(--wood)")}${poly(oct(0, -16, 5), shade("wood", 25))}` +
    [0, 45, 90, 135].map((a) => { const r = (a * Math.PI) / 180; return `<line x1="${f(-Math.cos(r) * 14)}" y1="${f(-16 - Math.sin(r) * 14)}" x2="${f(Math.cos(r) * 14)}" y2="${f(-16 + Math.sin(r) * 14)}" style="stroke:${shade("wood", 20)};stroke-width:3"/>`; }).join("") + `</g>`;
  const box = poly([[-40, -22], [40, -22], [44, -46], [-44, -46]], shade("wood", 6)) +
    `<line x1="-42" y1="-30" x2="42" y2="-30" style="stroke:${shade("wood", 22)};stroke-width:2"/><line x1="-43" y1="-38" x2="43" y2="-38" style="stroke:${shade("wood", 22)};stroke-width:2"/>`;
  const load = [[-30, -10], [-10, 10], [10, 30]].map(([a, b], i) => poly([[a, -46], [b + 0, -46], [b, -58], [a + 2, -58]], i % 2 ? shade("stone", 14) : "var(--stone)")).join("");
  const shaft = `<line x1="40" y1="-28" x2="78" y2="-30" style="stroke:var(--wood);stroke-width:4;stroke-linecap:round"/>`;
  return { svg: G(id, x, y, s, shaft + box + load + wheel) };
}
