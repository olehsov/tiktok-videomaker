import { W, PLATE_Y } from "../layout.mjs";
import { LOOK, num } from "../look.mjs";
import { fitFont, textWidth } from "../measure.mjs";
import { esc } from "../lowpoly.mjs";
import { pop, clipAttrs } from "./_anim.mjs";

const S = LOOK.uiScale;
const PILL_H = Math.round(96 * S), PAD = Math.round(44 * S);
const CSS = `
.kit-pill{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:${PILL_H / 2}px;color:var(--ui-white);font-family:var(--font-ui);font-weight:900;letter-spacing:.02em;white-space:nowrap;box-shadow:var(--shadow-ui)}
.kit-pill-green{background:var(--ui-green)}
.kit-pill-red{background:var(--ui-red)}
`;

/** Shared pill for StepBadge / ThreatBadge. Text comes from the script (already contains ✓ / ⚠). */
export function Pill({ id, text, tone, at, dur, y = PLATE_Y }) {
  const label = text.toLocaleUpperCase();
  const { size, overflow } = fitFont(label, { maxWidth: W - 2 * 70 - 2 * PAD, max: Math.max(46, num("plate-size", 46)), min: 36 });
  const width = Math.min(W - 140, Math.ceil(textWidth(label, size) + 2 * PAD));
  const left = Math.round((W - width) / 2);
  const html = `<div id="${id}" ${clipAttrs(at, dur)} style="left:${left}px;top:${Math.round(y - PILL_H / 2)}px;width:${width}px;height:${PILL_H}px"><div id="${id}-i" class="kit-pill kit-pill-${tone}" style="font-size:${size}px;opacity:0">${esc(label)}</div></div>`;
  return { html, css: CSS, tl: pop(`#${id}-i`, at, dur), overflow };
}
