// One function picks the class. Callers ask for a kind by name.

export function makeGreeter(kind) {
  if (kind === "wave") return { hello: (name) => `wave ${name}` };
  if (kind === "bow") return { hello: (name) => `bow ${name}` };
  throw new Error(`unknown kind ${kind}`);
}

export function demo() {
  if (makeGreeter("wave").hello("Ada") !== "wave Ada") throw new Error("wave");
  if (makeGreeter("bow").hello("Ada") !== "bow Ada") throw new Error("bow");
  let refused = false;
  try { makeGreeter("shout"); } catch { refused = true; }
  if (!refused) throw new Error("unknown kind must be refused");
}

if (import.meta.main) demo();
