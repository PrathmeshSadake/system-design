// Opens every built page in a real browser and checks that diagrams are tidy:
//  - text stays inside the picture with padding, and inside its own box
//  - no two pieces of text touch
//  - arrows and lines never run through text or through a box
//  - boxes never overlap each other
//  - the page never scrolls sideways on a phone or a laptop
//
// Usage: npm run build && npm run check:diagrams [-- slug-filter]
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

const OUT = new URL("../out/", import.meta.url).pathname;
const filter = process.argv[2] ?? "";

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

function serve() {
  const server = createServer(async (req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    let file = join(OUT, p);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((r) => server.listen(0, () => r(server)));
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  ].filter(Boolean);
  return candidates.find((c) => existsSync(c));
}

// Runs inside the page. Returns a list of problems for every diagram.
function inspect() {
  const PAD_EDGE = 6; // screen pixels of empty space required at the picture edge
  const problems = [];
  const inter = (a, b, pad = 0) =>
    a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
  const shrink = (r, by) => ({ left: r.left + by, right: r.right - by, top: r.top + by, bottom: r.bottom - by });
  const inside = (inner, outer, pad = 0) =>
    inner.left >= outer.left + pad &&
    inner.right <= outer.right - pad &&
    inner.top >= outer.top + pad &&
    inner.bottom <= outer.bottom - pad;
  const ptIn = (x, y, r) => x > r.left && x < r.right && y > r.top && y < r.bottom;

  for (const fig of document.querySelectorAll("figure.diagram")) {
    const id = fig.dataset.diagram;
    const svg = fig.querySelector("svg");
    const svgRect = svg.getBoundingClientRect();
    const scale = svgRect.width / svg.viewBox.baseVal.width;
    const texts = [...svg.querySelectorAll("text")].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, r, label: el.textContent.trim().slice(0, 40) };
    });
    const boxes = [...svg.querySelectorAll("[data-box] > rect")].map((el) => ({
      el,
      r: el.getBoundingClientRect(),
      text: el.parentElement.querySelector("text"),
    }));
    const groups = [...svg.querySelectorAll("[data-container] > rect")].map((el) => ({
      el,
      r: el.getBoundingClientRect(),
      text: el.parentElement.querySelector("text"),
    }));

    // Everything visible must sit inside the viewBox with padding.
    for (const el of svg.querySelectorAll("text, rect, path, circle:not(.motion), ellipse, line, polygon")) {
      if (el.closest("defs, marker")) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (!inside(r, svgRect, PAD_EDGE * scale)) {
        problems.push(`${id}: <${el.tagName}> "${(el.textContent || "").trim().slice(0, 30)}" is too close to or outside the edge`);
      }
    }

    // Text never touches other text.
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        if (inter(texts[i].r, texts[j].r, 1)) {
          problems.push(`${id}: text "${texts[i].label}" overlaps text "${texts[j].label}"`);
        }
      }
    }

    // Text inside a box stays inside it. Other text stays out of boxes.
    for (const b of boxes) {
      for (const t of texts) {
        if (t.el === b.text) {
          if (!inside(t.r, b.r, 3 * scale)) problems.push(`${id}: text "${t.label}" spills out of its box`);
        } else if (inter(t.r, b.r) && !b.el.closest("[data-allow-text]")) {
          problems.push(`${id}: text "${t.label}" overlaps a box`);
        }
      }
    }
    // Group labels must not collide with the boxes inside the group.
    for (const g of groups) {
      if (!g.text) continue;
      for (const b of boxes) {
        if (inter(g.text.getBoundingClientRect(), b.r, 2)) {
          problems.push(`${id}: group label "${g.text.textContent}" overlaps a box`);
        }
      }
    }

    // Boxes never overlap other boxes.
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (inter(shrink(boxes[i].r, 1), shrink(boxes[j].r, 1))) {
          problems.push(`${id}: two boxes overlap ("${boxes[i].text?.textContent?.slice(0, 20)}" and "${boxes[j].text?.textContent?.slice(0, 20)}")`);
        }
      }
    }

    // Arrows and lines never pass through text or through the inside of a box.
    const ctm = svg.getScreenCTM();
    for (const p of svg.querySelectorAll("[data-arrow]")) {
      const len = p.getTotalLength();
      const steps = Math.max(10, Math.ceil(len / 3));
      for (let k = 0; k <= steps; k++) {
        const pt = p.getPointAtLength((len * k) / steps);
        const x = ctm.a * pt.x + ctm.c * pt.y + ctm.e;
        const y = ctm.b * pt.x + ctm.d * pt.y + ctm.f;
        const hitText = texts.find((t) => ptIn(x, y, shrink(t.r, -2)));
        if (hitText) {
          problems.push(`${id}: a line runs through text "${hitText.label}"`);
          break;
        }
        const hitBox = boxes.find((b) => !b.el.closest("[data-allow-lines]") && ptIn(x, y, shrink(b.r, 3)));
        if (hitBox) {
          problems.push(`${id}: a line runs through the box "${hitBox.text?.textContent?.slice(0, 30) ?? ""}"`);
          break;
        }
      }
    }
  }
  return problems;
}

async function listPages() {
  const pages = ["/"];
  const dir = join(OUT, "topics");
  for (const slug of await readdir(dir)) pages.push(`/topics/${slug}/`);
  return pages.filter((p) => p.includes(filter));
}

const server = await serve();
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ executablePath: findChrome() });
const viewports = [
  { name: "laptop", width: 1280, height: 900 },
  { name: "phone", width: 375, height: 800 },
];

let failures = 0;
let diagramCount = 0;
for (const url of await listPages()) {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    // Use a wide font on purpose. If labels fit with it, they fit with narrower fonts too.
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = ".diagram svg { font-family: 'DejaVu Sans', Verdana, sans-serif !important; }";
      document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(base + url, { waitUntil: "networkidle" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const problems = vp.name === "laptop" ? await page.evaluate(inspect) : [];
    if (vp.name === "laptop") diagramCount += await page.locator("figure.diagram").count();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) problems.push(`page scrolls sideways by ${overflow}px on ${vp.name}`);
    for (const e of errors) problems.push(`browser error: ${e}`);
    if (problems.length) {
      failures += problems.length;
      console.log(`\n${url} (${vp.name})`);
      for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
    }
    await page.close();
  }
}
await browser.close();
server.close();
console.log(`\nChecked ${diagramCount} diagrams.`);
if (failures) {
  console.log(`${failures} problem(s) found.`);
  process.exit(1);
}
console.log("All diagrams look tidy.");
