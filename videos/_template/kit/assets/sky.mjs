import { poly } from "../lowpoly.mjs";
import { lightingStyle } from "../lighting.mjs";

/**
 * Flat low-poly sky: three angled bands using --sky / --sky-2.
 * Colors come from the lighting preset on the scene world (day / night / tense / sunset).
 * Pass `preset` only for a static sky; leave it out when the scene transitions with lightTween.
 */
export function sky({ id = "", w = 1080, horizonY = 900, preset = null } = {}) {
  const top = poly([[0, 0], [w, 0], [w, horizonY * 0.55], [0, horizonY * 0.42]], "var(--sky)");
  const mid = poly([[0, horizonY * 0.42], [w, horizonY * 0.55], [w, horizonY * 0.82], [0, horizonY * 0.74]], "color-mix(in srgb, var(--sky) 50%, var(--sky-2))");
  const low = poly([[0, horizonY * 0.74], [w, horizonY * 0.82], [w, horizonY + 20], [0, horizonY + 20]], "var(--sky-2)");
  return `<g ${id ? `id="${id}"` : ""} ${preset ? `style="${lightingStyle(preset)}"` : ""}>${top}${mid}${low}</g>`;
}
