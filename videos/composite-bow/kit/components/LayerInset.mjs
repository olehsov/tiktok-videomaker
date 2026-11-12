import { poly, shade, tint, f, tf } from "../lowpoly.mjs";
import { r3, clipAttrs } from "./_anim.mjs";

const K = 1.15; // section stack scale inside the disc
// layer spans (local x) — belly (horn) on the archer's side (left), back (sinew) on the right
const SPAN = { horn: [-70, -26], core: [-26, 22], sinew: [22, 62] };
const Y0 = -95, Y1 = 95, C = 14;

/** chamfered rect polygon points; `right` = only the right half (dark face) */
const chamfer = (x0, x1, y0, y1, c = C) => [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];
const half = (x0, x1, y0, y1, c = C) => { const m = (x0 + x1) / 2; return [[m, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [m, y1]]; };
const arc = (cx, cy, r, a0, a1) => {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M ${f(x0)} ${f(y0)} A ${r} ${r} 0 0 1 ${f(x1)} ${f(y1)}`;
};

/**
 * Cross-section inset of a limb that gains layers (circle, upper right). Calls must be made in time order.
 * LayerInset({ id, cx=760, cy=470, r=150, at, dur }) → { html, css, add(layer,t), ghost(kind,t,hold), pulse(layer,t), tl() }
 * layers: core, horn, sinew, glue, cover.  ghost kinds: slip, peel.
 */
export function LayerInset({ id, cx = 760, cy = 470, r = 150, at, dur }) {
  const L = (n) => `${id}-L-${n}`;
  const faces = {
    horn: [tint("stone", 38), tint("stone", 18)],
    core: [tint("wood", 6), shade("wood", 14)],
    sinew: [tint("sand", 22), tint("sand", 4)],
  };
  const slab = (n) => {
    const [x0, x1] = SPAN[n];
    let s = poly(chamfer(x0, x1, Y0, Y1), faces[n][0]) + poly(half(x0, x1, Y0, Y1), faces[n][1]);
    if (n === "sinew") for (let i = 0; i < 4; i++) { const x = x0 + 8 + i * 9; s += `<line x1="${x}" y1="${Y0 + 12}" x2="${x}" y2="${Y1 - 12}" style="stroke:${tint("sand", 15)};stroke-width:2.5"/>`; }
    return s;
  };
  const red = (n) => `<g id="${id}-red-${n}" style="opacity:0">${poly(chamfer(...SPAN[n], Y0, Y1), "var(--ui-red)")}</g>`;
  const yel = (n) => `<g id="${id}-Y-${n}" style="opacity:0"><polygon points="${chamfer(...SPAN[n], Y0, Y1).map(([x, y]) => `${x},${y}`).join(" ")}" style="fill:none;stroke:var(--ui-yellow);stroke-width:5;stroke-linejoin:round"/></g>`;
  const layerG = (n, inner) => `<g id="${L(n)}" style="opacity:0"><g id="${L(n)}-m" transform="${tf()}">${inner}</g></g>`;
  const glueLines = [-26, 22].map((x) => `<line x1="${x}" y1="${Y0}" x2="${x}" y2="${Y1}" style="stroke:${tint("sand", 45)};stroke-width:6"/>`).join("");
  const redGlue = [-26, 22].map((x) => `<line x1="${x}" y1="${Y0}" x2="${x}" y2="${Y1}" style="stroke:var(--ui-red);stroke-width:6"/>`).join("");
  const coverPts = chamfer(-80, 72, -105, 105);
  const coverD = coverPts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") + " Z";
  const ticks = [-60, -20, 20, 60].map((x) => `<line x1="${x - 8}" y1="-105" x2="${x + 8}" y2="-93" style="stroke:${shade("wood", 30)};stroke-width:5"/>`).join("");
  const coverInner = `<path d="${coverD}" style="fill:none;stroke:${shade("wood", 30)};stroke-width:10;stroke-linejoin:round"/>${ticks}`;
  const stack =
    layerG("core", slab("core") + red("core")) + layerG("horn", slab("horn") + red("horn")) + layerG("sinew", slab("sinew") + red("sinew")) +
    layerG("glue", glueLines + `<g id="${id}-red-glue" style="opacity:0">${redGlue}</g>`) +
    layerG("cover", coverInner) +
    ["core", "horn", "sinew"].map(yel).join("") +
    `<g id="${id}-Y-glue" style="opacity:0">${glueLines.replace(/stroke:[^;]+/g, "stroke:var(--ui-yellow)")}</g>` +
    `<g id="${id}-Y-cover" style="opacity:0"><path d="${coverD}" style="fill:none;stroke:var(--ui-yellow);stroke-width:5;stroke-linejoin:round"/></g>`;
  const head = poly([[-20, -2], [-24, -28], [-12, -50], [12, -50], [24, -28], [20, -2]], tint("sand", 22)) +
    poly([[-25, -30], [-13, -53], [13, -53], [25, -30], [25, -23], [-25, -23]], shade("earth-3", 0));
  const svg =
    `<svg id="${id}-svg" xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible">` +
    `<defs><clipPath id="${id}-clip"><circle cx="${cx}" cy="${cy}" r="${r - 6}"/></clipPath></defs>` +
    `<g id="${id}-all" style="opacity:0" transform="${tf({ px: cx, py: cy })}">` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--panel-bg);stroke:var(--ui-white);stroke-width:5"/>` +
    `<path d="${arc(cx, cy, r, 145, 215)}" style="fill:none;stroke:var(--ui-blue);stroke-width:8;stroke-linecap:round"/>` +
    `<path d="${arc(cx, cy, r, -35, 35)}" style="fill:none;stroke:var(--ui-heat);stroke-width:8;stroke-linecap:round"/>` +
    `<g clip-path="url(#${id}-clip)"><g transform="translate(${cx} ${cy}) scale(${K})">${stack}</g></g></g></svg>`;
  const html = `<div id="${id}" ${clipAttrs(at, dur, 2)} style="left:0;top:0;width:1080px;height:1920px">${svg}</div>`;
  const out = [];
  const T = (sel, from, to, t) => out.push(`tl.fromTo("${sel}", ${JSON.stringify(from)}, ${JSON.stringify({ ...to, immediateRender: false })}, ${r3(t)});`);
  out.push(`tl.fromTo("#${id}-all", {opacity:0, attr:{transform:"${tf({ px: cx, py: cy })}"}}, {opacity:1, attr:{transform:"${tf({ px: cx, py: cy })}"}, duration:0.18, ease:"power2.out", immediateRender:false}, ${r3(at)});`);
  const api = {
    html, css: "",
    add(layer, t) {
      const sel = `#${L(layer)}`;
      if (layer === "core") T(sel, { opacity: 0, scaleY: 0.6 }, { opacity: 1, scaleY: 1, duration: 0.35, ease: "power2.out" }, t);
      else if (layer === "horn") T(sel, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, t);
      else if (layer === "sinew") T(sel, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, t);
      else if (layer === "glue") T(sel, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, t);
      else if (layer === "cover") T(sel, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, t);
      else throw new Error(`LayerInset layer '${layer}' unknown`);
    },
    ghost(kind, t, hold = 1.3) {
      const back = t + hold;
      if (kind === "slip") {
        T(`#${L("horn")}-m`, { attr: { transform: tf() } }, { attr: { transform: tf({ y: -18 }) }, duration: 0.3, ease: "power2.out" }, t);
        T(`#${L("sinew")}-m`, { attr: { transform: tf() } }, { attr: { transform: tf({ y: 18 }) }, duration: 0.3, ease: "power2.out" }, t);
        for (const n of ["horn", "sinew"]) { T(`#${id}-red-${n}`, { opacity: 0 }, { opacity: 0.5, duration: 0.3 }, t); T(`#${id}-red-${n}`, { opacity: 0.5 }, { opacity: 0, duration: 0.35 }, back); }
        T(`#${L("horn")}-m`, { attr: { transform: tf({ y: -18 }) } }, { attr: { transform: tf() }, duration: 0.35, ease: "power2.inOut" }, back);
        T(`#${L("sinew")}-m`, { attr: { transform: tf({ y: 18 }) } }, { attr: { transform: tf() }, duration: 0.35, ease: "power2.inOut" }, back);
      } else if (kind === "peel") {
        T(`#${id}-red-glue`, { opacity: 0 }, { opacity: 0.6, duration: 0.3 }, t);
        T(`#${L("horn")}-m`, { attr: { transform: tf({ px: -70, py: 95 }) } }, { attr: { transform: tf({ r: -12, px: -70, py: 95 }) }, duration: 0.4, ease: "power2.out" }, t);
        T(`#${id}-red-glue`, { opacity: 0.6 }, { opacity: 0, duration: 0.35 }, back);
        T(`#${L("horn")}-m`, { attr: { transform: tf({ r: -12, px: -70, py: 95 }) } }, { attr: { transform: tf({ px: -70, py: 95 }) }, duration: 0.35, ease: "power2.inOut" }, back);
      } else throw new Error(`LayerInset ghost '${kind}' unknown`);
    },
    pulse(layer, t) {
      const sel = `#${id}-Y-${layer}`;
      T(sel, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, t);
      T(sel, { opacity: 1 }, { opacity: 0, duration: 0.15, ease: "none" }, t + 0.15);
    },
    tl: () => out.join("\n") + `\ntl.to("#${id}-all", {opacity:0, duration:0.2, ease:"power1.in"}, ${r3(at + dur - 0.22)});`,
  };
  return api;
}
