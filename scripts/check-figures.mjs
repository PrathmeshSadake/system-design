// Checks every Hairline figure twice.
//
// 1. Against the hairline-create skill's own validator: each figure in hairline/figures is
//    put on the skill's bench page and checked for the mechanical rules (no words inside
//    the drawing, no colours of its own, no timers, input only through the pointer, at most
//    200 lines, a proper tour, and so on).
// 2. On the built site: every lesson page is opened in Chromium at a laptop and a phone
//    width. Each figure is scrolled into view and must draw, must answer a pointer held on
//    its first tour stop (its read-out changes from "rest"), and must return to "rest" when
//    the pointer leaves. No page may scroll sideways, and the console must stay clean.
//    Every section that names a figure must have one, and every figure must be used.
//
// Usage: npm run build && npm run check:figures [-- slug-filter]
import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";
import { assemble } from "../.claude/skills/hairline-create/build.mjs";
import { validate } from "../.claude/skills/hairline-create/validate.mjs";

const root = new URL("..", import.meta.url).pathname;
const OUT = join(root, "out");
const filter = process.argv[2] ?? "";
let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`  - ${msg}`);
};

// 1. The skill's validator
const figDir = join(root, "hairline/figures");
const files = readdirSync(figDir).filter((f) => f.endsWith(".js")).sort();
console.log(`Validating ${files.length} figures with the hairline-create validator`);
for (const f of files) {
  const problems = validate(assemble(readFileSync(join(figDir, f), "utf8")));
  if (problems.length) {
    console.log(`${f}`);
    problems.forEach(fail);
  }
}

// Every section's figure exists, and every figure is used once.
const meta = JSON.parse(readFileSync(join(root, "components/figures/generated/meta.json"), "utf8"));
const used = new Map();
for (const t of readdirSync(join(root, "content/topics"))) {
  const src = readFileSync(join(root, "content/topics", t), "utf8");
  for (const [, name] of src.matchAll(/figure: "([^"]+)"/g)) {
    if (!meta[name]) fail(`${t} names a figure "${name}" that does not exist`);
    used.set(name, (used.get(name) ?? 0) + 1);
  }
}
for (const name of Object.keys(meta)) {
  if (!used.has(name)) fail(`figure "${name}" is not used by any lesson`);
  if ((used.get(name) ?? 0) > 1) fail(`figure "${name}" is used more than once`);
}

// 2. The built site
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  let file = join(OUT, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const chrome = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((c) => c && existsSync(c));
const browser = await chromium.launch({ executablePath: chrome });

const pages = ["/", ...readdirSync(join(OUT, "topics")).map((s) => `/topics/${s}/`)].filter((p) => p.includes(filter));
let checked = 0;
for (const url of pages) {
  for (const vp of [
    { name: "laptop", width: 1280, height: 900 },
    { name: "phone", width: 375, height: 800 },
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text()));
    await page.goto(base + url, { waitUntil: "networkidle" });
    const head = `${url} (${vp.name})`;
    let printed = false;
    const note = (msg) => {
      if (!printed) console.log(head);
      printed = true;
      fail(msg);
    };

    const figures = await page.locator("figure.figure").all();
    for (const fig of figures) {
      if ((await fig.locator(".figure-read").count()) === 0) continue; // the package's own hero figure
      const stage = fig.locator(".figure-stage");
      const name = await stage.getAttribute("data-hairline");
      await fig.scrollIntoViewIfNeeded();
      const drew = await stage
        .locator("svg > *")
        .first()
        .waitFor({ timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (!drew) {
        note(`${name}: did not draw`);
        continue;
      }
      if (vp.name !== "laptop") continue;
      checked++;
      const read = fig.locator(".figure-read");
      if ((await read.textContent()) !== "rest") note(`${name}: read-out at rest is "${await read.textContent()}"`);
      const stop = (meta[name]?.tour ?? []).find(Boolean) ?? [200, 160];
      const box = await stage.boundingBox();
      await page.mouse.move(box.x + (stop[0] / 400) * box.width, box.y + (stop[1] / 320) * box.height, { steps: 4 });
      await page.waitForTimeout(250);
      const answer = await read.textContent();
      if (!answer || answer === "rest") note(`${name}: no answer with the pointer on its first tour stop (read-out "${answer}")`);
      await page.mouse.move(2, 2);
      await page.waitForTimeout(250);
      const after = await read.textContent();
      if (after !== "rest") note(`${name}: read-out says "${after}" after the pointer left`);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) note(`page scrolls sideways by ${overflow}px`);
    for (const e of errors) note(`console: ${e}`);
    await page.close();
  }
}
await browser.close();
server.close();

console.log(`\nValidated ${files.length} figure files and tried ${checked} figures in their lessons.`);
if (failures) {
  console.log(`${failures} problem(s) found.`);
  process.exit(1);
}
console.log("Every figure passes.");
