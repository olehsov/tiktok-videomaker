import { poly, shade, tint } from "../lowpoly.mjs";

/**
 * Front of a small house: wall, eave, plinth, door frame, door (group `${id}-door`), ground.
 * houseFront({ id, groundY=1520, doorX=330, doorW=380, doorTop=760, lock={x:650,y:1130} }) → { svg, doorId, lockPt }
 */
export function houseFront({ id, groundY = 1520, doorX = 330, doorW = 380, doorTop = 760, lock = { x: 650, y: 1130 } } = {}) {
  const wall =
    poly([[0, 330], [1080, 330], [1080, groundY], [0, groundY]], tint("sand", 12)) +
    poly([[720, 330], [1080, 330], [1080, groundY], [720, groundY]], tint("sand", 4)) +
    poly([[0, 330], [1080, 330], [1080, 370], [0, 370]], shade("earth-2", 10)) +
    poly([[0, groundY - 80], [1080, groundY - 80], [1080, groundY], [0, groundY]], shade("stone", 10));
  const frame = poly([[doorX - 20, doorTop - 20], [doorX + doorW + 20, doorTop - 20], [doorX + doorW + 20, groundY], [doorX - 20, groundY]], shade("wood", 25));
  const inside = poly([[doorX, doorTop], [doorX + doorW, doorTop], [doorX + doorW, groundY], [doorX, groundY]], shade("earth-3", 40));
  const R = (x0, y0, x1, y1, c) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], c);
  const panels = [[30, 40, 170, 340], [210, 40, 350, 340], [30, 420, 170, 720], [210, 420, 350, 720]]
    .map(([a, b, c, d]) => R(doorX + a, doorTop + b, doorX + c, doorTop + d, shade("wood", 18))).join("");
  const door =
    `<g id="${id}-door">` +
    R(doorX, doorTop, doorX + doorW, groundY, "var(--wood)") +
    R(doorX + doorW / 2, doorTop, doorX + doorW, groundY, shade("wood", 10)) + panels +
    `<circle cx="${lock.x}" cy="${lock.y + 50}" r="16" style="fill:${tint("stone", 20)}"/>` +
    `<circle cx="${lock.x}" cy="${lock.y}" r="13" style="fill:${tint("stone", 30)}"/>` +
    R(lock.x - 1.5, lock.y - 2, lock.x + 1.5, lock.y + 10, shade("earth-3", 30)) + `</g>`;
  let ground = poly([[0, groundY], [1080, groundY], [1080, 1920], [0, 1920]], tint("stone", 10));
  for (const y of [groundY + 140, groundY + 260, groundY + 340]) ground += `<line x1="0" y1="${y}" x2="1080" y2="${y}" style="stroke:${shade("stone", 10)};stroke-width:3"/>`;
  return { svg: `<g id="${id}">${wall}${frame}${inside}${door}${ground}</g>`, doorId: `${id}-door`, lockPt: lock };
}
