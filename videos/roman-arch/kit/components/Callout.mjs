import { W, H } from "../layout.mjs";
import { LOOK, num } from "../look.mjs";
import { fitFont, fitLines, textWidth } from "../measure.mjs";
import { esc } from "../lowpoly.mjs";
import { pop, fade, clipAttrs } from "./_anim.mjs";

const S = LOOK.uiScale;
const CARD_W0 = Math.round(640 * S), PAD_L = Math.round(36 * S), PAD_R = Math.round(28 * S), PAD_Y = Math.round(22 * S), BAR = Math.round(10 * S);
const CSS = `
.kit-callout{left:0;top:0;width:${W}px;height:${H}px;pointer-events:none}
.kit-callout-card{position:absolute;background:var(--ui-white);border-radius:14px;box-shadow:var(--shadow-card);overflow:hidden;font-family:var(--font-ui);color:var(--ui-ink)}
.kit-callout-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:${BAR}px;background:var(--ui-yellow)}
.kit-callout-title{font-weight:900;white-space:nowrap;letter-spacing:.01em}
.kit-callout-sub{font-weight:700;color:var(--ui-ink-soft);margin-top:6px}
.kit-callout-svg{position:absolute;left:0;top:0}
.kit-label{font-family:var(--font-ui);font-weight:900;color:var(--ui-white);white-space:nowrap;letter-spacing:.02em}
.kit-label-i{display:block;background:var(--panel-bg);border-radius:10px;padding:6px 16px}
`;

/**
 * Callout card with a dashed leader to a target point.
 * { id, title, subtitle, card:{x,y} (top-left), target:{x,y}, at, dur }
 * Title ≤ 1 line (font shrinks), subtitle ≤ 2 lines. Height is computed so nothing overflows.
 */
export function Callout({ id, title, subtitle = "", card, target, at, dur, width }) {
  const CARD_W = width ? Math.round(width) : CARD_W0;
  const inner = CARD_W - PAD_L - PAD_R;
  const t = fitFont(title.toLocaleUpperCase(), { maxWidth: inner, max: Math.max(44, num("callout-title-size", 38)), min: 36 });
  const sub = subtitle ? fitLines(subtitle, { maxWidth: inner, max: Math.max(40, num("callout-sub-size", 28)), min: 38, maxLines: 2, weight: 700 }) : null;
  const h = Math.ceil(PAD_Y * 2 + t.size * 1.2 + (sub ? 6 + sub.lines.length * sub.size * 1.28 : 0));
  // leader starts at the card-edge midpoint nearest the target
  const hasT = !!target;
  const cands = [[card.x, card.y + h / 2], [card.x + CARD_W, card.y + h / 2], [card.x + CARD_W / 2, card.y], [card.x + CARD_W / 2, card.y + h]];
  const d2 = ([x, y]) => (x - (target?.x ?? 0)) ** 2 + (y - (target?.y ?? 0)) ** 2;
  const [sx, sy] = hasT ? cands.reduce((a, b) => (d2(b) < d2(a) ? b : a)) : [0, 0];
  const html =
    `<div id="${id}" ${clipAttrs(at, dur, 3, "kit-callout")}>` +
    (hasT ? `<svg id="${id}-line" class="kit-callout-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="opacity:0">` +
    `<line x1="${sx}" y1="${sy}" x2="${target.x}" y2="${target.y}" style="stroke:var(--leader-halo)" stroke-width="8" stroke-linecap="round"/>` +
    `<line x1="${sx}" y1="${sy}" x2="${target.x}" y2="${target.y}" style="stroke:var(--ui-white)" stroke-width="4" stroke-dasharray="14 10" stroke-linecap="round"/>` +
    `<circle cx="${target.x}" cy="${target.y}" r="11" style="fill:var(--ui-yellow);stroke:var(--ui-white)" stroke-width="4"/></svg>` : "") +
    `<div id="${id}-card" class="kit-callout-card" style="left:${card.x}px;top:${card.y}px;width:${CARD_W}px;height:${h}px;padding:${PAD_Y}px ${PAD_R}px ${PAD_Y}px ${PAD_L}px;opacity:0">` +
    `<div class="kit-callout-title" style="font-size:${t.size}px;line-height:1.2">${esc(title.toLocaleUpperCase())}</div>` +
    (sub ? `<div class="kit-callout-sub" style="font-size:${sub.size}px;line-height:1.28">${sub.lines.map(esc).join("<br>")}</div>` : "") +
    `</div></div>`;
  const tl = pop(`#${id}-card`, at, dur) + (hasT ? "\n" + fade(`#${id}-line`, at + 0.08, dur - 0.08) : "");
  return { html, css: CSS, tl, height: h, width: CARD_W, overflow: t.overflow || !!sub?.overflow };
}

/** Small in-scene text tag (dimension lines, "16–20 in"). { id, text, x, y (center), at, dur, maxWidth=360, max=label-size, min=20 } */
export function Label({ id, text, x, y, at, dur, maxWidth = 640, max = Math.max(36, num("label-size", 30)), min = 36 }) {
  const { size } = fitFont(text, { maxWidth, max, min });
  const w = Math.ceil(textWidth(text, size) + 32);
  const html = `<div id="${id}" ${clipAttrs(at, dur, 3, "kit-label")} style="left:${Math.round(x - w / 2)}px;top:${Math.round(y - size)}px;width:${w}px;font-size:${size}px"><span id="${id}-i" class="kit-label-i" style="opacity:0">${esc(text)}</span></div>`;
  return { html, css: CSS, tl: pop(`#${id}-i`, at, dur) };
}
