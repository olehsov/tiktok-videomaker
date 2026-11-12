import { poly, shade, tint, f } from "../lowpoly.mjs";

/** Chorobates (Roman water level): wood beam with a water groove, 4 legs to the ground, braces, 2 plumb lines. y = beam top. */
export function chorobates({ id, x, y, len = 120, groundAt = () => y + 50 }) {
  let out = "";
  const legs = [x + 8, x + 26, x + len - 26, x + len - 8];
  for (const lx of legs) {
    const gy = groundAt(lx);
    out += poly([[lx - 2, y + 7], [lx + 2, y + 7], [lx + 2, gy], [lx - 2, gy]], shade("wood", 15));
  }
  const g1 = groundAt(legs[0]), g2 = groundAt(legs[3]);
  out += poly([[legs[0], y + 12], [legs[1], y + 12], [legs[3], g2 - 6], [legs[2], g2 - 6]], shade("wood", 22), 'opacity=".8"');
  out += poly([[legs[1], y + 12], [legs[0] + 2, y + 12], [legs[2] - 2, g2 - 6], [legs[3], g2 - 6]], shade("wood", 22), 'opacity=".8"').replace(/points="[^"]*"/, (m) => m);
  out += poly([[x, y], [x + len, y], [x + len, y + 7], [x, y + 7]], "var(--wood)");
  out += poly([[x, y], [x + len, y], [x + len, y + 2.5], [x, y + 2.5]], tint("wood", 18));
  out += poly([[x + 4, y - 3], [x + len - 4, y - 3], [x + len - 4, y], [x + 4, y]], "var(--water)");
  for (const px of [x + 14, x + len - 14]) {
    out += poly([[px - 0.75, y + 7], [px + 0.75, y + 7], [px + 0.75, y + 34], [px - 0.75, y + 34]], shade("snow", 30));
    out += poly([[px - 4, y + 34], [px + 4, y + 34], [px, y + 42]], shade("stone", 30));
  }
  return `<g id="${id}">${out}</g>`;
}
