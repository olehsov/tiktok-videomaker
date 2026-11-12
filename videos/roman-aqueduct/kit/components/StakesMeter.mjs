import { fitFont } from "../measure.mjs";
import { esc } from "../lowpoly.mjs";
import { pop, r3, clipAttrs } from "./_anim.mjs";

const CSS = `
.kit-meter{font-family:var(--font-ui);color:#fff}
.kit-meter-label{display:inline-block;padding:4px 16px;border-radius:12px;background:rgba(14,22,36,.78);font-weight:900;letter-spacing:.06em;white-space:nowrap}
.kit-meter-track{margin-top:8px;height:28px;border-radius:14px;background:rgba(14,22,36,.72);border:3px solid rgba(255,255,255,.85);overflow:hidden}
.kit-meter-fill{height:100%;width:100%;border-radius:11px;transform-origin:0 50%}
`;
const TONES = { yellow: "#F5C518", blue: "#3BA3FF", green: "#2FA84F", red: "#E5484D", heat: "#FF6A3D" };

/**
 * Corner meter (e.g. "ICE SUPPLY"). { id, label, x, y, w, keyframes:[{t,value}], at, dur, tone, exit }
 * The fill scales to value/100 at each keyframe time (0.6 s ease). Persists to the end of its clip unless exit:true.
 */
export function StakesMeter({ id, label, x, y, w = 460, keyframes, at, dur, tone = "yellow", exit = false }) {
  const text = label.toLocaleUpperCase();
  const { size } = fitFont(text, { maxWidth: w - 32, max: 38, min: 32, letterSpacing: 0.06 });
  const first = keyframes[0]?.value ?? 0;
  const html =
    `<div id="${id}" ${clipAttrs(at, dur)} style="left:${x}px;top:${y}px;width:${w}px;height:84px"><div id="${id}-i" class="kit-meter" style="opacity:0;width:${w}px">` +
    `<div class="kit-meter-label" style="font-size:${size}px">${esc(text)}</div>` +
    `<div class="kit-meter-track"><div id="${id}-fill" class="kit-meter-fill" style="background:${TONES[tone]};transform:scaleX(${first / 100})"></div></div></div></div>`;
  let tl = pop(`#${id}-i`, at, dur, { exit });
  let prev = first;
  for (const k of keyframes) {
    if (k.value === prev) continue;
    tl += `\ntl.fromTo("#${id}-fill", {scaleX:${prev / 100}}, {scaleX:${k.value / 100}, duration:0.6, ease:"power2.inOut", immediateRender:false}, ${r3(k.t)});`;
    prev = k.value;
  }
  return { html, css: CSS, tl };
}
