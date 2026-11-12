// Small effect generators. Each returns SVG (world coordinates) and appends finite tweens to the scene timeline builder T.
import * as kit from "../kit/index.mjs";
import { L } from "./world.mjs";
const { poly, shade, tint, prng, f } = kit;
const hide = (T, sel) => T.ft(sel, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
const diamond = (x, y, r, fill, extra = "") => poly([[x, y - r], [x + r, y], [x, y + r], [x - r, y]], fill, extra);

/** S2: three clods per shovel stroke arc back 30 wu (peak -40) and fade. strokes: [{t, x, y}] */
export function clods(T, I, strokes) {
  let svg = "";
  const r = prng(5);
  strokes.forEach((s, k) => {
    for (let i = 0; i < 3; i++) {
      const id = `${I}-cl${k}_${i}`, sz = 3 + r() * 1.5, dx = -22 - i * 5, t = s.t + i * 0.06;
      svg += diamond(s.x + 6 * i, s.y, sz, i % 2 ? "var(--earth-1)" : "var(--earth-2)", `id="${id}" opacity="0"`);
      T.ft(`#${id}`, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.05 }, t);
      T.to(`#${id}`, { x: dx, duration: 0.6, ease: "none" }, t);
      T.to(`#${id}`, { y: -40 - i * 4, duration: 0.3, ease: "power2.out" }, t);
      T.to(`#${id}`, { y: 6, duration: 0.3, ease: "power2.in" }, t + 0.3);
      T.to(`#${id}`, { opacity: 0, duration: 0.15, ease: "none" }, t + 0.5);
    }
  });
  return svg;
}
/** S4: S-shaped steam wisps rising 60 wu (finite loop, 1.2 s cycles, staggered 0.2 s). */
export function steam(T, I, { xs, y, t, until }) {
  let svg = "";
  const n = Math.max(1, Math.floor((until - t) / 1.2) - 1);
  xs.forEach((x, i) => {
    const id = `${I}-st${i}`;
    svg += poly([[x, y], [x + 6, y - 10], [x, y - 20], [x + 7, y - 32], [x + 3, y - 34], [x - 3, y - 22], [x + 3, y - 10], [x - 3, y]], tint("snow", 10), `id="${id}" opacity="0"`);
    hide(T, `#${id}`);
    T.ft(`#${id}`, { opacity: 0.8, y: 0 }, { opacity: 0, y: -60, duration: 1.2, ease: "none", repeat: n }, t + i * 0.2);
  });
  return svg;
}
/** Falling bits (dirt clods or leaves) into the trench. items: [{x, y0, y1, at, dur}] */
export function falling(T, I, kind, items) {
  let svg = "";
  items.forEach((it, i) => {
    const id = `${I}-${kind}${i}`;
    svg += kind === "leaf" ? diamond(it.x, it.y0, 4, "var(--green-mid)", `id="${id}" opacity="0"`) : diamond(it.x, it.y0, 3.5, "var(--earth-1)", `id="${id}" opacity="0"`);
    hide(T, `#${id}`);
    T.to(`#${id}`, { opacity: 1, duration: 0.01 }, it.at);
    T.to(`#${id}`, { y: it.y1 - it.y0, x: kind === "leaf" ? 6 : 0, duration: it.dur, ease: kind === "leaf" ? "sine.inOut" : "power2.in" }, it.at);
  });
  return svg;
}
/** S5: dark drips leave the channel floor and fall 40–60 wu, fading. */
export function drips(T, I, { x0, x1, y, t, n = 8 }) {
  let svg = "";
  const r = prng(9);
  for (let i = 0; i < n; i++) {
    const id = `${I}-dr${i}`, x = x0 + ((x1 - x0) * (i + 0.5)) / n;
    svg += poly([[x, y - 5], [x + 2.5, y], [x, y + 3], [x - 2.5, y]], shade("earth-3", 30), `id="${id}" opacity="0"`);
    hide(T, `#${id}`);
    T.ft(`#${id}`, { opacity: 0.9, y: 0 }, { opacity: 0, y: 40 + r() * 20, duration: 0.8, ease: "power1.in" }, t + i * 0.08);
  }
  return svg;
}
/** S8/S11: sand grains drifting to the settling-tank floor. */
export function grains(T, I, { x0, x1, y0, yFloor, t, n = 14, dur = [1.4, 1.9], step = 0.1, tag = "gr" }) {
  let svg = "";
  const r = prng(17);
  for (let i = 0; i < n; i++) {
    const id = `${I}-${tag}${i}`, x = x0 + r() * (x1 - x0), sz = 2 + r();
    svg += poly([[x - sz, y0], [x + sz, y0 - 1], [x + sz, y0 + sz * 1.6], [x - sz, y0 + sz]], "var(--sand)", `id="${id}" opacity="0"`);
    const d = dur[0] + r() * (dur[1] - dur[0]);
    hide(T, `#${id}`);
    T.to(`#${id}`, { opacity: 1, duration: 0.01 }, t + i * step);
    T.to(`#${id}`, { x: 20 + r() * 60, y: Math.min(yFloor - y0, 60 + r() * 30), duration: d, ease: "sine.in" }, t + i * step);
    T.to(`#${id}`, { opacity: 0, duration: 0.2 }, t + i * step + d);
  }
  return svg;
}
/** S11: whitecaps run right along the flood (finite 0.6 s loops). */
export function whitecaps(T, I, { t, until, y = 1095 }) {
  let svg = "";
  const n = Math.max(1, Math.floor((until - t) / 0.6) - 1);
  for (let i = 0; i < 6; i++) {
    const id = `${I}-wc${i}`, x = 1040 + i * 28;
    svg += poly([[x, y + (i % 2) * 8], [x + 16, y - 3 + (i % 2) * 8], [x + 20, y + (i % 2) * 8], [x + 4, y + 3 + (i % 2) * 8]], "var(--snow)", `id="${id}" opacity="0"`);
    hide(T, `#${id}`);
    T.ft(`#${id}`, { opacity: 0.9, x: 0 }, { opacity: 0, x: 26, duration: 0.6, ease: "none", repeat: n }, t + i * 0.1);
  }
  return svg;
}
/** S11: splash polygons at the pier feet (pulsing). */
export function splash(T, I, { t, until }) {
  let svg = "";
  const n = Math.max(1, Math.floor((until - t) / 0.5) - 1);
  [1060, 1100, 1140, 1180].forEach((x, i) => {
    const id = `${I}-sp${i}`;
    svg += poly([[x - 8, 1092], [x - 3, 1080], [x, 1086], [x + 4, 1078], [x + 8, 1092]], tint("snow", 12), `id="${id}" opacity="0"`);
    hide(T, `#${id}`);
    T.ft(`#${id}`, { opacity: 0.9, scaleY: 0.3, svgOrigin: `${x} 1092` }, { opacity: 0.2, scaleY: 1, duration: 0.5, ease: "sine.inOut", repeat: n, yoyo: true }, t + i * 0.12);
  });
  return svg;
}
/** S13: glints slide along the arcade channel water (1.4 s cycles). */
export function glints(T, I, { t, until }) {
  let svg = "";
  const n = Math.max(1, Math.floor((until - t) / 1.4) - 1);
  for (let i = 0; i < 5; i++) {
    const id = `${I}-gl${i}`, x = 910 + i * 85;
    svg += poly([[x, L(x) + 10], [x + 12, L(x) + 10], [x + 12, L(x) + 13], [x, L(x) + 13]], tint("snow", 20), `id="${id}" opacity="0"`);
    hide(T, `#${id}`);
    T.ft(`#${id}`, { opacity: 0.9, x: 0 }, { opacity: 0, x: 60, duration: 1.4, ease: "none", repeat: n }, t + i * 0.28);
  }
  return svg;
}
