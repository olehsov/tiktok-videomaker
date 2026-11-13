import { poly, shade, tint } from "../lowpoly.mjs";

/** Pale faceted sun/moon disc (octagon), tinted from palette tokens only. */
export function sun({ id = "", cx = 800, cy = 380, r = 90, kind = "sun" } = {}) {
  const token = kind === "moon" ? "snow" : "sand";
  const n = 8;
  const ring = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.PI / 8;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const base = poly(ring, tint(token, 35));
  let facets = "";
  for (let i = 0; i < n; i++) facets += poly([[cx, cy], ring[i], ring[(i + 1) % n]], i % 3 === 0 ? tint(token, 55) : i % 3 === 1 ? tint(token, 25) : shade(token, 0), 'opacity=".55"');
  return `<g ${id ? `id="${id}"` : ""}>${base}${facets}</g>`;
}
