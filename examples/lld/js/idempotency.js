// The same key twice is one charge. The second call returns the first result.

export class Cashier {
  constructor() { this.done = new Map(); }
  charge(key, cents) {
    if (this.done.has(key)) return this.done.get(key);
    const receipt = { key, cents, id: `r${this.done.size + 1}` };
    this.done.set(key, receipt);
    return receipt;
  }
}

export function demo() {
  const cashier = new Cashier();
  const first = cashier.charge("k1", 500);
  const again = cashier.charge("k1", 500);
  if (first !== again) throw new Error("same key must return the same receipt");
  if (cashier.charge("k2", 500).id === first.id) throw new Error("new key is a new charge");
}

if (import.meta.main) demo();
