import { poly, shade, tint, prng, groundShadow } from "../lowpoly.mjs";

/** A cluster of faceted rocks sitting on y. s = scale. */
export function rocks({ id = "", x = 0, y = 0, s = 1, count = 3, seed = 5 } = {}) {
  const r = prng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const ox = x + i * 46 * s + (r() - 0.5) * 20 * s;
    const w = (44 + r() * 40) * s, h = (30 + r() * 36) * s;
    const a = [ox, y], b = [ox + w * 0.15, y - h * 0.7], c = [ox + w * 0.5, y - h], d = [ox + w * 0.9, y - h * 0.55], e = [ox + w, y];
    out += groundShadow(ox + w / 2, y, w * 1.15) + poly([a, b, c, [ox + w * 0.5, y]], tint("stone", 10));
    out += poly([c, d, e, [ox + w * 0.5, y]], shade("stone", 12));
    out += poly([b, c, [ox + w * 0.35, y - h * 0.45]], tint("stone", 28), 'opacity=".7"');
  }
  return `<g ${id ? `id="${id}"` : ""}>${out}</g>`;
}
