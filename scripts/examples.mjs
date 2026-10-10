// Bundles each JavaScript example with its Java twin into content/lld-examples.json.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const jsDir = join(root, "examples/lld/js");
const javaDir = join(root, "examples/lld/java");

function pascal(key) {
  return key
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const jsFiles = readdirSync(jsDir).filter((name) => name.endsWith(".js")).sort();
const javaFiles = new Set(readdirSync(javaDir).filter((name) => name.endsWith(".java")));
const bundle = {};
const problems = [];

for (const jsFile of jsFiles) {
  const key = jsFile.replace(/\.js$/, "");
  const javaFile = `${pascal(key)}.java`;
  if (!javaFiles.has(javaFile)) {
    problems.push(`${jsFile} has no ${javaFile}`);
    continue;
  }
  javaFiles.delete(javaFile);
  bundle[key] = {
    javascript: readFileSync(join(jsDir, jsFile), "utf8"),
    java: readFileSync(join(javaDir, javaFile), "utf8"),
    jsFile,
    javaFile,
  };
}

for (const extra of javaFiles) problems.push(`${extra} has no JavaScript twin`);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

writeFileSync(join(root, "content/lld-examples.json"), JSON.stringify(bundle));
console.log(`wrote ${Object.keys(bundle).length} examples`);
