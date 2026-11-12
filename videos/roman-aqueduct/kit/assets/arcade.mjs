import { poly, shade, tint, f, pts } from "../lowpoly.mjs";

/**
 * Multi-tier Roman arcade. tiers bottom→top: [{x0,x1,n,h}]; the top tier has a sloped top (top0 at x0, top1 at x1) and flat bottom,
 * tiers below are rectangles stacked down to `base` (the bottom tier's h is "the rest").
 * Each tier = one evenodd path (outer minus n arch openings) + voussoir rings, shaded pier sides, cornice. Groups `${id}-t0..`.
 */
export function arcade({ id, x0, x1, top0, top1, base, tiers }) {
  const nT = tiers.length;
  const topAt = (x) => top0 + ((x - x0) / (x1 - x0)) * (top1 - top0);
  const topT = tiers[nT - 1];
  let flatTop = Math.max(topAt(topT.x0), topAt(topT.x1)) + topT.h; // bottom of the top tier
  const geo = [];
  geo[nT - 1] = { top: (x) => topAt(x), bot: flatTop };
  let y = flatTop;
  for (let i = nT - 2; i >= 0; i--) {
    const bot = i === 0 ? base : y + tiers[i].h;
    geo[i] = { top: () => y, bot };
    y = bot;
  }
  let svg = "";
  const out = [];
  tiers.forEach((t, i) => {
    const g = geo[i], isTop = i === nT - 1;
    const m = (t.x1 - t.x0) / t.n, pw = (isTop ? 0.3 : 0.28) * m, ow = m - pw, r = ow / 2;
    const h = g.bot - Math.min(g.top(t.x0), g.top(t.x1));
    const spring = (isTop ? 0.35 : 0.45) * (isTop ? t.h : g.bot - g.top(t.x0));
    let d = `M${f(t.x0)} ${f(g.top(t.x0))}L${f(t.x1)} ${f(g.top(t.x1))}L${f(t.x1)} ${f(g.bot)}L${f(t.x0)} ${f(g.bot)}Z`;
    let ring = "", side = "";
    for (let k = 0; k < t.n; k++) {
      const c = t.x0 + (k + 0.5) * m, l = c - r, rr = c + r, sy = g.bot - spring;
      const arc = [];
      for (let s = 0; s <= 6; s++) { const a = Math.PI - (s / 6) * Math.PI; arc.push([c + Math.cos(a) * r, sy - Math.sin(a) * r]); }
      d += `M${f(l)} ${f(g.bot)}L${f(l)} ${f(sy)}` + arc.map(([ax, ay]) => `L${f(ax)} ${f(ay)}`).join("") + `L${f(rr)} ${f(g.bot)}Z`;
      ring += `<path d="M${f(l)} ${f(sy)}${arc.map(([ax, ay]) => `L${f(ax)} ${f(ay)}`).join("")}L${f(rr)} ${f(sy)}" fill="none" style="stroke:${shade("sand", 18)}" stroke-width="${isTop ? 3 : 6}" stroke-linejoin="round"/>`;
      // shaded right side of the pier to the right of this opening
      const px1 = c + m - r, sw = Math.min(8, pw / 2);
      if (k < t.n - 1 || true) side += poly([[px1 - sw, g.top(px1 - sw)], [px1, g.top(px1)], [px1, g.bot], [px1 - sw, g.bot]], shade("sand", 28), 'opacity=".9"');
    }
    const cornice = poly([[t.x0, g.top(t.x0)], [t.x1, g.top(t.x1)], [t.x1, g.top(t.x1) + 4], [t.x0, g.top(t.x0) + 4]], shade("sand", 30));
    svg += `<g id="${id}-t${i}"><path d="${d}" fill-rule="evenodd" style="fill:${tint("sand", 4)}"/>${side}${ring}${cornice}</g>`;
    out.push({ id: `${id}-t${i}`, pivot: { x: (t.x0 + t.x1) / 2, y: g.bot } });
  });
  return { svg: `<g id="${id}">${svg}</g>`, tiers: out };
}
