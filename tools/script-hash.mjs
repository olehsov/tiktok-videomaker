// Print the sha256 of all narration of a script (used to detect stale marketing).
// Usage: node tools/script-hash.mjs <slug> <lang>
import { loadScript, scriptHash, parseArgs, die } from "./lib.mjs";
const { pos } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/script-hash.mjs <slug> <lang>");
console.log(scriptHash(loadScript(slug, lang)));
