// Small deterministic colour maths shared by tools/apply-look.mjs and lighting.mjs (no dependencies).
export const SCENE_TOKENS = ["bg-sky-day", "bg-sky-night", "bg-sky-night-2", "bg-sky-tense-2", "bg-sky-sunset", "bg-sky-sunset-2", "sky-2",
  "earth-1", "earth-2", "earth-3", "sand", "stone", "snow", "green-dark", "green-mid", "wood", "water"];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const rgb2hex = (c) => "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("").toUpperCase();
export const mixRgb = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);
/** Mix two hex colours (t = share of b). */
export const mixHex = (a, b, t) => rgb2hex(mixRgb(hex2rgb(a), hex2rgb(b), t));

export function rgb2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
export function hsl2rgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/**
 * Scene-colour look: saturation (HSL s ×), lightness (HSL l ×, capped at maxLightness), contrast (RGB around mid grey),
 * temperature (−1 cool … +1 warm). Stages whose factor is neutral are skipped, so neutral values return the input unchanged.
 */
export function adjust(hex, { saturation = 1, lightness = 1, maxLightness = 0.94, contrast = 1, temperature = 0 } = {}) {
  let rgb = hex2rgb(hex);
  const neutral = saturation === 1 && lightness === 1 && contrast === 1 && temperature === 0;
  if (neutral) return hex.toUpperCase();
  if (saturation !== 1 || lightness !== 1) {
    let [h, s, l] = rgb2hsl(rgb);
    s = clamp(s * saturation);
    if (lightness !== 1) l = clamp(l * lightness);
    if (lightness > 1) l = Math.min(l, Math.max(maxLightness, rgb2hsl(rgb)[2])); // never lighten past the cap (already-light colours stay)
    rgb = hsl2rgb([h, s, l]);
  }
  if (contrast !== 1) rgb = rgb.map((v) => (clamp((v / 255 - 0.5) * contrast + 0.5)) * 255);
  if (temperature !== 0) rgb = [rgb[0] + temperature * 14, rgb[1] + temperature * 2, rgb[2] - temperature * 14];
  return rgb2hex(rgb);
}

/** Lighting grade: darken (0..1) then shift toward `to` (amt 0..1). */
export const grade = (hex, { dark = 0, to = "#1B2A55", amt = 0 }) => rgb2hex(mixRgb(hex2rgb(hex).map((v) => v * (1 - dark)), hex2rgb(to), amt));
export const tintHex = (hex, p, target = "#FFFFFF") => mixHex(hex, target, p / 100);
export const shadeHex = (hex, p, target = "#0B1220") => mixHex(hex, target, p / 100);
export const dist = (a, b) => Math.hypot(...hex2rgb(a).map((v, i) => v - hex2rgb(b)[i]));
