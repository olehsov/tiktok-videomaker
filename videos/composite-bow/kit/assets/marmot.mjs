import { poly, shade, tint, f, groundShadow } from "../lowpoly.mjs";

// Marmot, ~90 px tall sitting up, ~75 px long crouching, at s=1. Facing right, feet at (0,0).
// The body group rotates about the feet: 70° (crouched, nose forward) ↔ 0° upright with scale Y .85 → 1.
const SIT = "rotate(0) scale(1 1)", CROUCH = "rotate(70) scale(1 0.85)";

/** marmot({ id, x, y, s=1 }) → { svg, moveTo(x,y,at,dur), sitUp(at), crouch(at), dive(x,y,at,dur), tl() }. Starts crouched. */
export function marmot({ id, x = 0, y = 0, s = 1 } = {}) {
  const body =
    poly([[-18, 0], [-26, -30], [-14, -60], [10, -62], [24, -34], [20, 0]], "var(--earth-1)") +
    poly([[-18, 0], [-26, -30], [-12, -34], [-4, 0]], tint("earth-1", 20)) +
    poly([[6, -4], [22, -4], [24, -34], [10, -48]], tint("sand", 10)) +
    poly([[-18, -4], [-34, -2], [-40, 8], [-20, 2]], shade("earth-3", 0)) + // tail wedge
    poly([[-4, -58], [-12, -76], [6, -84], [22, -78], [28, -62], [14, -52]], tint("earth-1", 20)) + // head 6-gon
    poly([[-8, -76], [-6, -86], [0, -80]], shade("earth-1", 10)) + poly([[8, -82], [14, -90], [18, -80]], shade("earth-1", 10)) + // ears
    `<circle cx="16" cy="-68" r="3" style="fill:var(--earth-3)"/>`;
  const svg = `<g id="${id}" transform="translate(${f(x)} ${f(y)})"><g transform="scale(${s})">${groundShadow(0, 0, 60)}<g id="${id}-b" transform="${CROUCH}">${body}</g></g></g>`;
  const lines = [];
  const st = { x, y, pose: CROUCH };
  const setPose = (p, at, dur) => { if (st.pose !== p) lines.push(`tl.fromTo("#${id}-b", {attr:{transform:"${st.pose}"}}, {attr:{transform:"${p}"}, duration:${dur}, ease:"power2.out", immediateRender:false}, ${at});`); st.pose = p; };
  const moveTo = (nx, ny, at, dur, ease = "power1.inOut") => {
    lines.push(`tl.fromTo("#${id}", {attr:{transform:"translate(${f(st.x)} ${f(st.y)})"}}, {attr:{transform:"translate(${f(nx)} ${f(ny)})"}, duration:${dur}, ease:"${ease}", immediateRender:false}, ${at});`);
    st.x = nx; st.y = ny;
  };
  return {
    svg, moveTo,
    sitUp: (at) => setPose(SIT, at, 0.3),
    crouch: (at) => setPose(CROUCH, at, 0.2),
    dive(nx, ny, at, dur) { setPose(CROUCH, at, 0.2); moveTo(nx, ny, at, dur, "power2.in"); },
    tl: () => lines.join("\n"),
  };
}
