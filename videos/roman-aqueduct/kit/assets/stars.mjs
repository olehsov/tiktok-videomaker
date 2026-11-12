import { poly, prng } from "../lowpoly.mjs";

/** Seeded star field (4-point diamonds). Group opacity is meant to be tweened (fade in at night). */
export function stars({ id = "", n = 40, w = 1080, h = 700, seed = 11 } = {}) {
  const r = prng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const cx = r() * w, cy = r() * h, s = 3 + r() * 5;
    out += poly([[cx, cy - s * 1.6], [cx + s * 0.6, cy], [cx, cy + s * 1.6], [cx - s * 0.6, cy]], "var(--snow)", `opacity="${(0.5 + r() * 0.5).toFixed(2)}"`);
  }
  return `<g ${id ? `id="${id}"` : ""} style="opacity:0">${out}</g>`;
}
