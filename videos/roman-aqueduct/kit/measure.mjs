// Build-time text measurement (no browser, no font loading → deterministic).
// Widths are conservative estimates for Inter; Cyrillic is wider. Used to auto-fit text in every language.
const NARROW = new Set("ijl|!.,:;'`’’".split(""));
const MEDIUM_NARROW = new Set("frt()[]-·".split(""));
const WIDE = new Set("mwMW@%".split(""));

function charEm(ch) {
  if (ch === " ") return 0.28;
  if (/[0-9]/.test(ch)) return 0.66;
  if (/[Ѐ-ӿ]/.test(ch)) return ch === ch.toUpperCase() ? 0.76 : 0.64;
  if (NARROW.has(ch)) return ch === "I" ? 0.36 : 0.30;
  if (ch === "I") return 0.36;
  if (MEDIUM_NARROW.has(ch)) return 0.40;
  if (WIDE.has(ch)) return ch === ch.toUpperCase() ? 1.0 : 0.92;
  if (/[A-Z]/.test(ch)) return 0.72;
  if (/[a-z]/.test(ch)) return 0.60;
  return 0.75; // symbols such as ✓ ⚠ °
}
const WEIGHT = { 400: 0.9, 700: 0.96, 900: 1 };

export function textWidth(str, size, { weight = 900, letterSpacing = 0 } = {}) {
  let em = 0;
  for (const ch of str) em += charEm(ch) * (WEIGHT[weight] ?? 1) + letterSpacing;
  return em * size * 1.04;
}

/** Largest font size in [min,max] that fits one line in maxWidth (shrinks below min rather than overflow). */
export function fitFont(str, { maxWidth, max, min, weight = 900, letterSpacing = 0 }) {
  const w1 = textWidth(str, 1, { weight, letterSpacing });
  const fit = maxWidth / w1;
  if (fit >= max) return { size: max, overflow: false };
  if (fit >= min) return { size: Math.floor(fit), overflow: false };
  return { size: Math.max(Math.floor(fit), Math.floor(min * 0.6)), overflow: fit < min * 0.6 };
}

export function wrap(str, size, maxWidth, opts = {}) {
  const words = str.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (!cur || textWidth(next, size, opts) <= maxWidth) cur = next;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Fit text into at most maxLines lines: shrinks the font from max to min, then below min if still too long. */
export function fitLines(str, { maxWidth, max, min, maxLines = 2, weight = 900, letterSpacing = 0 }) {
  const floor = Math.floor(min * 0.6);
  for (let size = max; size >= floor; size -= 2) {
    const lines = wrap(str, size, maxWidth, { weight, letterSpacing });
    if (lines.length <= maxLines && lines.every((l) => textWidth(l, size, { weight, letterSpacing }) <= maxWidth)) {
      return { size, lines, overflow: false };
    }
  }
  return { size: floor, lines: wrap(str, floor, maxWidth, { weight, letterSpacing }), overflow: true };
}
