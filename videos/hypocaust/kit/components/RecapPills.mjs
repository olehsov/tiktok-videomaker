import { esc } from "../lowpoly.mjs";
import { fitFont } from "../measure.mjs";
import { pop, clipAttrs, r3 } from "./_anim.mjs";

/**
 * Green recap pills (like StepBadge), column-major, each popping in order and staying to the clip end.
 * RecapPills({ id, items:[text], x0=40, y0=1060, colW=440, rowH=80, cols=2, at, step=0.4, dur }) → { html, css, tl, overflow }
 */
export function RecapPills({ id, items, x0 = 40, y0 = 1060, colW = 440, rowH = 80, cols = 2, at, step = 0.4, dur }) {
  const rows = Math.ceil(items.length / cols);
  let overflow = false, tl = "";
  const pills = items.map((text, k) => {
    const label = text.toLocaleUpperCase();
    const fit = fitFont(label, { maxWidth: colW - 40, max: 40, min: 36 });
    if (fit.overflow || fit.size < 36) overflow = true;
    const col = Math.floor(k / rows), row = k % rows;
    tl += (tl ? "\n" : "") + pop(`#${id}-${k}`, at + k * step, dur - k * step, { exit: false });
    return `<div id="${id}-${k}" style="position:absolute;left:${x0 + col * (colW + 10)}px;top:${y0 + row * rowH}px;width:${colW}px;height:60px;border-radius:30px;background:var(--ui-green);color:var(--ui-white);display:flex;align-items:center;justify-content:center;font-family:var(--font-ui);font-weight:900;white-space:nowrap;font-size:${fit.size}px;box-shadow:var(--shadow-ui);opacity:0">${esc(label)}</div>`;
  }).join("");
  const html = `<div id="${id}" ${clipAttrs(at, dur, 2)} style="left:0;top:0;width:1080px;height:1920px">${pills}</div>`;
  return { html, css: "", tl, overflow };
}
