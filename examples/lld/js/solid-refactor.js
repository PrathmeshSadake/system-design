// Before: one class loaded, added, and saved. After: three reasons to change, three types.

export function loadLines(text) {
  return text.split(",").filter(Boolean).map((part) => {
    const [name, cents] = part.split(":");
    return { name, cents: Number(cents) };
  });
}

export function totalOf(lines) {
  return lines.reduce((sum, line) => sum + line.cents, 0);
}

export function formatTotal(lines) {
  return `total ${totalOf(lines)}`;
}

export function demo() {
  const lines = loadLines("milk:80,bread:50");
  if (totalOf(lines) !== 130) throw new Error("total");
  if (formatTotal(lines) !== "total 130") throw new Error("format");
}

if (import.meta.main) demo();
