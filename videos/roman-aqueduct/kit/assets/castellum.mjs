import { poly, shade, tint, f } from "../lowpoly.mjs";

/** Round splitter basin, cut-away. ids: -water (body+surface), -walls. 3 outlet stubs on the right wall at y 866/872/878. */
export function castellum({ id, cx, rimY, floorY, r = 45, waterY, hidden = [] }) {
  const hid = (k) => (hidden.includes(k) || hidden.includes("all") ? ' style="opacity:0"' : "");
  const oct = (rx, ry, y) => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; return [cx + Math.cos(a) * rx, y + Math.sin(a) * ry]; });
  const back = poly([[cx - r, rimY], [cx + r, rimY], [cx + r, floorY], [cx - r, floorY]], shade("sand", 22));
  const backTop = poly([[cx - r, rimY], [cx - r * 0.7, rimY - 7], [cx + r * 0.7, rimY - 7], [cx + r, rimY], [cx + r * 0.6, rimY + 7], [cx - r * 0.6, rimY + 7]], tint("sand", 10));
  const ix0 = cx - r + 8, ix1 = cx + r - 8;
  const body = poly([[ix0, waterY], [ix1, waterY], [ix1, floorY - 8], [ix0, floorY - 8]], "var(--water)");
  const surf = poly(oct(r - 8, 7, waterY), tint("water", 12));
  const facet = poly([[ix0, waterY], [cx, waterY + 30], [cx - 10, floorY - 8], [ix0, floorY - 8]], shade("water", 14), 'opacity=".5"');
  const walls = poly([[cx - r, rimY], [cx - r + 8, rimY], [cx - r + 8, floorY], [cx - r, floorY]], "var(--sand)") +
    poly([[cx + r - 8, rimY], [cx + r, rimY], [cx + r, floorY], [cx + r - 8, floorY]], shade("sand", 12)) +
    poly([[cx - r, floorY - 8], [cx + r, floorY - 8], [cx + r, floorY], [cx - r, floorY]], shade("sand", 16));
  const lipL = poly([[cx - r - 2, rimY - 4], [cx - r + 12, rimY - 4], [cx - r + 12, rimY + 3], [cx - r - 2, rimY + 3]], tint("sand", 10));
  const lipR = poly([[cx + r - 12, rimY - 4], [cx + r + 2, rimY - 4], [cx + r + 2, rimY + 3], [cx + r - 12, rimY + 3]], tint("sand", 10));
  const stubs = [866, 872, 878].map((y) => poly([[cx + r, y - 3], [cx + r + 6, y - 3], [cx + r + 6, y + 3], [cx + r, y + 3]], shade("stone", 38))).join("");
  return `<g id="${id}"><g id="${id}-back"${hid("back")}>${back}${backTop}</g><g id="${id}-water"${hid("water")}>${body}${facet}${surf}</g><g id="${id}-walls"${hid("walls")}>${walls}${lipL}${lipR}${stubs}</g></g>`;
}
