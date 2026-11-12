import { poly, shade, tint, f } from "../lowpoly.mjs";

/** Cut-away water tank. walls (left/right/floor), back face, water (faceted top), mud overlay (opacity 0), sand layer. wallTop lets the side walls start lower (a pit below a channel). */
export function tank({ id, x, top, w, h, waterY, wall = 8, sand = 0, wallTop, hidden = [] }) {
  const bot = top + h, wt = wallTop ?? top;
  const hid = (k) => (hidden.includes(k) || hidden.includes("all") ? ' style="opacity:0"' : "");
  const iw = w - 2 * wall;
  const wl = [[x, wt], [x + wall, wt], [x + wall, bot], [x, bot]];
  const wr = [[x + w - wall, wt], [x + w, wt], [x + w, bot], [x + w - wall, bot]];
  const fl = [[x, bot - wall], [x + w, bot - wall], [x + w, bot], [x, bot]];
  const waterBody = poly([[x + wall, waterY], [x + w - wall, waterY], [x + w - wall, bot - wall], [x + wall, bot - wall]], "var(--water)");
  let facets = "";
  const n = Math.max(2, Math.round(iw / 28));
  for (let i = 0; i < n; i++) {
    const a = x + wall + (iw * i) / n, b = x + wall + (iw * (i + 1)) / n;
    facets += poly([[a, waterY], [b, waterY], [(a + b) / 2, waterY + (bot - waterY) * 0.55]], i % 2 ? tint("water", 18) : shade("water", 14), 'opacity=".5"');
  }
  const back = `<g id="${id}-back"${hid("back")}>${poly([[x, top], [x + w, top], [x + w, bot], [x, bot]], shade("stone", 30))}</g>`;
  const sandTop = bot - wall - sand;
  const sandG = `<g id="${id}-sand">${sand > 0 ? poly([[x + wall, sandTop + 2], [x + w - wall, sandTop - 2], [x + w - wall, bot - wall], [x + wall, bot - wall]], "var(--sand)") + poly([[x + wall, sandTop + 2], [x + w * 0.5, sandTop - 1], [x + w * 0.5, bot - wall]], tint("sand", 14), 'opacity=".5"') : ""}</g>`;
  const mud = `<g id="${id}-mud" style="opacity:0">${poly([[x + wall, waterY], [x + w - wall, waterY], [x + w - wall, bot - wall], [x + wall, bot - wall]], "color-mix(in srgb, var(--water) 45%, var(--earth-1))")}</g>`;
  const walls = `<g id="${id}-walls"${hid("walls")}>${poly(wl, "var(--stone)")}${poly(wr, shade("stone", 16))}${poly(fl, shade("stone", 10))}</g>`;
  return {
    svg: `<g id="${id}">${back}<g id="${id}-water"${hid("water")}>${waterBody}${facets}</g>${mud}${sandG}${walls}</g>`,
    pivotBottom: { x: x + w / 2, y: bot }, pivotTop: { x: x + w / 2, y: top },
  };
}
