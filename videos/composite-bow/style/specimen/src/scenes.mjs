// Style specimen: one diorama with every kit asset and overlay, in three states (day, night, tense).
// Used by /style-preview to judge the look on still frames. Text comes from script.en.json; the palette strip shows token names.
import {
  stage, sky, sun, stars, mountains, terrain, roots, clouds, pineTree, deciduousTree, palmTree, bush, grassTufts, leaves, rocks,
  pool, iceBlock, snowCap, logs, stoneWall, fire, smoke, puppet, lizard, crow, ghost, poly, shade, FlowArrows, TOKENS,
} from "../../../kit/index.mjs";

const BACK = 1052; // back row: standing just behind the cut face
const FRONT = 1060; // cut face (ground line of the cross-section)
const WALL = { x: 520, w: 90, h: 210 };
const GUIDES = process.env.SPECIMEN_GUIDES === "1";
const LABEL = process.env.SPECIMEN_LABEL || "";

function palette() {
  const chip = (name, x, y, w = 92, h = 50, token = name) =>
    `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px"><div style="height:${h}px;background:var(--${token});border:2px solid rgba(255,255,255,.35)"></div>` +
    `<div style="margin-top:4px;font:700 15px var(--font-ui);color:var(--ui-white);white-space:nowrap">${name}</div></div>`;
  const scene = ["earth-1", "earth-2", "earth-3", "sand", "stone", "snow", "green-dark", "green-mid", "wood", "water", "sky"];
  const ui = ["ui-green", "ui-red", "ui-yellow", "ui-blue", "ui-heat", "ui-white", "text-muted"];
  const tones = ["earth-1", "stone", "green-mid", "water"].flatMap((n) => [`${n}-light`, `${n}-mid`, `${n}-dark`]);
  let out = `<div style="position:absolute;left:0;top:1585px;width:1080px;height:335px;background:var(--panel-bg-strong)">`;
  scene.forEach((n, i) => (out += chip(n, 20 + i * 94, 14)));
  ui.forEach((n, i) => (out += chip(n, 20 + i * 94, 94)));
  tones.forEach((n, i) => (out += chip(n.replace("earth-1", "e1").replace("green-mid", "gm").replace("stone", "st").replace("water", "wa"), 20 + i * 86, 174, 80, 40, n)));
  out += `<div style="position:absolute;left:20px;top:290px;font:700 17px var(--font-ui);color:var(--ui-white);white-space:nowrap">${LABEL}</div></div>`;
  return out;
}

function guides() {
  if (!GUIDES) return "";
  const line = "stroke:#FF00FF;stroke-width:3;stroke-dasharray:14 10;fill:none";
  return `<svg class="kit-stage" width="1080" height="1920" viewBox="0 0 1080 1920" style="z-index:4">` +
    `<rect x="0" y="150" width="940" height="1370" style="${line}"/><rect x="0" y="1234" width="1080" height="220" style="${line};stroke:#00FFFF"/>` +
    `<text x="12" y="140" style="font:700 22px sans-serif;fill:#FF00FF">safe zone: top 150 · right 140 · bottom 400</text></svg>`;
}

/** The whole world. State flags control sun/moon/stars; everything else is identical in all three states. */
function world(I, ctx, { night = false } = {}) {
  const p = [
    puppet({ id: I("p1"), x: 70, y: FRONT, s: 0.7 }),
    puppet({ id: I("p2"), x: 160, y: FRONT, s: 0.7 }),
    puppet({ id: I("p3"), x: 250, y: FRONT, s: 0.7 }),
  ];
  p[0].pose("dig", ctx.t0 + 0.01, 0.01);
  p[1].pose("carry", ctx.t0 + 0.01, 0.01);
  p[2].pose("lift", ctx.t0 + 0.01, 0.01);
  const fireA = fire({ id: I("fire"), x: 700, y: BACK, s: 0.8 });
  const smokeA = smoke({ id: I("smoke"), x: 700, y: BACK - 100, s: 0.8 });
  const leafA = leaves({ id: I("leaf"), x0: 80, x1: 1000, y0: 360, y1: 1040, n: 7 });
  const svg =
    sky({ horizonY: 1052 }) +
    `<g id="${I("stars-w")}" style="opacity:${night ? 1 : 0}">${stars({ id: I("stars"), h: 700 }).replace("opacity:0", "opacity:1")}</g>` +
    `<g style="opacity:${night ? 0 : 1}">${sun({ id: I("sun"), cx: 860, cy: 340 })}</g>` +
    `<g style="opacity:${night ? 1 : 0}">${sun({ id: I("moon"), cx: 860, cy: 340, r: 70, kind: "moon" })}</g>` +
    clouds({ id: I("clouds"), x: 220, y: 300, s: 1, count: 2 }) +
    mountains({ y: BACK, seed: 3, height: 300 }) +
    palmTree({ id: I("palm"), x: 70, y: BACK, s: 0.8, depth: 0.5 }) +
    deciduousTree({ id: I("oak"), x: 230, y: BACK, s: 0.8, depth: 0.35 }) +
    pineTree({ id: I("pine"), x: 390, y: BACK, s: 1.0, depth: 0.2 }) +
    terrain({ id: I("terrain"), y: FRONT, h: 520, layers: [150, 330], top: "grass" }) +
    roots({ id: I("roots"), x: 230, y: FRONT, depth: 200, spread: 130 }) +
    pool({ id: I("pool"), x: 560, y: FRONT, w: 210, depth: 96 }) +
    stoneWall({ id: I("wall"), x: WALL.x, y: BACK, w: WALL.w, h: WALL.h }) +
    snowCap({ id: I("cap"), x: WALL.x, y: BACK - WALL.h, w: 56, h: 24 }) +
    crow({ id: I("crow"), x: WALL.x + 76, y: BACK - WALL.h - 2, s: 0.55, flip: true }) +
    logs({ id: I("logs"), x: 890, y: BACK, s: 0.5, count: 3 }) +
    fireA.svg + smokeA.svg +
    bush({ id: I("bush"), x: 330, y: FRONT, s: 0.75 }) +
    grassTufts({ id: I("grass"), x: 20, y: FRONT, w: 360, count: 6 }) +
    rocks({ id: I("rocks-big"), x: 395, y: FRONT, s: 1.1, count: 1 }) +
    rocks({ id: I("rocks-small"), x: 480, y: FRONT, s: 0.55, count: 2, seed: 9 }) +
    lizard({ id: I("lizard"), x: 425, y: FRONT - 44, s: 0.55 }) +
    iceBlock({ id: I("ice"), x: 800, y: FRONT, w: 90, h: 70 }) +
    p.map((q) => q.svg).join("") + leafA.svg;
  const L = [p.map((q) => q.tl()).join("\n"), fireA.tl(ctx.t0 + 0.1, ctx.dur - 0.2), smokeA.tl(ctx.t0 + 0.1, ctx.dur - 0.2), leafA.tl(ctx.t0 + 0.2, ctx.dur - 0.4)];
  return { svg, tl: L.join("\n") };
}

/** Flow arrows for the whole scene (heat over the fire, cold over the ice, water through the pool, load on the wall). */
function arrows(I, ctx) {
  const at = ctx.t0 + 0.2, dur = ctx.dur - 0.4;
  const a = [
    FlowArrows({ id: I("f-heat"), kind: "heat", x: 650, y: 760, w: 110, h: 200, count: 3, at, dur }),
    FlowArrows({ id: I("f-cold"), kind: "cold", x: 790, y: 840, w: 120, h: 150, count: 3, at, dur }),
    FlowArrows({ id: I("f-water"), kind: "water", x: 560, y: 1000, w: 210, h: 40, points: [[10, 20], [190, 20]], at, dur, width: 6 }),
    FlowArrows({ id: I("f-load"), kind: "load", x: WALL.x - 10, y: 790, w: WALL.w + 20, h: 120, count: 2, dir: "down", at, dur }),
  ];
  return { html: a.map((x) => x.html).join(""), tl: a.map((x) => x.tl).join("\n") };
}

const anchors = {
  wall: { card: { x: 330, y: 560 }, target: { x: WALL.x + 45, y: 860 } },
  fire: { card: { x: 330, y: 560 }, target: { x: 700, y: 990 } },
  crack: { card: { x: 330, y: 560 }, target: { x: WALL.x + 45, y: 880 } },
};

export default [
  {
    id: "s1", beats: ["b01"], light: "day",
    render(ctx) {
      const I = ctx.id, w = world(I, ctx), a = arrows(I, ctx);
      return { html: stage(w.svg) + a.html + palette() + guides(), tl: w.tl + "\n" + a.tl, anchors };
    },
  },
  {
    id: "s2", beats: ["b02"], light: "night",
    render(ctx) {
      const I = ctx.id, w = world(I, ctx, { night: true }), a = arrows(I, ctx);
      return { html: stage(w.svg) + a.html + palette() + guides(), tl: w.tl + "\n" + a.tl, anchors };
    },
  },
  {
    id: "s3", beats: ["b03"], light: "tense",
    render(ctx) {
      const I = ctx.id, w = world(I, ctx, { night: true }), a = arrows(I, ctx);
      const tCrack = ctx.cue("ghost-crack");
      const cx = WALL.x + WALL.w / 2, top = BACK - WALL.h;
      const crack =
        `<polyline points="${cx},${top} ${cx - 9},${top + 50} ${cx + 9},${top + 100} ${cx - 7},${top + 150} ${cx + 5},${BACK - 6}" style="fill:none;stroke:var(--earth-3);stroke-width:7;stroke-linejoin:bevel"/>` +
        `<polyline points="${cx + 9},${top + 100} ${cx + 25},${top + 124}" style="fill:none;stroke:var(--earth-3);stroke-width:5"/>`;
      const g = ghost(I("ghost"), poly([[WALL.x, BACK], [WALL.x + WALL.w, BACK], [WALL.x + WALL.w, top], [WALL.x, top]], "var(--stone)") + crack);
      const tl = `tl.fromTo("#${I("ghost")}", {opacity:0}, {opacity:1, duration:0.2, ease:"none", immediateRender:false}, ${tCrack});\ntl.to("#${I("ghost")}", {opacity:0, duration:0.3, ease:"none"}, ${tCrack + 1.5});`;
      return { html: stage(w.svg + g) + a.html + palette() + guides(), tl: w.tl + "\n" + a.tl + "\n" + tl, anchors };
    },
  },
];
