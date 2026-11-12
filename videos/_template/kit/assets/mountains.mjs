import { poly, shade, tint, prng, far } from "../lowpoly.mjs";

/** Distant mountain range on a baseline y: two-tone faceted peaks, optional snow caps. */
export function mountains({ id = "", y = 900, w = 1080, seed = 3, count = 5, height = 260, snow = true, token = "stone" } = {}) {
  const r = prng(seed);
  const slot = w / count;
  let out = "";
  for (let i = 0; i < count; i++) {
    const cx = slot * (i + 0.5) + (r() - 0.5) * slot * 0.3;
    const hh = height * (0.6 + r() * 0.5);
    const half = slot * (0.75 + r() * 0.25);
    const peak = [cx, y - hh];
    const left = [cx - half, y], right = [cx + half, y];
    const ridge = [cx + (r() - 0.5) * 30, y - hh * 0.35];
    out += poly([left, peak, ridge, [cx, y]], far(tint(token, 6), 0.9));
    out += poly([peak, right, [cx, y], ridge], far(shade(token, 16), 0.9));
    if (snow && hh > height * 0.8) {
      const k = 0.22;
      const l = [peak[0] - half * k, peak[1] + hh * k], rr = [peak[0] + half * k, peak[1] + hh * k];
      out += poly([peak, l, [cx - half * 0.06, peak[1] + hh * k * 0.7], [cx + half * 0.08, peak[1] + hh * k * 1.1], rr], far("var(--snow)", 0.9));
    }
  }
  return `<g ${id ? `id="${id}"` : ""}>${out}</g>`;
}
