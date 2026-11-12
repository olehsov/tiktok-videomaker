// Publish stub. Validates out/upload.<lang>.json; no network calls.
// Usage: node tools/publish-tiktok.mjs <slug> <lang>
//
// TODO (future, when config.pipeline.publish becomes draft | private | public) — TikTok Content Posting API, Direct Post:
//   1. OAuth: read the user access token (scope video.publish) and its refresh token from .env
//      (TIKTOK_ACCESS_TOKEN, TIKTOK_REFRESH_TOKEN, TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET). Refresh when expired. Never print them.
//   2. Query creator info: POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/
//      → allowed privacy_level_options, max_video_post_duration_sec, comment/duet/stitch disabled flags.
//      Reject or adjust when upload.post_info does not fit (an unaudited client may only post SELF_ONLY).
//   3. Init: POST https://open.tiktokapis.com/v2/post/publish/video/init/ with { post_info, source_info:
//      { source: "FILE_UPLOAD", video_size, chunk_size, total_chunk_count } } → publish_id, upload_url.
//   4. Upload chunks: PUT upload_url with Content-Range / Content-Length / Content-Type: video/mp4 (5–64 MB chunks, last up to 128 MB).
//   5. Poll: POST https://open.tiktokapis.com/v2/post/publish/status/fetch/ with { publish_id } until PUBLISH_COMPLETE or FAILED.
//   6. Write the result (publish_id, status) back into upload.<lang>.json and log it with tools/log.mjs.
//   The cover is chosen by post_info.video_cover_timestamp_ms; the pinned comment is posted manually.
import { join } from "node:path";
import { videoDir, readJson, config, exists, parseArgs, die } from "./lib.mjs";

const { pos } = parseArgs(process.argv.slice(2));
const [slug, lang] = pos;
if (!slug || !lang) die("usage: node tools/publish-tiktok.mjs <slug> <lang>");
const p = join(videoDir(slug), "out", `upload.${lang}.json`);
if (!exists(p)) die(`missing ${p} — run tools/prepare-upload.mjs first`);
const u = readJson(p);

const errs = [];
if (u.platform !== "tiktok") errs.push("platform must be tiktok");
if (u.status !== "ready") errs.push(`status is '${u.status}', expected 'ready'`);
for (const k of ["video_path", "cover_path"]) if (!u[k] || !exists(join(videoDir(slug), u[k]))) errs.push(`${k} missing on disk`);
if (!u.post_info?.title || u.post_info.title.length > 2200) errs.push("post_info.title missing or > 2200");
if (errs.length) die(errs.join("; "));

const mode = config().pipeline.publish;
if (mode === "off") {
  console.log(`publish disabled — upload.${lang}.json is ready`);
  process.exit(0);
}
die(`pipeline.publish = "${mode}" is not implemented yet (stub). Set it to "off".`);
