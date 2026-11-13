import { poly, shade, tint, tf, f, groundShadow } from "../lowpoly.mjs";

const r3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Low-poly heron, feet at (0,0), faces right, about 100 tall at s 1.
 * heron({ id, x, y, s=1, flip=false }) → { svg, pose(name,at,dur), flap(at,dur,period), move(x,y,at,dur,ease), face(dir,at), tl() }
 * Call everything in chronological order (state is tracked, like the cat).
 */
export function heron({ id, x = 0, y = 0, s = 1, flip = false } = {}) {
  const body = tint("stone", 18), wing = shade("stone", 12), flight = shade("stone", 35), neck = tint("stone", 40);
  const crest = shade("earth-3", 40), beak = tint("sand", 10), legs = shade("sand", 25);
  const line = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${c};stroke-width:${w};stroke-linecap:round"/>`;
  const head = (dx, dy) => {
    const P = (a) => a.map(([px, py]) => [px + dx, py + dy]);
    return poly(P([[16, -92], [22, -98], [30, -96], [30, -90], [20, -88]]), neck) +
      line(18 + dx, -96 + dy, 6 + dx, -100 + dy, crest, 3) +
      `<circle cx="${25 + dx}" cy="${-94 + dy}" r="1.8" style="fill:var(--earth-3)"/>` +
      poly(P([[30, -96], [52, -92], [30, -90]]), beak);
  };
  const stand =
    line(-4, 0, -2, -44, legs, 3) + line(4, 0, 2, -44, legs, 3) +
    poly([[-30, -44], [-22, -62], [8, -66], [20, -56], [12, -44], [-10, -40]], body) +
    poly([[-28, -48], [-20, -62], [10, -62], [6, -50], [-34, -40]], wing) +
    poly([[-34, -40], [-44, -36], [-28, -46]], flight) +
    poly([[12, -60], [20, -64], [26, -80], [22, -92], [16, -92], [18, -80], [10, -66]], neck) +
    head(0, 0);
  const fly =
    line(-34, -28, -64, -24, legs, 3) +
    poly([[-34, -30], [-10, -40], [24, -38], [30, -30], [-20, -22]], body) +
    poly([[24, -38], [34, -44], [40, -40], [30, -32]], neck) +
    head(4, 44) +
    `<g id="${id}-wingF"><polygon points="-4,-34 -40,-80 -8,-74 16,-36" style="fill:${wing};stroke:var(--outline-c, none);stroke-width:var(--outline-w, 0)"/>` +
    poly([[-40, -80], [-24, -78], [-34, -62]], flight) + `</g>`;
  const svg =
    `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g id="${id}-flip" transform="scale(${flip ? -s : s} ${s})">` +
    groundShadow(0, 0, 50) +
    `<g id="${id}-stand">${stand}</g><g id="${id}-fly" style="opacity:0">${fly}</g></g></g>`;

  const lines = [];
  const st = { x, y, pose: "stand", dir: flip ? "left" : "right" };
  const fl = (dir) => `scale(${dir === "left" ? -s : s} ${s})`;
  return {
    svg,
    pose(name, at, dur = 0.15) {
      if (!["stand", "fly"].includes(name)) throw new Error(`heron pose '${name}' unknown (stand, fly)`);
      if (name === st.pose) return;
      const a = name === "fly" ? 1 : 0;
      lines.push(`tl.fromTo("#${id}-fly", {opacity:${1 - a}}, {opacity:${a}, duration:${r3(dur)}, ease:"none", immediateRender:false}, ${r3(at)});`);
      lines.push(`tl.fromTo("#${id}-stand", {opacity:${a}}, {opacity:${1 - a}, duration:${r3(dur)}, ease:"none", immediateRender:false}, ${r3(at)});`);
      st.pose = name;
    },
    flap(at, dur, period = 0.25) {
      let t = at, i = 0, cur = tf({ r: -15, px: -4, py: -34 });
      while (t + period / 2 <= at + dur + 1e-6) {
        const next = tf({ r: i % 2 ? -15 : 40, px: -4, py: -34 });
        lines.push(`tl.fromTo("#${id}-wingF", {attr:{transform:"${cur}"}}, {attr:{transform:"${next}"}, duration:${r3(period / 2 * 0.95)}, ease:"sine.inOut", immediateRender:false}, ${r3(t)});`);
        cur = next; t += period / 2; i++;
      }
    },
    move(nx, ny, at, dur, ease = "power1.inOut") {
      lines.push(`tl.fromTo("#${id}", {attr:{transform:"translate(${f(st.x)} ${f(st.y)})"}}, {attr:{transform:"translate(${f(nx)} ${f(ny)})"}, duration:${r3(dur)}, ease:"${ease}", immediateRender:false}, ${r3(at)});`);
      st.x = nx; st.y = ny;
    },
    face(dir, at) {
      if (dir === st.dir) return;
      lines.push(`tl.fromTo("#${id}-flip", {attr:{transform:"${fl(st.dir)}"}}, {attr:{transform:"${fl(dir)}"}, duration:0.01, ease:"none", immediateRender:false}, ${r3(at)});`);
      st.dir = dir;
    },
    tl: () => lines.join("\n"),
  };
}
