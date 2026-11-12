import { poly, tint, prng, f } from "../lowpoly.mjs";
import { W, H } from "../layout.mjs";

/** Fixed-screen rain: two phase-offset layers of streaks that translate (+60,+360) per 0.4 s with a finite repeat. */
export function rain({ id, n = 70, seed = 21, angle = 15 }) {
  const r = prng(seed);
  const layer = (k) => {
    let s = "";
    for (let i = 0; i < n / 2; i++) {
      const x = r() * (W + 100) - 50, y = r() * (H + 200) - 360;
      s += `<polygon points="${f(x)},${f(y)} ${f(x + 2.5)},${f(y)} ${f(x + 2.5 + 26 * Math.tan((angle * Math.PI) / 180))},${f(y + 26)} ${f(x + 26 * Math.tan((angle * Math.PI) / 180))},${f(y + 26)}" style="fill:${tint("snow", 10)}" opacity=".55"/>`;
    }
    return `<g id="${id}-L${k}">${s}</g>`;
  };
  const svg = `<g id="${id}" style="opacity:0">${layer(0)}${layer(1)}</g>`;
  const tl = (at, dur) => {
    const cyc = Math.max(1, Math.floor(dur / 0.4) - 1);
    return `tl.fromTo("#${id}-L0", {x:0, y:0}, {x:60, y:360, duration:0.4, ease:"none", repeat:${cyc}}, ${f(at * 1000) / 1000});\n` +
      `tl.fromTo("#${id}-L1", {x:0, y:-180}, {x:60, y:180, duration:0.4, ease:"none", repeat:${cyc}}, ${f(at * 1000) / 1000});`;
  };
  return { svg, tl };
}
