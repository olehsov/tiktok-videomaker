import { poly, shade, tint, prng } from "../lowpoly.mjs";

/** Water body with a faceted top edge. (x,y) = top-left of the surface. */
export function waterSurface({ id = "", x = 0, y = 0, w = 300, h = 60, seed = 9 } = {}) {
  const r = prng(seed);
  const n = Math.max(3, Math.round(w / 60));
  const top = Array.from({ length: n + 1 }, (_, i) => [x + (w * i) / n, y + (r() - 0.5) * 6]);
  const body = poly([...top, [x + w, y + h], [x, y + h]], "var(--water)");
  let facets = "";
  for (let i = 0; i < n; i++) {
    facets += poly([top[i], top[i + 1], [x + (w * (i + 0.5)) / n, y + h * 0.5]], i % 2 ? tint("water", 18) : shade("water", 14), 'opacity=".6"');
  }
  return `<g ${id ? `id="${id}"` : ""}>${body}${facets}</g>`;
}
