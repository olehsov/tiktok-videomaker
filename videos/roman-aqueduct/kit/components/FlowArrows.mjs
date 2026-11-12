import { f } from "../lowpoly.mjs";
import { r3, clipAttrs } from "./_anim.mjs";

const KINDS = {
  heat: { color: "#FF6A3D", dir: [0, -1], wavy: true },
  cold: { color: "#3BA3FF", dir: [0, 1], wavy: false },
  water: { color: "#3BA3FF", dir: null, wavy: false },
  load: { color: "#F5C518", dir: [0, 1], wavy: false },
};
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** Arrow = stroked polyline + triangular head oriented along the last segment. */
function arrow(points, color, width, head) {
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(" ");
  const [x1, y1] = points[points.length - 2], [x2, y2] = points[points.length - 1];
  const a = Math.atan2(y2 - y1, x2 - x1), ca = Math.cos(a), sa = Math.sin(a);
  const tip = [x2 + ca * head * 0.6, y2 + sa * head * 0.6];
  const l = [x2 - ca * head * 0.4 - sa * head * 0.6, y2 - sa * head * 0.4 + ca * head * 0.6];
  const r = [x2 - ca * head * 0.4 + sa * head * 0.6, y2 - sa * head * 0.4 - ca * head * 0.6];
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<polygon points="${[tip, l, r].map((p) => p.map(f).join(",")).join(" ")}" fill="${color}"/>`;
}

/**
 * Animated process arrows (finite loops, no repeat:-1).
 *  heat  – wavy, rising, red-orange     cold – straight, sinking, blue
 *  load  – straight yellow, `dir` up/down/left/right      water – dashed flow along `points` (local coords) with an arrowhead
 * { id, kind, x, y, w, h (area, top-left), count=4, dir, points, at, dur, period=1.6, width=8 }
 */
export function FlowArrows({ id, kind, x, y, w, h, count = 4, dir, points, at, dur, period = 1.6, width = 8, inline = false, fadeIn = true, fadeOut = true }) {
  const K = KINDS[kind];
  if (!K) throw new Error(`FlowArrows kind '${kind}' unknown (heat, cold, water, load)`);
  const color = K.color;
  let body = "", tl = "";
  const end = at + dur;

  if (kind === "water") {
    if (!points || points.length < 2) throw new Error("FlowArrows water needs points: [[x,y],…] (local coordinates)");
    const d = points.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join(" ");
    body = `<path id="${id}-flow" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="26 18"/>`;
    const [x1, y1] = points[points.length - 2], [x2, y2] = points[points.length - 1];
    const a = Math.atan2(y2 - y1, x2 - x1), hd = width * 3.2;
    const tip = [x2 + Math.cos(a) * hd, y2 + Math.sin(a) * hd];
    const l = [x2 - Math.sin(a) * hd * 0.6, y2 + Math.cos(a) * hd * 0.6], r = [x2 + Math.sin(a) * hd * 0.6, y2 - Math.cos(a) * hd * 0.6];
    body += `<polygon id="${id}-head" points="${[tip, l, r].map((p) => p.map(f).join(",")).join(" ")}" fill="${color}"/>`;
    // dashes travel along the path direction: offset decreases linearly (44 px per dash period)
    tl += `tl.fromTo("#${id}-flow", {strokeDashoffset:0}, {strokeDashoffset:${-Math.round(44 * dur * 1.5)}, duration:${r3(dur)}, ease:"none"}, ${r3(at)});`;
    if (fadeIn) tl += `\ntl.fromTo("#${id}-svg", {opacity:0}, {opacity:1, duration:0.2}, ${r3(at)});`;
    if (fadeOut) tl += `\ntl.to("#${id}-svg", {opacity:0, duration:0.2}, ${r3(end - 0.22)});`;
  } else {
    const v = K.dir ?? DIRS[dir ?? "down"];
    const vec = dir ? DIRS[dir] : v;
    const horizontal = vec[0] !== 0;
    const span = horizontal ? h : w; // lane axis
    const run = horizontal ? w : h; // travel axis
    const travel = run * 0.35;
    const len = run * 0.5;
    for (let i = 0; i < count; i++) {
      const lane = ((i + 0.5) / count) * span;
      // path in local coords: starts at "tail", ends at "tip" in the direction of vec
      const pts = [];
      const n = K.wavy ? 14 : 2;
      for (let s = 0; s < n; s++) {
        const t = n === 2 ? s : s / (n - 1);
        const along = (vec[0] + vec[1] > 0 ? t * len : run - t * len);
        const wob = K.wavy ? Math.sin(t * Math.PI * 3 + i) * 12 : 0;
        pts.push(horizontal ? [along, lane + wob] : [lane + wob, along]);
      }
      if (n === 2) {
        const a0 = vec[0] + vec[1] > 0 ? 0 : run, a1 = vec[0] + vec[1] > 0 ? len : run - len;
        pts.length = 0;
        pts.push(horizontal ? [a0, lane] : [lane, a0], horizontal ? [a1, lane] : [lane, a1]);
      }
      body += `<g id="${id}-a${i}" style="opacity:0">${arrow(pts, color, width, width * 3.2)}</g>`;
      // finite cycles, phase-staggered
      const phase = (i / count) * period;
      let first = true;
      for (let t = at + phase * 0.6; t + period <= end + 1e-6 || first; t += period) {
        const p = Math.min(period, end - t);
        if (p < 0.4) break;
        const ir = first ? "" : ", immediateRender:false";
        const dx = vec[0] * travel, dy = vec[1] * travel;
        tl += `${tl ? "\n" : ""}tl.fromTo("#${id}-a${i}", {x:0, y:0, opacity:0}, {x:${f(dx * 0.3)}, y:${f(dy * 0.3)}, opacity:1, duration:${r3(p * 0.25)}, ease:"none"${ir}}, ${r3(t)});`;
        tl += `\ntl.to("#${id}-a${i}", {x:${f(dx * 0.7)}, y:${f(dy * 0.7)}, duration:${r3(p * 0.4)}, ease:"none"}, ${r3(t + p * 0.25)});`;
        tl += `\ntl.to("#${id}-a${i}", {x:${f(dx)}, y:${f(dy)}, opacity:0, duration:${r3(p * 0.35)}, ease:"none"}, ${r3(t + p * 0.65)});`;
        first = false;
        if (t + 2 * period > end + 1e-6) break;
      }
    }
  }
  if (inline) {
    const svg = `<g id="${id}" transform="translate(${x} ${y})"><g id="${id}-svg" ${kind === "water" && fadeIn ? 'style="opacity:0"' : ""}>${body}</g></g>`;
    return { html: "", svg, css: "", tl };
  }
  const html = `<div id="${id}" ${clipAttrs(at, dur, 2)} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><svg id="${id}-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible${kind === "water" ? ";opacity:0" : ""}">${body}</svg></div>`;
  return { html, css: "", tl };
}
