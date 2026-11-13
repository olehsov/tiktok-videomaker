import { W, CAPTION_Y, UI_HEX } from "../layout.mjs";
import { fitFont } from "../measure.mjs";
import { num } from "../look.mjs";
import { esc } from "../lowpoly.mjs";
import { r3, clipAttrs } from "./_anim.mjs";

const BAND_H = 220;
const CSS = `
.kit-cap{z-index:10;left:0;width:${W}px;height:${BAND_H}px;display:flex;align-items:center;justify-content:center;pointer-events:none}
.kit-cap-inner{display:flex;gap:0.28em;white-space:nowrap;font-family:var(--font-ui);font-weight:900;text-transform:none;text-shadow:var(--text-shadow);-webkit-text-stroke:11px rgba(14,20,32,.92);paint-order:stroke fill;stroke-linejoin:round;letter-spacing:.01em;line-height:1.1}
.kit-cap-w{color:var(--text-muted)}
`;

/** Lowercase, strip edge punctuation, NFC: the one normalisation used for cues and keywords. */
export const norm = (s) => s.normalize("NFC").toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** Mark word indexes covered by a keyword phrase (consecutive words, all occurrences). */
function markKeywords(words, keywords) {
  const colors = new Array(words.length).fill(null);
  const toks = words.map((w) => norm(w.text));
  for (const kw of keywords || []) {
    const ks = kw.text.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i + ks.length <= toks.length; i++) {
      if (ks.every((k, j) => toks[i + j] === k)) for (let j = 0; j < ks.length; j++) colors[i + j] = kw.color;
    }
  }
  return colors;
}

/** Split words into groups of 2–4 on sentence punctuation / pauses. */
function group(words) {
  const groups = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push(i);
    const next = words[i + 1];
    const endsClause = /[.!?,;:—…]$/.test(w.text);
    const pause = next && next.start - w.end > 0.35;
    const len = cur.reduce((n, j) => n + words[j].text.length + 1, 0);
    const tooLong = next && cur.length >= 2 && len + next.text.length > 20;
    if (tooLong || cur.length >= 4 || (cur.length >= 2 && endsClause) || (cur.length >= 1 && pause && cur.length >= 2) || !next) {
      groups.push(cur);
      cur = [];
    }
  });
  // no 1-word groups when they can be merged into the previous group
  for (let g = groups.length - 1; g > 0; g--) {
    if (groups[g].length === 1 && groups[g - 1].length < 4) { groups[g - 1] = groups[g - 1].concat(groups[g]); groups.splice(g, 1); }
  }
  return groups;
}

/**
 * Karaoke captions from word timings.
 * beats: [{ words:[{text,start,end}], keywords:[{text,color}] }]  → { html, css, tl, count, overflow }
 * 2–4 words per group, UPPERCASE, centered at 70 % height, font auto-fit to ≤ 90 % width.
 * Upcoming words are muted grey; each word turns white (or its keyword color / yellow for numbers) at its start.
 */
export function KaraokeCaption({ id = "cap", beats, lang = "en", endAt }) {
  const all = [];
  for (const b of beats) {
    if (!b.words?.length) continue;
    const colors = markKeywords(b.words, b.keywords);
    for (const g of group(b.words)) all.push({ words: g.map((i) => ({ ...b.words[i], color: colors[i] })) });
  }
  let html = "", tl = "", overflow = false;
  all.forEach((g, gi) => {
    const start = Math.max(0, g.words[0].start - 0.04);
    const nextStart = all[gi + 1]?.words[0].start - 0.04;
    const stop = g.words[g.words.length - 1].end + 0.35;
    const end = Math.min(nextStart ?? endAt ?? stop, Math.max(stop, start + 0.35), endAt ?? Infinity);
    const dur = Math.max(0.3, end - start);
    const text = g.words.map((w) => w.text.toLocaleUpperCase(lang)).join(" ");
    const fit = fitFont(text, { maxWidth: W * 0.9, max: num("caption-size-max", 96), min: num("caption-size-min", 56) });
    overflow ||= fit.overflow;
    const gid = `${id}${gi}`;
    html += `<div id="${gid}" ${clipAttrs(start, dur, 9, "kit-cap")} style="top:${Math.round(CAPTION_Y - BAND_H / 2)}px"><div id="${gid}-i" class="kit-cap-inner" style="font-size:${fit.size}px;opacity:0">` +
      g.words.map((w, wi) => `<span id="${gid}w${wi}" class="kit-cap-w">${esc(w.text.toLocaleUpperCase(lang))}</span>`).join("") + `</div></div>`;
    tl += `${tl ? "\n" : ""}tl.fromTo("#${gid}-i", {opacity:0}, {opacity:1, duration:0.05, ease:"none"}, ${r3(start)});`;
    g.words.forEach((w, wi) => {
      const target = w.color ? UI_HEX[w.color] : /\d/.test(w.text) ? UI_HEX.yellow : UI_HEX.white;
      tl += `\ntl.fromTo("#${gid}w${wi}", {color:"${UI_HEX.muted}"}, {color:"${target}", duration:0.06, ease:"none", immediateRender:false}, ${r3(Math.max(start, w.start))});`;
    });
  });
  return { html, css: CSS, tl, count: all.length, overflow };
}
