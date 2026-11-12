import { poly, shade, tint } from "../lowpoly.mjs";

/** Bucket with optional water level (0..1). (x,y) = bottom center, s = scale (1 ≈ 90 px tall). Water polygon id: `${id}-water`. */
export function bucket({ id = "", x = 0, y = 0, s = 1, fill = 0.6 } = {}) {
  const P = (px, py) => [x + px * s, y + py * s];
  const body = [P(-34, -90), P(34, -90), P(26, 0), P(-26, 0)];
  let out = poly(body, "var(--stone)");
  out += poly([P(0, -90), P(34, -90), P(26, 0), P(0, 0)], shade("stone", 20));
  const level = -90 + 90 * (1 - fill);
  const wl = (yy) => 34 - (yy + 90) * (8 / 90);
  out += `<polygon id="${id ? id + "-water" : ""}" points="${[P(-wl(level), level), P(wl(level), level), P(26, 0), P(-26, 0)].map((p) => p.map((n) => Math.round(n * 10) / 10).join(",")).join(" ")}" style="fill:var(--water)"/>`;
  out += poly([P(-34, -90), P(34, -90), P(34, -80), P(-34, -80)], tint("stone", 20));
  out += `<path d="M ${P(-34, -86).join(" ")} Q ${P(0, -150).join(" ")} ${P(34, -86).join(" ")}" style="fill:none;stroke:var(--earth-3);stroke-width:${3 * s}"/>`;
  return `<g ${id ? `id="${id}"` : ""}>${out}</g>`;
}
