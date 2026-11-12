// Helpers for flat-shaded low-poly SVG: polygons, tone shading, seeded randomness.
export const f = (n) => Math.round(n * 10) / 10;
export const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
const isRaw = (t) => /^(#|rgb|color-mix|var\()/.test(t);
export const col = (t) => (isRaw(t) ? t : `var(--${t})`);
// Face tones: p is the original step in percent; --face-k (= look.faceShading / 0.5) scales every step, 1 = original look.
/** Darker tone of a palette token (p = percent toward --shade-target, near-black navy). */
export const shade = (t, p) => `color-mix(in srgb, ${col(t)} calc(100% - ${p}% * var(--face-k, 1)), var(--shade-target, #0b1220))`;
/** Lighter tone of a palette token (p = percent toward --tint-target, white). */
export const tint = (t, p) => `color-mix(in srgb, ${col(t)} calc(100% - ${p}% * var(--face-k, 1)), var(--tint-target, #ffffff))`;
/** Far-layer colour: blends toward the sky by look.depthFade × depth (0 = near, 1 = farthest). */
export const far = (color, depth = 1) => `color-mix(in srgb, ${color} calc(100% - var(--depth-fade, 0) * ${Math.round(depth * 100)}%), var(--sky-2))`;
/** Polygon: flat fill + optional outline (look.outline → --outline-w, 0 = none). */
export const poly = (points, fill, extra = "") => `<polygon points="${pts(points)}" style="fill:${fill};stroke:var(--outline-c, none);stroke-width:var(--outline-w, 0);stroke-linejoin:round" ${extra}/>`;
/** Soft ground shadow ellipse (look.shadowOpacity → --shadow-op). (cx,y) = centre on the ground line. */
export const groundShadow = (cx, y, w, h = Math.max(8, w * 0.12)) => `<ellipse cx="${f(cx)}" cy="${f(y + h * 0.3)}" rx="${f(w / 2)}" ry="${f(h)}" style="fill:var(--shade-target, #0b1220);opacity:var(--shadow-op, 0)"/>`;
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Deterministic PRNG (mulberry32). Never use Math.random in a composition. */
export function prng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Full-canvas SVG stage for scene content. */
export const stage = (inner, id = "") =>
  `<svg ${id ? `id="${id}" ` : ""}class="kit-stage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">${inner}</svg>`;
/** Failure ghost wrapper: desaturated, red-tinted, starts hidden (animate its opacity). */
export const ghost = (id, inner) =>
  `<g id="${id}" style="opacity:0;filter:saturate(.3) sepia(.7) hue-rotate(-50deg) saturate(1.8)">${inner}</g>`;
