// Append one line to a pipeline log. The timestamp (and run duration) always come from this tool, never from the model.
//   node tools/log.mjs <slug> <step> <result> "<details>"                  → videos/<slug>/logs/pipeline.log
//   node tools/log.mjs --run <command> <slug|-> <result> "<details>"       → logs/runs.log
// Line format: ISO-timestamp | slug | step | result | details
// Run log: any result other than "start" gets "duration <N>s" appended, measured from the last "start" line of the same command.
import { appendFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT, videoDir, isoLocal, die } from "./lib.mjs";

const args = process.argv.slice(2);
const clean = (s) => String(s ?? "").replace(/\s*[\r\n]+\s*/g, " ").replace(/\|/g, "/").trim();
let file, fields;
if (args[0] === "--run") {
  const [, command, slug, result, details = ""] = args;
  if (!command || !slug || !result) die('usage: node tools/log.mjs --run <command> <slug|-> <result> "<details>"');
  file = join(ROOT, "logs", "runs.log");
  let det = details;
  if (result !== "start" && existsSync(file)) {
    const rows = readFileSync(file, "utf8").trim().split("\n").map((l) => l.split(" | "));
    const start = rows.reverse().find((r) => r[2] === command && r[3] === "start");
    if (start) det = `${details} duration ${Math.max(0, Math.round((Date.now() - new Date(start[0]).getTime()) / 1000))}s`.trim();
  }
  fields = [slug, command, result, det];
} else {
  const [slug, step, result, details = ""] = args;
  if (!slug || !step || !result) die('usage: node tools/log.mjs <slug> <step> <result> "<details>"');
  file = join(videoDir(slug), "logs", "pipeline.log");
  fields = [slug, step, result, details];
}
mkdirSync(dirname(file), { recursive: true });
appendFileSync(file, [isoLocal(), ...fields].map(clean).join(" | ") + "\n");
