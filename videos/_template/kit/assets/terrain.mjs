import { poly, shade, tint, prng } from "../lowpoly.mjs";

/**
 * Cut-away terrain cross-section with 3 soil layers.
 * opts: { x=0, y (surface line), w=1080, h (total depth), layers=[d1,d2] (depth of layer 1 and 2 from surface), top:'sand'|'grass', seed }
 * Returns SVG fragment. Layer ids: `${id}-l1/l2/l3` when id is given.
 */
export function terrain({ id = "", x = 0, y, w = 1080, h = 1000, layers = [260, 560], top = "grass", seed = 7 } = {}) {
  const r = prng(seed);
  const step = 90;
  const xs = [];
  for (let px = x; px < x + w; px += step) xs.push(px);
  xs.push(x + w);
  const edge = (base, amp) => xs.map((px) => [px, base + (r() - 0.5) * amp]);
  const surf = edge(y, 16);
  const b1 = edge(y + layers[0], 40);
  const b2 = edge(y + layers[1], 50);
  const bottom = [[x + w, y + h], [x, y + h]];
  const band = (upper, lower, fill, light, dark, tag) => {
    const base = poly([...upper, ...[...lower].reverse()], fill, tag);
    let facets = "";
    for (let i = 0; i < upper.length - 1; i++) {
      const [ax, ay] = upper[i], [bx] = upper[i + 1];
      const [cx, cy] = lower[i + 1], [dx, dy] = lower[i];
      const mid = [(ax + bx) / 2 + (r() - 0.5) * 30, (ay + dy) / 2 + (r() - 0.5) * 30];
      facets += poly([[ax, ay], [bx, upper[i + 1][1]], mid], i % 2 ? light : dark, 'opacity=".55"');
      facets += poly([[dx, dy], [cx, cy], mid], i % 2 ? dark : light, 'opacity=".45"');
    }
    return base + facets;
  };
  const l1 = band(surf, b1, "var(--earth-1)", tint("earth-1", 10), shade("earth-1", 14), id ? `id="${id}-l1"` : "");
  const l2 = band(b1, b2, "var(--earth-2)", tint("earth-2", 8), shade("earth-2", 14), id ? `id="${id}-l2"` : "");
  const l3 = band(b2, [...b2.map(([px]) => [px, y + h])], "var(--earth-3)", tint("earth-3", 6), shade("earth-3", 22), id ? `id="${id}-l3"` : "");
  // top strip (grass or sand), faceted
  const topCol = top === "sand" ? "sand" : "green-mid";
  const strip = surf.map(([px, py]) => [px, py - 22 - r() * 8]);
  let cap = poly([...strip, ...[...surf].reverse()], `var(--${topCol})`);
  for (let i = 0; i < strip.length - 1; i += 2) {
    cap += poly([strip[i], strip[Math.min(i + 1, strip.length - 1)], surf[Math.min(i + 1, surf.length - 1)]], tint(topCol, 14), 'opacity=".6"');
  }
  return `<g ${id ? `id="${id}"` : ""}>${l3}${l2}${l1}${cap}</g>`;
}
