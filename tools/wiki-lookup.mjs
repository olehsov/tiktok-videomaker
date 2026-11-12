// Look up a Wikipedia article by title (REST summary endpoint). No dependencies.
// Usage: node tools/wiki-lookup.mjs "<title>" [--lang en]
// Prints JSON: { title, url, found }. Redirects are followed (url is the canonical article).
//   404 → found:false (exit 0) · disambiguation page → found:false + disambiguation:true (try a more specific title)
//   429 → retried up to 3 times · network / other HTTP error → message on stderr, exit 1
import { die } from "./lib.mjs";

const argv = process.argv.slice(2);
let lang = "en";
const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--lang") lang = argv[++i] ?? die("--lang needs a value");
  else pos.push(argv[i]);
}
const title = pos.join(" ").trim();
if (!title) die('usage: node tools/wiki-lookup.mjs "<title>" [--lang en]');
if (!/^[a-z]{2,3}(-[a-z]+)?$/.test(lang)) die(`bad language code '${lang}'`);

const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
let res;
for (let attempt = 0; attempt < 4; attempt++) {
  try {
    res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "tiktok-videomaker/1.0 (personal project)", Accept: "application/json" } });
  } catch (e) {
    die(`request failed: ${e.message}`);
  }
  if (res.status !== 429) break; // rate limited: wait (Retry-After, else 2 s, 4 s, 6 s) and try again
  await new Promise((r) => setTimeout(r, Math.min(10, Number(res.headers.get("retry-after")) || 2 * (attempt + 1)) * 1000));
}
if (res.status === 404) {
  console.log(JSON.stringify({ title, url: null, found: false }));
  process.exit(0);
}
if (!res.ok) die(`Wikipedia answered HTTP ${res.status} for '${title}'`);
const data = await res.json();
const page = data.content_urls?.desktop?.page;
if (data.type === "disambiguation") console.log(JSON.stringify({ title: data.title, url: page ?? null, found: false, disambiguation: true }));
else console.log(JSON.stringify({ title: data.title, url: page ?? null, found: Boolean(page) }));
