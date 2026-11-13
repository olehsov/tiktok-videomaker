import { poly, shade, tint, tf, f, groundShadow } from "../lowpoly.mjs";

// Low-poly cat, side view, feet at (0,0), facing right (flip:true faces left). ~80 long, 66 tall at s = 1.
// cat({ id, x, y, s=1, flip=false }) → { svg, pose(name,at,dur), act(name,at,dur,period), move(x,y,at,dur,ease), face(dir,at), tl() }
// Call pose / act / move / face in chronological order (state is tracked to build from→to tweens).

const DEFAULT = { ears: 0, head: 0, tail: 0, legF: 0, legB: 0, dy: 0, curl: 0 };
export const CAT_POSES = {
  stand: {},
  earsFlat: { ears: 55, head: 8, tail: 20 },
  run: { legF: -35, legB: 35, tail: -25, dy: -6 },
  curl: { curl: 1 },
};
export const CAT_ACTIONS = {
  run: [{ legF: -35, legB: 35 }, { legF: 25, legB: -25 }],
};
const r3 = (n) => Math.round(n * 1000) / 1000;

export function cat({ id, x = 0, y = 0, s = 1, flip = false } = {}) {
  const fur = tint("earth-1", 12), dark = shade("earth-1", 12), stripe = shade("earth-1", 30);
  const belly = tint("sand", 30), eye = "var(--earth-3)", inner = tint("earth-1", 35);
  const part = (name, px, py, inner_) => `<g id="${id}-${name}" transform="${tf({ px, py })}">${inner_}</g>`;
  const stand =
    part("tail", -34, -30, poly([[-34, -30], [-58, -46], [-64, -62], [-58, -64], [-52, -50], [-30, -36]], dark)) +
    part("legB", -24, -22, poly([[-30, -22], [-18, -22], [-16, 0], [-26, 0]], fur)) +
    poly([[-36, -24], [-30, -40], [10, -44], [30, -34], [30, -20], [-30, -18]], fur) +
    poly([[-30, -18], [30, -20], [26, -14], [-26, -14]], dark) +
    poly([[-22, -42], [-18, -42], [-16, -20], [-20, -20]], stripe) + poly([[-8, -43], [-4, -43], [-2, -21], [-6, -21]], stripe) + poly([[6, -43], [10, -42], [12, -22], [8, -22]], stripe) +
    part("legF", 22, -22, poly([[16, -22], [28, -22], [28, 0], [18, 0]], fur)) +
    part("head", 30, -36,
      poly([[24, -36], [30, -54], [48, -56], [56, -44], [50, -32], [32, -30]], fur) +
      poly([[48, -44], [58, -42], [54, -36], [46, -36]], belly) +
      `<circle cx="46" cy="-47" r="2.2" style="fill:${eye}"/>` +
      part("ears", 40, -55, poly([[30, -52], [32, -66], [40, -55]], fur) + poly([[40, -55], [48, -67], [50, -55]], fur) + poly([[32, -55], [33, -62], [38, -56]], inner) + poly([[42, -56], [47, -62], [48, -56]], inner)));
  const arc = Array.from({ length: 6 }, (_, k) => { const a = (k / 5) * Math.PI; return [-30 + 58 * (k / 5), -6 - Math.sin(a) * 4]; });
  const curl =
    poly(Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return [Math.cos(a) * 36, -16 + Math.sin(a) * 17]; }), fur) +
    poly([[-30, -24], [0, -32], [30, -24], [0, -20]], tint("earth-1", 20)) +
    poly([...arc.map(([ax, ay]) => [ax, ay]), ...[...arc].reverse().map(([ax, ay]) => [ax, ay + 7])], dark) +
    poly([[16, -26], [34, -32], [40, -18], [22, -10]], fur) + poly([[22, -28], [24, -38], [30, -30]], fur) + poly([[30, -31], [36, -38], [37, -29]], fur) +
    `<line x1="28" y1="-22" x2="34" y2="-21" style="stroke:${eye};stroke-width:2"/>`;
  const sgn = flip ? -s : s;
  const svg =
    `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g id="${id}-flip" transform="scale(${sgn} ${s})">` +
    groundShadow(0, 0, 70) +
    `<g id="${id}-lift" transform="translate(0 0)"><g id="${id}-stand" style="opacity:1">${stand}</g><g id="${id}-curl" style="opacity:0">${curl}</g></g></g></g>`;

  const L = [];
  const cur = { ...DEFAULT };
  const st = { x, y, dir: flip ? "left" : "right", sx: 0 };
  const PIV = { ears: [40, -55], head: [30, -36], tail: [-34, -30], legF: [22, -22], legB: [-24, -22] };
  const setPose = (target, at, dur = 0.35) => {
    const next = { ...DEFAULT, ...target };
    for (const p of ["ears", "head", "tail", "legF", "legB"]) {
      if (cur[p] !== next[p]) L.push(`tl.fromTo("#${id}-${p}", {attr:{transform:"${tf({ r: cur[p], px: PIV[p][0], py: PIV[p][1] })}"}}, {attr:{transform:"${tf({ r: next[p], px: PIV[p][0], py: PIV[p][1] })}"}, duration:${r3(dur)}, ease:"power1.inOut", immediateRender:false}, ${r3(at)});`);
    }
    if (cur.dy !== next.dy) L.push(`tl.fromTo("#${id}-lift", {attr:{transform:"translate(${st.sx} ${cur.dy})"}}, {attr:{transform:"translate(${st.sx} ${next.dy})"}, duration:${r3(dur)}, ease:"power1.inOut", immediateRender:false}, ${r3(at)});`);
    if (cur.curl !== next.curl) {
      const d = Math.max(dur, 0.4);
      L.push(`tl.fromTo("#${id}-stand", {opacity:${1 - cur.curl}}, {opacity:${1 - next.curl}, duration:${d}, ease:"none", immediateRender:false}, ${r3(at)});`);
      L.push(`tl.fromTo("#${id}-curl", {opacity:${cur.curl}}, {opacity:${next.curl}, duration:${d}, ease:"none", immediateRender:false}, ${r3(at)});`);
    }
    Object.assign(cur, next);
  };
  return {
    svg,
    pose(name, at, dur = 0.35) {
      if (!CAT_POSES[name]) throw new Error(`cat pose '${name}' unknown`);
      setPose(CAT_POSES[name], at, dur);
    },
    act(name, at, dur, period = 0.8) {
      if (name === "shiver") {
        let t = at, i = 0;
        while (t + period / 2 <= at + dur + 1e-6) {
          const nx = i % 2 ? -2 : 2;
          L.push(`tl.fromTo("#${id}-lift", {attr:{transform:"translate(${st.sx} ${cur.dy})"}}, {attr:{transform:"translate(${nx} ${cur.dy})"}, duration:${r3(period / 2 * 0.95)}, ease:"sine.inOut", immediateRender:false}, ${r3(t)});`);
          st.sx = nx; t += period / 2; i++;
        }
        if (st.sx !== 0) { L.push(`tl.fromTo("#${id}-lift", {attr:{transform:"translate(${st.sx} ${cur.dy})"}}, {attr:{transform:"translate(0 ${cur.dy})"}, duration:0.1, ease:"none", immediateRender:false}, ${r3(Math.max(t, at + dur))});`); st.sx = 0; }
        return;
      }
      const seq = CAT_ACTIONS[name];
      if (!seq) throw new Error(`cat action '${name}' unknown`);
      let t = at, i = 0;
      while (t + period / 2 <= at + dur + 1e-6) { setPose({ ...seq[i % 2], dy: cur.dy }, t, period / 2 * 0.95); t += period / 2; i++; }
    },
    move(nx, ny, at, dur, ease = "power1.inOut") {
      L.push(`tl.fromTo("#${id}", {attr:{transform:"translate(${f(st.x)} ${f(st.y)})"}}, {attr:{transform:"translate(${f(nx)} ${f(ny)})"}, duration:${r3(dur)}, ease:"${ease}", immediateRender:false}, ${r3(at)});`);
      st.x = nx; st.y = ny;
    },
    face(dir, at) {
      if (dir === st.dir) return;
      const a = dir === "left" ? s : -s, b = dir === "left" ? -s : s;
      L.push(`tl.fromTo("#${id}-flip", {attr:{transform:"scale(${a} ${s})"}}, {attr:{transform:"scale(${b} ${s})"}, duration:0.01, ease:"none", immediateRender:false}, ${r3(at)});`);
      st.dir = dir;
    },
    tl: () => L.join("\n"),
  };
}
