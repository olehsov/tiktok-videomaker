import { poly, shade, tint, f, groundShadow } from "../lowpoly.mjs";

// Side-view horse facing right, feet at (0,0), ~500 px long at s=1 (≈ 2.4 m at 210 px/m), withers at y -330.
// Parts are groups rotated about their pivot through the SVG `transform` attribute (same mechanism as the puppet).
const DEFAULT = { neck: 0, head: 0, legFL: 0, legFR: 0, legBL: 0, legBR: 0, tail: 0, dy: 0 };
export const SEAT = [10, -305];
export const HORSE_POSES = {
  stand: {},
  graze: { neck: 100, head: -62 },
  grazeBob: { neck: 108, head: -66 },
  toss: { neck: -10 },
};
export const HORSE_ACTIONS = {
  gallop: [
    { legFL: -35, legFR: 25, legBL: 35, legBR: -25, neck: -6, tail: 8, dy: -12 },
    { legFL: 25, legFR: -35, legBL: -25, legBR: 35, neck: 4, tail: -6, dy: 0 },
  ],
};
const PIV = { neck: [170, -280], head: [245, -410], legFL: [150, -200], legFR: [120, -200], legBL: [-180, -200], legBR: [-210, -200], tail: [-245, -270] };

/**
 * horse({ id, x, y, s=1, flip=false }) → { svg, pose(name,at,dur), act(name,at,dur,period,{bob}), move(x,y,at,dur), tl(), SEAT }
 * Call pose/act/move in chronological order (state is tracked to build from→to tweens).
 */
export function horse({ id, x = 0, y = 0, s = 1, flip = false } = {}) {
  const part = (name, inner) => `<g transform="translate(${PIV[name][0]} ${PIV[name][1]})"><g id="${id}-${name}" transform="rotate(0)">${inner}</g></g>`;
  const rel = (name, pts) => pts.map(([a, b]) => [a - PIV[name][0], b - PIV[name][1]]);
  const leg = (name, near) => {
    const dk = near ? 0 : 20;
    const up = poly([[-20, 0], [20, 0], [13, 100], [-12, 100]], shade("earth-1", 4 + dk));
    const upD = poly([[0, 0], [20, 0], [13, 100], [0, 100]], shade("earth-1", 18 + dk));
    const lo = poly([[-12, 100], [13, 100], [10, 186], [-9, 186]], shade("earth-1", 12 + dk));
    const knee = poly([[-14, 92], [15, 92], [13, 112], [-12, 112]], shade("earth-3", 8 + dk));
    const hoof = poly([[-11, 186], [11, 186], [14, 202], [-13, 202]], shade("earth-3", 40));
    return part(name, up + upD + knee + lo + hoof);
  };
  const P = [[-258, -245], [-238, -312], [-150, -326], [-20, -312], [90, -320], [175, -335], [242, -292], [238, -225], [190, -180], [100, -170], [-60, -172], [-170, -182], [-244, -200]];
  const barrelLow = poly(P, shade("earth-1", 16));
  const barrelUp = poly([P[0], P[1], P[2], P[3], P[4], P[5], P[6], [236, -262], [100, -250], [-60, -240], [-170, -250], [-250, -235]], tint("earth-1", 6));
  const haunch = poly([[-250, -280], [-170, -318], [-100, -290], [-110, -200], [-200, -190], [-245, -215]], tint("earth-1", 16));
  const shoulder = poly([[110, -318], [190, -330], [230, -270], [200, -200], [120, -215]], tint("earth-1", 14));
  const neckPoly = poly(rel("neck", [[120, -325], [232, -435], [278, -400], [232, -240], [140, -230]]), tint("earth-1", 4)) +
    poly(rel("neck", [[232, -435], [278, -400], [232, -240], [200, -250], [236, -380]]), shade("earth-1", 18)) +
    poly(rel("neck", [[118, -322], [226, -440], [240, -428], [150, -312]]), "var(--earth-3)");
  const headPoly = poly(rel("head", [[232, -440], [266, -452], [330, -348], [316, -322], [262, -366], [250, -398]]), shade("earth-1", 2)) +
    poly(rel("head", [[266, -452], [330, -348], [316, -322], [280, -372]]), shade("earth-1", 22)) +
    poly(rel("head", [[310, -360], [330, -348], [316, -322], [302, -334]]), shade("earth-3", 30)) +
    `<circle cx="${256 - PIV.head[0]}" cy="${-406 - PIV.head[1]}" r="5" style="fill:var(--earth-3)"/>` +
    poly(rel("head", [[238, -438], [246, -470], [260, -444]]), "var(--earth-3)");
  const tailPoly = poly([[6, -6], [-26, 22], [-52, 130], [-30, 172], [2, 60]], "var(--earth-3)") + poly([[6, -6], [-12, 30], [-30, 140], [-30, 172], [2, 60]], shade("earth-3", 20));
  const saddle = poly([[-50, -318], [70, -318], [64, -296], [-44, -296]], shade("wood", 20)) + poly([[-30, -296], [50, -296], [46, -250], [-26, -250]], shade("earth-2", 10));
  const svg =
    `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g transform="scale(${flip ? -s : s} ${s})">` +
    groundShadow(-30, 0, 480, 26) +
    `<g id="${id}-lift" transform="translate(0 0)">` +
    leg("legFR", false) + leg("legBR", false) + part("tail", tailPoly) +
    barrelLow + barrelUp + haunch + shoulder + saddle +
    leg("legFL", true) + leg("legBL", true) +
    part("neck", neckPoly + part("head", headPoly).replace(/translate\([^)]*\)/, `translate(${PIV.head[0] - PIV.neck[0]} ${PIV.head[1] - PIV.neck[1]})`).replace(/^/, "")) +
    `</g></g></g>`;

  const lines = [];
  const cur = { ...DEFAULT };
  const state = { x, y };
  const rot = (v) => `rotate(${v})`;
  const setPose = (target, at, dur = 0.35, bob = true) => {
    const next = { ...DEFAULT, ...target };
    if (!bob) next.dy = 0;
    for (const p of ["neck", "head", "legFL", "legFR", "legBL", "legBR", "tail"]) {
      if (cur[p] !== next[p]) lines.push(`tl.fromTo("#${id}-${p}", {attr:{transform:"${rot(cur[p])}"}}, {attr:{transform:"${rot(next[p])}"}, duration:${dur}, ease:"power1.inOut", immediateRender:false}, ${f(at * 1000) / 1000});`);
    }
    if (cur.dy !== next.dy) lines.push(`tl.fromTo("#${id}-lift", {attr:{transform:"translate(0 ${cur.dy})"}}, {attr:{transform:"translate(0 ${next.dy})"}, duration:${dur}, ease:"power1.inOut", immediateRender:false}, ${f(at * 1000) / 1000});`);
    Object.assign(cur, next);
  };
  return {
    svg, SEAT,
    pose(name, at, dur = 0.35) {
      if (!HORSE_POSES[name]) throw new Error(`horse pose '${name}' unknown (have: ${Object.keys(HORSE_POSES).join(", ")})`);
      setPose(HORSE_POSES[name], at, dur);
    },
    act(name, at, dur, period = 0.5, { bob = true } = {}) {
      const seq = HORSE_ACTIONS[name];
      if (!seq) throw new Error(`horse action '${name}' unknown (have: ${Object.keys(HORSE_ACTIONS).join(", ")})`);
      let t = at, i = 0;
      while (t + period / 2 <= at + dur + 1e-6) { setPose(seq[i % 2], t, period / 2 * 0.95, bob); t += period / 2; i++; }
    },
    move(nx, ny, at, dur, ease = "power1.inOut") {
      lines.push(`tl.fromTo("#${id}", {attr:{transform:"translate(${f(state.x)} ${f(state.y)})"}}, {attr:{transform:"translate(${f(nx)} ${f(ny)})"}, duration:${dur}, ease:"${ease}", immediateRender:false}, ${at});`);
      state.x = nx; state.y = ny;
    },
    tl: () => lines.join("\n"),
  };
}
