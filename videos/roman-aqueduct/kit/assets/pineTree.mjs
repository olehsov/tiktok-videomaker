import { poly, shade, tint } from "../lowpoly.mjs";

/** Low-poly pine: trunk + 3 stacked two-tone triangles. (x,y) = trunk base, s = scale (1 ≈ 230 px tall). */
export function pineTree({ id = "", x = 0, y = 0, s = 1 } = {}) {
  const P = (px, py) => [x + px * s, y + py * s];
  let out = poly([P(-9, 0), P(9, 0), P(7, -50), P(-7, -50)], shade("wood", 6));
  out += poly([P(0, 0), P(9, 0), P(7, -50), P(0, -50)], shade("wood", 22));
  const tiers = [[-70, 78, -52], [-122, 60, -96], [-170, 42, -144]]; // [tipOffset, halfWidth, baseY]
  tiers.forEach(([, hw, by], i) => {
    const tip = P(0, by - 78 + i * 6 - 6 * i);
    const l = P(-hw, by), r = P(hw, by), m = P(0, by + 4);
    out += poly([tip, l, m], i % 2 ? "var(--green-mid)" : "var(--green-dark)");
    out += poly([tip, r, m], i % 2 ? shade("green-mid", 22) : shade("green-dark", 24));
    out += poly([tip, P(-hw * 0.4, by - 14), P(-hw * 0.1, by - 30)], tint("green-mid", 14), 'opacity=".6"');
  });
  return `<g ${id ? `id="${id}"` : ""}>${out}</g>`;
}
