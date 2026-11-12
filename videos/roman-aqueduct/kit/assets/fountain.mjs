import { poly, shade, tint, f } from "../lowpoly.mjs";

/** Fountain: basin 50×14 + column 10×42 + spout. (x,y) = basin centre at ground level. ids: -water (basin), -jetThin, -jetFull, -splash (6 droplets). */
export function fountain({ id, x, y, s = 1 }) {
  const P = (px, py) => [px, py];
  const basin = poly([[-25, -14], [25, -14], [25, 0], [-25, 0]], "var(--stone)") +
    poly([[0, -14], [25, -14], [25, 0], [0, 0]], shade("stone", 14)) +
    poly([[-21, -12], [21, -12], [21, -2], [-21, -2]], shade("stone", 40));
  const water = `<g id="${id}-water">${poly([[-21, -12], [21, -12], [21, -2], [-21, -2]], "var(--water)")}${poly([[-21, -12], [0, -12], [-8, -2], [-21, -2]], tint("water", 18), 'opacity=".5"')}</g>`;
  const rim = poly([[-27, -16], [27, -16], [25, -12], [-25, -12]], tint("stone", 15));
  const col = poly([[-5, -14], [5, -14], [5, -42], [-5, -42]], "var(--sand)") + poly([[0, -14], [5, -14], [5, -42], [0, -42]], shade("sand", 16));
  const spout = poly([[3, -39], [11, -39], [11, -33], [3, -33]], shade("stone", 30));
  const jt = `<path id="${id}-jetThin" d="M11 -36 Q22 -42 21 -12" pathLength="1" fill="none" stroke-linecap="round" style="stroke:var(--water);stroke-width:3;stroke-dasharray:1 2;stroke-dashoffset:1;opacity:0"/>`;
  const jf = `<path id="${id}-jetFull" d="M11 -36 Q30 -66 20 -12" pathLength="1" fill="none" stroke-linecap="round" style="stroke:var(--water);stroke-width:6;stroke-dasharray:1 2;stroke-dashoffset:1;opacity:0"/>`;
  const drops = Array.from({ length: 6 }, (_, i) => `<g transform="translate(${f(12 + i * 4)} -14)">` + poly([[0, -3], [2.5, 0], [0, 3], [-2.5, 0]], tint("water", 30), `id="${id}-sp${i}" opacity="0"`) + "</g>").join("");
  return `<g id="${id}" transform="translate(${f(x)} ${f(y)}) scale(${s})">${col}${spout}${basin}${water}${rim}${jt}${jf}<g id="${id}-splash">${drops}</g></g>`;
}
