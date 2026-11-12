import { fitFont, textWidth } from "../measure.mjs";
import { LOOK, num } from "../look.mjs";
import { esc } from "../lowpoly.mjs";
import { pop, r3, clipAttrs } from "./_anim.mjs";

const S = LOOK.uiScale;
const CSS = `
.kit-gauge{display:flex;align-items:center;gap:16px;height:${Math.round(104 * S)}px;padding:0 28px 0 18px;border-radius:${Math.round(52 * S)}px;background:var(--panel-bg-strong);color:var(--ui-white);font-family:var(--font-ui);font-weight:900;letter-spacing:.02em;white-space:nowrap;box-shadow:var(--shadow-ui)}
`;

/** Thermometer + value text. { id, text, x, y (top-left), level 0..1, tone:'heat'|'cold', at, dur } */
export function Gauge({ id, text, x, y, level = 0.8, tone = "heat", at, dur }) {
  const label = text.toLocaleUpperCase();
  const { size, overflow } = fitFont(label, { maxWidth: 420, max: num("gauge-size", 40), min: 24 });
  const w = Math.ceil(textWidth(label, size) + 18 + 28 + 40 + 16);
  const color = tone === "cold" ? "var(--ui-blue)" : "var(--ui-heat)";
  const tubeTop = 14, tubeH = 54;
  const lvl = Math.round(tubeH * level);
  const html =
    `<div id="${id}" ${clipAttrs(at, dur)} style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(104 * S)}px"><div id="${id}-i" class="kit-gauge" style="opacity:0;width:100%">` +
    `<svg width="40" height="84" viewBox="0 0 40 84"><rect x="14" y="${tubeTop}" width="12" height="${tubeH}" rx="6" style="fill:var(--ui-white)" opacity=".9"/>` +
    `<rect id="${id}-hg" x="16.5" y="${tubeTop + tubeH - lvl}" width="7" height="${lvl}" rx="3.5" style="fill:${color}"/>` +
    `<circle cx="20" cy="68" r="12" style="fill:${color}"/></svg><span style="font-size:${size}px">${esc(label)}</span></div></div>`;
  const tl = pop(`#${id}-i`, at, dur) +
    `\ntl.fromTo("#${id}-hg", {attr:{y:${tubeTop + tubeH}, height:0}}, {attr:{y:${tubeTop + tubeH - lvl}, height:${lvl}}, duration:0.6, ease:"power2.out"}, ${r3(at + 0.1)});`;
  return { html, css: CSS, tl, width: w, overflow };
}
