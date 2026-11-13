// Roman-arch effects (palette tokens only, deterministic): tween tracker, splash, rain.
import { poly, tint, prng, f } from "../kit/lowpoly.mjs";
import { tf } from "../kit/lowpoly.mjs";

const J = JSON.stringify;
export const r3 = (n) => Math.round(n * 1000) / 1000;

/** tween tracker: emits fromTo(prev → next) with immediateRender:false for each (selector, property) pair; call in time order per element */
export function tracker(L) {
  const st = new Map();
  const emit = (sel, from, to, at) => L.push(`tl.fromTo(${J(sel)}, ${J(from)}, ${J({ ...to, immediateRender: false })}, ${r3(at)});`);
  const api = {
    emit,
    init(sel, key, v) { st.set(sel + "|" + key, v); },
    get(sel, key) { return st.get(sel + "|" + key) ?? (key === "o" ? 0 : null); },
    op(sel, to, at, dur = 0.3, ease = "none") {
      const k = sel + "|o", prev = st.has(k) ? st.get(k) : 0;
      st.set(k, to);
      emit(sel, { opacity: prev }, { opacity: to, duration: r3(dur), ease }, at);
    },
    tf(sel, to, at, dur = 0.3, ease = "power2.out") {
      const k = sel + "|t", prev = st.has(k) ? st.get(k) : tf();
      st.set(k, to);
      emit(sel, { attr: { transform: prev } }, { attr: { transform: to }, duration: r3(dur), ease }, at);
    },
    /** up/down opacity pulse 0 → peak → 0 (n times in total time dur) */
    flash(sel, at, dur, n = 1, peak = 1) {
      const seg = dur / (2 * n);
      for (let i = 0; i < n; i++) { api.op(sel, peak, at + 2 * i * seg, seg); api.op(sel, 0, at + (2 * i + 1) * seg, seg); }
    },
  };
  return api;
}

/** water splash at world (x,y): 6 drops + an expanding ring, all finite */
export function splash({ id, x, y, at, s = 1 }) {
  const r = prng(Math.round(x * 7 + y * 3 + 11));
  let svg = "", tl = "";
  const drops = Array.from({ length: 6 }, (_, k) => {
    const rr = 5 + r() * 3, dx = ((k - 2.5) / 2.5) * 60 * s + (r() - 0.5) * 12, up = (60 + r() * 50) * s;
    return { rr, dx, up };
  });
  drops.forEach((d, k) => {
    svg += `<g id="${id}-d${k}" style="opacity:0">${poly([[x, y - d.rr], [x + d.rr, y], [x, y + d.rr], [x - d.rr, y]], tint("water", 30))}</g>`;
    tl += `${tl ? "\n" : ""}tl.fromTo("#${id}-d${k}", {x:0, y:0, opacity:0}, {x:${f(d.dx * 0.6)}, y:${f(-d.up)}, opacity:1, duration:0.28, ease:"power2.out", immediateRender:false}, ${r3(at)});`;
    tl += `\ntl.to("#${id}-d${k}", {x:${f(d.dx)}, y:${f(8)}, opacity:0, duration:0.32, ease:"power2.in"}, ${r3(at + 0.28)});`;
  });
  svg += `<ellipse id="${id}-r" cx="${x}" cy="${y}" rx="10" ry="3" style="fill:none;stroke:${tint("water", 35)};stroke-width:3;opacity:0"/>`;
  tl += `\ntl.fromTo("#${id}-r", {opacity:0}, {opacity:1, duration:0.05, ease:"none", immediateRender:false}, ${r3(at)});`;
  tl += `\ntl.fromTo("#${id}-r", {attr:{rx:10, ry:3}}, {attr:{rx:${60 * s}, ry:${10 * s}}, duration:0.5, ease:"power1.out", immediateRender:false}, ${r3(at)});`;
  tl += `\ntl.to("#${id}-r", {opacity:0, duration:0.45, ease:"power1.in"}, ${r3(at + 0.05)});`;
  return { svg: `<g id="${id}">${svg}</g>`, tl };
}

/** rain streaks in screen space: n lines, seeded; each falls 900 px in 0.9 s; finite repeats = floor(dur/0.9) */
export function rain({ id, n = 36, seed = 21, at, dur }) {
  const r = prng(seed);
  let svg = "", tl = "";
  const reps = Math.max(1, Math.floor(dur / 0.9));
  const a = (12 * Math.PI) / 180, dx = Math.sin(a) * 900;
  for (let k = 0; k < n; k++) {
    const x = r() * 1200, y = -200 + r() * 2120, L = 34;
    svg += `<g id="${id}-${k}"><line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.sin(a) * L)}" y2="${f(y + Math.cos(a) * L)}" style="stroke:${tint("water", 40)};stroke-width:3;stroke-linecap:round"/></g>`;
    for (let c = 0; c < reps; c++) tl += `${tl ? "\n" : ""}tl.fromTo("#${id}-${k}", {x:0, y:0}, {x:${f(dx)}, y:900, duration:0.9, ease:"none", immediateRender:false}, ${r3(at + c * 0.9)});`;
  }
  return { svg: `<g id="${id}" style="opacity:0">${svg}</g>`, tl };
}
