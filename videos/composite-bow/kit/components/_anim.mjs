// Shared enter/exit animation: pop 0.9→1 in 180 ms, fade out in 200 ms. No bounce, no spin.
export const r3 = (n) => Math.round(n * 1000) / 1000;

export function pop(sel, at, dur, { exit = true, enter = 0.18, leave = 0.2 } = {}) {
  let s = `tl.fromTo(${JSON.stringify(sel)}, {opacity:0, scale:0.9}, {opacity:1, scale:1, duration:${enter}, ease:"power2.out"}, ${r3(at)});`;
  if (exit) s += `\ntl.to(${JSON.stringify(sel)}, {opacity:0, duration:${leave}, ease:"power1.in"}, ${r3(at + dur - leave - 0.02)});`;
  return s;
}

export function fade(sel, at, dur, { exit = true, enter = 0.18, leave = 0.2 } = {}) {
  let s = `tl.fromTo(${JSON.stringify(sel)}, {opacity:0}, {opacity:1, duration:${enter}, ease:"power1.out"}, ${r3(at)});`;
  if (exit) s += `\ntl.to(${JSON.stringify(sel)}, {opacity:0, duration:${leave}, ease:"power1.in"}, ${r3(at + dur - leave - 0.02)});`;
  return s;
}

/** Timing attributes every timed overlay element carries (.kit-abs = absolute positioning, defined in the build's base CSS). */
export const clipAttrs = (at, dur, track = 3, cls = "") =>
  `class="clip kit-abs${cls ? " " + cls : ""}" data-start="${r3(at)}" data-duration="${r3(dur)}" data-track-index="${track}"`;
