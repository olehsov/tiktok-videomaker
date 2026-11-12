import { poly, shade, tint, f } from "../lowpoly.mjs";

/** Access shaft: dark interior, stone side walls, lid hinged at its left end. top = ground surface of the cover, bottom = channel roof. */
export function hatch({ id, x, top, bottom, w = 24 }) {
  const x0 = x - w / 2, x1 = x + w / 2;
  const shaft = poly([[x0, top], [x1, top], [x1, bottom], [x0, bottom]], shade("earth-3", 50)) +
    poly([[x0 - 4, top], [x0, top], [x0, bottom], [x0 - 4, bottom]], "var(--stone)") +
    poly([[x1, top], [x1 + 4, top], [x1 + 4, bottom], [x1, bottom]], shade("stone", 16));
  const hx = x0 - 4 - 0, hy = top;
  const lid = `<g id="${id}-lid" transform="rotate(0 ${f(hx)} ${f(hy)})">${poly([[hx, hy - 8], [hx + 34, hy - 8], [hx + 34, hy], [hx, hy]], "var(--stone)")}${poly([[hx, hy - 8], [hx + 34, hy - 8], [hx + 34, hy - 6], [hx, hy - 6]], tint("stone", 20))}</g>`;
  return { svg: `<g id="${id}">${shaft}${lid}</g>`, hinge: { x: hx, y: hy } };
}
