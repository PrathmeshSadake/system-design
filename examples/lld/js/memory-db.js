export class MemoryDb {
  constructor(now) {
    this.now = now;
    this.rows = new Map();
    this.tx = null;
  }
  put(key, value, ttl = 0) {
    const expiresAt = ttl > 0 ? this.now() + ttl : 0;
    this.write(key, { value, expiresAt });
  }
  get(key) {
    const row = this.read(key);
    if (!row) return undefined;
    if (row.expiresAt && row.expiresAt <= this.now()) {
      this.write(key, undefined);
      return undefined;
    }
    return row.value;
  }
  begin() {
    if (this.tx) throw new Error("already open");
    this.tx = new Map();
  }
  commit() {
    if (!this.tx) throw new Error("no tx");
    for (const [key, row] of this.tx) {
      if (row === undefined) this.rows.delete(key);
      else this.rows.set(key, row);
    }
    this.tx = null;
  }
  rollback() {
    if (!this.tx) throw new Error("no tx");
    this.tx = null;
  }
  read(key) {
    if (this.tx && this.tx.has(key)) return this.tx.get(key);
    return this.rows.get(key);
  }
  write(key, row) {
    if (this.tx) this.tx.set(key, row);
    else if (row === undefined) this.rows.delete(key);
    else this.rows.set(key, row);
  }
}

export function demo() {
  let time = 0;
  const db = new MemoryDb(() => time);
  db.put("a", 1, 5);
  db.begin();
  db.put("a", 2);
  db.put("b", 3);
  if (db.get("b") !== 3) throw new Error("see own write");
  db.rollback();
  if (db.get("a") !== 1 || db.get("b") !== undefined) throw new Error("rollback");
  time = 5;
  if (db.get("a") !== undefined) throw new Error("ttl");
  db.begin();
  db.put("c", 4);
  db.commit();
  if (db.get("c") !== 4) throw new Error("commit");
}

if (import.meta.main) demo();
