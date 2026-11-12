// Pin tumbler lock: scenes s1..s4 + extras (EndInset, RecapPills). Text comes from script.<lang>.json (overlays built by build.mjs);
// every beat-level time comes from timings via ctx.cue / ctx.word. Only durations and offsets are literal numbers.
import * as kit from "../kit/index.mjs";
import { PX, DT, SL, KT, DL, V, VWRONG, SEAM, CAM, ORDER, r3, J, lockSvg, keySvg, tracker, screwdriver, stick, twig, drill, tensionG, tensionN, pick, tick, cutLine, bottleCap, fanKey } from "./lock.mjs";
import { EndInset } from "./endInset.mjs";
import { egyptInset } from "./egyptInset.mjs";

const { stage, sky, sun, puppet, houseFront, magpie, ForceArrows, RecapPills, lightTween, tf, poly, shade, tint } = kit;

const LT = (...a) => lightTween(...a).replace("\"duration\"", "\"immediateRender\":false,\"duration\"");
const IDX = [0, 1, 2, 3, 4];
const MP_LOW = 90;
let INSET = null; // created by s2, emitted by the `inset` extra

const plank = (shelf) =>
  poly([[0, 1500], [1080, 1500], [1080, 1530], [0, 1530]], tint("wood", 10)) + poly([[0, 1530], [1080, 1530], [1080, 1920], [0, 1920]], shade("wood", 14)) +
  (shelf ? poly([[20, 1215], [170, 1215], [170, 1235], [20, 1235]], shade("wood", 20)) : "");

/** gk: scale factor for a ghost's internal offsets so it ends 0.45 s before the next cue (short-beat rule) */
const gk = (cueT, nextT, planned) => Math.min(1, Math.max(0.8, nextT - cueT - 0.45) / planned);

// ------------------------------------------------------------------ s1 door (b01)
const ZOOM = tf({ x: -110, y: -230, px: 650, py: 1130, sx: 3.5, sy: 3.5 });
const s1 = {
  id: "s1", beats: ["b01"], light: "day",
  render(ctx) {
    const L = [], tr = tracker(L);
    const t0 = ctx.t0, cPull = ctx.cue("pullback-door-to-lock"), cFan = ctx.cue("keys-fan-one-glows"), wTh = ctx.word("b01", "thousands");
    const house = houseFront({ id: "s1-house" });
    const p = puppet({ id: "s1-p", x: 980, y: 1520, s: 3.0, flip: true, jacket: "water" });
    p.pose("holdKey", t0, 0.01);
    const m = magpie({ id: "s1-m", x: 690, y: 740, s: 1.5, flip: true });
    tr.tf("#s1-m-head", tf({ r: -10, px: 24, py: -54 }), t0 + 0.3, 0.25, "power2.out");
    tr.init("#s1-m-head", "t", tf({ px: 24, py: -54 }));
    tr.emit("#s1-cam", { attr: { transform: tf() } }, { attr: { transform: ZOOM }, duration: 1.55, ease: "power2.inOut" }, cPull);
    let fan = "";
    for (let k = 0; k < 9; k++) {
      fan += fanKey(`s1-fan${k}`, -60 + k * 15);
      const t = wTh + 0.05 * k;
      tr.op(`#s1-fan${k}`, 1, t, 0.25, "power2.out");
      tr.emit(`#s1-fan${k}-in`, { attr: { transform: tf({ sx: 0.9, sy: 0.9 }) } }, { attr: { transform: tf() }, duration: 0.25, ease: "power2.out" }, t);
      if (k !== 4) tr.op(`#s1-fan${k}`, 0.3, cFan, 0.3);
    }
    tr.emit("#s1-fan4w", { attr: { transform: tf() } }, { attr: { transform: tf({ sx: 1.15, sy: 1.15 }) }, duration: 0.3, ease: "power2.out" }, cFan);
    tr.op("#s1-fan4-ol", 1, cFan, 0.2); tr.op("#s1-fan4-ol", 0.5, cFan + 0.2, 0.2); tr.op("#s1-fan4-ol", 1, cFan + 0.4, 0.2);
    const html = stage(`<g id="s1-cam" transform="${tf()}">${sky({ horizonY: 400 })}${sun({ cx: 880, cy: 210, r: 60 })}${house.svg}${p.svg}${m.svg}</g>${fan}`);
    return { html, tl: [p.tl(), ...L].join("\n") };
  },
};

// ------------------------------------------------------------------ s2 lock (b02..b09)
const s2 = {
  id: "s2", beats: ["b02", "b03", "b04", "b05", "b06", "b07", "b08", "b09"], light: "day",
  render(ctx) {
    const B = ctx.beat, c = (a) => ctx.cue(a), w = (b, t, n = 1) => ctx.word(b, t, n), t0 = ctx.t0;
    const L = [], tr = tracker(L), Q = [];
    const q = (t, fn) => Q.push([t, Q.length, fn]);
    const bt = (id) => ctx.timings.beats.find((b) => b.id === id);
    const inset = (INSET = EndInset({ id: "ex-inset-v", at: B("b02").start, dur: r3(bt("b10").start - 0.1 - B("b02").start) }));
    const lock = lockSvg("s2");
    const S = (n) => `#s2-${n}`;

    // inits for tweens whose markup transform is not in tf() form
    const I0 = (sel, v) => tr.init(sel, "t", v);
    I0(S("bolt"), "translate(0 0)"); I0(S("camL"), tf({ px: CAM.x, py: CAM.y })); I0(S("key"), "translate(-900 0)"); I0(S("mkey"), "translate(-900 0)");
    I0(S("sd-m"), "translate(-400 0)"); I0(S("stick-m"), "translate(-500 0)"); I0(S("twig-m"), "translate(-380 0)"); I0(S("twig-r"), tf({ px: 175, py: 1147 }));
    I0(S("tension-m"), "translate(-300 0)"); I0(S("tension2-m"), "translate(-300 0)"); I0(S("pick"), "translate(-600 0)");
    I0(S("drill"), "translate(0 -900)"); I0(S("drill-gr"), "translate(0 0)"); I0(S("lock"), tf({ px: 540, py: 1000, sx: 0.94, sy: 0.94 }));
    I0(S("m"), "translate(-140 1215)"); I0(S("m-head"), tf({ px: 24, py: -54 })); I0(S("m-hop"), "translate(0 0)"); I0(S("st2-drv"), "translate(0 0)");
    for (const i of IDX) {
      I0(S(`hole${i}`), tf({ px: PX[i], py: 820, sy: 0.02 })); I0(S(`up${i}`), "translate(0 0)"); I0(S(`axS${i}`), "translate(0 0)");
      tr.init(S(`st${i}-kpFlat`), "o", 1); tr.init(S(`st${i}-drv`), "o", i === 2 ? 0 : 1); tr.init(S(`st${i}-split`), "o", i === 2 ? 0 : 1);
    }
    tr.init(S("st2-oneP"), "o", 1); tr.init(S("pick-n"), "o", 1);

    const lockOpen = (angle, bolt, at, d = 0.35, ease = "power2.inOut") => {
      tr.tf(S("camL"), tf({ r: angle, px: CAM.x, py: CAM.y }), at, d, ease);
      tr.tf(S("bolt"), `translate(${bolt} 0)`, at, d, ease);
    };
    const red = (v, at, d = 0.2) => tr.op(S("lockRed"), v, at, d);
    const hopTo = (x, at) => {
      tr.tf(S("m"), `translate(${x} 1215)`, at, 0.35, "power2.out");
      tr.emit(S("m-hop"), { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(0 -12)" }, duration: 0.175, ease: "power2.out" }, at);
      tr.emit(S("m-hop"), { attr: { transform: "translate(0 -12)" } }, { attr: { transform: "translate(0 0)" }, duration: 0.175, ease: "power2.in" }, at + 0.175);
    };
    const pk = { x: -600, y: 0 };
    const pickTo = (x, y, at, d = 0.2, ease = "power1.inOut") => { tr.tf(S("pick"), `translate(${x} ${y})`, at, d, ease); pk.x = x; pk.y = y; };
    const pop = (i, at) => tr.emit(S(`pop${i}`), { opacity: 1, attr: { r: 8 } }, { opacity: 0, attr: { r: 20 }, duration: 0.25, ease: "power2.out" }, at);
    const setPin = (i, t, mv, up, dn, ring) => {
      const x = PX[i] - 330;
      pickTo(x, 0, t, mv); pickTo(x, -DL[i], t + mv, up, "power2.out"); tr.lift(i, DL[i], t + mv, up); pickTo(x, 0, t + mv + up, dn, "power2.in");
      if (ring) pop(i, t + mv + up);
    };
    const growHole = (i, t, d = 0.25) => { tr.op(S(`hole${i}`), 1, t, 0.05); tr.tf(S(`hole${i}`), tf({ px: PX[i], py: 820 }), t, d, "power1.inOut"); };
    const drawSpring = (i, t) => tr.emit(S(`sp${i}`), { opacity: 0, attr: { transform: tf({ px: PX[i], py: 820, sy: 0.2 }) } }, { opacity: 1, attr: { transform: tf({ px: PX[i], py: 820 }) }, duration: 0.35, ease: "power2.out" }, t);
    const dropStack = (i, t) => { tr.op(S(`st${i}`), 1, t, 0.05); tr.emit(S(`st${i}`), { attr: { transform: "translate(0 -420)" } }, { attr: { transform: "translate(0 0)" }, duration: 0.35, ease: "power2.in" }, t); };

    // ---------------- b02 attempt
    const cPlug = c("plug-turns-bolt-slides"), cSd = c("ghost-screwdriver-opens"), wBolt = w("b02", "bolt.");
    tr.op(S("lock"), 1, t0, 0.45, "power2.out"); tr.tf(S("lock"), tf({ px: 610, py: 1000 }), t0, 0.45);
    q(cPlug, (i) => i.turn(90, cPlug)); lockOpen(60, -100, cPlug);
    const tBack = wBolt + 0.3;
    lockOpen(0, 0, tBack); q(tBack, (i) => i.turn(0, tBack));
    { // ghost: screwdriver
      const k = gk(cSd, B("b02").end + 0.3, 1.3), a = cSd + 0.35 * k, r = cSd + 1.3 * k;
      tr.op(S("sd"), 1, cSd, 0.15); tr.tf(S("sd-m"), "translate(0 0)", cSd, 0.3); red(0.28, cSd);
      lockOpen(60, -100, a); q(a, (i) => { i.turn(90, a); i.ghostTint(a, r - a); });
      tr.tf(S("sd-m"), "translate(-400 0)", r, 0.35, "power2.inOut"); tr.op(S("sd"), 0, r + 0.15, 0.2); red(0, r, 0.35);
      lockOpen(0, 0, r); q(r, (i) => i.turn(0, r));
    }

    // ---------------- b03 step 1: pin
    const cDr = c("drill-hole"), cPin = c("pin-drop"), cJam = c("plug-jams"), cEg = c("egypt-wooden-lock-inset");
    tr.op(S("drill"), 1, cDr - 0.1, 0.05); tr.tf(S("drill"), "translate(0 0)", cDr - 0.1, 0.8, "power1.inOut");
    for (let n = 0; n < 3; n++) tr.emit(S("drill-gr"), { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(0 -60)" }, duration: 0.25, ease: "none" }, cDr + 0.1 + 0.25 * n);
    growHole(2, cDr - 0.1, 0.8);
    tr.tf(S("drill"), "translate(0 -900)", cDr + 0.9, 0.3, "power1.in"); tr.op(S("drill"), 0, cDr + 1.2, 0.05);
    dropStack(2, cPin); q(cPin + 0.35, (i) => i.pin(cPin + 0.35));
    q(cJam, (i) => i.jam(cJam)); tr.pulse(S("st2-drvY"), cJam, 0.2, 0.2);
    const eg = egyptInset({ id: "s2-eg", cx: 270, cy: 1040, r: 110, at: cEg });
    const egEnd = B("b04").start - 0.3;

    // ---------------- b04 step 2: split pin + shear line
    const cSt = c("ghost-stick-lifts-pin"), cSplit = c("pin-split"), cLow = c("stack-too-low"), cHigh = c("stack-too-high"), cGl = c("shear-line-glow");
    tr.op(S("seam"), 1, B("b04").start, 0.3);
    { // ghost: stick lifts the one-piece pin
      const k = gk(cSt, cSplit, 1.3), r = cSt + 1.3 * k;
      tr.op(S("stick"), 1, cSt, 0.15); tr.tf(S("stick-m"), "translate(0 0)", cSt, 0.25); red(0.28, cSt);
      tr.lift(2, 125, cSt + 0.25 * k, 0.3);
      const a = cSt + 0.55 * k; lockOpen(60, -100, a); q(a, (i) => { i.turn(70, a); i.ghostTint(a, r - a); });
      tr.lift(2, 0, r, 0.3); tr.tf(S("stick-m"), "translate(-500 0)", r, 0.3); tr.op(S("stick"), 0, r + 0.15, 0.2); red(0, r, 0.3);
      lockOpen(0, 0, r, 0.3); q(r, (i) => i.turn(0, r, 0.3));
    }
    tr.pulse(S("cutLine"), cSplit, 0.1, 0.15);
    tr.op(S("st2-oneP"), 0, cSplit, 0.3); tr.op(S("st2-drv"), 1, cSplit, 0.3); tr.op(S("st2-split"), 1, cSplit + 0.1, 0.2);
    tr.emit(S("st2-drv"), { attr: { transform: "translate(0 0)" } }, { attr: { transform: "translate(0 -6)" }, duration: 0.15, ease: "power2.out" }, cSplit + 0.3);
    tr.emit(S("st2-drv"), { attr: { transform: "translate(0 -6)" } }, { attr: { transform: "translate(0 0)" }, duration: 0.15, ease: "power2.in" }, cSplit + 0.45);
    tr.lift(2, 30, cLow); tr.flash(S("st2-drvRed"), "red", cLow + 0.25, 0.6); q(cLow + 0.3, (i) => i.jam(cLow + 0.3));
    tr.lift(2, 95, cHigh); tr.flash(S("st2-kpRed"), "red", cHigh + 0.25, 0.6); q(cHigh + 0.3, (i) => i.jam(cHigh + 0.3));
    tr.lift(2, DL[2], cGl);
    tr.op(S("seamGlow"), 1, cGl, 0.25); tr.op(S("seamGlow"), 0.6, cGl + 0.4, 0.3); tr.op(S("seamGlow"), 1, cGl + 0.7, 0.3);
    tr.op(S("seamGlow"), 0, B("b05").start - 0.2, 0.3);
    q(cGl, (i) => i.align(true, cGl)); q(cGl + 0.3, (i) => i.flash("yellow", cGl + 0.3)); q(cGl + 0.5, (i) => i.turn(25, cGl + 0.5)); q(cGl + 1.4, (i) => i.turn(0, cGl + 1.4)); q(cGl + 1.8, (i) => i.align(false, cGl + 1.8));
    tr.lift(2, 0, B("b05").start - 0.4, 0.3);
    const fa1 = ForceArrows({ id: "s2-fa1", tone: "yellow", mode: "along", path: [[540, 1190], [540, 1150]], count: 1, len: 40, width: 9, at: cLow, dur: r3(cGl + 1.0 - cLow) });

    // ---------------- b05 step 3: springs
    const cFl = c("ghost-flip-pins-stay-out"), cSpr = c("springs-push-down");
    { // ghost: lock held upside down
      const k = gk(cFl, cSpr, 1.5), r = cFl + 1.5 * k;
      tr.tf(S("lock"), tf({ r: 180, px: 610, py: 1000 }), cFl, 0.5, "power2.inOut"); red(0.28, cFl);
      tr.lift(2, 120, cFl + 0.5 * k, 0.3, "power2.in");
      const a = cFl + 0.8 * k; lockOpen(60, -100, a, 0.3); q(a, (i) => { i.turn(70, a, 0.3); i.ghostTint(a, r - a); });
      lockOpen(0, 0, r, 0.25); q(r, (i) => i.turn(0, r, 0.25));
      tr.tf(S("lock"), tf({ px: 610, py: 1000 }), r, 0.5, "power2.inOut"); red(0, r, 0.3);
      tr.lift(2, 0, r + 0.5 * k, 0.25);
    }
    drawSpring(2, cSpr); tr.lift(2, 60, cSpr + 0.45, 0.25); tr.lift(2, 0, cSpr + 0.9, 0.35, "power2.in");
    const fa2 = ForceArrows({ id: "s2-fa2", tone: "yellow", mode: "along", path: [[575, 830], [575, 950]], count: 2, len: 44, width: 9, at: cSpr, dur: r3(B("b06").start - cSpr - 0.1) });

    // ---------------- b06 step 4: five heights
    const cGu = c("ghost-one-pin-guessed"), cFive = c("five-stacks-appear"), cKey = c("key-slides-in");
    { // ghost: guessing one pin with a twig
      const k = gk(cGu, cFive, 1.5), r = cGu + 1.45 * k;
      hopTo(MP_LOW, cGu - 0.4);
      tr.op(S("twig"), 1, cGu, 0.1); tr.tf(S("twig-m"), "translate(0 0)", cGu, 0.2); red(0.28, cGu);
      const ang = (l) => tf({ r: -(Math.atan(l / 385) * 180) / Math.PI, px: 175, py: 1147 });
      const tries = [[0.2, 30], [0.55, 95], [0.9, DL[2]]];
      tries.forEach(([o, l], n) => {
        const t = cGu + o * k;
        tr.lift(2, l, t, 0.25); tr.tf(S("twig-r"), ang(l), t, 0.25);
        if (n === 0) tr.flash(S("st2-drvRed"), "red", t + 0.2, 0.25);
        if (n === 1) tr.flash(S("st2-kpRed"), "red", t + 0.2, 0.25);
        if (n === 2) tr.pulse(S("seamGlow"), t + 0.2, 0.2, 0.2);
      });
      q(cGu + 0.3 * k, (i) => i.jam(cGu + 0.3 * k)); q(cGu + 0.65 * k, (i) => i.jam(cGu + 0.65 * k));
      q(cGu + 0.95 * k, (i) => i.align(true, cGu + 0.95 * k)); q(cGu + 1.0 * k, (i) => i.turn(40, cGu + 1.0 * k));
      tr.lift(2, 0, r, 0.3); tr.tf(S("twig-r"), tf({ px: 175, py: 1147 }), r, 0.3); tr.tf(S("twig-m"), "translate(-380 0)", r + 0.1, 0.25); tr.op(S("twig"), 0, r + 0.2, 0.15); red(0, r, 0.3);
      q(r, (i) => { i.turn(0, r); i.align(false, r); });
      hopTo(-140, cGu + 1.5 * k);
    }
    [0, 1, 3, 4].forEach((i, j) => growHole(i, cFive + 0.12 * j));
    [0, 1, 3, 4].forEach((i, j) => { const t = cFive + 0.6 + 0.15 * j; dropStack(i, t); drawSpring(i, t); });
    tr.op(S("key"), 1, cKey, 0.05); tr.ride(S("key"), IDX, V, -900, 0, cKey, 1.2);
    tr.op(S("seamGlow"), 1, cKey + 1.25, 0.25); tr.op(S("seamGlow"), 0, B("b07").start - 0.2, 0.2);
    q(cKey + 1.25, (i) => i.align(true, cKey + 1.25)); q(cKey + 1.3, (i) => i.flash("yellow", cKey + 1.3)); q(cKey + 1.45, (i) => i.turn(40, cKey + 1.45));

    // ---------------- b07 step 5: rounded tips
    const B7 = B("b07"), cSn = c("ghost-key-snags"), cTr = c("tips-round"), cRd = c("key-rides-pins");
    q(B7.start, (i) => { i.turn(0, B7.start); i.align(false, B7.start); });
    tr.ride(S("key"), IDX, V, 0, -900, B7.start, 0.5);
    tr.tf(S("cam"), tf({ px: 300, py: 1060, sx: 1.6, sy: 1.6 }), B7.start, 0.6, "power2.inOut");
    { // ghost: flat pin snags on the key tip
      const k = gk(cSn, cTr, 1.4), r = cSn + 1.4 * k;
      tr.tf(S("key"), "translate(-558 0)", cSn, 0.45, "power1.in");
      [-552, -562, -558].forEach((x, n) => tr.tf(S("key"), `translate(${x} 0)`, cSn + 0.45 + 0.067 * n, 0.067, "none"));
      tr.flash(S("st0-kpRed"), "red", cSn + 0.45, 0.7); tr.flash(S("key") + "Red", "red", cSn + 0.45, 0.7); red(0.28, cSn);
      tr.tf(S("key"), "translate(-900 0)", r, 0.35, "power2.inOut"); red(0, r, 0.3);
    }
    IDX.forEach((i, j) => { tr.op(S(`st${i}-kpFlat`), 0, cTr + 0.06 * j, 0.3); tr.op(S(`st${i}-kpRound`), 1, cTr + 0.06 * j, 0.3); tr.pulse(S(`st${i}-kpY`), cTr + 0.5, 0.2, 0.2); });
    tr.ride(S("key"), IDX, V, -900, 0, cRd, 1.3);
    q(cRd + 1.35, (i) => i.align(true, cRd + 1.35)); q(cRd + 1.4, (i) => i.turn(40, cRd + 1.4));
    tr.tf(S("cam"), tf(), Math.min(B7.end + 0.05, B("b08").start - 0.45), 0.4, "power2.inOut");

    // ---------------- b08 step 6: spool pins
    const B8 = B("b08"), cNt = c("to-night-tense"), cHo = c("holes-offset-zoom"), cGp = c("ghost-pick-sets-pins"), cSpool = c("spool-drivers"), cFs = c("false-set");
    const DX = [10, -12, 14, -10, 8];
    tr.ride(S("key"), IDX, V, 0, -900, B8.start, 0.4);
    q(B8.start, (i) => { i.align(false, B8.start); i.turn(0, B8.start); });
    const lightL = LT(ctx.world, "day", "tense", cNt, 0.8);
    hopTo(MP_LOW, cNt + 0.2);
    tr.op(S("pick"), 1, cNt + 0.4, 0.3); pickTo(-150, 0, cNt + 0.4, 0.3, "power2.out");
    tr.tf(S("cam"), tf({ px: 540, py: 1010, sx: 1.2, sy: 1.2 }), cHo, 2.5, "power1.inOut");
    IDX.forEach((i) => {
      const t = cHo + 0.2 + 0.1 * i;
      tr.tf(S(`up${i}`), `translate(${DX[i]} 0)`, t, 0.6); tr.tf(S(`axS${i}`), `translate(${DX[i]} 0)`, t, 0.6);
      tr.op(S(`axS${i}`), 0.7, t, 0.4); tr.op(S(`axP${i}`), 0.7, t, 0.4);
      tr.op(S(`axS${i}`), 0, cSpool, 0.3); tr.op(S(`axP${i}`), 0, cSpool, 0.3);
    });
    { // ghost: a picker sets the pins one at a time
      const k = gk(cGp, cSpool, 1.6), r = cGp + 1.6 * k;
      tr.op(S("tension"), 1, cGp, 0.1); tr.tf(S("tension-m"), "translate(0 0)", cGp, 0.15);
      tr.op(S("pick-n"), 0, cGp, 0.1); tr.op(S("pick-g"), 1, cGp, 0.1);
      q(cGp, (i) => { i.turn(4, cGp); i.ghostTint(cGp, r - cGp); }); red(0.28, cGp);
      ORDER.forEach((i, n) => setPin(i, cGp + (0.15 + 0.25 * n) * k, 0.08 * k, 0.1 * k, 0.07 * k, true));
      const a = cGp + 1.4 * k; lockOpen(60, -50, a, 0.3); q(a, (i) => i.turn(40, a));
      IDX.forEach((i) => tr.lift(i, 0, r, 0.3));
      pickTo(-600, 0, r, 0.3); tr.tf(S("tension-m"), "translate(-300 0)", r, 0.3); tr.op(S("tension"), 0, r + 0.1, 0.2);
      tr.op(S("pick-g"), 0, r, 0.1); tr.op(S("pick-n"), 1, r, 0.1);
      q(r, (i) => i.turn(0, r, 0.3)); lockOpen(0, 0, r, 0.3); red(0, r, 0.3);
    }
    IDX.forEach((i) => { const t = cSpool + 0.08 * i; tr.op(S(`st${i}-drv`), 0, t, 0.35); tr.op(S(`st${i}-spool`), 1, t, 0.35); tr.pulse(S(`st${i}-wY`), cSpool + 0.5 + 0.06 * i, 0.2, 0.2); });
    tr.op(S("tension2"), 1, cSpool + 0.5, 0.1); tr.tf(S("tension2-m"), "translate(0 0)", cSpool + 0.5, 0.25);
    pickTo(PX[0] - 330, 0, cSpool + 0.35, 0.2);
    [0, 1, 3, 4].forEach((i, j) => setPin(i, cSpool + 0.6 + 0.15 * j, 0.04, 0.06, 0.04, false));
    pickTo(PX[2] - 330, 0, cFs - 0.25, 0.2); pickTo(PX[2] - 330, -15, cFs, 0.25, "power2.out"); tr.lift(2, 15, cFs, 0.25);
    q(cFs, (i) => i.turn(12, cFs, 0.3));
    const wStops = w("b08", "stops.");
    q(wStops, (i) => i.turn(14, wStops, 0.08)); q(wStops + 0.08, (i) => i.turn(12, wStops + 0.08, 0.1));
    tr.flash(S("st2-spoolRed"), "red", wStops, 0.5);
    const wFake = w("b08", "fake");
    tr.tf(S("m-head"), tf({ r: -20, px: 24, py: -54 }), wFake, 0.25); tr.tf(S("m-head"), tf({ px: 24, py: -54 }), B8.end + 0.1, 0.25);

    // ---------------- b09 climax
    const B9 = B("b09"), cWk = c("wrong-key-blocked"), cPb = c("pick-blocked"), cRk = c("right-key-in"), cOp = c("plug-turns-bolt-opens");
    IDX.forEach((i) => { tr.lift(i, 0, B9.start, 0.3); tr.tf(S(`up${i}`), "translate(0 0)", B9.start, 0.4); });
    pickTo(-600, 0, B9.start, 0.3); tr.tf(S("tension2-m"), "translate(-300 0)", B9.start, 0.3); tr.op(S("tension2"), 0, B9.start + 0.15, 0.15);
    q(B9.start, (i) => i.turn(0, B9.start, 0.3));
    tr.tf(S("cam"), tf(), B9.start, 0.5);
    tr.op(S("mkey"), 1, cWk - 0.5, 0.05); tr.ride(S("mkey"), IDX, VWRONG, -900, 0, cWk - 0.5, 0.8);
    tr.flash(S("st3-kpRed"), "red", cWk + 0.3, 0.7); q(cWk + 0.3, (i) => i.jam(cWk + 0.3));
    const wS1 = w("b09", "stuck.", 1) + 0.4;
    tr.ride(S("mkey"), IDX, VWRONG, 0, -900, wS1, 0.4); tr.op(S("mkey"), 0, wS1 + 0.4, 0.05);
    tr.op(S("tension2"), 1, cPb - 0.2, 0.1); tr.tf(S("tension2-m"), "translate(0 0)", cPb - 0.2, 0.15); pickTo(PX[0] - 330, 0, cPb - 0.2, 0.2);
    [0, 1, 3, 4].forEach((i, j) => setPin(i, cPb + 0.1 * j, 0.03, 0.05, 0.02, false));
    pickTo(PX[2] - 330, 0, cPb + 0.4, 0.05); pickTo(PX[2] - 330, -15, cPb + 0.45, 0.25, "power2.out"); tr.lift(2, 15, cPb + 0.45, 0.25);
    q(cPb + 0.5, (i) => i.turn(12, cPb + 0.5, 0.3));
    const wS2 = w("b09", "stuck.", 2);
    tr.flash(S("st2-spoolRed"), "red", wS2, 0.5); q(wS2, (i) => i.turn(14, wS2, 0.08)); q(wS2 + 0.08, (i) => i.turn(12, wS2 + 0.08, 0.1));
    const tD = wS2 + 0.3;
    IDX.forEach((i) => tr.lift(i, 0, tD, 0.3));
    pickTo(-600, 0, tD, 0.3); tr.tf(S("tension2-m"), "translate(-300 0)", tD, 0.3); tr.op(S("tension2"), 0, tD + 0.15, 0.15);
    q(tD, (i) => i.turn(0, tD, 0.3));
    const lightR = LT(ctx.world, "tense", "sunset", cRk, 1.0);
    hopTo(-140, cRk);
    const wFive = w("b09", "five"), rStart = wFive - cRk >= 0.6 ? cRk : wFive - 0.6;
    tr.op(S("key"), 1, rStart, 0.05); tr.ride(S("key"), IDX, V, -900, 0, rStart, wFive - rStart);
    const wGaps = w("b09", "gaps");
    tr.op(S("seamGlow"), 1, wGaps, 0.25);
    IDX.forEach((i) => tr.op(S(`tick${i}`), 1, wGaps + 0.06 * i, 0.15));
    q(wGaps, (i) => { i.align(true, wGaps); i.flash("yellow", wGaps + 0.05); });
    q(cOp, (i) => i.turn(90, cOp, 0.4)); lockOpen(60, -100, cOp, 0.4);
    tr.emit(S("clickRing"), { opacity: 1, attr: { r: 20 } }, { opacity: 0, attr: { r: 70 }, duration: 0.45, ease: "power2.out" }, cOp);

    // flush inset events in time order
    Q.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, , fn]) => fn(inset));

    // ---------------- markup
    const keys = keySvg("s2-key", V) + keySvg("s2-mkey", VWRONG, { shiny: true });
    const tools =
      screwdriver("s2-sd") + stick("s2-stick") + twig("s2-twig") + drill("s2-drill") + tensionG("s2-tension") + tensionN("s2-tension2") + pick("s2-pick") +
      cutLine("s2-cutLine") + IDX.map((i) => tick(`s2-tick${i}`, PX[i])).join("") + IDX.map((i) => `<circle id="s2-pop${i}" cx="${PX[i]}" cy="${SEAM}" r="8" style="fill:none;stroke:var(--ui-yellow);stroke-width:4;opacity:0"/>`).join("") + fa1.svg + fa2.svg;
    const lockMarkup = lock.replace("@@KEYS@@", keys).replace("@@TOOLS@@", tools);
    const mp = magpie({ id: "s2-m", x: -140, y: 1215, s: 1.25 });
    const html = stage(
      sky({ horizonY: 1500 }) + plank(true) +
      `<g id="s2-cam" transform="${tf()}"><g id="s2-lock" transform="${tf({ px: 540, py: 1000, sx: 0.94, sy: 0.94 })}" style="opacity:0">${lockMarkup}</g></g>` +
      `<g id="s2-egypt">${eg.svg}</g>` + mp.svg,
    );
    const tlOut = [L.join("\n"), fa1.tl, fa2.tl, eg.tl(egEnd), lightL, lightR].join("\n");
    const mt = (...pairs) => pairs.map(([t, value]) => (value == null ? { t } : { t, value }));
    return {
      html, tl: tlOut,
      anchors: {
        plug: { card: { x: 40, y: 610 }, target: { x: 420, y: 1025 }, at: cPlug },
        pin: { card: { x: 40, y: 610 }, target: { x: 540, y: 1010 }, at: cPin + 0.3 },
        "shear-line": { card: { x: 40, y: 610 }, target: { x: 720, y: 1010 }, at: cGl },
        "key-cuts": { card: { x: 40, y: 610 }, target: { x: 420, y: 1120 }, at: cKey },
        "rounded-tip": { card: { x: 40, y: 610 }, target: { x: 300, y: 1164 }, at: cTr },
        spool: { card: { x: 40, y: 610 }, target: { x: 540, y: 1028 }, at: cSpool + 0.3 },
        egypt: { x: 270, y: 900, at: cEg },
      },
      overlays: {
        b02: { meter: mt([cPlug]) }, b03: { meter: mt([cPin]) }, b04: { meter: mt([cGl]) }, b05: { meter: mt([cSpr]) },
        b06: { meter: mt([cFive]) }, b07: { meter: mt([cTr]) },
        b08: { stepAt: cSpool, meter: mt([cGp, 50], [cSpool]) },
        b09: { stepAt: cRk, meter: mt([cOp]) },
      },
    };
  },
};

// ------------------------------------------------------------------ s3 recap (b10)
const s3 = {
  id: "s3", beats: ["b10"], light: "day",
  render(ctx) {
    const L = [], tr = tracker(L);
    const lock = lockSvg("s3", { state: "final" }).replace("@@KEYS@@", "").replace("@@TOOLS@@", "");
    const sel = (n) => IDX.map((i) => `#s3-${n}`.replace("#s3-", `#s3-`) + "").map((s, i) => s);
    const groups = [
      [`#s3-st2-stY`], [`#s3-seamGlow`], IDX.map((i) => `#s3-spY${i}`), IDX.map((i) => `#s3-st${i}-stY`), IDX.map((i) => `#s3-st${i}-kpY`), IDX.map((i) => `#s3-st${i}-wY`),
    ];
    groups.forEach((g, k) => {
      const t = ctx.t0 + 0.15 + 0.4 * k;
      for (const s of g) { tr.emit(s, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, t); tr.emit(s, { opacity: 1 }, { opacity: 0.35, duration: 0.15, ease: "none" }, t + 0.15); }
    });
    const html = stage(sky({ horizonY: 1500 }) + plank(false) + `<g transform="translate(0 -180)">${lock}</g>`);
    return { html, tl: L.join("\n"), anchors: {} };
  },
};

// ------------------------------------------------------------------ s4 ending (b11)
const s4 = {
  id: "s4", beats: ["b11"], light: "sunset",
  render(ctx) {
    const L = [], tr = tracker(L);
    const t0 = ctx.t0, wBuild = ctx.word("b11", "build"), wTumbler = ctx.word("b11", "tumbler");
    const house = houseFront({ id: "s4-house" });
    const p = puppet({ id: "s4-p", x: 980, y: 1520, s: 3.0, flip: true, jacket: "water" });
    p.pose("holdKey", t0, 0.01); p.pose("stand", wTumbler, 0.35);
    const m = magpie({ id: "s4-m", x: 0, y: 0, s: 1.5 });
    tr.tf("#s4-cam", tf(), t0, 1.0, "power2.inOut"); tr.init("#s4-cam", "t", ZOOM);
    tr.init("#s4-house-door", "t", tf({ px: 330, py: 1140 }));
    tr.tf("#s4-house-door", tf({ px: 330, py: 1140, sx: 0.2 }), wBuild, 0.8, "power2.inOut");
    tr.init("#s4-mw", "t", "translate(760 600)");
    tr.tf("#s4-mw", "translate(368 760)", wBuild + 0.4, 0.5, "power2.out");
    const light = LT(ctx.world, "sunset", "day", t0, 1.5);
    const html = stage(
      `<g id="s4-cam" transform="${ZOOM}">${sky({ horizonY: 400 })}${sun({ cx: 880, cy: 210, r: 60 })}${house.svg}${p.svg}` +
      `<g id="s4-mw" transform="translate(760 600)">${m.svg}${bottleCap("s4-cap", 102, -81)}</g></g>`,
    );
    return { html, tl: [p.tl(), L.join("\n"), light].join("\n"), anchors: { title: { x: 540, y: 640, at: t0 + 1.0 } } };
  },
};

export const scenes = [s1, s2, s3, s4];
export default scenes;

export const extras = [
  { id: "inset", from: "b02", to: "b09", render: () => ({ html: INSET.html, css: INSET.css, tl: INSET.tl() }) },
  {
    id: "recap", from: "b10", to: "b10",
    render(ctx) {
      const items = ctx.script.beats.filter((b) => b.type === "step").map((b) => b.onScreen.stepPlate);
      const r = RecapPills({ id: "ex-recap-p", items, cols: 1, colW: 700, x0: 190, y0: 1080, rowH: 84, at: ctx.t0 + 0.15, step: 0.4, dur: ctx.dur - 0.15 });
      if (r.overflow) console.warn("WARN: recap pill text overflow — shorten the step plate strings");
      return { html: r.html, css: r.css, tl: r.tl };
    },
  },
];
