import { poly, shade, tint, groundShadow } from "../lowpoly.mjs";

/** Faceted ice block with a faint cold glow edge (--ui-blue is allowed for glowing ice). (x,y) = bottom-left. */
export function iceBlock({ id = "", x = 0, y = 0, w = 120, h = 90, glow = true } = {}) {
  const dx = w * 0.22, dy = h * 0.22;
  const gs = groundShadow(x + w / 2, y, w * 1.2);
  const front = poly([[x, y], [x + w, y], [x + w, y - h + dy], [x, y - h + dy]], tint("snow", 0));
  const side = poly([[x + w, y], [x + w + dx * 0.4, y - dy], [x + w + dx * 0.4, y - h], [x + w, y - h + dy]], shade("snow", 18));
  const topf = poly([[x, y - h + dy], [x + w, y - h + dy], [x + w + dx * 0.4, y - h], [x + dx * 0.4, y - h]], tint("snow", 40));
  const shine = poly([[x + w * 0.15, y - h * 0.25], [x + w * 0.35, y - h * 0.25], [x + w * 0.2, y - h * 0.65]], "var(--ui-blue)", 'opacity=".22"');
  const edge = glow ? `<polygon points="${[[x, y], [x + w, y], [x + w, y - h + dy], [x, y - h + dy]].map((p) => p.join(",")).join(" ")}" style="fill:none;stroke:var(--ui-blue);stroke-width:3;opacity:.45"/>` : "";
  return `<g ${id ? `id="${id}"` : ""}>${gs}${front}${side}${topf}${shine}${edge}</g>`;
}
