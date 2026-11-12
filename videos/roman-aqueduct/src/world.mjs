// World model for the Roman aqueduct profile (see PLAN.md §3.0). Everything is in world units (wu); the camera group maps wu → screen px.
import * as kit from "../kit/index.mjs";
const { poly, shade, tint, prng, f, pts, stage, sky, sun, mountains, rocks, pineTree, puppet, pigeon, waterSurface, profileTerrain, grassStrip, surfaceY,
  channel, arcade, tank, leadPipe, castellum, fountain, romanBuilding, hatch, FlowArrows } = kit;

export const r3 = (n) => Math.round(n * 1000) / 1000;
export const L = (x) => 740 + 0.064 * (x - 190);
export const MUD = "color-mix(in srgb, var(--water) 45%, var(--earth-1))";
export const FARG = "color-mix(in srgb, var(--earth-1) 55%, var(--stone))", FARG2 = "color-mix(in srgb, var(--earth-1) 45%, var(--sand))", FARG3 = "color-mix(in srgb, var(--earth-2) 60%, var(--stone))";
export const STAGNANT = "color-mix(in srgb, var(--water) 60%, var(--green-mid))";

export const CAMS = {
  WIDE: [1200, 840, 0.45], F1: [2120, 820, 2.4], F2: [470, 745, 1.55], F3: [715, 740, 1.6], F4: [380, 745, 2.2], F6: [420, 760, 3.2],
  F7s: [800, 760, 1.5], F7a: [1120, 880, 1.1], F7b: [1120, 930, 0.85], F8: [1550, 905, 0.9], F9: [1830, 860, 1.9], F10a: [1900, 850, 2.0],
  F10b: [1915, 852, 3.0], F11: [2080, 830, 2.0], F12a: [1650, 930, 0.8], F12b: [2090, 815, 2.4], F14a: [2100, 805, 2.6],
};
const rr = (v) => Math.round(v * 100) / 100;
export const camStr = (n) => { const [fx, fy, s] = CAMS[n]; return `translate(${rr(540 - s * fx)} ${rr(900 - s * fy)}) scale(${rr(s)})`; };
export const toScreen = (n, x, y) => { const [fx, fy, s] = CAMS[n]; return [540 + (x - fx) * s, 900 + (y - fy) * s]; };

/** Timeline builder: appends GSAP code; the 2nd+ tween of the same selector gets immediateRender:false automatically. Times are absolute. */
export function mkTl() {
  const seen = new Set(), out = [];
  const J = JSON.stringify;
  const api = {
    ft(sel, from, to, at) {
      const first = !seen.has(sel); seen.add(sel);
      out.push(`tl.fromTo(${J(sel)}, ${J(from)}, ${J(first ? to : { ...to, immediateRender: false })}, ${r3(at)});`);
      return api;
    },
    to(sel, vars, at) { seen.add(sel); out.push(`tl.to(${J(sel)}, ${J(vars)}, ${r3(at)});`); return api; },
    set(sel, vars, at) { seen.add(sel); out.push(`tl.set(${J(sel)}, ${J(vars)}, ${r3(at)});`); return api; },
    raw(s) { if (s) out.push(s); return api; },
    code: () => out.join("\n"),
  };
  return api;
}
/** fit(at, want, limit, min): a duration that ends before `limit` (PLAN §6). */
export const fit = (at, want, limit, min) => Math.max(min, Math.min(want, limit - at - 0.05));

// ---------------------------------------------------------------- geometry tables
export const SURF = [[-600, 520], [0, 520], [60, 545], [120, 600], [160, 660], [185, 712], [205, 719], [885, 762.5], [900, 763.4], [935, 840], [975, 960], [1010, 1080], [1035, 1160],
  [1205, 1160], [1230, 1080], [1265, 960], [1305, 840], [1340, 791.6], [1400, 795.4], [1430, 880], [1465, 1010], [1500, 1150], [1525, 1230], [1575, 1235], [1600, 1225], [1630, 1140],
  [1660, 1010], [1688, 885], [1700, 814.6], [1955, 831], [1960, 832], [3000, 832]];
export const HUMP = [[545, 741], [600, 732], [660, 712], [715, 700], [770, 712], [830, 740], [885, 762.5]];
export const HILL = [[545, 741], [585, 712], [625, 660], [665, 600], [700, 556], [730, 540], [760, 548], [795, 585], [830, 650], [860, 715], [885, 762.5]];
export const PIPE = [[1398, 838], [1418, 850], [1440, 895], [1474, 1022], [1508, 1160], [1530, 1248], [1572, 1250], [1598, 1240], [1626, 1155], [1654, 1022], [1680, 900], [1696, 862], [1702, 860]];
export const CPIPES = { cp1: [[2045, 866], [2090, 872], [2090, 832]], cp2: [[2045, 872], [2175, 884], [2175, 832]], cp3: [[2045, 878], [2252, 896], [2252, 832]] };
export const SPAN = { A: [205, 560], T: [560, 900], V: [900, 1346], B: [1748, 1955] };
export const hillY = (x) => surfaceY(HILL, x);
export const humpY = (x) => surfaceY(HUMP, x);
export const surf = (x) => surfaceY(SURF, x);
/** Polygon band W+a..W+b between xa and xb along the water line. */
export const Wband = (xa, xb, a, b) => [[xa, L(xa) + a], [xb, L(xb) + a], [xb, L(xb) + b], [xa, L(xa) + b]];
const FLAT = (x0, x1, off) => [[x0, L(x0) + off], [x1, L(x1) + off]];

const BUILT = { A: 3, B: 3, Aw: 3, hill: 4, T: 4, Tw: 4, slabs: 5, cover: 5, lining: 6, arc: 7, V: 7, hdr: 8, rcv: 8, pipe: 8, rcvw: 8, Bw: 8, settle: 9, hatch: 10, cast: 11, cpipes: 11,
  fa: 3, ft: 4, fv: 7, fs: 8, fb: 8, fcity: 11 };

const cover = (id, xa, xb, left, right, seed) => {
  const ta = L(xa) - 64, tb = L(xb) - 64;
  const top = [left, [xa, ta], [xb, tb], right];
  const soil = poly([...top, [xb, L(xb) - 36], [xa, L(xa) - 36]], "var(--earth-1)");
  const mid = (xa + xb) / 2;
  const facets = poly([[xa, ta], [mid, (ta + tb) / 2], [xa + 20, L(xa) - 36]], tint("earth-1", 10), 'opacity=".5"') +
    poly([[mid, (ta + tb) / 2], [xb, tb], [xb - 20, L(xb) - 36]], shade("earth-1", 14), 'opacity=".5"');
  const capTop = top.map(([x, y]) => [x, y - 16]);
  const cap = poly([...capTop, ...[...top].reverse()], "var(--green-mid)") +
    poly([capTop[1], [mid, (ta + tb) / 2 - 16], [mid - 20, (ta + tb) / 2]], tint("green-mid", 14), 'opacity=".6"');
  return `<g id="${id}">${soil}${facets}${cap}</g>`;
};

/**
 * drawWorld(I, st, slots) → { html, tl, T, puppet, pigeon }
 *  st.lvl: scene number 1..13 (what is already built); st.anim: { name: true | time } things built in this scene (start hidden).
 *  slots: { t0, t1, cam, sun:{x,y,r}, puppet:{x,y,flip?}, pigeon:{x,y,flip?}, behind, mid, fx, front, hump:false, ... }
 */
export function drawWorld(I, st, slots) {
  const T = slots.T ?? mkTl();
  const { t0, t1 } = slots;
  const lvl = st.lvl, anim = st.anim ?? {};
  const has = (n) => lvl >= BUILT[n];
  const show = (n) => has(n) || !!anim[n];
  const hid = (n) => !has(n) && !!anim[n];
  const hidS = (n) => (hid(n) ? ' style="opacity:0"' : "");
  const id = (n) => `${I}-${n}`;

  // ---- fixed back
  const sunC = slots.sun ?? { x: 860, y: 470, r: 70 };
  let back = sky({ horizonY: 1300 }) + `<g id="${id("sun")}" style="opacity:${sunC.opacity ?? 1}">${sun({ cx: sunC.x, cy: sunC.y, r: sunC.r })}</g>`;

  // ---- camera world
  let w = "";
  w += `<g transform="translate(-500 0)">${mountains({ y: 800, w: 3400, count: 12, height: 320, snow: false, seed: 4 })}</g>`;
  // far ground
  {
    const r = prng(31);
    const top = []; for (let x = -600; x <= 3000; x += 100) top.push([x, 815 + (r() - 0.5) * 20]);
    w += poly([...top, [3000, 1300], [-600, 1300]], FARG);
    for (let i = 0; i < top.length - 1; i++) for (let row = 0; row < 4; row++) {
      const y = top[i][1] + row * 120;
      w += poly([[top[i][0], y], [top[i + 1][0], y + 10], [(top[i][0] + top[i + 1][0]) / 2, y + 90]], (i + row) % 2 ? FARG2 : FARG3, 'opacity=".45"');
    }
  }
  if (slots.behind) w += slots.behind;
  // arcade
  const ARC = arcade({ id: id("arc"), x0: 900, x1: 1340, top0: L(900) + 40, top1: L(1340) + 40, base: 1160,
    tiers: [{ x0: 1020, x1: 1260, n: 6, h: 0 }, { x0: 900, x1: 1340, n: 11, h: 120 }, { x0: 900, x1: 1340, n: 22, h: 44 }] });
  if (show("arc")) w += hid("arc") ? ARC.svg : ARC.svg;
  // terrain
  const grassGaps = [[190, 575], [1735, 1965]];
  w += profileTerrain({ id: id("ter"), surface: SURF, seed: 7, grassGaps });
  if (lvl <= 2) {
    w += grassStrip({ id: id("gA"), surface: SURF, x0: 205, x1: 560, seed: 41 });
    w += grassStrip({ id: id("gB"), surface: SURF, x0: 1748, x1: 1955, seed: 42 });
  }
  // spring pool
  w += poly([[150, 716], [205, 722], [205, 746], [160, 742]], "var(--water)") + poly([[150, 716], [180, 719], [165, 730]], tint("water", 18), 'opacity=".6"') + poly([[185, 722], [205, 722], [205, 746], [190, 740]], shade("water", 14), 'opacity=".6"');
  w += rocks({ x: 138, y: 736, s: 0.25, count: 1, seed: 6 }) + rocks({ x: 212, y: 727, s: 0.2, count: 1, seed: 8 });
  w += `<g id="${id("bub")}">${[165, 180, 195].map((x, i) => `<circle id="${id("bub" + i)}" cx="${x}" cy="738" r="3" style="fill:${tint("water", 45)}" opacity="0"/>`).join("")}</g>`;
  // trees
  const cypress = (n, x, y) => `<g id="${id(n)}" transform="translate(${x} ${y}) scale(0.6 1.25) translate(${-x} ${-y})">${pineTree({ x, y, s: 0.4 })}</g>`;
  w += cypress("trS0", 40, 528) + cypress("trS1", 95, 570);
  // hump / hill
  const cap = (pl) => poly([...pl.slice(1, -1), ...[...pl.slice(1, -1)].reverse().map(([x, y]) => [x, y + 14])], "var(--green-mid)");
  const hump = `<g id="${id("hump")}">${poly([...HUMP, [885, 790], [545, 790]], "var(--earth-1)")}${poly([HUMP[0], HUMP[3], [660, 790]], tint("earth-1", 10), 'opacity=".5"')}${poly([HUMP[3], HUMP[6], [760, 790]], shade("earth-1", 14), 'opacity=".5"')}${cap(HUMP)}</g>`;
  const hill = `<g id="${id("hill")}"${hid("hill") ? "" : ""}>${poly([...HILL, [885, 790], [545, 790]], "var(--earth-1)")}${poly([HILL[0], HILL[4], [660, 790]], tint("earth-1", 10), 'opacity=".5"')}${poly([HILL[4], HILL[7], [800, 790]], shade("earth-1", 14), 'opacity=".55"')}${poly([HILL[2], HILL[4], [640, 700]], shade("earth-1", 8), 'opacity=".5"')}${cap(HILL)}</g>`;
  if (slots.hump !== false && lvl <= 3) w += hump;
  if (show("hill")) w += hill;
  if (show("hill") || lvl >= 4) w += `<g id="${id("hillTrees")}"${st.anim?.hillTrees ? ' style="opacity:0"' : ""}>${cypress("trH0", 705, 548).replace(/id="[^"]+"/, "")}${cypress("trH1", 770, 556).replace(/id="[^"]+"/, "")}</g>`;
  w += cypress("trT0", 2370, 832) + cypress("trT1", 2420, 832);
  // river
  w += `<g id="${id("river")}">${waterSurface({ x: 1040, y: 1144, w: 160, h: 16, seed: 12 })}</g>`;
  w += `<g id="${id("flood")}" style="opacity:0">${poly([[1013, 1090], [1227, 1090], [1205, 1160], [1035, 1160]], MUD)}${poly([[1013, 1090], [1120, 1090], [1090, 1160], [1035, 1160]], shade("earth-1", 10), 'opacity=".4"')}</g>`;

  // channels
  const hidC = (n, extra = []) => [...(hid(n) ? ["all"] : []), ...extra];
  const A = channel({ id: id("A"), x0: 205, y0: L(205), x1: 560, y1: L(560), water: show("Aw"), slabs: true, lining: true, hidden: [...(hid("Aw") ? ["water"] : []), ...(has("slabs") ? [] : ["slabs"]), ...(has("lining") ? [] : ["lining"])] });
  const Tn = channel({ id: id("T"), x0: 560, y0: L(560), x1: 900, y1: L(900), water: show("Tw"), slabs: true, slabRange: [865, 900], lining: true, backShade: 38, hidden: [...(hid("Tw") ? ["water"] : []), ...(has("slabs") ? [] : ["slabs"]), ...(has("lining") ? [] : ["lining"])] });
  const B = channel({ id: id("B"), x0: 1748, y0: L(1748), x1: 1955, y1: L(1955), water: show("Bw"), slabs: true, slabRange: [1760, 1955], lining: true, endWalls: { right: true }, hidden: [...(hid("Bw") ? ["water"] : []), ...(has("slabs") ? [] : ["slabs"]), ...(has("lining") ? [] : ["lining"])] });
  const V = channel({ id: id("V"), x0: 900, y0: L(900), x1: 1346, y1: L(1346), water: true, slabs: true, lining: true, hidden: hid("V") ? ["water"] : [], endWalls: has("hdr") || anim.hdr ? {} : { right: true } });
  const portal = (x) => poly([[x - 5, L(x) - 26], [x + 5, L(x) - 26], [x + 5, L(x) + 40], [x - 5, L(x) + 40]], "var(--sand)") + poly([[x, L(x) - 26], [x + 5, L(x) - 26], [x + 5, L(x) + 40], [x, L(x) + 40]], shade("sand", 16));
  if (show("A")) w += `<g id="${id("Ar")}"${hid("A") ? ' style="opacity:0"' : ""}>${A.svg}</g>`;
  if (show("T")) w += `<g id="${id("Tg")}">${Tn.svg}</g><g id="${id("portL")}"${hidS("T")}>${portal(560)}</g><g id="${id("portR")}"${hidS("T")}>${portal(870)}</g>`;
  if (show("B")) w += `<g id="${id("Bg")}"${hidS("B")}>${B.svg}</g>`;
  if (show("V")) w += `<g id="${id("Vg")}">${V.svg}</g>`;
  // tanks, pipes
  const HDR = tank({ id: id("hdr"), x: 1346, top: 768, w: 48, h: 77, waterY: 815.5 });
  const RCV = tank({ id: id("rcv"), x: 1702, top: 790, w: 46, h: 78, waterY: 838.2, hidden: lvl < 8 ? ["water"] : [] });
  const SET = tank({ id: id("set"), x: 1775, top: L(1830) - 22, w: 110, h: 112, waterY: 843, wallTop: L(1830) + 34, sand: has("settle") || anim.settle ? 18 : 0, hidden: hid("settle") ? ["all"] : [] });
  if (show("hdr")) w += HDR.svg;
  if (show("rcv")) w += RCV.svg;
  if (show("pipe")) w += leadPipe({ id: id("pipe"), points: PIPE, width: 12, double: true, hidden: hid("pipe") });
  if (show("settle")) w += SET.svg;
  // mud overlays on the open channel B pieces
  w += `<g id="${id("mB1")}" style="opacity:0">${poly(Wband(1748, 1775, 0, 30), MUD)}</g><g id="${id("mB3")}" style="opacity:0">${poly(Wband(1885, 1955, 0, 30), MUD)}</g>`;
  if (show("cast")) w += castellum({ id: id("cast"), cx: 2000, rimY: 820, floorY: 870, r: 45, waterY: 853, hidden: hid("cast") ? ["all"] : [] });
  if (show("cpipes")) for (const k of ["cp1", "cp2", "cp3"]) w += leadPipe({ id: id(k), points: CPIPES[k], width: 6, double: false, hidden: hid("cpipes") });
  // crust (lime scale) layers inside B outside the settling tank
  if (st.crust) {
    for (let k = 0; k < 4; k++) {
      const segs = [[1748, 1775], [1885, 1955]];
      const floor = segs.map(([a, b]) => poly(Wband(a, b, 30 - 5 * (k + 1), 30 - 5 * k), k % 2 ? tint("sand", 55) : shade("sand", 8))).join("");
      const roof = segs.map(([a, b]) => poly(Wband(a, b, -22 + 5 * k, -22 + 5 * (k + 1)), k % 2 ? shade("sand", 8) : tint("sand", 70))).join("");
      w += `<g id="${id("crF" + k)}" style="opacity:0">${floor}</g><g id="${id("crR" + k)}" style="opacity:0">${roof}</g>`;
    }
  }
  // cover bands
  if (show("cover")) {
    const hs = hid("cover") ? ' style="opacity:0"' : "";
    w += `<g id="${id("cvs")}"${hs}>` + cover(id("cvA"), 205, 560, [172, 680], [595, 704], 1) + cover(id("cvT"), 865, 900, [858, hillY(858)], [908, 768], 2) + cover(id("cvB"), 1760, 1940, [1736, 816.4], [1966, 832], 3) + `</g>`;
  }
  // hatch
  if (show("hatch")) { const H = hatch({ id: id("hatch"), x: 1920, top: L(1920) - 64, bottom: L(1920) - 22 }); w += `<g id="${id("hatchg")}"${hidS("hatch")}>${H.svg}</g>`; }
  // town
  w += romanBuilding({ id: id("bath"), x: 2140, y: 832, w: 70, h: 56, roofH: 16, windows: 2 });
  w += romanBuilding({ id: id("hsA"), x: 2230, y: 832, w: 45, h: 40, roofH: 14, windows: 1 });
  w += romanBuilding({ id: id("hsB"), x: 2295, y: 832, w: 50, h: 46, roofH: 16, windows: 1 });
  w += fountain({ id: id("fnt"), x: 2090, y: 832 });
  w += slots.mid ?? "";
  // characters
  const P = slots.puppet ? puppet({ id: id("pup"), s: 0.25, ...slots.puppet }) : null;
  const G = slots.pigeon ? pigeon({ id: id("pg"), s: 1, ...slots.pigeon }) : null;
  if (P) w += P.svg;
  if (G) w += G.svg;
  // flows
  const flowSpec = {
    fa: { pts: [[212, L(212) + 14], [540, L(540) + 14]], width: 8 },
    ft: { pts: [[560, L(560) + 14], [895, L(895) + 14]], width: 8 },
    fv: { pts: [[905, L(905) + 14], [1342, L(1342) + 14]], width: 8 },
    fs: { pts: [[1370, 830], ...PIPE, [1725, 852]], width: 7 },
    fb: { pts: [[1752, L(1752) + 14], [1950, L(1950) + 14]], width: 8 },
  };
  let flowTl = "";
  for (const [k, spec] of Object.entries(flowSpec)) {
    const at = typeof anim[k] === "number" ? anim[k] : null;
    if (st.noFlow?.includes(k)) continue;
    if (!has(k) && at == null) continue;
    const start = has(k) ? t0 : at;
    const fl = FlowArrows({ id: id(k), kind: "water", x: 0, y: 0, points: spec.pts, width: spec.width, at: start, dur: t1 - start, inline: true, fadeIn: !has(k), fadeOut: false });
    w += fl.svg; flowTl += fl.tl + "\n";
  }
  if (has("fcity") || anim.fcity != null) {
    Object.entries(CPIPES).forEach(([k, pl], i) => {
      const st2 = Array.isArray(anim.fcity) ? anim.fcity[i] : anim.fcity;
      const fl = FlowArrows({ id: id("f" + k), kind: "water", x: 0, y: 0, points: pl, width: 6, at: has("fcity") ? t0 : st2, dur: t1 - (has("fcity") ? t0 : st2), inline: true, fadeIn: !has("fcity"), fadeOut: false });
      w += fl.svg; flowTl += fl.tl + "\n";
    });
  }
  w += slots.fx ?? "";

  // ambient: spring bubbles (finite loops), river shimmer from S6
  const cyc = Math.max(1, Math.floor((t1 - t0) / 0.9) - 1);
  [0, 1, 2].forEach((i) => T.ft(`#${id("bub" + i)}`, { opacity: 0.8, y: 0 }, { opacity: 0, y: -12, duration: 0.9, ease: "none", repeat: cyc }, t0 + i * 0.3));
  if (lvl >= 6) {
    let sh = "";
    for (let i = 0; i < 3; i++) sh += poly([[1060 + i * 45, 1149 + i], [1090 + i * 45, 1149 + i], [1086 + i * 45, 1152 + i], [1056 + i * 45, 1152 + i]], tint("snow", 20), `id="${id("shim" + i)}" opacity="0"`);
    w += sh;
    const c2 = Math.max(1, Math.floor((t1 - t0) / 1.5) - 1);
    [0, 1, 2].forEach((i) => T.ft(`#${id("shim" + i)}`, { opacity: 0.8, x: 0 }, { opacity: 0, x: 40, duration: 1.5, ease: "none", repeat: c2 }, t0 + i * 0.5));
  }
  // fountain state: dry (lvl<=10) / trickle (11) / full (>=12)
  {
    const fw = `#${id("fnt-water")}`, fo = "0 -2";
    const hideF = (sel, p) => T.ft(sel, p, { ...p, duration: 0.01 }, 0);
    hideF(fw, { scaleY: lvl <= 10 ? 0 : lvl === 11 ? 0.5 : 1, svgOrigin: fo });
    if (lvl === 11) hideF(`#${id("fnt-jetThin")}`, { opacity: 1, strokeDashoffset: 0 });
    if (lvl >= 12) {
      hideF(`#${id("fnt-jetFull")}`, { opacity: 1, strokeDashoffset: 0 });
      const c3 = Math.max(1, Math.floor((t1 - t0) / 0.6) - 1);
      for (let i = 0; i < 6; i++) {
        T.ft(`#${id("fnt-sp" + i)}`, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
        T.ft(`#${id("fnt-sp" + i)}`, { opacity: 0.9, y: 0, x: 0 }, { opacity: 0, y: 18, x: 3 + i, duration: 0.6, ease: "power1.in", repeat: c3 }, t0 + i * 0.1);
      }
    }
  }
  const camW = `<g id="${id("cam")}" transform="${camStr(slots.cam)}">${w}</g>`;
  const html = stage(back + camW + (slots.front ?? ""));
  return { html, T, tl: flowTl, puppet: P, pigeon: G, id, has, camStr, ch: { A, Tn, B, V }, arc: ARC };
}
