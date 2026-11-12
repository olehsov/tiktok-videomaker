import { poly, shade, tint, groundShadow, f, tf } from "../lowpoly.mjs";

/**
 * Magpie, ≈95 px tall at s=1, feet at (0,0), faces right (flip mirrors). Root `<g id>` has transform translate(x y) (tween it with attr);
 * inner `<g id="${id}-b">` scales; head group `${id}-head` pivots at (24,-54) (attr transform rotate).
 * magpie({ id, x, y, s=1, flip=false }) → { svg }.  Beak tip (local) = (68,-54).
 */
export function magpie({ id, x = 0, y = 0, s = 1, flip = false } = {}) {
  const ink = shade("earth-3", 55);
  const svg =
    `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g id="${id}-b" transform="scale(${flip ? -s : s} ${s})">` +
    groundShadow(0, 0, 56) +
    `<g id="${id}-hop" transform="translate(0 0)">` +
    poly([[-4, 0], [2, -24], [8, 0]], shade("earth-3", 60)) +
    poly([[-40, -24], [-110, -6], [-112, 2], [-30, -12]], shade("water", 35)) +
    poly([[-40, -24], [-110, -6], [-96, -12]], ink) +
    poly([[-40, -24], [-12, -54], [22, -56], [34, -32], [12, -10], [-18, -12]], ink) +
    poly([[-6, -14], [14, -12], [32, -32], [22, -46], [0, -30]], "var(--snow)") +
    poly([[-30, -30], [-8, -46], [10, -40], [-14, -26]], tint("snow", 10)) +
    `<g id="${id}-head" transform="${tf({ px: 24, py: -54 })}">` +
    poly([[22, -56], [38, -68], [52, -58], [42, -44], [30, -44]], ink) +
    poly([[48, -60], [68, -54], [48, -50]], shade("earth-3", 65)) +
    `<circle cx="42" cy="-58" r="2.6" style="fill:var(--snow)"/></g></g></g></g>`;
  return { svg };
}
