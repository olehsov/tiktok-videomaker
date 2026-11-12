import { poly, shade, tint, prng, f, pts } from "../lowpoly.mjs";

const yAt = (surface, x) => {
  if (x <= surface[0][0]) return surface[0][1];
  for (let i = 0; i < surface.length - 1; i++) {
    const [ax, ay] = surface[i], [bx, by] = surface[i + 1];
    if (x <= bx) return bx === ax ? by : ay + ((x - ax) / (bx - ax)) * (by - ay);
  }
  return surface[surface.length - 1][1];
};

/** Grass strip (16–22 wu, green-mid + facets) along a surface polyline between x0 and x1. Removable: pass an id. */
export function grassStrip({ id = "", surface, x0, x1, seed = 11 }) {
  const r = prng(seed);
  const xs = [x0];
  for (let x = Math.ceil((x0 + 1) / 40) * 40; x < x1; x += 40) xs.push(x);
  xs.push(x1);
  // include polyline corners inside the span so the strip follows the surface
  for (const [px] of surface) if (px > x0 && px < x1) xs.push(px);
  xs.sort((a, b) => a - b);
  const base = xs.map((x) => [x, yAt(surface, x)]);
  const top = base.map(([x, y]) => [x, y - 16 - r() * 6]);
  let out = poly([...top, ...[...base].reverse()], "var(--green-mid)");
  for (let i = 0; i < top.length - 1; i += 2) out += poly([top[i], top[i + 1], base[i + 1]], tint("green-mid", 14), 'opacity=".6"');
  for (let i = 1; i < top.length - 1; i += 3) out += poly([top[i], base[i], base[i + 1]], shade("green-mid", 14), 'opacity=".5"');
  return `<g ${id ? `id="${id}"` : ""}>${out}</g>`;
}

/**
 * Side-view cut-away terrain clipped to a surface polyline. Three full-width soil bands (earth-1 / 2 / 3) with noisy edges and
 * triangle facets, plus a grass cap along the surface except `grassGaps` ([[x0,x1],…]).
 */
export function profileTerrain({ id, surface, bounds = [960, 1240], bottom = 3200, x0 = -600, x1 = 3000, seed = 7, grassGaps = [] }) {
  const r = prng(seed);
  const top = Math.min(...surface.map((p) => p[1])) - 60;
  const step = 150;
  const xs = [];
  for (let x = x0; x < x1; x += step) xs.push(x);
  xs.push(x1);
  const edge = (y) => xs.map((x) => [x, y + (r() - 0.5) * 40]);
  const e1 = edge(bounds[0]), e2 = edge(bounds[1]);
  const flat = (y) => xs.map((x) => [x, y]);
  const band = (up, low, fill, light, dark, rowH, tag) => {
    let out = poly([...up, ...[...low].reverse()], fill, tag);
    const yTop = Math.min(...up.map((p) => p[1])), yBot = Math.max(...low.map((p) => p[1]));
    let k = 0;
    for (let y = yTop; y < yBot; y += rowH) {
      for (let i = 0; i < xs.length - 1; i++) {
        const ax = xs[i], bx = xs[i + 1];
        const jx = (r() - 0.5) * 40, jy = (r() - 0.5) * 30;
        const tri = k++ % 2
          ? [[ax, y + rowH], [bx, y + rowH], [(ax + bx) / 2 + jx, y + jy]]
          : [[ax, y + jy], [bx, y], [(ax + bx) / 2 + jx, y + rowH]];
        out += poly(tri, k % 3 ? light : dark, `opacity="${(0.45 + r() * 0.1).toFixed(2)}"`);
      }
    }
    return out;
  };
  const b1 = band(flat(top), e1, "var(--earth-1)", tint("earth-1", 10), shade("earth-1", 14), 120);
  const b2 = band(e1, e2, "var(--earth-2)", tint("earth-2", 8), shade("earth-2", 14), 120);
  const b3 = band(e2, flat(bottom), "var(--earth-3)", tint("earth-3", 6), shade("earth-3", 22), 260);
  const poly0 = [...surface, [x1, bottom], [x0, bottom]];
  // grass segments between gaps
  const gaps = [...grassGaps].sort((a, b) => a[0] - b[0]);
  let cur = x0, grass = "";
  for (const [ga, gb] of gaps) {
    if (ga > cur) grass += grassStrip({ surface, x0: cur, x1: ga, seed: seed + Math.round(cur) });
    cur = Math.max(cur, gb);
  }
  if (cur < x1) grass += grassStrip({ surface, x0: cur, x1, seed: seed + Math.round(cur) });
  return `<g id="${id}"><defs><clipPath id="${id}-clip"><polygon points="${pts(poly0)}"/></clipPath></defs><g clip-path="url(#${id}-clip)">${b1}${b2}${b3}</g>${grass}</g>`;
}
export const surfaceY = yAt;
