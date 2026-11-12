import { poly, shade, tint, prng } from "../lowpoly.mjs";

/** Faceted cloud (5–7 lobes). tone "storm" (dark) or "overcast" (grey). (x,y) centre, w width. */
export function cloud({ id, x, y, w, tone = "storm", seed = 5 }) {
  const r = prng(seed);
  const [a, b] = tone === "storm" ? [shade("stone", 35), shade("stone", 45)] : ["var(--stone)", tint("stone", 10)];
  const n = 5 + Math.floor(r() * 3);
  let out = "";
  for (let i = 0; i < n; i++) {
    const cx = x - w / 2 + (w * (i + 0.5)) / n, rad = w * (0.13 + r() * 0.07) * (1 - Math.abs(i - n / 2 + 0.5) / n * 0.7), cy = y - r() * w * 0.06;
    const oct = Array.from({ length: 7 }, (_, k) => { const ang = (k / 7) * Math.PI * 2; return [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.8]; });
    out += poly(oct, i % 2 ? a : b);
    out += poly([[cx, cy], oct[1], oct[2], oct[3]], i % 2 ? b : a, 'opacity=".7"');
  }
  out += poly([[x - w / 2 + w * 0.05, y + w * 0.07], [x + w / 2 - w * 0.05, y + w * 0.07], [x + w * 0.4, y - w * 0.05], [x - w * 0.4, y - w * 0.05]], a);
  return `<g id="${id}" style="opacity:0">${out}</g>`;
}
