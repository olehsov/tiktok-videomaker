// Ancient Egyptian wooden pin lock inset (circle). Shapes relative to (cx, cy).
import { poly, shade, tint, tf } from "../kit/lowpoly.mjs";
import { r3 } from "./lock.mjs";
const J = JSON.stringify;

export function egyptInset({ id, cx, cy, r, at }) {
  const R = (x0, y0, x1, y1, c) => poly([[cx + x0, cy + y0], [cx + x1, cy + y0], [cx + x1, cy + y1], [cx + x0, cy + y1]], c);
  const pegs = [-15, 30].map((x, k) => `<g id="${id}-peg${k}" transform="translate(0 0)">${R(x - 7, -40, x + 7, 0, tint("wood", 18))}</g>`).join("");
  const keyPins = [-135, -90].map((x) => R(x - 7, 30, x + 7, 44, tint("wood", 30))).join("");
  const svg =
    `<svg id="${id}-svg" xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible">` +
    `<defs><clipPath id="${id}-clip"><circle cx="${cx}" cy="${cy}" r="${r - 6}"/></clipPath></defs>` +
    `<g id="${id}" style="opacity:0" transform="${tf({ px: cx, py: cy })}">` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--panel-bg);stroke:var(--ui-white);stroke-width:5"/>` +
    `<g clip-path="url(#${id}-clip)">` +
    R(-40, -50, 60, 10, shade("wood", 25)) +
    `<g id="${id}-bolt" transform="translate(0 0)">${R(-90, 10, 90, 25, "var(--wood)")}${R(-90, 25, 90, 40, shade("wood", 14))}</g>` +
    pegs +
    `<g id="${id}-key" transform="translate(0 0)"><g id="${id}-keyx" transform="translate(0 0)">${R(-160, 44, -40, 54, tint("wood", 30))}${keyPins}</g></g>` +
    `</g></g></svg>`;
  const html = (dur) => `<div class="clip kit-abs" data-start="${r3(at)}" data-duration="${r3(dur)}" data-track-index="2" style="z-index:4;left:0;top:0;width:1080px;height:1920px">${svg}</div>`;
  const T = (sel, from, to, t) => `tl.fromTo(${J(sel)}, ${J(from)}, ${J({ ...to, immediateRender: false })}, ${r3(t)});`;
  return {
    svg, html,
    tl(endAt) {
      const L = [];
      L.push(T(`#${id}`, { opacity: 0, attr: { transform: tf({ px: cx, py: cy, sx: 0.9, sy: 0.9 }) } }, { opacity: 1, attr: { transform: tf({ px: cx, py: cy }) }, duration: 0.18, ease: "power2.out" }, at));
      for (const k of [0, 1]) L.push(T(`#${id}-peg${k}`, { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(0 30)" }, duration: 0.3, ease: "power2.in" }, at + 0.2));
      L.push(T(`#${id}-keyx`, { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(120 0)" }, duration: 0.4, ease: "power2.inOut" }, at + 1.0));
      L.push(T(`#${id}-key`, { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(0 -30)" }, duration: 0.3, ease: "power2.out" }, at + 1.5));
      for (const k of [0, 1]) L.push(T(`#${id}-peg${k}`, { attr: { transform: "translate(0 30)" } }, { attr: { transform: "translate(0 0)" }, duration: 0.3, ease: "power2.out" }, at + 1.5));
      L.push(T(`#${id}-bolt`, { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(40 0)" }, duration: 0.4, ease: "power2.inOut" }, at + 1.9));
      L.push(T(`#${id}`, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power1.in" }, endAt));
      return L.join("\n");
    },
  };
}
