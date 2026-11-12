// Lighting presets: recolor a whole scene by overriding palette CSS variables on its "world" element.
// day = neutral; night = deep navy (scene colors ~35% darker, shifted blue); tense = navy, lighter than night; sunset = warm sky.
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);
export function grade(hex, { dark = 0, to = "#1B2A55", amt = 0 }) {
  const c = hex2rgb(hex).map((v) => v * (1 - dark));
  return rgb2hex(mix(c, hex2rgb(to), amt));
}

export const BASE = {
  sky: "#9FB3BF", "sky-2": "#B8C7CF",
  "earth-1": "#8A6E52", "earth-2": "#6B5440", "earth-3": "#4E3D2F",
  sand: "#B9A68A", stone: "#8C9196", snow: "#E3E8EC",
  "green-dark": "#3F5A4A", "green-mid": "#56735F", wood: "#7A5A3E", water: "#5E8FA3", tile: "#A8705E",
};
const SCENE_KEYS = Object.keys(BASE).filter((k) => !k.startsWith("sky"));
const graded = (opts) => Object.fromEntries(SCENE_KEYS.map((k) => [k, grade(BASE[k], opts)]));

export const PRESETS = {
  day: { ...BASE },
  night: { ...graded({ dark: 0.35, amt: 0.22 }), sky: "#1E2A3D", "sky-2": "#2A3A52" },
  tense: { ...graded({ dark: 0.22, amt: 0.14 }), sky: "#1E2A3D", "sky-2": "#2F4058" },
  harsh: { ...graded({ dark: -0.06, to: "#E0C890", amt: 0.12 }), sky: "#BFC4B4", "sky-2": "#DCD3AE" },
  overcast: { ...graded({ dark: 0.12, to: "#6B7580", amt: 0.18 }), sky: "#7F8C95", "sky-2": "#97A3AB" },
  sunset: { ...graded({ dark: 0.06, to: "#C9855A", amt: 0.10 }), sky: "#B58F7E", "sky-2": "#D7A67E" },
};

const vars = (name) => {
  const p = PRESETS[name];
  if (!p) throw new Error(`unknown lighting preset '${name}' (have: ${Object.keys(PRESETS).join(", ")})`);
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [`--${k}`, v]));
};
/** Inline style string that sets a preset on an element. */
export const lightingStyle = (name) => Object.entries(vars(name)).map(([k, v]) => `${k}:${v}`).join(";");
/** GSAP code (string) that blends the world from one preset to another. Call after the world exists. */
export function lightTween(sel, from, to, at, dur, ease = "power1.inOut", immediateRender = true) {
  const extra = immediateRender ? {} : { immediateRender: false };
  return `tl.fromTo(${JSON.stringify(sel)}, ${JSON.stringify(vars(from))}, ${JSON.stringify({ ...vars(to), duration: dur, ease, ...extra })}, ${at});`;
}
