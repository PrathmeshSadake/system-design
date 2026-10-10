export class VersionedKv {
  constructor() {
    this.rows = new Map();
  }
  put(key, value, expected) {
    const history = this.rows.get(key) ?? [];
    const current = history.length;
    if (current !== expected) throw new Error(`conflict ${current}`);
    history.push(value);
    this.rows.set(key, history);
    return current + 1;
  }
  get(key) {
    const history = this.rows.get(key) ?? [];
    if (!history.length) return undefined;
    return { value: history[history.length - 1], version: history.length };
  }
  at(key, version) {
    const history = this.rows.get(key) ?? [];
    if (version < 1 || version > history.length) throw new Error("version");
    return history[version - 1];
  }
}

export function demo() {
  const store = new VersionedKv();
  if (store.put("a", "one", 0) !== 1) throw new Error("first");
  let clash = false;
  try { store.put("a", "two", 0); } catch { clash = true; }
  if (!clash) throw new Error("stale write");
  store.put("a", "two", 1);
  if (store.get("a").value !== "two" || store.at("a", 1) !== "one") throw new Error("history");
}

if (import.meta.main) demo();
