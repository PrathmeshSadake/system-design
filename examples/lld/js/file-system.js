export class FileSystem {
  constructor() {
    this.root = { kind: "dir", children: new Map(), mode: "rw" };
  }
  mkdir(path) {
    const node = this.walk(path, true);
    if (node.kind !== "dir") throw new Error("not a dir");
  }
  write(path, text, userMode = "w") {
    this.require(path, userMode);
    const { parent, name } = this.parentOf(path);
    const existing = parent.children.get(name);
    if (existing && existing.kind !== "file") throw new Error("not a file");
    parent.children.set(name, { kind: "file", text, mode: existing?.mode ?? "rw" });
  }
  read(path) {
    const node = this.walk(path, false);
    if (node.kind !== "file") throw new Error("not a file");
    if (!node.mode.includes("r")) throw new Error("denied");
    return node.text;
  }
  chmod(path, mode) {
    this.walk(path, false).mode = mode;
  }
  walk(path, create) {
    const parts = path.split("/").filter(Boolean);
    let node = this.root;
    for (const part of parts) {
      if (node.kind !== "dir") throw new Error("not a dir");
      if (!node.children.has(part)) {
        if (!create) throw new Error("missing");
        node.children.set(part, { kind: "dir", children: new Map(), mode: "rw" });
      }
      node = node.children.get(part);
    }
    return node;
  }
  parentOf(path) {
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop();
    const parent = parts.length ? this.walk(parts.join("/"), true) : this.root;
    return { parent, name };
  }
  require(path, need) {
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    if (!parts.length) return;
    const dir = this.walk(parts.join("/"), false);
    if (!dir.mode.includes(need)) throw new Error("denied");
  }
}

export function demo() {
  const fs = new FileSystem();
  fs.mkdir("/home/ada");
  fs.write("/home/ada/note.txt", "hi");
  fs.chmod("/home/ada/note.txt", "r");
  if (fs.read("/home/ada/note.txt") !== "hi") throw new Error("read");
  fs.chmod("/home/ada", "");
  let denied = false;
  try { fs.write("/home/ada/other.txt", "no"); } catch { denied = true; }
  if (!denied) throw new Error("dir permission");
}

if (import.meta.main) demo();
