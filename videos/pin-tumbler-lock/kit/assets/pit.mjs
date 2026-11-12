import { poly, shade, tint, prng, f } from "../lowpoly.mjs";

/**
 * A pit cut into the cross-section, with a spoil mound beside it, plus flying clods for each dig stroke.
 * pit({ id, x (center), y (ground line), w, depth, moundDx=+140, moundW=110, moundH=60, static=false, seed })
 *   → { svg, grow(at, dur, steps), dig(at, strokes, period), tl() }
 *   - svg: cavity (two-tone faceted walls over a dark floor) + mound. Starts empty unless static:true (fully dug).
 *   - grow(at, dur, steps): the pit deepens in `steps` increments (one per dig stroke) and the mound rises with it.
 *   - dig(at, strokes, period): small clods arc out of the pit onto the mound, one burst per stroke
 *     (a burst starts at at + k·period; time it to the shovel's upswing).
 * Call in chronological order. Everything is deterministic (seeded).
 */
export function pit({ id, x, y, w = 150, depth = 150, moundDx = 140, moundW = 110, moundH = 60, static: isStatic = false, seed = 21 } = {}) {
  const r = prng(seed);
  const top = y - 20, bot = y + depth;
  const L = x - w / 2, R = x + w / 2, bl = x - w * 0.34, br = x + w * 0.34;
  const wallL = poly([[L, top], [x, top], [x - 8, bot], [bl, bot]], shade("earth-3", 8));
  const wallR = poly([[x, top], [R, top], [br, bot], [x - 8, bot]], shade("earth-3", 30));
  const floor = poly([[bl, bot], [br, bot], [br - 10, bot + 10], [bl + 10, bot + 10]], shade("earth-3", 45));
  const cavity = poly([[L, top], [R, top], [br, bot], [bl, bot]], shade("earth-3", 40)) + wallL + wallR + floor;
  // crumbly lip so the mouth does not look cut with scissors
  const lip = poly([[L - 10, y - 6], [L + 14, top - 2], [L + 22, y + 4]], tint("earth-1", 6)) + poly([[R + 10, y - 6], [R - 14, top - 2], [R - 22, y + 4]], shade("earth-1", 10));

  const mx = x + moundDx, my = y - 2;
  const mound =
    poly([[mx - moundW / 2, my], [mx - moundW * 0.18, my - moundH], [mx + moundW * 0.1, my - moundH * 0.85], [mx, my]], tint("earth-1", 10)) +
    poly([[mx + moundW * 0.1, my - moundH * 0.85], [mx + moundW / 2, my], [mx, my]], shade("earth-1", 14)) +
    poly([[mx - moundW * 0.35, my - moundH * 0.2], [mx - moundW * 0.18, my - moundH], [mx - moundW * 0.05, my - moundH * 0.3]], tint("earth-1", 22), 'opacity=".6"');

  const svg =
    `<g id="${id}-mound">${mound}</g>` +
    `<g id="${id}-cavity" ${isStatic ? "" : 'style="opacity:0"'}>${cavity}${lip}</g>`;

  const lines = [];
  const clods = [];
  const origin = (cx, cy) => `svgOrigin:"${f(cx)} ${f(cy)}"`;
  if (!isStatic) {
    // initial collapsed state
    lines.push(`gsap.set("#${id}-cavity", {scaleY:0.02, scaleX:0.6, ${origin(x, top)}});`);
    lines.push(`gsap.set("#${id}-mound", {scaleY:0.02, ${origin(mx, my)}});`);
  }
  const api = {
    svg,
    grow(at, dur, steps = 3) {
      lines.push(`tl.fromTo("#${id}-cavity", {opacity:0}, {opacity:1, duration:0.1, immediateRender:false}, ${at});`);
      for (let k = 1; k <= steps; k++) {
        const t = at + ((k - 1) / steps) * dur, d = (dur / steps) * 0.85, s = k / steps;
        const sy = Math.max(0.02, s), sx = 0.6 + 0.4 * s;
        lines.push(`tl.to("#${id}-cavity", {scaleY:${f(sy * 100) / 100}, scaleX:${f(sx * 100) / 100}, ${origin(x, top)}, duration:${f(d * 100) / 100}, ease:"power2.out"}, ${f(t * 100) / 100});`);
        lines.push(`tl.to("#${id}-mound", {scaleY:${f(s * 100) / 100}, ${origin(mx, my)}, duration:${f(d * 100) / 100}, ease:"power2.out"}, ${f((t + 0.3) * 100) / 100});`);
      }
    },
    dig(at, strokes = 3, period = 0.8, count = 5) {
      for (let k = 0; k < strokes; k++) {
        const t = at + k * period;
        for (let n = 0; n < count; n++) {
          const cid = `${id}-c${k}-${n}`;
          const sz = 7 + r() * 8;
          const tone = n % 2 ? shade("earth-1", 6) : tint("earth-2", 4);
          // small faceted clod, drawn at the pit mouth
          const cl = poly([[x - sz, y - 18], [x, y - 18 - sz * 1.1], [x + sz, y - 18 - sz * 0.2], [x + sz * 0.5, y - 18 + sz * 0.8], [x - sz * 0.6, y - 18 + sz * 0.7]], tone);
          clods.push(`<g id="${cid}" style="opacity:0">${cl}</g>`);
          const dx = moundDx * (0.55 + r() * 0.5), peak = -(120 + r() * 90), t0 = t + n * 0.04, up = 0.32 + r() * 0.08, down = 0.38 + r() * 0.1;
          const land = 18 + r() * 14; // lands on the mound slope
          lines.push(`tl.set("#${cid}", {opacity:1, x:0, y:0}, ${f(t0 * 1000) / 1000});`);
          lines.push(`tl.to("#${cid}", {x:${f(dx)}, duration:${f((up + down) * 100) / 100}, ease:"none"}, ${f(t0 * 1000) / 1000});`);
          lines.push(`tl.to("#${cid}", {y:${f(peak)}, duration:${f(up * 100) / 100}, ease:"power2.out"}, ${f(t0 * 1000) / 1000});`);
          lines.push(`tl.to("#${cid}", {y:${f(land)}, duration:${f(down * 100) / 100}, ease:"power2.in"}, ${f((t0 + up) * 1000) / 1000});`);
          lines.push(`tl.to("#${cid}", {opacity:0, duration:0.12, ease:"none"}, ${f((t0 + up + down) * 1000) / 1000});`);
        }
      }
    },
    tl: () => lines.join("\n"),
    /** SVG for the clod elements created by dig(); put it after the puppet so clods fly in front of the pit. */
    clodsSvg: () => clods.join(""),
  };
  return api;
}
