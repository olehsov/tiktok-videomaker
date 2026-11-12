// Create videos/<slug>/ from videos/_template without generated or template-only folders. No rm needed (so no permission prompt).
// Usage: node tools/new-video.mjs <slug>
// Skips: build, out, audio, review, logs, renders, node_modules, .hyperframes, showcase/, style/ (kit demo and style tooling stay in the template).
// Writes STATUS = selected. Fails when the folder exists.
import { cpSync, existsSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { ROOT, die } from "./lib.mjs";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) die("usage: node tools/new-video.mjs <slug>   (lowercase ASCII, hyphens)");
const SRC = join(ROOT, "videos", "_template"), DST = join(ROOT, "videos", slug);
if (!existsSync(SRC)) die("videos/_template is missing — run BOOTSTRAP_PROMPT.md first");
if (existsSync(DST)) die(`videos/${slug} already exists`);
const SKIP = new Set(["build", "out", "audio", "review", "logs", "renders", "node_modules", ".hyperframes", "showcase", "style"]);
cpSync(SRC, DST, { recursive: true, filter: (p) => !relative(SRC, p).split(sep).some((part) => SKIP.has(part)) });
writeFileSync(join(DST, "STATUS"), "selected\n");
console.log(`OK videos/${slug} created from _template (STATUS selected)`);
