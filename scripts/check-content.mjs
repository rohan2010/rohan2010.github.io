// Checks the Notebook and the Playground content for the mistakes the build can't see:
// a prompt blank with no field, a pitfall that quotes words the prompt doesn't have, a cover
// motif or image that doesn't exist, a name that must never appear. `npm run check`.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (...p) => readFileSync(join(ROOT, ...p), "utf8");
const folders = (...p) =>
  readdirSync(join(ROOT, ...p), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

const errors = [];
const warnings = [];
const fail = (where, what) => errors.push(`${where}: ${what}`);
const warn = (where, what) => warnings.push(`${where}: ${what}`);

// Never on the site: the employer's name, and the component gallery the Playground is modelled on.
const BANNED = [/bulk\s*magic/i, /21st\.dev/i];
const banned = (where, text) => BANNED.forEach((re) => re.test(text) && fail(where, `contains ${re}`));
const words = (text) => text.split(/\s+/).filter(Boolean).length;
const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d ?? "");
const oneAccent = (title) => (title?.match(/\*[^*]+\*/g) ?? []).length === 1;

// ── The Notebook ──────────────────────────────────────────────

const motifs = [...read("src/notebook/Cover.tsx").matchAll(/^ {2}(?:"([\w-]+)"|([\w]+)): \(\) =>/gm)].map((m) => m[1] ?? m[2]);

for (const slug of folders("src/content/notebook")) {
  const at = `notebook/${slug}`;
  const file = join("src/content/notebook", slug, "entry.json");
  if (!existsSync(join(ROOT, file))) {
    fail(at, "no entry.json");
    continue;
  }
  const raw = read(file);
  let e;
  try {
    e = JSON.parse(raw);
  } catch (err) {
    fail(at, `entry.json isn't valid JSON (${err.message})`);
    continue;
  }
  banned(`${at}/entry.json`, raw);
  for (const key of ["type", "title", "dek", "date", "tags"]) if (!e[key]) fail(at, `missing "${key}"`);
  if (e.title && !oneAccent(e.title)) fail(at, 'title needs exactly one *accent* word');
  if (!isDate(e.date)) fail(at, 'date must be "YYYY-MM-DD"');
  if (!e.takeaways?.length) warn(at, "no takeaways (shown above the post and on the featured card)");
  if (e.motif && !motifs.includes(e.motif)) fail(at, `motif "${e.motif}" isn't in src/notebook/Cover.tsx (has: ${motifs.join(", ")})`);
  if (!e.motif) warn(at, "no cover motif");
  for (const link of [...(e.resources ?? []), ...(e.sources ?? [])]) {
    if (!/^https:\/\//.test(link.url ?? "")) fail(at, `link "${link.label}" needs an https:// url`);
    if (!link.label || !link.by) fail(at, `link ${link.url} needs "label" and "by"`);
  }
  if (e.original && !/^https:\/\//.test(e.original.url ?? "")) fail(at, "original.url must be https://");

  const postFile = join("src/content/notebook", slug, "post.md");
  if (!existsSync(join(ROOT, postFile))) {
    fail(at, "no post.md");
    continue;
  }
  const post = read(postFile);
  banned(`${at}/post.md`, post);
  // Headings outside code: a "# comment" in a Python block isn't one.
  const prose = post.replace(/^```[\s\S]*?^```/gm, "");
  if (/^# /m.test(prose)) fail(at, "post.md uses a # heading; sections are ## (the title comes from entry.json)");
  if (!/^## /m.test(prose)) warn(at, "post.md has no ## sections, so there's no contents rail");
  for (const [, src] of post.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    if (src.startsWith("/") && !existsSync(join(ROOT, "public", src))) fail(at, `image ${src} isn't in public/`);
  }
  for (const [, alt] of post.matchAll(/!\[([^\]]*)\]\(/g)) if (alt.trim().length < 8) fail(at, "an image has no real alt text");
  for (const [line] of post.matchAll(/^> \[!(\w+)\].*$/gm)) {
    if (!/^> \[!(NOTE|TIP|CAUTION)\]/.test(line)) fail(at, `unknown callout "${line}" (use NOTE, TIP or CAUTION)`);
  }
}

// ── The Playground ────────────────────────────────────────────

const previews = read("src/playground/previews.ts");
const orders = new Map();

for (const slug of folders("src/content/playground")) {
  const at = `playground/${slug}`;
  const file = join("src/content/playground", slug, "item.json");
  if (!existsSync(join(ROOT, file))) {
    fail(at, "no item.json");
    continue;
  }
  const raw = read(file);
  let i;
  try {
    i = JSON.parse(raw);
  } catch (err) {
    fail(at, `item.json isn't valid JSON (${err.message})`);
    continue;
  }
  banned(`${at}/item.json`, raw);
  for (const key of ["title", "dek", "kind", "date", "order", "stack", "template", "variables", "mistakes", "files"]) if (i[key] === undefined) fail(at, `missing "${key}"`);
  if (i.title && !oneAccent(i.title)) fail(at, "title needs exactly one *accent* word");
  if (!isDate(i.date)) fail(at, 'date must be "YYYY-MM-DD"');
  if (typeof i.order === "number") {
    if (orders.has(i.order)) fail(at, `order ${i.order} is also used by ${orders.get(i.order)}`);
    orders.set(i.order, slug);
  }
  if (!previews.includes(`"${slug}"`)) fail(at, "not registered in src/playground/previews.ts");

  const template = i.template ?? "";
  const blanks = [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
  const keys = (i.variables ?? []).map((v) => v.key);
  for (const b of blanks) if (!keys.includes(b)) fail(at, `prompt blank {${b}} has no variable`);
  for (const k of keys) if (!blanks.includes(k)) fail(at, `variable "${k}" isn't used in the prompt`);
  for (const v of i.variables ?? []) if (!v.label || !v.value) fail(at, `variable "${v.key}" needs a label and an example value`);
  if (blanks.length < 3 || blanks.length > 8) warn(at, `${blanks.length} blanks; 4–7 is the sweet spot`);
  const n = words(template);
  if (n < 120 || n > 340) warn(at, `prompt is ${n} words; aim for 150–300`);

  for (const m of i.mistakes ?? []) {
    for (const key of ["then", "cost", "now", "line"]) if (!m[key]) fail(at, `a pitfall is missing "${key}"`);
    if (m.line && !template.includes(m.line)) fail(at, `pitfall line isn't in the prompt: "${m.line}"`);
  }
  if ((i.mistakes ?? []).length < 3) warn(at, "fewer than 3 pitfalls");
  for (const f of i.files ?? []) {
    if (!existsSync(join(ROOT, f.path))) fail(at, `file ${f.path} doesn't exist`);
    else banned(f.path, read(f.path));
  }
}

for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  FAIL  ${e}`);
console.log(errors.length ? `\n${errors.length} problem(s).` : `\nContent OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}.`);
process.exit(errors.length ? 1 : 0);
