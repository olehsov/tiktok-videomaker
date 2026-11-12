import { W } from "../layout.mjs";
import { fitLines } from "../measure.mjs";
import { esc } from "../lowpoly.mjs";

const CSS = `
.kit-cover{z-index:8;left:0;top:0;width:${W}px;height:1920px;pointer-events:none}
.kit-cover-shade{position:absolute;left:0;top:0;width:100%;height:760px;background:linear-gradient(180deg,var(--cover-shade-top),transparent)}
.kit-cover-h{position:absolute;left:100px;width:800px;top:300px;font-family:var(--font-ui);font-weight:900;color:var(--ui-white);text-shadow:var(--text-shadow);line-height:1.05;letter-spacing:.01em}
.kit-cover-bar{position:absolute;left:100px;width:180px;height:14px;border-radius:7px;background:var(--ui-yellow)}
`;

/**
 * Cover headline over the finished scene (static, for the cover snapshot).
 * Kept inside the safe zone: x 100–900, y ≥ 300. { id, headline, lang, start, dur }
 */
export function Cover({ id = "cover", headline, lang = "en", start, dur }) {
  const text = headline.toLocaleUpperCase(lang);
  const { size, lines, overflow } = fitLines(text, { maxWidth: 800, max: 128, min: 64, maxLines: 3 });
  const h = Math.ceil(lines.length * size * 1.05);
  const html = `<div id="${id}" class="clip kit-abs kit-cover" data-start="${start}" data-duration="${dur}" data-track-index="8"><div class="kit-cover-shade"></div>` +
    `<div class="kit-cover-h" style="font-size:${size}px">${lines.map(esc).join("<br>")}</div><div class="kit-cover-bar" style="top:${300 + h + 28}px"></div></div>`;
  return { html, css: CSS, tl: "", overflow };
}
