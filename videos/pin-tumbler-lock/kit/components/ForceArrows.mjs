import { f } from "../lowpoly.mjs";
import { r3, clipAttrs } from "./_anim.mjs";

const COLORS = { blue: "var(--ui-blue)", heat: "var(--ui-heat)", yellow: "var(--ui-yellow)" };

function sample(path, frac) {
  const seg = [];
  let total = 0;
  for (let i = 0; i + 1 < path.length; i++) { const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); seg.push(l); total += l; }
  let d = frac * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      const [x0, y0] = path[i], [x1, y1] = path[i + 1];
      const tx = (x1 - x0) / (seg[i] || 1), ty = (y1 - y0) / (seg[i] || 1);
      return { p: [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k], t: [tx, ty] };
    }
    d -= seg[i];
  }
}

/** Arrow polygon: tail at `o`, pointing along unit vector `d`, total length `len`. Head = triangle width×3 wide. */
function arrowPoly(o, d, len, width, color) {
  const n = [-d[1], d[0]], hl = width * 1.6, hw = width * 1.5, sw = width / 2, bl = Math.max(4, len - hl);
  const P = (a, b) => [o[0] + d[0] * a + n[0] * b, o[1] + d[1] * a + n[1] * b];
  const pts = [P(0, -sw), P(bl, -sw), P(bl, -hw), P(len, 0), P(bl, hw), P(bl, sw), P(0, sw)];
  return `<polygon points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}" style="fill:${color};stroke:var(--ui-white);stroke-width:2;stroke-linejoin:round"/>`;
}

/**
 * Force arrows along a polyline (squeeze / stretch / along). Finite cycles, no repeat:-1.
 * { id, tone:'blue'|'heat'|'yellow', mode:'squeeze'|'stretch'|'along', path:[[x,y]…], count=3, len=64, width=10, gap=18, at, dur, period=1.2 }
 * → { svg (a <g id> for a scene stage), html (same in a full-frame clip), tl }
 */
export function ForceArrows({ id, tone, mode, path, count = 3, len = 64, width = 10, gap = 18, at, dur, period = 1.2 }) {
  const color = COLORS[tone];
  if (!color) throw new Error(`ForceArrows tone '${tone}' unknown (blue, heat, yellow)`);
  if (!["squeeze", "stretch", "along"].includes(mode)) throw new Error(`ForceArrows mode '${mode}' unknown`);
  const arrows = [];
  for (let i = 0; i < count; i++) {
    const { p, t } = sample(path, (i + 0.5) / count);
    const neg = [-t[0], -t[1]];
    if (mode === "squeeze") {
      arrows.push({ o: [p[0] - t[0] * (gap / 2 + len), p[1] - t[1] * (gap / 2 + len)], d: t, mv: t });
      arrows.push({ o: [p[0] + t[0] * (gap / 2 + len), p[1] + t[1] * (gap / 2 + len)], d: neg, mv: neg });
    } else if (mode === "stretch") {
      arrows.push({ o: [p[0] - t[0] * gap / 2, p[1] - t[1] * gap / 2], d: neg, mv: neg });
      arrows.push({ o: [p[0] + t[0] * gap / 2, p[1] + t[1] * gap / 2], d: t, mv: t });
    } else arrows.push({ o: [p[0] - t[0] * len / 2, p[1] - t[1] * len / 2], d: t, mv: t, along: true });
  }
  const body = arrows.map((a, k) => `<g id="${id}-a${k}">${arrowPoly(a.o, a.d, len, width, color)}</g>`).join("");
  const svg = `<g id="${id}" style="opacity:0">${body}</g>`;
  const end = at + dur;
  let tl = `tl.fromTo("#${id}", {opacity:0}, {opacity:1, duration:0.2, ease:"power1.out", immediateRender:false}, ${r3(at)});`;
  const cycles = Math.max(0, Math.floor((dur - 0.4) / period));
  arrows.forEach((a, k) => {
    for (let c = 0; c < cycles; c++) {
      const t0 = at + 0.2 + c * period;
      if (a.along) {
        tl += `\ntl.fromTo("#${id}-a${k}", {x:0, y:0}, {x:${f(a.mv[0] * 30)}, y:${f(a.mv[1] * 30)}, duration:${r3(period)}, ease:"none", immediateRender:false}, ${r3(t0)});`;
      } else {
        tl += `\ntl.fromTo("#${id}-a${k}", {x:0, y:0}, {x:${f(a.mv[0] * 14)}, y:${f(a.mv[1] * 14)}, duration:${r3(period / 2)}, ease:"sine.inOut", immediateRender:false}, ${r3(t0)});`;
        tl += `\ntl.to("#${id}-a${k}", {x:0, y:0, duration:${r3(period / 2)}, ease:"sine.inOut"}, ${r3(t0 + period / 2)});`;
      }
    }
  });
  tl += `\ntl.to("#${id}", {opacity:0, duration:0.2, ease:"power1.in"}, ${r3(end - 0.22)});`;
  const html = `<div id="${id}-clip" ${clipAttrs(at, dur, 2)} style="left:0;top:0;width:1080px;height:1920px"><svg width="1080" height="1920" viewBox="0 0 1080 1920" style="overflow:visible">${svg}</svg></div>`;
  return { svg, html, css: "", tl };
}
