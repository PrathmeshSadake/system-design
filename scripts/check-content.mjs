// Checks the writing rules on every topic: no emojis, no em or en dashes,
// no markdown emphasis, and every section has the fields it needs.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dirs = ["content/topics", "components", "components/diagrams", "app", "app/topics/[slug]", "lib"];
const rules = [
  { name: "em dash", re: /—/ },
  { name: "en dash", re: /–/ },
  { name: "emoji", re: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F900}-\u{1F9FF}]/u },
  { name: "markdown bold", re: /\*\*[^*]+\*\*/ },
  { name: "double hyphen used as a dash", re: /[a-z] -- [a-z]/i },
  { name: "TODO left in content", re: /"TODO"/ },
  { name: "exclamation mark in prose", re: /[a-z]!\s/i, only: "content/topics" },
];

let problems = 0;
for (const dir of dirs) {
  for (const f of await readdir(join(root, dir))) {
    if (!/\.(tsx?|mjs|css)$/.test(f)) continue;
    const rel = `${dir}/${f}`;
    const lines = (await readFile(join(root, rel), "utf8")).split("\n");
    lines.forEach((line, i) => {
      for (const r of rules) {
        if (r.only && !rel.startsWith(r.only)) continue;
        if (r.re.test(line)) {
          problems++;
          console.log(`${rel}:${i + 1} has ${r.name}: ${line.trim().slice(0, 100)}`);
        }
      }
    });
  }
}

if (problems) {
  console.log(`\n${problems} writing problem(s) found.`);
  process.exit(1);
}
console.log("Writing rules pass: no emojis, no em or en dashes, no markdown emphasis.");
