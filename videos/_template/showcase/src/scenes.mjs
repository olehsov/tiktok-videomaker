// Kit showcase scenes: one cut-away diorama that accumulates (pit → thin wall → thick wall → night).
// Shows: terrain cross-section, puppet poses, step/threat plates, callouts, heat arrows, failure ghost,
// day→night lighting, stakes meter, karaoke captions. Written once, text comes from script.en.json.
import { stage, sky, sun, stars, mountains, terrain, rocks, pineTree, puppet, pit, ghost, poly, shade, lightTween, FlowArrows } from "../../kit/index.mjs";

const GROUND = 1000;
const PX = 280; // puppet feet x
const PIT = { x: 470, y: GROUND, w: 130, depth: 130, moundDx: 150 }; // the pit the puppet digs
const WALL_CX = 785; // wall center x
const SLEEP_X = 390; // where the puppet lies down (clear of the pit)

function wall(id, x, w, h) {
  const top = GROUND - h;
  let out = poly([[x, GROUND], [x + w, GROUND], [x + w, top], [x, top]], "var(--stone)");
  out += poly([[x + w * 0.5, GROUND], [x + w, GROUND], [x + w, top], [x + w * 0.5, top]], shade("stone", 16));
  for (let y = GROUND - 52; y > top; y -= 52) out += `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" style="stroke:${shade("stone", 28)};stroke-width:3"/>`;
  return `<g id="${id}">${out}</g>`;
}

/** The shared backdrop: sky, sun/moon, stars, mountains, terrain, props. */
function backdrop(I, { sunOpacity = 1, moonOpacity = 0, starsOn = 0 } = {}) {
  return (
    sky() +
    `<g id="${I("stars-w")}" style="opacity:${starsOn}">${stars({ id: I("stars"), h: 620 }).replace("opacity:0", "opacity:1")}</g>` +
    `<g id="${I("sun-w")}" style="opacity:${sunOpacity}">${sun({ id: I("sun"), cx: 860, cy: 400 })}</g>` +
    `<g id="${I("moon-w")}" style="opacity:${moonOpacity}">${sun({ id: I("moon"), cx: 860, cy: 400, r: 70, kind: "moon" })}</g>` +
    mountains({ y: GROUND, seed: 3 }) +
    terrain({ id: I("terrain"), y: GROUND, h: 920, layers: [200, 520], top: "sand" }) +
    pineTree({ x: 140, y: GROUND, s: 1.4 }) +
    rocks({ x: 910, y: GROUND, s: 1.0 })
  );
}

export default [
  // ------------------------------------------------------------ b01–b02: day, sweat, dig
  {
    id: "s1",
    beats: ["b01", "b02"],
    light: "day",
    render(ctx) {
      const I = ctx.id;
      const p = puppet({ id: I("pup"), x: PX, y: GROUND, s: 1.5 });
      const b1 = ctx.beat("b01"), b2 = ctx.beat("b02");
      p.act("wipeSweat", b1.start + 0.3, b2.start - b1.start - 0.5);
      const tDig = ctx.cue("dig-start");
      const nStrokes = Math.floor((ctx.t1 - 0.3 - tDig) / 0.8);
      p.act("dig", tDig, ctx.t1 - 0.3 - tDig, 0.8);
      // the pit deepens one step per stroke; clods arc out onto the mound on each upswing (second half of a stroke)
      const hole = pit({ id: I("pit"), ...PIT });
      hole.grow(tDig + 0.2, nStrokes * 0.8 - 0.2, nStrokes);
      hole.dig(tDig + 0.4, nStrokes, 0.8);
      const heat = FlowArrows({ id: I("heat"), kind: "heat", x: 560, y: 620, w: 420, h: 340, count: 4, at: b1.start + 0.3, dur: 2.4 });
      return {
        html: stage(backdrop(I) + hole.svg + p.svg + hole.clodsSvg()) + heat.html,
        tl: p.tl() + "\n" + hole.tl() + "\n" + heat.tl,
        anchors: { soil: { card: { x: 360, y: 600 }, target: { x: 575, y: 1075 } } },
      };
    },
  },
  // ------------------------------------------------------------ b03–b05: thin wall, failure ghost, thick wall, → night
  {
    id: "s2",
    beats: ["b03", "b04", "b05"],
    light: "day",
    render(ctx) {
      const I = ctx.id;
      const p = puppet({ id: I("pup"), x: PX, y: GROUND, s: 1.5 });
      const tThin = ctx.cue("wall-thin"), tCrack = ctx.cue("ghost-crack"), tThick = ctx.cue("wall-thick"), tNight = ctx.cueOpt("to-night");
      const thin = wall(I("wall-thin"), WALL_CX - 25, 50, 260);
      const thick = wall(I("wall-thick"), WALL_CX - 75, 150, 300);
      const crack =
        `<polyline points="${WALL_CX},${GROUND - 260} ${WALL_CX - 9},${GROUND - 200} ${WALL_CX + 9},${GROUND - 150} ${WALL_CX - 7},${GROUND - 90} ${WALL_CX + 5},${GROUND - 30}" style="fill:none;stroke:var(--earth-3);stroke-width:7;stroke-linejoin:bevel"/>` +
        `<polyline points="${WALL_CX + 9},${GROUND - 150} ${WALL_CX + 23},${GROUND - 128}" style="fill:none;stroke:var(--earth-3);stroke-width:5"/>`;
      const g = ghost(I("ghost"), wall(I("wall-ghost"), WALL_CX - 25, 50, 260) + crack);
      const heat = FlowArrows({ id: I("heat"), kind: "heat", x: WALL_CX - 100, y: 520, w: 200, h: 320, count: 3, at: tCrack - 0.4, dur: 1.5 });

      const L = [];
      p.pose("lift", tThin, 0.4);
      p.pose("stand", tThin + 1.0, 0.4);
      p.pose("lift", tThick, 0.4);
      p.pose("stand", tThick + 1.2, 0.4);
      // walls rise from the ground (svgOrigin = base center, in stage coordinates)
      L.push(`tl.fromTo("#${I("wall-thin")}", {scaleY:0, svgOrigin:"${WALL_CX} ${GROUND}"}, {scaleY:1, svgOrigin:"${WALL_CX} ${GROUND}", duration:0.5, ease:"power2.out", immediateRender:true}, ${tThin});`);
      // failure ghost: 1.2 s of what goes wrong, then back
      L.push(`tl.fromTo("#${I("ghost")}", {opacity:0}, {opacity:1, duration:0.2, ease:"none", immediateRender:false}, ${tCrack});`);
      L.push(`tl.to("#${I("ghost")}", {opacity:0, duration:0.3, ease:"none"}, ${tCrack + 1.2});`);
      // the fix: thin wall out, thick wall in
      L.push(`tl.to("#${I("wall-thin")}", {opacity:0, duration:0.3}, ${tThick});`);
      L.push(`tl.fromTo("#${I("wall-thick")}", {scaleY:0, svgOrigin:"${WALL_CX} ${GROUND}"}, {scaleY:1, svgOrigin:"${WALL_CX} ${GROUND}", duration:0.6, ease:"power2.out", immediateRender:true}, ${tThick});`);
      if (tNight != null) {
        L.push(lightTween(ctx.world, "day", "night", tNight, 1.4));
        L.push(`tl.fromTo("#${I("stars-w")}", {opacity:0}, {opacity:1, duration:1.4, ease:"none", immediateRender:false}, ${tNight});`);
        L.push(`tl.fromTo("#${I("sun-w")}", {opacity:1}, {opacity:0, duration:1.0, ease:"none", immediateRender:false}, ${tNight});`);
        L.push(`tl.fromTo("#${I("moon-w")}", {opacity:0}, {opacity:1, duration:1.4, ease:"none", immediateRender:false}, ${tNight + 0.2});`);
        p.move(SLEEP_X, GROUND, tNight + 0.2, 0.9); // walk clear of the pit, then lie down
        p.pose("sleepLeft", tNight + 1.1, 0.9);
      }
      return {
        html: stage(backdrop(I) + pit({ id: I("pit"), ...PIT, static: true }).svg + thin + thick + g + p.svg) + heat.html,
        tl: p.tl() + "\n" + L.join("\n") + "\n" + heat.tl,
        anchors: { wall: { card: { x: 360, y: 600 }, target: { x: WALL_CX, y: 760 } } },
      };
    },
  },
  // ------------------------------------------------------------ b06: night, finished
  {
    id: "s3",
    beats: ["b06"],
    light: "night",
    render(ctx) {
      const I = ctx.id;
      const p = puppet({ id: I("pup"), x: SLEEP_X, y: GROUND, s: 1.5 });
      p.pose("sleepLeft", ctx.t0, 0.01);
      return {
        html: stage(backdrop(I, { sunOpacity: 0, moonOpacity: 1, starsOn: 1 }) + pit({ id: I("pit"), ...PIT, static: true }).svg + wall(I("wall"), WALL_CX - 75, 150, 300) + p.svg),
        tl: p.tl(),
        anchors: {},
      };
    },
  },
];
