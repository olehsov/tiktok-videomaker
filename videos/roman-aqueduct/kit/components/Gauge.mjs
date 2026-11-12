import { fitFont, textWidth } from "../measure.mjs";
import { esc } from "../lowpoly.mjs";
import { pop, r3, clipAttrs } from "./_anim.mjs";

const CSS = `
.kit-gauge{display:flex;align-items:center;gap:16px;height:104px;padding:0 28px 0 18px;border-radius:52px;background:rgba(14,22,36,.82);color:#fff;font-family:var(--font-ui);font-weight:900;letter-spacing:.02em;white-space:nowrap;box-shadow:0 6px 18px rgba(10,16,28,.3)}
`;

/** Thermometer + value text. { id, text, x, y (top-left), level 0..1, tone:'heat'|'cold', at, dur } */
export function Gauge({ id, text, x, y, level = 0.8, tone = "heat", icon = "thermo", at, dur }) {
  const label = text.toLocaleUpperCase();
  const { size, overflow } = fitFont(label, { maxWidth: 420, max: 40, min: 24 });
  const w = Math.ceil(textWidth(label, size) + 18 + 28 + 40 + 16);
  const color = tone === "cold" ? "#3BA3FF" : "#FF6A3D";
  const tubeTop = 14, tubeH = 54;
  const lvl = Math.round(tubeH * level);
  const dropIcon = `<svg width="40" height="84" viewBox="0 0 40 84"><polygon points="20,10 31,36 33,50 28,62 20,66 12,62 7,50 9,36" fill="${color}"/><polygon points="14,40 18,30 17,48" fill="#fff" opacity=".5"/></svg>`;
  const thermo = `<svg width="40" height="84" viewBox="0 0 40 84"><rect x="14" y="${tubeTop}" width="12" height="${tubeH}" rx="6" fill="#fff" opacity=".9"/><rect id="${id}-hg" x="16.5" y="${tubeTop + tubeH - lvl}" width="7" height="${lvl}" rx="3.5" fill="${color}"/><circle cx="20" cy="68" r="12" fill="${color}"/></svg>`;
  const html =
    `<div id="${id}" ${clipAttrs(at, dur)} style="left:${x}px;top:${y}px;width:${w}px;height:104px"><div id="${id}-i" class="kit-gauge" style="opacity:0;width:100%">` +
    `${icon === "drop" ? dropIcon : thermo}<span style="font-size:${size}px">${esc(label)}</span></div></div>`;
  const tl = pop(`#${id}-i`, at, dur) + (icon === "drop" ? "" :
    `\ntl.fromTo("#${id}-hg", {attr:{y:${tubeTop + tubeH}, height:0}}, {attr:{y:${tubeTop + tubeH - lvl}, height:${lvl}}, duration:0.6, ease:"power2.out"}, ${r3(at + 0.1)});`);
  return { html, css: CSS, tl, width: w, overflow };
}
