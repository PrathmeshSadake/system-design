const DENOMS = [25, 10, 5, 1];

export class VendingMachine {
  constructor(items) {
    this.items = new Map(items);
    this.box = new Map(DENOMS.map((d) => [d, 0]));
    this.inserted = [];
  }
  load(denom, count) {
    this.box.set(denom, this.box.get(denom) + count);
  }
  insert(denom) {
    if (!DENOMS.includes(denom)) throw new Error("coin");
    this.inserted.push(denom);
  }
  credit() {
    return this.inserted.reduce((sum, coin) => sum + coin, 0);
  }
  refund() {
    const coins = this.inserted;
    this.inserted = [];
    return coins;
  }
  buy(id) {
    const item = this.items.get(id);
    if (!item || item.stock < 1) throw new Error("out of stock");
    const credit = this.credit();
    if (credit < item.price) throw new Error("insert more");
    const pool = new Map(this.box);
    for (const coin of this.inserted) pool.set(coin, pool.get(coin) + 1);
    const plan = planChange(pool, credit - item.price);
    if (!plan) return { ok: false, refund: this.refund() };
    for (const coin of this.inserted) this.box.set(coin, this.box.get(coin) + 1);
    for (const [denom, count] of plan) this.box.set(denom, this.box.get(denom) - count);
    this.inserted = [];
    item.stock -= 1;
    return { ok: true, item: id, change: plan };
  }
}

function planChange(pool, cents) {
  const plan = [];
  let left = cents;
  for (const denom of DENOMS) {
    const use = Math.min(pool.get(denom), Math.floor(left / denom));
    if (use) plan.push([denom, use]);
    left -= use * denom;
  }
  return left === 0 ? plan : null;
}

export function demo() {
  const machine = new VendingMachine([["soda", { price: 65, stock: 1 }]]);
  machine.load(10, 5);
  machine.insert(25);
  machine.insert(25);
  let short = false;
  try { machine.buy("soda"); } catch { short = true; }
  if (!short) throw new Error("needs 65");
  machine.insert(25);
  const sold = machine.buy("soda");
  if (!sold.ok || sold.change.reduce((n, row) => n + row[0] * row[1], 0) !== 10) throw new Error("dime back");
  machine.insert(25);
  const refund = machine.refund();
  if (refund.join(",") !== "25") throw new Error("refund");
  const empty = new VendingMachine([["soda", { price: 30, stock: 1 }]]);
  empty.insert(25);
  empty.insert(10);
  const stuck = empty.buy("soda");
  if (stuck.ok || stuck.refund.reduce((n, c) => n + c, 0) !== 35) throw new Error("cannot make a nickel");
}

if (import.meta.main) demo();
