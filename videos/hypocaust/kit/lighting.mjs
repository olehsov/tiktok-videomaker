// Lighting presets: recolor a whole scene by overriding palette CSS variables on its "world" element.
// day = the tokens as generated (look applied); night = deep navy (scene colors darkened by --night-darkness and shifted blue by --night-blue);
// tense = navy, lighter than night; sunset = warm sky. Every colour is derived from tokens.css, nothing is hard-coded here.
import { tok, LOOK } from "./look.mjs";
import { grade } from "./color.mjs";

const SCENE_KEYS = ["earth-1", "earth-2", "earth-3", "sand", "stone", "snow", "green-dark", "green-mid", "wood", "water"];
export const BASE = { sky: tok("bg-sky-day"), "sky-2": tok("sky-2"), ...Object.fromEntries(SCENE_KEYS.map((k) => [k, tok(k)])) };
const graded = (opts) => Object.fromEntries(SCENE_KEYS.map((k) => [k, grade(BASE[k], opts)]));
// neutral look (night-darkness .35, night-blue .5) reproduces the original grades: night dark .35 / amt .22, tense dark .22 / amt .14
const nd = LOOK.nightDarkness, nb = LOOK.nightBlue, tint = tok("night-tint");

export const PRESETS = {
  day: { ...BASE },
  night: { ...graded({ dark: nd, to: tint, amt: nb * 0.44 }), sky: tok("bg-sky-night"), "sky-2": tok("bg-sky-night-2") },
  tense: { ...graded({ dark: nd * 0.63, to: tint, amt: nb * 0.28 }), sky: tok("bg-sky-night"), "sky-2": tok("bg-sky-tense-2") },
  sunset: { ...graded({ dark: 0.06, to: tok("sunset-tint"), amt: 0.10 }), sky: tok("bg-sky-sunset"), "sky-2": tok("bg-sky-sunset-2") },
};

const vars = (name) => {
  const p = PRESETS[name];
  if (!p) throw new Error(`unknown lighting preset '${name}' (have: ${Object.keys(PRESETS).join(", ")})`);
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [`--${k}`, v]));
};
/** Inline style string that sets a preset on an element. */
export const lightingStyle = (name) => Object.entries(vars(name)).map(([k, v]) => `${k}:${v}`).join(";");
/** GSAP code (string) that blends the world from one preset to another. Call after the world exists. */
export function lightTween(sel, from, to, at, dur, ease = "power1.inOut") {
  return `tl.fromTo(${JSON.stringify(sel)}, ${JSON.stringify(vars(from))}, ${JSON.stringify({ ...vars(to), duration: dur, ease, immediateRender: false })}, ${at});`;
}
