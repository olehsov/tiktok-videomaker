import { poly, shade, tint, f } from "../lowpoly.mjs";

/**
 * Longitudinal section of a water channel (specus) along W from (x0,y0) to (x1,y1) (y = water surface).
 * Back face W-22..W+30 · water W..W+30 · floor W+30..W+40 · slabs W-36..W-22 · lining (tile tint + floor strip).
 * hidden: array of "water" | "lining" | "slabs" | "all" that start with opacity 0 (animated in by the scene).
 * slabRange: [xa, xb] limits the slabs. endWalls: { left, right } draw 8 wu stone walls.
 */
export function channel({ id, x0, x1, y0, y1, water = true, slabs = false, lining = false, back = "stone", backShade = 30, endWalls = {}, hidden = [], slabRange }) {
  const m = (y1 - y0) / (x1 - x0);
  const W = (x) => y0 + m * (x - x0);
  const band = (a, b, xa = x0, xb = x1) => [[xa, W(xa) + a], [xb, W(xb) + a], [xb, W(xb) + b], [xa, W(xa) + b]];
  const hid = (k) => (hidden.includes(k) || hidden.includes("all") ? ' style="opacity:0"' : "");
  let out = `<g id="${id}-back">${poly(band(-22, 30), shade(back, backShade))}${poly(band(-22, -6), shade(back, backShade + 10), 'opacity=".5"')}</g>`;
  if (water) {
    let w = poly(band(0, 30), "var(--water)");
    const n = Math.max(2, Math.round((x1 - x0) / 60));
    for (let i = 0; i < n; i++) {
      const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
      w += poly([[a, W(a)], [b, W(b)], [(a + b) / 2, W((a + b) / 2) + 22]], i % 2 ? tint("water", 18) : shade("water", 14), 'opacity=".55"');
    }
    out += `<g id="${id}-water"${hid("water")}>${w}</g>`;
  }
  out += `<g id="${id}-mud" style="opacity:0">${poly(band(0, 30), "color-mix(in srgb, var(--water) 45%, var(--earth-1))")}</g>`;
  out += `<g id="${id}-lining"${lining ? hid("lining") : ' style="opacity:0"'}>${poly(band(-22, 26), "var(--tile)", 'opacity=".85"')}${poly(band(26, 30), "var(--tile)")}</g>`;
  out += `<g id="${id}-floor">${poly(band(30, 40), shade("stone", 10))}</g>`;
  const slabIds = [];
  if (slabs) {
    const [sa, sb] = slabRange ?? [x0, x1];
    let k = 0, s = "";
    for (let x = sa; x < sb - 1; x += 52, k++) {
      const xe = Math.min(x + 50, sb);
      slabIds.push(`${id}-slab${k}`);
      s += `<g id="${id}-slab${k}">${poly(band(-36, -22, x, xe), "var(--stone)")}${poly(band(-36, -34, x, xe), tint("stone", 12))}</g>`;
    }
    out += `<g id="${id}-slabs"${hid("slabs")}>${s}</g>`;
  }
  let walls = "";
  if (endWalls.left) walls += poly([[x0 - 8, W(x0) - 36], [x0, W(x0) - 36], [x0, W(x0) + 40], [x0 - 8, W(x0) + 40]], "var(--stone)");
  if (endWalls.right) walls += poly([[x1, W(x1) - 36], [x1 + 8, W(x1) - 36], [x1 + 8, W(x1) + 40], [x1, W(x1) + 40]], shade("stone", 16));
  out += walls;
  return { svg: `<g id="${id}">${out}</g>`, slabIds, pivot: { x0, y0 }, W };
}
