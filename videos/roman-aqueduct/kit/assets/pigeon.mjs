import { poly, shade, tint, f } from "../lowpoly.mjs";

const DEFAULT = { body: 0, head: 0, wing: 0, crouch: 0 };
export const PIGEON_POSES = {
  stand: {},
  peck: { head: 55 },
  drinkDown: { head: 65 },
  look: { head: -20 },
  fly: { wing: -70, body: -10 },
  flinch: { head: -10, wing: -25, crouch: 3 },
};
export const PIGEON_ACTIONS = {
  peck: [PIGEON_POSES.stand, PIGEON_POSES.peck],
  drink: [PIGEON_POSES.stand, PIGEON_POSES.drinkDown],
  flap: [{ wing: -70 }, { wing: 10 }],
};

/** Pigeon observer, 30 wu long, 22 tall at s=1, feet at (0,0), facing right. Same API as puppet: { svg, pose, act, move, tl }. */
export function pigeon({ id, x = 0, y = 0, s = 1, flip = false } = {}) {
  const part = (name, px, py, inner) => `<g transform="translate(${px} ${py})"><g id="${id}-${name}" transform="rotate(0)">${inner}</g></g>`;
  const legs = poly([[-3, -8], [-2, -8], [-2, 0], [-3, 0]], tint("tile", 20)) + poly([[2, -8], [3, -8], [3, 0], [2, 0]], tint("tile", 20)) +
    poly([[-5, 0], [0, 0], [0, -1]], tint("tile", 20)) + poly([[0, 0], [6, 0], [3, -1]], tint("tile", 20));
  const bodyShape = poly([[-14, -10], [-8, -18], [6, -19], [12, -13], [8, -8], [-4, -7]], "var(--stone)") +
    poly([[-14, -10], [-4, -7], [8, -8], [-4, -12]], shade("stone", 14)) +
    poly([[-14, -10], [-18, -8], [-12, -8]], shade("stone", 30));
  const patch = poly([[4, -18], [11, -14], [9, -12], [3, -14]], "color-mix(in srgb, var(--stone) 60%, var(--green-mid))");
  const wing = poly([[-2, 0], [-14, 6], [-16, 9], [-6, 8], [4, 3]], shade("stone", 25)) + poly([[-10, 5], [-8, 5], [-6, 8], [-9, 8]], shade("stone", 45)) + poly([[-4, 3], [-2, 3], [0, 6], [-2, 6]], shade("stone", 45));
  const head = `<circle cx="3" cy="-1" r="5" style="fill:${tint("stone", 5)}"/>` + poly([[7, -2], [13, 0], [7, 1]], shade("sand", 10)) + `<circle cx="5" cy="-2" r="1.1" style="fill:var(--earth-3)"/>`;
  const svg =
    `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g transform="scale(${flip ? -s : s} ${s})"><g id="${id}-crouch" transform="translate(0 0)">` +
    legs + `<g id="${id}-bodyg">` + part("body", 0, -8, `<g transform="translate(0 8)">${bodyShape}${patch}${part("wing", -2, -16 + 0, wing)}${part("head", 8, -18 + 0, head)}</g>`) + `</g></g></g></g>`;
  const lines = [];
  const cur = { ...DEFAULT };
  const state = { x, y };
  const rot = (v) => `rotate(${v})`;
  const setPose = (target, at, dur = 0.3) => {
    const next = { ...DEFAULT, ...target };
    for (const p of ["body", "head", "wing"]) if (cur[p] !== next[p]) lines.push(`tl.fromTo("#${id}-${p}", {attr:{transform:"${rot(cur[p])}"}}, {attr:{transform:"${rot(next[p])}"}, duration:${dur}, ease:"power1.inOut", immediateRender:false}, ${at});`);
    if (cur.crouch !== next.crouch) lines.push(`tl.fromTo("#${id}-crouch", {attr:{transform:"translate(0 ${cur.crouch})"}}, {attr:{transform:"translate(0 ${next.crouch})"}, duration:${dur}, ease:"power1.inOut", immediateRender:false}, ${at});`);
    Object.assign(cur, next);
  };
  return {
    svg,
    pose(name, at, dur = 0.3) { if (!PIGEON_POSES[name]) throw new Error(`pigeon pose '${name}' unknown`); setPose(PIGEON_POSES[name], at, dur); },
    act(name, at, dur, period = 0.5) {
      const seq = PIGEON_ACTIONS[name];
      if (!seq) throw new Error(`pigeon action '${name}' unknown`);
      let t = at, i = 0;
      while (t + period / 2 <= at + dur + 1e-6) { setPose(seq[i % 2], Math.round(t * 1000) / 1000, (period / 2) * 0.9); t += period / 2; i++; }
    },
    move(nx, ny, at, dur, ease = "power1.inOut") {
      lines.push(`tl.fromTo("#${id}", {attr:{transform:"translate(${f(state.x)} ${f(state.y)})"}}, {attr:{transform:"translate(${f(nx)} ${f(ny)})"}, duration:${dur}, ease:"${ease}", immediateRender:false}, ${at});`);
      state.x = nx; state.y = ny;
    },
    tl: () => lines.join("\n"),
  };
}
