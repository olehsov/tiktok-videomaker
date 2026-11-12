// 13 scenes for "Roman aqueduct" (PLAN.md §3). Times come only from cues, beat starts and fixed offsets from them.
import * as kit from "../kit/index.mjs";
import { drawWorld, mkTl, camStr, CAMS, L, fit, toScreen, HILL, HUMP, PIPE, MUD, STAGNANT, Wband, hillY, humpY, surf, r3 } from "./world.mjs";
import { clods, steam, falling, drips, grains, whitecaps, splash, glints } from "./effects.mjs";
const { poly, shade, tint, ghost, lightTween, FlowArrows, bucket, chorobates, rocks, cloud, rain, arcade, leadPipe, prng, f } = kit;

export const options = { gauge: { tone: "cold", icon: "drop" } };

// ---------------------------------------------------------------- helpers
const finish = (W, extra = {}) => ({
  html: W.html,
  tl: [W.T.code(), W.tl, W.puppet?.tl() ?? "", W.pigeon?.tl() ?? "", extra.tl ?? ""].filter(Boolean).join("\n"),
  anchors: extra.anchors, stepAt: extra.stepAt, meter: extra.meter,
});
const camMove = (T, I, a, b, at, dur, ease = "power2.inOut") => T.ft(`#${I}-cam`, { attr: { transform: camStr(a) } }, { attr: { transform: camStr(b) }, duration: dur, ease }, at);
const fadeTo = (T, sel, at, to, dur = 0.3) => T.ft(sel, { opacity: to ? 0 : 1 }, { opacity: to, duration: dur, ease: "power1.inOut" }, at);
const ghostRun = (T, gid, at, hold, out = 0.3) => { T.ft(`#${gid}`, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" }, at); T.to(`#${gid}`, { opacity: 0, duration: out, ease: "power1.in" }, at + hold); };
const pop = (T, sel, at, origin, dur = 0.2) => T.ft(sel, { opacity: 0, scale: 0.9, svgOrigin: origin }, { opacity: 1, scale: 1, duration: dur, ease: "power2.out" }, at);
const show = (T, sel, at) => T.ft(sel, { opacity: 0 }, { opacity: 1, duration: 0.01 }, at);
/** Clip-rect reveal (left→right or top→bottom): returns { defs, ref } and registers the width tween. */
const revealX = (T, cid, x, y, w, h, at, dur, ease = "none") => {
  T.ft(`#${cid}-r`, { attr: { width: 0 } }, { attr: { width: w }, duration: dur, ease }, at);
  return `<clipPath id="${cid}"><rect id="${cid}-r" x="${x}" y="${y}" width="0" height="${h}"/></clipPath>`;
};
const dashedLine = (d, w, dash, extra = "") => `<path d="${d}" fill="none" stroke-linecap="round" style="stroke:var(--snow)" stroke-width="${w}" stroke-dasharray="${dash}" ${extra}/>`;
const scoreSteps = (ctx) => (id) => ctx.beat(id).start;

const scenes = [];

// ================================================================ S1 — hook
scenes.push({ id: "s1", beats: ["b01"], light: "day", render(ctx) {
  const I = "s1", cue = ctx.cue("city-reveal");
  const T = mkTl();
  const rs = cue - 1.2;
  const clip = revealX(T, `${I}-rhc`, 190, 600, 1780, 400, rs, 1.0);
  const d = `M205 ${f(L(205))} L1955 ${f(L(1955))}`;
  const hint = `<g id="${I}-rh" style="opacity:0"><defs>${clip}</defs><g clip-path="url(#${I}-rhc)">${dashedLine(d, 5, "14 10", 'opacity=".8"')}</g></g>`;
  const W = drawWorld(I, { lvl: 1 }, { T, t0: ctx.t0, t1: ctx.t1, cam: "WIDE", sun: { x: 860, y: 470, r: 70 }, pigeon: { x: 2112, y: 818 }, fx: hint });
  W.pigeon.act("peck", ctx.t0, ctx.dur - 0.2, 0.5);
  show(T, `#${I}-rh`, rs);
  T.to(`#${I}-rh`, { opacity: 0, duration: 0.3 }, cue + 0.4);
  camMove(T, I, "WIDE", "F1", cue, 1.4);
  return finish(W);
} });

// ================================================================ S2 — attempt + tiny slope
scenes.push({ id: "s2", beats: ["b02", "b03"], light: "day", render(ctx) {
  const I = "s2", b3 = ctx.beat("b03").start;
  const cDig = ctx.cue("ditch-dig"), cPool = ctx.cue("ghost-pool-at-hill"), cScour = ctx.cue("ghost-scour"), cStall = ctx.cue("ghost-stall"), cTilt = ctx.cue("slope-tilt");
  const tcho = cStall + 1.5;
  // naive ditch along the surface
  const P = [[205, 719], [545, 741], [600, 732], [660, 712], [700, 703]];
  const ditchSvg = `<g id="${I}-ditch">${poly([...P, ...[...P].reverse().map(([x, y]) => [x, y + 10])], shade("earth-1", 40))}</g>` +
    `<g id="${I}-ridge">${poly([...P.map(([x, y]) => [x, y - 6]), ...[...P].reverse()], "var(--earth-1)")}</g>`;
  // ghost: pool at the hump
  const strip = `<g id="${I}-wstrip">${poly([[205, 723], [545, 745], [545, 749], [205, 727]], "var(--water)")}</g>`;
  const puddle = `<g id="${I}-puddle">${poly([[515, 741], [525, 736], [550, 735], [572, 737], [580, 741], [570, 746], [540, 747], [520, 746]], "var(--water)")}${poly([[525, 736], [550, 735], [545, 742]], tint("water", 18), 'opacity=".6"')}</g>`;
  const gPool = ghost(`${I}-g-pool`, strip + puddle);
  // ghost: scour (steep trough)
  const chev = (i) => poly([[0, -7], [5, -7], [11, 0], [5, 7], [0, 7], [6, 0]], "var(--snow)", `id="${I}-chev${i}" opacity="0"`);
  const trough = (cls) => `<g transform="rotate(20 205 728)">${poly([[205, 728], [485, 728], [485, 758], [205, 758]], shade("stone", 35))}${poly([[205, 742], [485, 742], [485, 756], [205, 756]], "var(--water)")}${poly([[205, 726], [485, 726], [485, 730], [205, 730]], "var(--stone)")}${poly([[205, 756], [485, 756], [485, 760], [205, 760]], shade("stone", 20))}`;
  let scour = trough() ;
  for (let i = 0; i < 5; i++) scour += `<g transform="translate(${215 + i * 8} ${744 + (i % 2) * 6})">${chev(i)}</g>`;
  scour += `<g id="${I}-crack" style="opacity:0"><path d="M420 728 L428 742 L420 752" fill="none" style="stroke:var(--earth-3)" stroke-width="2.5"/><path d="M455 728 L448 738 L458 750" fill="none" style="stroke:var(--earth-3)" stroke-width="2.5"/></g></g>`;
  const rk = [0, 1, 2, 3].map((i) => `<g transform="translate(468 824)"><g id="${I}-rk${i}" opacity="0">${rocks({ x: -4, y: 0, s: 0.2, count: 1, seed: 20 + i })}</g></g>`).join("");
  const gScour = ghost(`${I}-g-scour`, scour + rk);
  // ghost: stall (flat trough, stagnant water, leaves)
  const stall = poly([[205, 730], [480, 730], [480, 760], [205, 760]], shade("stone", 35)) + poly([[207, 744], [478, 744], [478, 758], [207, 758]], STAGNANT) +
    poly([[205, 728], [480, 728], [480, 732], [205, 732]], "var(--stone)") + [260, 340, 420].map((x, i) => poly([[x, 744], [x + 5, 740], [x + 10, 744], [x + 5, 748]], "var(--green-mid)")).join("");
  const gStall = ghost(`${I}-g-stall`, stall);
  // chorobates on the hump
  const cho = `<g id="${I}-cho">${chorobates({ id: `${I}-chor`, x: 615, y: 680, len: 120, groundAt: (x) => humpY(x) })}</g>`;
  const T = mkTl();
  const strokes = [0, 1, 2].map((k) => ({ t: cDig + 0.3 + 0.6 * k, x: 230 + (240 * (0.3 + 0.6 * k)) / 1.8 + 16, y: L(470) - 30 }));
  const clodSvg = clods(T, I, strokes);
  const mid = ditchSvg + gPool + gScour + gStall + cho + clodSvg;
  const W = drawWorld(I, { lvl: 2, anim: { A: true, Aw: true, B: true, fa: cTilt + 0.8 } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F2", sun: { x: 860, y: 470, r: 70 },
    puppet: { x: 230, y: L(230) - 22 }, pigeon: { x: 1300, y: 600 }, mid });
  const p = W.puppet;
  // b02: the naive ditch
  T.ft(`#${I}-ditch`, { scaleX: 0, svgOrigin: "205 719" }, { scaleX: 1, duration: 1.8, ease: "none" }, cDig);
  T.ft(`#${I}-ridge`, { scaleX: 0, svgOrigin: "205 719" }, { scaleX: 1, duration: 1.8, ease: "none" }, cDig);
  p.act("dig", cDig, 1.8, 0.6); p.move(470, L(470) - 22, cDig, 1.8, "none");
  p.pose("stand", cDig + 1.85, 0.3);
  // ghost: water strip fills the ditch, puddle at the hump foot
  T.ft(`#${I}-wstrip`, { scaleX: 0, svgOrigin: "205 735" }, { scaleX: 1, duration: 0.6, ease: "none" }, cPool);
  T.ft(`#${I}-puddle`, { scaleX: 0.2, svgOrigin: "545 741" }, { scaleX: 1, duration: 0.8, ease: "power1.out" }, cPool);
  T.ft(`#${I}-g-pool`, { opacity: 0 }, { opacity: 1, duration: 0.2 }, cPool);
  T.to(`#${I}-g-pool`, { opacity: 0, duration: 0.3 }, cPool + 1.5);
  // b03: rewind
  T.to(`#${I}-ditch`, { opacity: 0, duration: 0.4 }, b3); T.to(`#${I}-ridge`, { opacity: 0, duration: 0.4 }, b3);
  p.act("carry", b3 + 0.5, 1.2); p.move(595, humpY(595), b3 + 0.5, 1.2); p.pose("stand", b3 + 1.75, 0.3);
  // scour
  const gs = fit(cScour, 1.3, cStall, 0.8);
  ghostRun(T, `${I}-g-scour`, cScour, gs);
  const nChev = Math.max(1, Math.floor(gs / 0.5) - 1);
  for (let i = 0; i < 5; i++) {
    T.ft(`#${I}-chev${i}`, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
    T.ft(`#${I}-chev${i}`, { opacity: 0.9, x: 0 }, { opacity: 0.1, x: 230, duration: 0.5, ease: "none", repeat: nChev }, cScour + i * 0.1);
  }
  for (let i = 0; i < 4; i++) {
    const t = cScour + 0.15 + i * 0.15, dx = 30 + i * 10, dy = 35 + i * 8;
    T.ft(`#${I}-rk${i}`, { opacity: 0, x: 0, y: 0, rotation: 0 }, { opacity: 1, x: dx, rotation: 180 + i * 40, duration: 0.7, ease: "none" }, t);
    T.to(`#${I}-rk${i}`, { y: -10, duration: 0.2, ease: "power2.out" }, t);
    T.to(`#${I}-rk${i}`, { y: dy, duration: 0.5, ease: "power2.in" }, t + 0.2);
  }
  show(T, `#${I}-crack`, cScour + 0.5);
  // stall
  ghostRun(T, `${I}-g-stall`, cStall, fit(cStall, 1.3, tcho, 0.8));
  // chorobates
  T.ft(`#${I}-cho`, { opacity: 0, scaleY: 0.9, svgOrigin: "675 725" }, { opacity: 1, scaleY: 1, duration: 0.3, ease: "power2.out" }, tcho);
  p.pose("sight", tcho, 0.4);
  // slope-tilt
  T.to(`#${I}-gA`, { opacity: 0, duration: 0.3 }, cTilt); T.to(`#${I}-gB`, { opacity: 0, duration: 0.3 }, cTilt);
  T.ft(`#${I}-Ar`, { opacity: 0, attr: { transform: "rotate(-3.66 205 741)" } }, { opacity: 1, attr: { transform: "rotate(0 205 741)" }, duration: 0.8, ease: "power2.out" }, cTilt);
  T.ft(`#${I}-A-water`, { opacity: 1, scaleX: 0, svgOrigin: `205 ${f(L(205) + 15)}` }, { opacity: 1, scaleX: 1, duration: 0.6, ease: "none" }, cTilt + 0.8);
  T.ft(`#${I}-Bg`, { opacity: 0 }, { opacity: 1, duration: 0.2 }, cTilt);
  return finish(W, {
    anchors: { chorobates: { card: { x: 48, y: 590 }, target: { x: 858, y: 804 }, at: tcho + 0.2 }, slope: { x: 420, y: 850, at: cTilt } },
    meter: { b03: [{ t: cTilt + 0.9, value: 10 }] },
  });
} });

// ================================================================ S3 — hill, tunnel
scenes.push({ id: "s3", beats: ["b04"], light: "day", render(ctx) {
  const I = "s3", cHill = ctx.cue("hill-rise"), cUp = ctx.cue("ghost-uphill"), cBore = ctx.cue("tunnel-bore");
  const T = mkTl();
  // ghost: an open channel up the hill flank, water slides back down
  const FL = [[545, 741], [585, 712], [625, 660], [665, 600], [700, 556]];
  const band = poly([...FL, ...[...FL].reverse().map(([x, y]) => [x, y + 30])], shade("stone", 35));
  const wedgeTop = FL.slice(0, 3), wedge = poly([...wedgeTop, ...[...wedgeTop].reverse().map(([x, y]) => [x, y + 30])], "var(--water)");
  const gUp = ghost(`${I}-g-up`, band + `<g id="${I}-wedge">${wedge}</g>`);
  // detour hint around the front of the hill
  const dClip = revealX(T, `${I}-dhc`, 540, 700, 360, 160, cBore - 1.1, 0.7);
  const detour = `<g id="${I}-detour" style="opacity:0"><defs>${dClip}</defs><g clip-path="url(#${I}-dhc)">${dashedLine("M545 741 C600 830, 830 840, 885 762", 5, "14 10")}</g>${poly([[894, 748], [876, 756], [888, 768]], "var(--snow)")}</g>`;
  const W = drawWorld(I, { lvl: 3, anim: { hill: true, hillTrees: true, T: true, Tw: true, ft: cBore + 1.0 } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F3",
    puppet: { x: 560, y: 730 }, pigeon: { x: 1300, y: 600 }, mid: gUp, fx: detour });
  const p = W.puppet;
  // hill-rise
  T.to(`#${I}-hump`, { opacity: 0, duration: 0.2 }, cHill);
  T.ft(`#${I}-hill`, { scaleY: 0.25, svgOrigin: "715 752" }, { scaleY: 1, duration: 0.9, ease: "power2.out" }, cHill);
  T.ft(`#${I}-hillTrees`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, cHill + 0.7);
  // ghost-uphill
  const gd = fit(cUp, 1.2, cBore - 1.1, 0.8);
  ghostRun(T, `${I}-g-up`, cUp, gd);
  T.ft(`#${I}-wedge`, { x: 0, y: 0, opacity: 1 }, { x: -30, y: 35, opacity: 0, duration: 1.0, ease: "power1.in" }, cUp + 0.2);
  // detour hint
  show(T, `#${I}-detour`, cBore - 1.1);
  T.to(`#${I}-detour`, { opacity: 0, duration: 0.3 }, cBore + 0.1);
  // tunnel-bore
  p.act("dig", cBore, 1.0, 0.5); p.pose("stand", cBore + 1.05, 0.25);
  pop(T, `#${I}-portL`, cBore, "560 " + f(L(560) + 7));
  T.ft(`#${I}-Tg`, { scaleX: 0, svgOrigin: `560 ${f(L(560))}` }, { scaleX: 1, duration: 1.0, ease: "power1.inOut" }, cBore);
  pop(T, `#${I}-portR`, cBore + 1.0, "870 " + f(L(870) + 7));
  T.ft(`#${I}-T-water`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, cBore + 1.0);
  return finish(W, { anchors: { tunnel: { card: { x: 340, y: 1048 }, target: { x: 708, y: 971 }, at: Math.max(cHill + 0.9, cBore - 1.8) } } });
} });

// ================================================================ S4 — sun and dirt, covered channel
scenes.push({ id: "s4", beats: ["b05"], light: "harsh", render(ctx) {
  const I = "s4", cSun = ctx.cue("ghost-sun-evaporation"), cBury = ctx.cue("channel-bury"), cRoof = ctx.cue("slab-roof");
  const T = mkTl();
  const span = cBury - cSun, k = Math.min(1, span / 3.6);
  const yw = L(375);
  const xs = [270, 320, 370, 420, 470, 520];
  const stm = steam(T, I, { xs, y: yw + 6, t: cSun + 0.5 * k, until: cBury });
  const dirt = falling(T, I, "dirt", xs.map((x, i) => ({ x: x - 5, y0: 650, y1: L(x) + 24, at: cSun + (1.6 + 0.15 * i) * k, dur: 0.4 * k + 0.05 })));
  const leaf = falling(T, I, "leaf", [290, 350, 410, 470, 520].map((x, i) => ({ x, y0: 640, y1: L(x) + 3, at: cSun + (2.3 + 0.12 * i) * k, dur: 0.8 * k + 0.05 })));
  const gSun = ghost(`${I}-g-sun`, stm + dirt + leaf);
  const heat = FlowArrows({ id: `${I}-heat`, kind: "heat", x: 250, y: 600, w: 270, h: 100, count: 4, at: cSun, dur: cBury - cSun, width: 5, inline: true });
  const W = drawWorld(I, { lvl: 4, anim: { slabs: true, cover: true } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F4", sun: { x: 830, y: 560, r: 100 },
    puppet: { x: 640, y: hillY(640) }, pigeon: { x: 1300, y: 600 }, fx: gSun + heat.svg });
  const p = W.puppet, c = W.ch;
  // ghost-sun-evaporation (word-driven)
  ghostRun(T, `${I}-g-sun`, cSun, span - 0.3, 0.3);
  T.ft(`#${I}-A-water`, { scaleY: 1, svgOrigin: `375 ${f(yw + 30)}` }, { scaleY: 0.8, duration: 2.0, ease: "none" }, cSun + 0.5 * k);
  // channel-bury
  T.to(`#${I}-A-water`, { scaleY: 1, duration: 0.3 }, cBury);
  T.raw(lightTween(ctx.world, "harsh", "day", cBury, 1.0));
  T.ft(`#${I}-sun`, { opacity: 1 }, { opacity: 0.6, duration: 1.0 }, cBury);
  const stag = Math.min(0.14, (cRoof - cBury - 0.35) / 6);
  for (const [grp, ids, t] of [["A", c.A.slabIds, cBury], ["T", c.Tn.slabIds, cBury], ["B", c.B.slabIds, cBury]]) {
    show(T, `#${I}-${grp}-slabs`, t);
    ids.forEach((sid, i) => {
      const sel = `#${sid.replace(/^[^-]+/, I)}`;
      const at = t + i * stag;
      T.ft(sel, { opacity: 0 }, { opacity: 1, duration: 0.05 }, at);
      T.ft(sel, { y: -160 }, { y: 0, duration: 0.35, ease: "power2.in" }, at);
    });
  }
  // slab-roof: soil + grass close the roof
  show(T, `#${I}-cvs`, cRoof);
  T.ft(`#${I}-cvA`, { scaleY: 0, svgOrigin: `382 ${f(L(382) - 36)}` }, { scaleY: 1, duration: 0.6, ease: "power2.out" }, cRoof);
  T.ft(`#${I}-cvT`, { scaleY: 0, svgOrigin: `882 ${f(L(882) - 36)}` }, { scaleY: 1, duration: 0.6, ease: "power2.out" }, cRoof);
  T.ft(`#${I}-cvB`, { scaleY: 0, svgOrigin: `1850 ${f(L(1850) - 36)}` }, { scaleY: 1, duration: 0.6, ease: "power2.out" }, cRoof);
  p.act("carry", cRoof + 0.8, 1.2); p.move(470, L(470) - 74, cRoof + 0.8, 1.2); p.pose("stand", cRoof + 2.05, 0.25);
  return finish(W, {
    tl: heat.tl,
    stepAt: { b05: cBury },
    anchors: { specus: { card: { x: 340, y: 1050 }, target: { x: 650, y: 859 }, at: cRoof + 0.7 } },
    meter: { b05: [{ t: cRoof + 0.6, value: 20 }] },
  });
} });

// ================================================================ S5 — waterproof lining
scenes.push({ id: "s5", beats: ["b06"], light: "day", render(ctx) {
  const I = "s5", b6 = ctx.beat("b06").start;
  const cLeak = ctx.cue("ghost-leak"), cTiles = ctx.cue("ingredient-tiles"), cLime = ctx.cue("ingredient-lime"), cCoat = ctx.cue("lining-coat");
  const T = mkTl();
  const yb = L(440) - 74;
  const bk = bucket({ id: `${I}-bk`, x: 440, y: yb, s: 0.2, fill: 0 });
  const mortar = `<g id="${I}-mortar">${poly([[434.8, yb], [445.2, yb], [446, yb - 17], [434, yb - 17]], "var(--tile)")}</g><g id="${I}-mortarPale">${poly([[434.8, yb], [445.2, yb], [446, yb - 17], [434, yb - 17]], "var(--snow)", 'opacity=".6"')}</g>`;
  const shards = [0, 1, 2, 3, 4].map((i) => `<g transform="translate(${436 + i * 2} 560)">` + poly([[0, 0], [5 + i, 1], [4, 4 + i % 3], [-1, 3]], "var(--tile)", `id="${I}-sh${i}" opacity="0"`) + "</g>").join("");
  const sack = `<g transform="translate(440 ${yb - 36})"><g id="${I}-sack">${poly([[-7, 0], [7, 0], [8, 16], [-8, 16]], tint("sand", 25))}${poly([[-3, -5], [3, -5], [7, 0], [-7, 0]], tint("sand", 25))}${poly([[-1, -8], [1, -8], [1, -5], [-1, -5]], "var(--earth-1)")}</g></g>`;
  const pow = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<g transform="translate(${438 + i * 0.8} ${yb - 30})">` + poly([[0, -2], [2, 0], [0, 2], [-2, 0]], "var(--snow)", `id="${I}-pw${i}" opacity="0"`) + "</g>").join("");
  // ghost: leak
  const dr = drips(T, I, { x0: 345, x1: 500, y: L(420) + 41, t: cLeak + 0.1 });
  const wet = `<g id="${I}-wet" opacity="0">${poly([[270, L(420) + 52], [300, L(420) + 44], [540, L(420) + 44], [570, L(420) + 52], [540, L(420) + 70], [300, L(420) + 70]], shade("earth-3", 30))}</g>`;
  const gLeak = ghost(`${I}-g-leak`, wet + dr);
  const W = drawWorld(I, { lvl: 5, anim: { lining: true } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F4", puppet: { x: 470, y: L(470) - 74 }, pigeon: { x: 1300, y: 600 },
    mid: bk + mortar, fx: gLeak + shards + sack + pow });
  const p = W.puppet;
  camMove(T, I, "F4", "F6", b6, 1.0);
  // ghost-leak
  const gl = fit(cLeak, 1.3, cTiles, 0.8);
  ghostRun(T, `${I}-g-leak`, cLeak, gl);
  T.ft(`#${I}-wet`, { opacity: 0 }, { opacity: 0.5, duration: 0.5 }, cLeak);
  T.ft(`#${I}-A-water`, { scaleY: 1, svgOrigin: `420 ${f(L(420) + 30)}` }, { scaleY: 0.6, duration: 0.5, ease: "power1.inOut" }, cLeak);
  T.to(`#${I}-A-water`, { scaleY: 1, duration: 0.3 }, cLeak + gl);
  // mortar levels
  T.ft(`#${I}-mortar`, { scaleY: 0, svgOrigin: `440 ${f(yb)}` }, { scaleY: 0, duration: 0.01 }, 0);
  T.ft(`#${I}-mortarPale`, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
  // ingredient-tiles
  for (let i = 0; i < 5; i++) {
    const t = cTiles + i * 0.08;
    T.ft(`#${I}-sh${i}`, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.01 }, t);
    T.to(`#${I}-sh${i}`, { y: yb - 560 - 2, duration: 0.45, ease: "power2.in" }, t);
    T.to(`#${I}-sh${i}`, { opacity: 0, duration: 0.01 }, t + 0.45);
  }
  T.to(`#${I}-mortar`, { scaleY: 0.35, duration: 0.3 }, cTiles + 0.45);
  // ingredient-lime
  T.ft(`#${I}-sack`, { opacity: 0, rotation: 0, svgOrigin: `440 ${f(yb - 24)}` }, { opacity: 1, duration: 0.2 }, cLime);
  T.to(`#${I}-sack`, { rotation: -40, duration: 0.3, ease: "power2.out" }, cLime + 0.2);
  for (let i = 0; i < 8; i++) {
    const t = cLime + 0.35 + i * 0.05;
    T.ft(`#${I}-pw${i}`, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.01 }, t);
    T.to(`#${I}-pw${i}`, { y: 24, duration: 0.3, ease: "power2.in" }, t);
    T.to(`#${I}-pw${i}`, { opacity: 0, duration: 0.01 }, t + 0.3);
  }
  T.to(`#${I}-mortar`, { scaleY: 0.7, duration: 0.3 }, cLime + 0.6);
  T.to(`#${I}-mortarPale`, { opacity: 1, scaleY: 0.7, svgOrigin: `440 ${f(yb)}`, duration: 0.3 }, cLime + 0.6);
  T.to(`#${I}-sack`, { opacity: 0, duration: 0.2 }, cLime + 1.0);
  // lining-coat
  p.act("dig", cCoat, 1.6, 0.5); p.pose("stand", cCoat + 1.65, 0.25);
  for (const [g, x0] of [["A", 205], ["T", 560], ["B", 1748]]) {
    show(T, `#${I}-${g}-lining`, cCoat);
    T.ft(`#${I}-${g}-lining`, { scaleX: 0, svgOrigin: `${x0} ${f(L(x0))}` }, { scaleX: 1, duration: 0.9, ease: "power1.inOut" }, cCoat);
  }
  T.to(`#${I}-mortar`, { scaleY: 0.2, duration: 0.4 }, cCoat);
  T.to(`#${I}-mortarPale`, { scaleY: 0.2, duration: 0.4 }, cCoat);
  return finish(W, {
    anchors: { lining: { card: { x: 48, y: 1050 }, target: { x: 348, y: 884 }, at: cCoat + 0.5 } },
    meter: { b06: [{ t: cCoat + 0.9, value: 30 }] },
  });
} });

// ================================================================ S6 — valley, arches
scenes.push({ id: "s6", beats: ["b07"], light: "day", render(ctx) {
  const I = "s6";
  const cVal = ctx.cue("valley-reveal"), cDip = ctx.cue("ghost-valley-dip"), cArch = ctx.cue("arches-rise"), cLoad = ctx.cue("load-arrows"), cPull = ctx.cue("scale-pullback");
  const T = mkTl();
  const VP = [[900, 786], [940, 860], [980, 975], [1015, 1090], [1040, 1150], [1200, 1150], [1225, 1090], [1260, 975], [1300, 860], [1340, 814]];
  const off = (a, d) => [...a].reverse().map(([x, y]) => [x, y + d]);
  const left = VP.slice(0, 5);
  const dip = poly([...VP, ...off(VP, 30)], shade("stone", 35)) + `<g id="${I}-dipw">${poly([...left, ...off(left, 30).map(([x, y]) => [x, y - 6])], "var(--water)")}</g>` +
    `<g id="${I}-pool">${poly([[1040, 1120], [1200, 1120], [1200, 1150], [1040, 1150]], "var(--water)")}</g>`;
  const gDip = ghost(`${I}-g-dip`, dip);
  const ld = FlowArrows({ id: `${I}-ld`, kind: "load", x: 1000, y: 850, w: 280, h: 300, count: 7, dir: "down", width: 7, period: 1.2, at: cLoad, dur: cPull - cLoad, inline: true });
  const dim = `<g id="${I}-dim">${poly([[878.5, 825], [881.5, 825], [881.5, 1160], [878.5, 1160]], "var(--snow)")}${poly([[873, 824], [887, 824], [887, 827], [873, 827]], "var(--snow)")}${poly([[873, 1158], [887, 1158], [887, 1161], [873, 1161]], "var(--snow)")}</g>`;
  const W = drawWorld(I, { lvl: 6, anim: { arc: true, V: true, Vw: true, fv: cArch + 1.4 } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F7s",
    puppet: { x: 1052, y: 1158 }, pigeon: { x: 1300, y: 600 }, fx: gDip + ld.svg + dim });
  const p = W.puppet, g = W.pigeon;
  camMove(T, I, "F7s", "F7a", cVal, 1.2);
  // ghost-valley-dip
  const gd = fit(cDip, 1.3, cArch, 0.8);
  ghostRun(T, `${I}-g-dip`, cDip, gd);
  T.ft(`#${I}-pool`, { scaleY: 0, svgOrigin: "1120 1150" }, { scaleY: 1, duration: 0.8, ease: "power1.out" }, cDip + 0.2);
  // arches-rise
  W.arc.tiers.forEach((t, i) => T.ft(`#${t.id}`, { scaleY: 0, svgOrigin: `${f(t.pivot.x)} ${f(t.pivot.y)}` }, { scaleY: 1, duration: 0.45, ease: "power2.out" }, cArch + 0.3 * i));
  T.ft(`#${I}-Vg`, { scaleX: 0, svgOrigin: `900 ${f(L(900))}` }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, cArch + 0.95);
  T.ft(`#${I}-V-water`, { opacity: 1, scaleX: 0, svgOrigin: `900 ${f(L(900) + 15)}` }, { opacity: 1, scaleX: 1, duration: 0.5, ease: "none" }, cArch + 1.4);
  // scale-pullback
  camMove(T, I, "F7a", "F7b", cPull, 0.8);
  p.pose("lift", cPull, 0.3); p.pose("stand", cPull + 1.0, 0.3);
  g.act("flap", cPull, 0.8, 0.18); g.move(1180, L(1180) - 36, cPull, 0.8); g.pose("stand", cPull + 0.85, 0.2);
  T.ft(`#${I}-dim`, { scaleY: 0, svgOrigin: "880 825" }, { scaleY: 1, duration: 0.4, ease: "power1.out" }, cPull + 0.5);
  return finish(W, {
    tl: ld.tl,
    stepAt: { b07: cArch },
    anchors: { arch: { card: { x: 48, y: 590 }, target: { x: 562, y: 938 }, at: cLoad, until: cPull }, "pdg-height": { x: 336, y: 953, at: cPull + 0.85 } },
    meter: { b07: [{ t: cArch + 1.2, value: 45 }] },
  });
} });

// ================================================================ S7 — siphon
scenes.push({ id: "s7", beats: ["b08"], light: "day", render(ctx) {
  const I = "s7";
  const cDeep = ctx.cue("ghost-too-tall"), cPipes = ctx.cue("siphon-pipes"), cFlow = ctx.cue("siphon-flow"), cFill = ctx.cue("tank-fill");
  const T = mkTl();
  const widths = [80, 140, 200, 250, 290];
  let tall = "";
  widths.forEach((w, i) => {
    const y = 1235 - 74 * (i + 1), x0 = 1550 - w / 2, x1 = 1550 + w / 2;
    tall += arcade({ id: `${I}-gt${i}`, x0, x1, top0: y, top1: y, base: y + 74, tiers: [{ x0, x1, n: Math.max(2, Math.round(w / 45)), h: 74 }] }).svg;
  });
  const gTall = ghost(`${I}-g-tall`, `<g id="${I}-wob" transform="rotate(0 1550 1235)">${tall}</g>`);
  const lvl = poly([[1346, 814], [1748, 814], [1748, 817], [1346, 817]], "var(--snow)");
  const lcl = revealX(T, `${I}-llc`, 1340, 800, 410, 30, cFill + 0.9, 0.6);
  const levelLine = `<g id="${I}-ll" opacity="0"><defs>${lcl}</defs><g clip-path="url(#${I}-llc)">${dashedLine("M1346 815.5 H1748", 3, "10 8")}</g></g>`;
  const W = drawWorld(I, { lvl: 7, anim: { hdr: true, rcv: true, pipe: true, fs: cFlow, Bw: cFill + 0.7, fb: cFill + 0.7 } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F8",
    pigeon: { x: 1180, y: L(1180) - 36 }, behind: gTall, fx: levelLine });
  // ghost-too-tall: wobble
  const gt = fit(cDeep, 1.3, cPipes, 0.8);
  ghostRun(T, `${I}-g-tall`, cDeep, gt);
  const rot = (a) => ({ attr: { transform: `rotate(${a} 1550 1235)` } });
  T.ft(`#${I}-wob`, rot(0), { ...rot(2.5), duration: 0.25 }, cDeep);
  [-2.5, 2, -1.5].forEach((a, i) => T.to(`#${I}-wob`, { ...rot(a), duration: 0.25, ease: "sine.inOut" }, cDeep + 0.25 * (i + 1)));
  // siphon-pipes
  T.ft(`#${I}-hdr`, { scaleY: 0, svgOrigin: "1370 845" }, { scaleY: 1, duration: 0.4, ease: "power2.out" }, cPipes);
  T.ft(`#${I}-rcv`, { scaleY: 0, svgOrigin: "1725 868" }, { scaleY: 1, duration: 0.4, ease: "power2.out" }, cPipes);
  for (const k of ["p1", "p2", "hl"]) {
    show(T, `#${I}-pipe-${k}`, cPipes + 0.2);
    T.to(`#${I}-pipe-${k}`, { strokeDashoffset: 0, duration: 1.2, ease: "power1.inOut" }, cPipes + 0.2);
  }
  // tank-fill
  T.ft(`#${I}-rcv-water`, { opacity: 0, scaleY: 0, svgOrigin: "1725 860" }, { opacity: 1, scaleY: 1, duration: 0.8, ease: "power1.out" }, cFill);
  T.ft(`#${I}-B-water`, { opacity: 1, scaleX: 0, svgOrigin: `1748 ${f(L(1748) + 15)}` }, { opacity: 1, scaleX: 1, duration: 0.6, ease: "none" }, cFill + 0.7);
  // level line
  const tl0 = cFill + 0.9;
  T.ft(`#${I}-ll`, { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, tl0);
  [1, 0.6, 1, 0.6].forEach((o, i) => T.to(`#${I}-ll`, { opacity: o, duration: 0.2 }, tl0 + 0.6 + 0.2 * i));
  return finish(W, {
    stepAt: { b08: cPipes },
    anchors: { siphon: { card: { x: 48, y: 590 }, target: { x: 472, y: 1005 }, at: cPipes + 0.8 } },
    meter: { b08: [{ t: cFill + 0.5, value: 55 }] },
  });
} });

// ================================================================ S8 — rain, mud, settling tank
scenes.push({ id: "s8", beats: ["b09"], light: "day", render(ctx) {
  const I = "s8";
  const cRain = ctx.cue("rain-muddy"), cClog = ctx.cue("ghost-clog"), cBuild = ctx.cue("tank-build"), cSettle = ctx.cue("sand-settle");
  const T = mkTl();
  const cl = [cloud({ id: `${I}-c0`, x: 220, y: 230, w: 460, tone: "overcast", seed: 3 }), cloud({ id: `${I}-c1`, x: 600, y: 330, w: 520, tone: "overcast", seed: 4 }), cloud({ id: `${I}-c2`, x: 930, y: 190, w: 420, tone: "overcast", seed: 5 })];
  const rn = rain({ id: `${I}-rain`, n: 70, seed: 21 });
  const yS = L(1960);
  const stub = leadPipe({ id: `${I}-stub`, points: [[1963, 867], [2062, 872]], width: 8, double: false }) +
    poly([[1965, 865], [2040, 870], [2040, 874], [1965, 869]], "var(--water)") +
    `<g id="${I}-bulge">${poly([[2024, 872], [2030, 865], [2040, 865], [2046, 872], [2040, 879], [2030, 879]], "var(--water)")}</g>` +
    `<g id="${I}-plug">${poly([[2040, 866], [2062, 867], [2062, 877], [2040, 876]], "var(--sand)")}</g>`;
  const gr1 = grains(T, I, { x0: 2046, x1: 2060, y0: 850, yFloor: 868, t: cClog + 0.1, n: 8, dur: [0.5, 0.6], step: 0.07, tag: "cg" });
  const gClog = ghost(`${I}-g-clog`, stub + gr1);
  const gr2 = grains(T, I, { x0: 1780, x1: 1800, y0: 850, yFloor: 927, t: cBuild + 1.0, n: 14 });
  const arrows = [20, 55].map((dy, i) => FlowArrows({ id: `${I}-sl${i}`, kind: "water", x: 0, y: 0, points: [[1790, L(1830) + dy], [1870, L(1830) + dy]], width: 6, period: 3.0, at: cBuild + 1.0, dur: cSettle - cBuild - 1.0, inline: true, fadeIn: true, fadeOut: false }));
  const W = drawWorld(I, { lvl: 8, anim: { settle: true } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F9", pigeon: { x: 1180, y: L(1180) - 36 },
    front: cl.join("") + rn.svg, fx: gClog + gr2 + arrows.map((a) => a.svg).join("") });
  // rain-muddy
  T.raw(lightTween(ctx.world, "day", "overcast", cRain, 0.8));
  T.ft(`#${I}-sun`, { opacity: 1 }, { opacity: 0.2, duration: 0.8 }, cRain);
  for (let i = 0; i < 3; i++) T.ft(`#${I}-c${i}`, { opacity: 0 }, { opacity: 1, duration: 0.6 }, cRain);
  T.ft(`#${I}-rain`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, cRain);
  T.raw(rn.tl(cRain, cSettle + 0.6 - cRain));
  for (const sel of ["rcv-mud", "mB1", "mB3"]) T.ft(`#${I}-${sel}`, { opacity: 0 }, { opacity: 1, duration: 1.0 }, cRain);
  // ghost-clog
  ghostRun(T, `${I}-g-clog`, cClog, fit(cClog, 1.3, cBuild, 0.8));
  T.ft(`#${I}-plug`, { scaleX: 0, svgOrigin: "2062 872" }, { scaleX: 1, duration: 0.6, ease: "power1.out" }, cClog + 0.3);
  T.ft(`#${I}-bulge`, { scaleX: 0.5, scaleY: 0.5, svgOrigin: "2035 872" }, { scaleX: 1.3, scaleY: 1.3, duration: 0.7, ease: "power1.out" }, cClog + 0.5);
  // tank-build
  const wt = L(1830) + 34;
  T.ft(`#${I}-set-back`, { opacity: 0 }, { opacity: 1, duration: 0.2 }, cBuild);
  T.ft(`#${I}-set-walls`, { opacity: 0, scaleY: 0, svgOrigin: `1830 ${f(wt)}` }, { opacity: 1, scaleY: 1, duration: 0.6, ease: "power2.out" }, cBuild);
  T.ft(`#${I}-set-water`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, cBuild + 0.5);
  T.ft(`#${I}-set-mud`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, cBuild + 0.5);
  T.ft(`#${I}-set-sand`, { scaleY: 0, svgOrigin: "1830 927" }, { scaleY: 0, duration: 0.01 }, 0);
  // sand-settle
  T.to(`#${I}-set-sand`, { scaleY: 1, duration: 0.6, ease: "power1.out" }, cSettle);
  T.to(`#${I}-mB3`, { opacity: 0, duration: 0.6 }, cSettle);
  T.raw(lightTween(ctx.world, "overcast", "day", cSettle, 0.8, "power1.inOut", false));
  T.to(`#${I}-sun`, { opacity: 1, duration: 0.8 }, cSettle);
  for (let i = 0; i < 3; i++) T.to(`#${I}-c${i}`, { opacity: 0, duration: 0.6 }, cSettle);
  T.to(`#${I}-rain`, { opacity: 0, duration: 0.6 }, cSettle);
  for (const sel of ["mB1", "rcv-mud", "set-mud"]) T.to(`#${I}-${sel}`, { opacity: 0, duration: 0.8 }, cSettle);
  return finish(W, { tl: arrows.map((a) => a.tl).join("\n"), stepAt: { b09: cBuild }, meter: { b09: [{ t: cSettle + 0.3, value: 65 }] } });
} });

// ================================================================ S9 — limestone crust, hatches
scenes.push({ id: "s9", beats: ["b10"], light: "tense", render(ctx) {
  const I = "s9", b10 = ctx.beat("b10").start;
  const cCrust = ctx.cue("crust-grow"), cThin = ctx.cue("flow-thin"), cHatch = ctx.cue("hatch-open"), cScrape = ctx.cue("crew-scrape");
  const T = mkTl();
  const thin = FlowArrows({ id: `${I}-fbt`, kind: "water", x: 0, y: 0, points: [[1752, L(1752) + 6], [1950, L(1950) + 6]], width: 3, at: cThin, dur: ctx.t1 - cThin, inline: true, fadeIn: true, fadeOut: false });
  const W = drawWorld(I, { lvl: 9, crust: true, anim: { hatch: true } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F10a", sun: { x: 860, y: 470, r: 70, opacity: 0.6 },
    puppet: { x: 1938, y: L(1938) - 74 }, pigeon: { x: 1300, y: 600 }, fx: thin.svg });
  const p = W.puppet;
  camMove(T, I, "F10a", "F10b", b10, 3.25, "power1.inOut");
  // crust-grow: 4 rings, 0.5 s apart
  const oF = `1850 ${f(L(1850) + 30)}`, oR = `1850 ${f(L(1850) - 22)}`;
  for (let k = 0; k < 4; k++) {
    const t = cCrust + 0.5 * k;
    T.ft(`#${I}-crF${k}`, { opacity: 0, scaleY: 0, svgOrigin: oF }, { opacity: 1, scaleY: 1, duration: 0.3, ease: "power2.out" }, t);
    T.ft(`#${I}-crR${k}`, { opacity: 0, scaleY: 0, svgOrigin: oR }, { opacity: 1, scaleY: 1, duration: 0.3, ease: "power2.out" }, t);
  }
  // flow-thin
  T.ft(`#${I}-fb-svg`, { opacity: 1 }, { opacity: 0, duration: 0.3 }, cThin);
  // hatch-open
  const hx = 1904, hy = f(L(1920) - 64);
  pop(T, `#${I}-hatchg`, cHatch, `1920 ${hy}`, 0.3);
  T.ft(`#${I}-hatch-lid`, { attr: { transform: `rotate(0 ${hx} ${hy})` } }, { attr: { transform: `rotate(-100 ${hx} ${hy})` }, duration: 0.5, ease: "power2.out" }, cHatch + 0.35);
  p.pose("lift", cHatch + 0.6, 0.3); p.move(1922, L(1922) + 30, cHatch + 0.6, 0.8);
  // crew-scrape
  p.act("scrape", cScrape, 1.45, 0.5);
  for (let k = 0; k < 4; k++) {
    const t = cScrape + 0.1 + 0.12 * k;
    T.to(`#${I}-crF${k}`, { opacity: 0, scaleY: 0, duration: 0.3 }, t);
    T.to(`#${I}-crR${k}`, { opacity: 0, scaleY: 0, duration: 0.3 }, t);
  }
  T.to(`#${I}-fbt-svg`, { opacity: 0, duration: 0.3 }, cScrape + 0.8);
  T.to(`#${I}-fb-svg`, { opacity: 1, duration: 0.3 }, cScrape + 0.8);
  T.raw(lightTween(ctx.world, "tense", "day", cScrape, 1.0));
  T.to(`#${I}-sun`, { opacity: 1, duration: 1.0 }, cScrape);
  return finish(W, {
    tl: thin.tl,
    stepAt: { b10: cHatch },
    anchors: { crust: { card: { x: 48, y: 1040 }, target: { x: 480, y: 954 }, at: Math.max(cCrust + 0.6, b10 + 3.35) } },
    meter: { b10: [{ t: cThin, value: 50 }, { t: cScrape + 0.7, value: 70 }] },
  });
} });

// ================================================================ S10 — splitter tank (castellum)
scenes.push({ id: "s10", beats: ["b11"], light: "day", render(ctx) {
  const I = "s10";
  const cCast = ctx.cue("castellum-build"), cCity = ctx.cue("pipes-to-city");
  const T = mkTl();
  const W = drawWorld(I, { lvl: 10, anim: { cast: true, cpipes: true, fcity: [cCity + 0.6, cCity + 0.85, cCity + 1.1] } }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F11",
    pigeon: { x: 2112, y: 818 }, pigeon2: null });
  const g = W.pigeon;
  // castellum
  T.ft(`#${I}-cast-back`, { opacity: 0 }, { opacity: 1, duration: 0.2 }, cCast);
  T.ft(`#${I}-cast-walls`, { opacity: 0, scaleY: 0, svgOrigin: "2000 870" }, { opacity: 1, scaleY: 1, duration: 0.5, ease: "power2.out" }, cCast);
  T.ft(`#${I}-cast-water`, { opacity: 1, scaleY: 0, svgOrigin: "2000 870" }, { opacity: 1, scaleY: 1, duration: 0.4, ease: "power1.out" }, cCast + 0.4);
  // pipes to the city
  ["cp1", "cp2", "cp3"].forEach((k, i) => {
    const t = cCity + 0.25 * i;
    for (const part of ["p1", "hl"]) {
      show(T, `#${I}-${k}-${part}`, t);
      T.to(`#${I}-${k}-${part}`, { strokeDashoffset: 0, duration: 0.6, ease: "none" }, t);
    }
  });
  T.to(`#${I}-fnt-jetThin`, { opacity: 1, strokeDashoffset: 0, duration: 0.5, ease: "power1.out" }, cCity + 0.9);
  T.to(`#${I}-fnt-water`, { scaleY: 0.5, duration: 0.5, ease: "power1.out" }, cCity + 0.9);
  g.pose("look", cCity + 0.9, 0.3);
  return finish(W, {
    anchors: { castellum: { card: { x: 48, y: 590 }, target: { x: 380, y: 960 }, at: cCast + 0.6 } },
    meter: { b11: [{ t: cCity + 0.8, value: 85 }] },
  });
} });

// ================================================================ S11 — storm, climax
scenes.push({ id: "s11", beats: ["b12"], light: "day", render(ctx) {
  const I = "s11";
  const cStorm = ctx.cue("storm"), cCatch = ctx.cue("tank-catches-mud"), cHold = ctx.cue("arches-hold"), cFlow = ctx.cue("fountain-flow-pigeon");
  const T = mkTl();
  const cl = [cloud({ id: `${I}-c0`, x: 170, y: 210, w: 520, tone: "storm", seed: 7 }), cloud({ id: `${I}-c1`, x: 560, y: 150, w: 560, tone: "storm", seed: 8 }),
    cloud({ id: `${I}-c2`, x: 940, y: 250, w: 480, tone: "storm", seed: 9 }), cloud({ id: `${I}-c3`, x: 400, y: 340, w: 460, tone: "storm", seed: 10 })];
  const rn = rain({ id: `${I}-rain`, n: 110, seed: 22 });
  const caps = whitecaps(T, I, { t: cStorm + 2.0, until: cFlow }) + splash(T, I, { t: cStorm + 2.0, until: cFlow });
  const gr = grains(T, I, { x0: 1780, x1: 1800, y0: 850, yFloor: 927, t: cCatch, n: 10, dur: [1.0, 1.2], step: 0.08, tag: "gm" });
  const hold = FlowArrows({ id: `${I}-ld`, kind: "load", x: 1000, y: 850, w: 280, h: 300, count: 7, dir: "down", width: 7, period: 0.9, at: cHold, dur: Math.min(1.6, cFlow - cHold - 0.1), inline: true });
  const W = drawWorld(I, { lvl: 11 }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F12a", sun: { x: 860, y: 470, r: 70 }, pigeon: { x: 2112, y: 818, s: 2.6, halo: true },
    front: cl.join("") + rn.svg, fx: caps + gr + hold.svg });
  const g = W.pigeon;
  // storm
  T.raw(lightTween(ctx.world, "day", "tense", cStorm, 0.8));
  T.ft(`#${I}-sun`, { opacity: 1 }, { opacity: 0, duration: 0.8 }, cStorm);
  for (let i = 0; i < 4; i++) T.ft(`#${I}-c${i}`, { opacity: 0 }, { opacity: 1, duration: 0.6 }, cStorm);
  T.ft(`#${I}-rain`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, cStorm);
  T.raw(rn.tl(cStorm, cFlow + 0.8 - cStorm));
  T.ft(`#${I}-flood`, { opacity: 0, scaleY: 0, svgOrigin: "1120 1160" }, { opacity: 1, scaleY: 1, duration: 1.0, ease: "power2.out" }, cStorm + 1.0);
  // mud wave left → right
  const tm = cCatch - 0.9;
  ["V-mud", "hdr-mud", "rcv-mud", "mB1"].forEach((s, i) => T.ft(`#${I}-${s}`, { opacity: 0 }, { opacity: 1, duration: 0.8 }, tm + 0.15 * i));
  // tank-catches-mud
  T.ft(`#${I}-set-mud`, { opacity: 0, scaleY: 0, svgOrigin: "1830 927" }, { opacity: 1, scaleY: 1, duration: 0.6, ease: "power1.out" }, cCatch);
  T.ft(`#${I}-set-sand`, { scaleY: 1, svgOrigin: "1830 927" }, { scaleY: 1.4, duration: 0.6, ease: "power1.out" }, cCatch + 0.5);
  // fountain-flow-pigeon
  T.raw(lightTween(ctx.world, "tense", "day", cFlow, 1.2, "power1.inOut", false));
  T.to(`#${I}-sun`, { opacity: 1, duration: 1.2 }, cFlow);
  for (let i = 0; i < 4; i++) T.to(`#${I}-c${i}`, { opacity: 0, duration: 0.8 }, cFlow);
  T.to(`#${I}-rain`, { opacity: 0, duration: 0.8 }, cFlow);
  T.to(`#${I}-flood`, { scaleY: 0, opacity: 0, duration: 1.2 }, cFlow);
  for (const s of ["V-mud", "hdr-mud", "rcv-mud", "mB1", "set-mud"]) T.to(`#${I}-${s}`, { opacity: 0, duration: 1.0 }, cFlow);
  camMove(T, I, "F12a", "F12b", cFlow - 0.6, 0.8);
  T.to(`#${I}-fnt-jetThin`, { opacity: 0, duration: 0.3 }, cFlow + 0.8);
  T.to(`#${I}-fnt-jetFull`, { opacity: 1, strokeDashoffset: 0, duration: 0.5, ease: "power1.out" }, cFlow + 0.8);
  T.to(`#${I}-fnt-water`, { scaleY: 1, duration: 0.5, ease: "power1.out" }, cFlow + 0.8);
  const nsp = Math.max(1, Math.floor((ctx.t1 - cFlow - 0.9) / 0.6) - 1);
  for (let i = 0; i < 6; i++) {
    T.ft(`#${I}-fnt-sp${i}`, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
    T.ft(`#${I}-fnt-sp${i}`, { opacity: 0.9, y: 0, x: 0 }, { opacity: 0, y: 18, x: 3 + i, duration: 0.6, ease: "power1.in", repeat: nsp }, cFlow + 0.9 + i * 0.1);
  }
  g.act("drink", cFlow + 0.2, 3.0, 0.7); g.pose("stand", cFlow + 3.3, 0.1);
  return finish(W, {
    tl: hold.tl,
    meter: { b12: [{ t: cFlow + 0.6, value: 100 }] },
  });
} });

// ================================================================ S12 — recap
scenes.push({ id: "s12", beats: ["b13"], light: "day", render(ctx) {
  const I = "s12";
  const T = mkTl();
  const marks = [["b03", 250, 690], ["b04", 715, 690], ["b05", 450, 820], ["b06", 885, 830], ["b07", 1120, 960], ["b08", 1550, 1180], ["b09", 1830, 900], ["b10", 1920, 720], ["b11", 2010, 860]];
  const step = Math.min(0.24, (ctx.dur - 0.6) / 9);
  let front = "";
  marks.forEach(([b, x, y], k) => {
    const [sx, sy] = toScreen("WIDE", x, y).map((v) => Math.round(v));
    front += `<g id="${I}-mk${k}" opacity="0"><circle cx="${sx}" cy="${sy}" r="28" fill="#2FA84F" stroke="#fff" stroke-width="4"/><text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="30" font-weight="900" style="font-family:var(--font-ui)">${ctx.script.beats.find((x) => x.id === b).step}</text></g>`;
    T.ft(`#${I}-mk${k}`, { opacity: 0, scale: 0.9, svgOrigin: `${sx} ${sy}` }, { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" }, ctx.t0 + 0.15 + step * k);
  });
  const W = drawWorld(I, { lvl: 12 }, { T, t0: ctx.t0, t1: ctx.t1, cam: "WIDE", sun: { x: 860, y: 470, r: 70 }, pigeon: { x: 2112, y: 818 }, front });
  return finish(W);
} });

// ================================================================ S13 — ending, sunset
scenes.push({ id: "s13", beats: ["b14"], light: "sunset", render(ctx) {
  const I = "s13", b14 = ctx.beat("b14").start, tc = b14 + 1.3;
  const T = mkTl();
  const gl = glints(T, I, { t: ctx.t0, until: ctx.t1 });
  const W = drawWorld(I, { lvl: 13 }, { T, t0: ctx.t0, t1: ctx.t1, cam: "F14a", sun: { x: 850, y: 760, r: 80 }, pigeon: { x: 2112, y: 818 }, fx: gl });
  const g = W.pigeon;
  g.act("drink", ctx.t0 + 0.2, 1.0, 0.7); g.pose("stand", ctx.t0 + 1.3, 0.2);
  // hard cut to the arcade hero shot
  T.ft(`#${I}-cam`, { attr: { transform: camStr("F14a") } }, { attr: { transform: camStr("F7a") }, duration: 0.01, immediateRender: false }, tc);
  return finish(W, { anchors: { title: { x: 540, y: 690, at: tc + 0.2 } } });
} });

export default scenes;
