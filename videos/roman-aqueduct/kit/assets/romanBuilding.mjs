import { poly, shade, tint, f } from "../lowpoly.mjs";

/** Roman building: walls (front + right side strip), gable tile roof, arched windows. (x,y) = bottom-left corner; w, h walls; roofH rise. */
export function romanBuilding({ id, x, y, w, h, roof = "gable", roofH, windows = 2 }) {
  const rh = roofH ?? Math.round(w * 0.24);
  const side = Math.min(10, w * 0.16);
  let out = poly([[x, y], [x + w - side, y], [x + w - side, y - h], [x, y - h]], tint("sand", 4));
  out += poly([[x + w - side, y], [x + w, y], [x + w, y - h], [x + w - side, y - h]], shade("sand", 14));
  const n = windows;
  for (let i = 0; i < n; i++) {
    const cx = x + ((i + 1) * (w - side)) / (n + 1), ww = 8, wh = h * 0.34, wy = y - h * 0.4;
    out += poly([[cx - ww / 2, wy], [cx + ww / 2, wy], [cx + ww / 2, wy - wh], [cx, wy - wh - 4], [cx - ww / 2, wy - wh]], shade("earth-3", 40));
  }
  out += poly([[x - 4, y - h], [x + w + 3, y - h], [x + w - side * 0.6, y - h - rh], [x + (w - side) / 2, y - h - rh], [x + 4, y - h - rh]].slice(0, 5), "var(--tile)");
  out += poly([[x + (w - side) / 2, y - h - rh], [x + w - side * 0.6, y - h - rh], [x + w + 3, y - h], [x + (w - side) / 2 + 6, y - h]], shade("tile", 18), 'opacity=".9"');
  out += poly([[x + 4, y - h - rh], [x + w - side * 0.6, y - h - rh], [x + w - side * 0.6, y - h - rh + 3], [x + 4, y - h - rh + 3]], shade("tile", 18));
  out += poly([[x + 2, y - h], [x + w, y - h], [x + w, y - h + 3], [x + 2, y - h + 3]], shade("sand", 24));
  return `<g id="${id}">${out}</g>`;
}
