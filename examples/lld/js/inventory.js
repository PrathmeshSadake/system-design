export class Inventory {
  constructor() {
    this.rows = new Map();
    this.holds = new Map();
  }
  add(sku, onHand) {
    this.rows.set(sku, { onHand, held: 0 });
  }
  available(sku) {
    const row = this.rows.get(sku);
    return row ? row.onHand - row.held : 0;
  }
  reserve(id, sku, qty) {
    if (this.holds.has(id)) throw new Error("duplicate hold");
    const row = this.rows.get(sku);
    if (!row || qty < 1 || qty > row.onHand - row.held) throw new Error("stock");
    row.held += qty;
    this.holds.set(id, { sku, qty });
  }
  commit(id) {
    const hold = this.take(id);
    const row = this.rows.get(hold.sku);
    row.held -= hold.qty;
    row.onHand -= hold.qty;
  }
  release(id) {
    const hold = this.take(id);
    this.rows.get(hold.sku).held -= hold.qty;
  }
  take(id) {
    const hold = this.holds.get(id);
    if (!hold) throw new Error("no hold");
    this.holds.delete(id);
    return hold;
  }
}

export function demo() {
  const stock = new Inventory();
  stock.add("mug", 2);
  stock.reserve("o1", "mug", 2);
  let over = false;
  try { stock.reserve("o2", "mug", 1); } catch { over = true; }
  if (!over || stock.available("mug") !== 0) throw new Error("held is not free");
  stock.release("o1");
  stock.reserve("o2", "mug", 1);
  stock.commit("o2");
  if (stock.available("mug") !== 1) throw new Error("sold one");
}

if (import.meta.main) demo();
