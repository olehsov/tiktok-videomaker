// End-view inset (upper right): the plug in the shell seen from the key side. Time-ordered calls, no text.
import { poly, shade, tint, tf, f } from "../kit/lowpoly.mjs";
import { r3 } from "./lock.mjs";

const ngon = (cx, cy, r, n = 14) => Array.from({ length: n }, (_, k) => [cx + r * Math.cos((k / n) * Math.PI * 2 + Math.PI / n), cy + r * Math.sin((k / n) * Math.PI * 2 + Math.PI / n)]);
const J = JSON.stringify;

export function EndInset({ id, cx = 800, cy = 470, r = 125, at, dur }) {
  const out = [];
  const T = (sel, from, to, t) => out.push(`tl.fromTo(${J(sel)}, ${J(from)}, ${J({ ...to, immediateRender: false })}, ${r3(t)});`);
  const rot = (a) => tf({ r: a, px: cx, py: cy });
  let ang = 0, kpOn = true, al = false;
  const shellHalf = ngon(cx, cy, 100).filter((p) => p[0] >= cx - 1);
  const pinFace = (x0, y0, w, h, c1, c2) => poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], c1) + poly([[x0 + w / 2, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0 + w / 2, y0 + h]], c2);
  const svg =
    `<svg id="${id}-svg" xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible">` +
    `<defs><clipPath id="${id}-clip"><circle cx="${cx}" cy="${cy}" r="${r - 6}"/></clipPath></defs>` +
    `<g id="${id}-all" style="opacity:0" transform="${tf({ px: cx, py: cy })}">` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--panel-bg);stroke:var(--ui-white);stroke-width:5"/>` +
    `<g clip-path="url(#${id}-clip)">` +
    poly(ngon(cx, cy, 100), shade("stone", 22)) + poly([[cx, cy - 100], ...shellHalf.slice(1), [cx, cy + 100]], shade("stone", 30)) +
    `<g id="${id}-plug" transform="${rot(0)}">${poly(ngon(cx, cy, 62), tint("stone", 28))}${poly([[cx - 9, cy - 10], [cx + 9, cy - 10], [cx + 9, cy + 52], [cx - 9, cy + 52]], shade("earth-3", 25))}</g>` +
    `<g id="${id}-pins" style="opacity:0"><g id="${id}-pinsA" transform="translate(0 0)">` +
    pinFace(cx - 10, cy - 90, 20, 40, tint("stone", 8), shade("stone", 6)) +
    `<g id="${id}-kp">${pinFace(cx - 10, cy - 50, 20, 24, "var(--sand)", shade("sand", 14))}</g></g></g>` +
    `<circle id="${id}-gt" cx="${cx}" cy="${cy}" r="100" style="fill:var(--ui-red);opacity:0"/>` +
    `<circle id="${id}-ringR" cx="${cx}" cy="${cy}" r="64" style="fill:none;stroke:var(--ui-red);stroke-width:6;opacity:0"/>` +
    `<circle id="${id}-ringY" cx="${cx}" cy="${cy}" r="64" style="fill:none;stroke:var(--ui-yellow);stroke-width:6;opacity:0"/>` +
    `</g></g></svg>`;
  const html = svg;
  T(`#${id}-all`, { opacity: 0, attr: { transform: tf({ px: cx, py: cy, sx: 0.9, sy: 0.9 }) } }, { opacity: 1, attr: { transform: tf({ px: cx, py: cy }) }, duration: 0.18, ease: "power2.out" }, at);
  const api = {
    html, css: "",
    turn(deg, t, d = 0.35) {
      T(`#${id}-plug`, { attr: { transform: rot(ang) } }, { attr: { transform: rot(deg) }, duration: d, ease: "power2.inOut" }, t);
      if (Math.abs(deg) > 6 && kpOn) { T(`#${id}-kp`, { opacity: 1 }, { opacity: 0, duration: 0.1, ease: "none" }, t); kpOn = false; }
      else if (Math.abs(deg) <= 6 && !kpOn) { T(`#${id}-kp`, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "none" }, t + d); kpOn = true; }
      ang = deg;
    },
    jam(t) {
      const seq = [[5, 0.12], [-2, 0.08], [3, 0.08], [0, 0.12]];
      let tt = t, a = ang;
      for (const [v, d] of seq) { T(`#${id}-plug`, { attr: { transform: rot(a) } }, { attr: { transform: rot(v) }, duration: d, ease: "none" }, tt); a = v; tt += d; }
      T(`#${id}-ringR`, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, t);
      T(`#${id}-ringR`, { opacity: 1 }, { opacity: 0, duration: 0.35, ease: "none" }, t + 0.15);
    },
    pin(t) { T(`#${id}-pins`, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" }, t); },
    align(on, t) {
      T(`#${id}-pinsA`, { attr: { transform: `translate(0 ${al ? -12 : 0})` } }, { attr: { transform: `translate(0 ${on ? -12 : 0})` }, duration: 0.25, ease: "power2.out" }, t);
      al = on;
    },
    flash(color, t) {
      const s = `#${id}-ring${color === "yellow" ? "Y" : "R"}`;
      T(s, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, t);
      T(s, { opacity: 1 }, { opacity: 0, duration: 0.35, ease: "none" }, t + 0.15);
    },
    ghostTint(t, hold) {
      T(`#${id}-gt`, { opacity: 0 }, { opacity: 0.35, duration: 0.15, ease: "none" }, t);
      T(`#${id}-gt`, { opacity: 0.35 }, { opacity: 0, duration: 0.15, ease: "none" }, t + hold);
    },
    tl: () => out.join("\n") + `\ntl.to("#${id}-all", {opacity:0, duration:0.2, ease:"power1.in"}, ${r3(at + dur - 0.22)});`,
  };
  return api;
}
