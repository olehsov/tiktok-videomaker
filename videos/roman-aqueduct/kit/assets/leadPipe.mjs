import { shade, tint, f } from "../lowpoly.mjs";

/** Lead pipe along a polyline. Paths have pathLength="1": draw-on = dasharray "1 2", dashoffset 1→0. ids: -p2 (back), -p1, -hl. */
export function leadPipe({ id, points, width = 12, double = true, hidden = false }) {
  const d = (dy) => points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y + dy)}`).join("");
  const st = (col, w, dy) => `<path id="${id}-@" d="${d(dy)}" pathLength="1" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke:${col};stroke-width:${w}${hidden ? ";stroke-dasharray:1 2;stroke-dashoffset:1;opacity:0" : ""}"/>`;
  let out = "";
  if (double) out += st(shade("stone", 50), width, 9).replace("@", "p2");
  out += st(shade("stone", 38), width, 0).replace("@", "p1");
  out += st(tint("stone", 15), Math.max(1.5, width / 4), -width / 4).replace("@", "hl");
  return `<g id="${id}">${out}</g>`;
}
