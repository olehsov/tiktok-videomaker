// Reads the generated tokens.css (build time, Node). tokens.css is the single source of truth for colours and sizes;
// it is generated from tokens.base.css + config.json "look" by tools/apply-look.mjs. Set KIT_TOKENS to use another file.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const TOKENS_PATH = process.env.KIT_TOKENS || join(dirname(fileURLToPath(import.meta.url)), "tokens.css");
export const TOKENS_CSS = readFileSync(TOKENS_PATH, "utf8");
export const TOKENS = Object.fromEntries([...TOKENS_CSS.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().replace(/\s*\/\*.*$/, "")]));
/** token value as a string (throws on a missing token: a typo should fail the build) */
export const tok = (name) => TOKENS[name] ?? (() => { throw new Error(`token --${name} missing in ${TOKENS_PATH}`); })();
/** numeric token (strips px) with fallback */
export const num = (name, fallback) => { const v = parseFloat(TOKENS[name]); return Number.isFinite(v) ? v : fallback; };

/** Look values the layout code needs at build time (everything else is pure CSS variables). */
export const LOOK = {
  uiScale: num("ui-scale", 1),
  captionScale: num("caption-scale", 1),
  faceK: num("face-k", 1),
  nightDarkness: num("night-darkness", 0.35),
  nightBlue: num("night-blue", 0.5),
};
export const UI_HEX = {
  yellow: tok("ui-yellow"), red: tok("ui-red"), blue: tok("ui-blue"), orange: tok("ui-heat"),
  green: tok("ui-green"), white: tok("ui-white"), muted: tok("text-muted"),
};
