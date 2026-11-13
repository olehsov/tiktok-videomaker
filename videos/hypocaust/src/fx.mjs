// Hypocaust effects (world-space, palette tokens only): heat/cool streams, cold arrows, CO haze.
import { poly, shade, tint, prng, f } from "../kit/lowpoly.mjs";

const r3 = (n) => Math.round(n * 1000) / 1000;
const TONES = {
  heat: "var(--ui-heat)",
  warm: "color-mix(in srgb, var(--ui-heat) 45%, var(--stone))",
  cool: "color-mix(in srgb, var(--ui-heat) 15%, var(--stone))",
  cold: "var(--ui-blue)",
};

/** wavy polyline along control points: sine, 3 waves per 300 px, deterministic */
export function wavyPath(points, amp = 12, step = 10) {
  const out = [];
  let dist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i], [bx, by] = points[i + 1];
    const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(len / step));
    const nx = -(by - ay) / len, ny = (bx - ax) / len;
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const t = k / n, d = dist + len * t, o = amp * Math.sin((d / 100) * Math.PI * 2);
      out.push([ax + (bx - ax) * t + nx * o, ay + (by - ay) * t + ny * o]);
    }
    dist += len;
  }
  return out;
}
const pathD = (p) => "M " + p.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ");

/** stream({ id, points, tone, at, dur, width=7, wavy=true, amp=12 }) → { svg, tl } */
export function stream({ id, points, tone = "heat", at, dur, width = 7, wavy = true, amp = 12 }) {
  const p = wavy ? wavyPath(points, amp) : points;
  const [x1, y1] = p[p.length - 1], [x0, y0] = p[Math.max(0, p.length - 4)];
  const a = Math.atan2(y1 - y0, x1 - x0), L = width * 2.6, W = width * 1.7;
  const c = Math.cos(a), s = Math.sin(a);
  const head = [[x1 + c * L, y1 + s * L], [x1 - s * W, y1 + c * W], [x1 + s * W, y1 - c * W]];
  const col = TONES[tone] ?? tone;
  const svg =
    `<g id="${id}" style="opacity:0"><path id="${id}-p" d="${pathD(p)}" style="fill:none;stroke:${col};stroke-width:${width};stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:26 18;stroke-dashoffset:0"/>` +
    poly(head, col) + `</g>` +
    `<path id="${id}-red" d="${pathD(p)}" style="fill:none;stroke:var(--ui-red);stroke-width:${width + 3};stroke-linecap:round;opacity:0"/>`;
  const tl =
    `tl.fromTo("#${id}", {opacity:0}, {opacity:1, duration:0.3, ease:"none", immediateRender:false}, ${r3(at)});\n` +
    `tl.fromTo("#${id}-p", {strokeDashoffset:0}, {strokeDashoffset:${-Math.round(44 * dur * 1.5)}, duration:${r3(dur)}, ease:"none", immediateRender:false}, ${r3(at)});`;
  return { svg, tl };
}

/** coldArrows({ id, xs, y0, y1, at, dur }) → { svg, tl }: blue arrows sinking, 0.8 s cycles, finite */
export function coldArrows({ id, xs, y0, y1, at, dur }) {
  let svg = "", tl = "";
  const col = "var(--ui-blue)";
  xs.forEach((x, i) => {
    svg += `<g transform="translate(${x} ${y0})"><g id="${id}-a${i}" style="opacity:0"><line x1="0" y1="-26" x2="0" y2="4" style="stroke:${col};stroke-width:6;stroke-linecap:round"/>${poly([[0, 16], [-11, 0], [11, 0]], col)}</g></g>`;
    for (let k = at + i * 0.2; k + 0.8 <= at + dur + 1e-6; k += 0.8) {
      tl += `${tl ? "\n" : ""}tl.fromTo("#${id}-a${i}", {y:0, opacity:0}, {y:${y1 - y0}, duration:0.8, ease:"none", keyframes:undefined, immediateRender:false}, ${r3(k)});`;
      tl += `\ntl.fromTo("#${id}-a${i}", {opacity:0}, {opacity:1, duration:0.2, ease:"none", immediateRender:false}, ${r3(k)});`;
      tl += `\ntl.fromTo("#${id}-a${i}", {opacity:1}, {opacity:0, duration:0.2, ease:"none", immediateRender:false}, ${r3(k + 0.6)});`;
    }
  });
  tl = tl.replace(/, keyframes:undefined/g, "");
  return { svg: `<g id="${id}">${svg}</g>`, tl };
}

/** haze({ id, area:{x,y,w,h}, n, seed }) → { svg, blobs:[{id,cx,cy}], tl(at, dur, drift=10) }: faint dashed grey-violet gas */
export function haze({ id, area, n = 5, seed = 21 }) {
  const r = prng(seed);
  const fill = "color-mix(in srgb, color-mix(in srgb, var(--stone) 70%, var(--night-tint)) 85%, var(--ui-red))";
  const blobs = [];
  let svg = "";
  for (let i = 0; i < n; i++) {
    const cx = area.x + ((i + 0.5) / n) * area.w + (r() - 0.5) * 30, cy = area.y + area.h * (0.35 + r() * 0.3), rr = Math.min(area.h * 0.5, 30) + r() * 12;
    const pts = Array.from({ length: 9 }, (_, k) => { const a = (k / 9) * Math.PI * 2, q = rr * (0.8 + r() * 0.4); return [cx + Math.cos(a) * q * 1.5, cy + Math.sin(a) * q]; });
    const d = pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
    blobs.push({ id: `${id}-b${i}`, cx, cy });
    svg += `<g id="${id}-b${i}"><polygon points="${d}" style="fill:${fill};fill-opacity:0.32;stroke:${tint("stone", 40)};stroke-opacity:0.5;stroke-width:3;stroke-dasharray:10 8;stroke-linejoin:round"/></g>`;
  }
  const tl = (at, dur, drift = 10) => blobs.map((b, i) => {
    const cyc = 1.2, rep = Math.max(1, 2 * Math.floor(dur / (cyc * 2)) - 1);
    return `tl.fromTo("#${b.id}", {y:0}, {y:${i % 2 ? drift : -drift}, duration:${cyc}, ease:"sine.inOut", yoyo:true, repeat:${rep}, immediateRender:false}, ${r3(at + i * 0.1)});`;
  }).join("\n");
  return { svg: `<g id="${id}" style="opacity:0">${svg}</g>`, blobs, tl };
}
