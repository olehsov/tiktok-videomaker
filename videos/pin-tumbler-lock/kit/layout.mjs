// Canvas and safe-zone numbers, mirrored from tokens.css for build-time layout.
import { UI_HEX as TOKEN_UI_HEX, num } from "./look.mjs";
export const W = 1080;
export const H = 1920;
export const SAFE = { top: 150, bottom: 400, right: 140 };
export const CAPTION_Y = 0.70 * H; // vertical center of caption band
export const PLATE_Y = 0.12 * H; // vertical center of step/threat plates
/** UI meaning colours, read from tokens.css (single source of truth). */
export const UI_HEX = TOKEN_UI_HEX;
export { num };
