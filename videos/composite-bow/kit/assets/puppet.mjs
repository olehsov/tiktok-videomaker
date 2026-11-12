import { poly, shade, tint, f, groundShadow } from "../lowpoly.mjs";

// Block puppet, ~200 px tall, feet at (0,0), facing right. Each limb is its own group, rotated about its joint
// via the SVG `transform` attribute (GSAP `attr` plugin), so there are no transform-origin surprises.
// Rotation: 0 = hanging down, negative = swing forward/up (-90 forward, -180 overhead).

const DEFAULT = { body: 0, torso: 0, head: 0, armL: 0, armR: 0, legL: 0, legR: 0, dy: 0, sweat: 0, closed: 0, shovel: 0 };

export const POSES = {
  stand: {},
  wipeSweat: { armR: -150, head: -4, sweat: 1 },
  dig: { armL: -28, armR: -24, torso: 14, shovel: 1 },
  carry: { armL: -80, armR: -80, torso: -3 },
  lift: { armL: -170, armR: -170, torso: -3, legL: 3, legR: -3 },
  sleep: { body: 90, dy: -30, closed: 1, armL: -8, armR: -8 }, // lies with the head to the right
  ride: { legL: -70, legR: -70 },
  rideHold: { legL: -70, legR: -70, armL: -80 },
  rideDraw: { legL: -70, legR: -70, armL: -90, armR: 92, head: 4 }, // right hand drawn back at head height (tuned, see PLAN builder notes)
  sleepLeft: { body: -90, dy: -30, closed: 1, armL: -8, armR: -8 }, // lies with the head to the left
};
// Looping actions alternate between two poses (finite repeats, no repeat:-1).
export const ACTIONS = {
  wipeSweat: [{ armR: -150, head: -4, sweat: 1 }, { armR: -128, head: -2, sweat: 1 }],
  dig: [{ armL: -28, armR: -24, torso: 14, shovel: 1 }, { armL: -100, armR: -95, torso: 6, shovel: 1 }],
  carry: [{ armL: -80, armR: -80, torso: -3, legL: 8, legR: -8 }, { armL: -80, armR: -80, torso: -3, legL: -8, legR: 8 }],
};

/**
 * puppet({ id, x, y, s=1, flip=false, tint })
 * → { svg, pose(name,at,dur), act(name,at,dur,period), move(x,y,at,dur), tl() }
 * Call pose/act/move in chronological order per puppet (state is tracked to build from→to tweens).
 */
export function puppet({ id, x = 0, y = 0, s = 1, flip = false, jacket = "water", shadow = true } = {}) {
  const skin = tint("sand", 22), hair = shade("earth-3", 0);
  const part = (name, px, py, inner) => `<g transform="translate(${px} ${py})"><g id="${id}-${name}" transform="rotate(0)">${inner}</g></g>`;
  const legShape = (dark) =>
    poly([[-11, 0], [1, 0], [1, 92], [-10, 92]], shade("earth-3", dark ? 18 : 0)) +
    poly([[1, 0], [11, 0], [10, 86], [26, 92], [1, 92]], shade("earth-3", dark ? 30 : 14));
  const arm = (dark, extra = "") =>
    poly([[-8, 0], [0, 0], [0, 64], [-7, 64]], shade(jacket, dark ? 22 : 4)) +
    poly([[0, 0], [8, 0], [7, 64], [0, 64]], shade(jacket, dark ? 34 : 18)) +
    poly([[-7, 64], [7, 64], [8, 77], [-8, 77]], dark ? shade("sand", 12) : skin) + extra;
  const shovel =
    `<g id="${id}-shovel" style="opacity:0">` +
    poly([[-3, 66], [3, 66], [3, 152], [-3, 152]], "var(--wood)") +
    poly([[-17, 152], [17, 152], [12, 188], [-12, 188]], "var(--stone)") +
    poly([[0, 152], [17, 152], [12, 188], [0, 188]], shade("stone", 22)) + `</g>`;
  const torso =
    poly([[-26, 0], [2, 0], [4, -74], [-30, -74]], tint(jacket, 4)) +
    poly([[2, 0], [26, 0], [30, -74], [4, -74]], shade(jacket, 16));
  const head =
    poly([[-20, -2], [-24, -28], [-12, -50], [0, -50], [0, -2]], skin) +
    poly([[0, -50], [12, -50], [24, -28], [20, -2], [0, -2]], shade("sand", 6)) +
    poly([[-25, -30], [-13, -53], [13, -53], [25, -30], [25, -23], [-25, -23]], hair) +
    `<g id="${id}-eyes"><circle cx="9" cy="-20" r="3.4" style="fill:var(--earth-3)"/></g>` +
    `<g id="${id}-eyesClosed" style="opacity:0"><path d="M 5 -20 L 14 -20" style="stroke:var(--earth-3);stroke-width:3;fill:none"/></g>` +
    `<g id="${id}-sweat" style="opacity:0">${poly([[-19, -26], [-14, -13], [-24, -13]], tint("water", 30))}</g>`;

  const svg =
    `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g transform="scale(${flip ? -s : s} ${s})">` +
    (shadow ? groundShadow(0, 0, 90) : "") + `<g id="${id}-lift" transform="translate(0 0)"><g id="${id}-body" transform="rotate(0)">` +
    part("legL", -14, -92, legShape(true)) +
    part("legR", 14, -92, legShape(false)) +
    part("torso", 0, -92,
      part("armL", -2, -66, arm(true)) +
      torso +
      part("head", 0, -74, head) +
      part("armR", 4, -66, arm(false, shovel))) +
    `</g></g></g></g>`;

  const lines = [];
  const cur = { ...DEFAULT };
  const state = { x, y };
  const rot = (v) => `rotate(${v})`;
  const setPose = (target, at, dur = 0.35) => {
    const next = { ...DEFAULT, ...target };
    for (const p of ["body", "torso", "head", "armL", "armR", "legL", "legR"]) {
      if (cur[p] !== next[p]) {
        lines.push(`tl.fromTo("#${id}-${p}", {attr:{transform:"${rot(cur[p])}"}}, {attr:{transform:"${rot(next[p])}"}, duration:${dur}, ease:"power1.inOut", immediateRender:false}, ${at});`);
      }
    }
    if (cur.dy !== next.dy) lines.push(`tl.fromTo("#${id}-lift", {attr:{transform:"translate(0 ${cur.dy})"}}, {attr:{transform:"translate(0 ${next.dy})"}, duration:${dur}, ease:"power1.inOut", immediateRender:false}, ${at});`);
    for (const [p, sel] of [["sweat", "sweat"], ["shovel", "shovel"]]) {
      if (cur[p] !== next[p]) lines.push(`tl.fromTo("#${id}-${sel}", {opacity:${cur[p]}}, {opacity:${next[p]}, duration:${Math.min(dur, 0.2)}, ease:"none", immediateRender:false}, ${at});`);
    }
    if (cur.closed !== next.closed) {
      lines.push(`tl.fromTo("#${id}-eyes", {opacity:${1 - cur.closed}}, {opacity:${1 - next.closed}, duration:0.1, immediateRender:false}, ${at});`);
      lines.push(`tl.fromTo("#${id}-eyesClosed", {opacity:${cur.closed}}, {opacity:${next.closed}, duration:0.1, immediateRender:false}, ${at});`);
    }
    Object.assign(cur, next);
  };

  return {
    svg,
    pose(name, at, dur = 0.35) {
      if (!POSES[name]) throw new Error(`puppet pose '${name}' unknown (have: ${Object.keys(POSES).join(", ")})`);
      setPose(POSES[name], at, dur);
    },
    act(name, at, dur, period = 0.8) {
      const seq = ACTIONS[name];
      if (!seq) throw new Error(`puppet action '${name}' unknown (have: ${Object.keys(ACTIONS).join(", ")})`);
      let t = at, i = 0;
      while (t + period / 2 <= at + dur + 1e-6) {
        setPose(seq[i % 2], f(t * 1000) / 1000, period / 2 * 0.95);
        t += period / 2; i++;
      }
    },
    move(nx, ny, at, dur, ease = "power1.inOut") {
      lines.push(`tl.fromTo("#${id}", {attr:{transform:"translate(${f(state.x)} ${f(state.y)})"}}, {attr:{transform:"translate(${f(nx)} ${f(ny)})"}, duration:${dur}, ease:"${ease}", immediateRender:false}, ${at});`);
      state.x = nx; state.y = ny;
    },
    tl: () => lines.join("\n"),
  };
}
