export class PaymentGateway {
  constructor(bank) {
    this.bank = bank;
    this.charges = new Map();
  }
  charge(key, user, cents) {
    if (this.charges.has(key)) return this.charges.get(key);
    if (!Number.isInteger(cents) || cents <= 0) throw new Error("amount");
    const result = this.bank(user, cents);
    const row = { key, user, cents, refunded: 0, status: result.ok ? "captured" : "failed", id: result.id };
    this.charges.set(key, row);
    return row;
  }
  refund(key, cents) {
    const row = this.charges.get(key);
    if (!row || row.status !== "captured") throw new Error("no capture");
    if (cents < 1 || row.refunded + cents > row.cents) throw new Error("refund");
    row.refunded += cents;
    if (row.refunded === row.cents) row.status = "refunded";
    return row;
  }
}

export function demo() {
  let calls = 0;
  const gateway = new PaymentGateway((user, cents) => {
    calls += 1;
    return { ok: true, id: `${user}-${cents}` };
  });
  const first = gateway.charge("k1", "ada", 500);
  const again = gateway.charge("k1", "ada", 500);
  if (again !== first || calls !== 1) throw new Error("idempotent");
  gateway.refund("k1", 200);
  if (first.status !== "captured" || first.refunded !== 200) throw new Error("partial");
  gateway.refund("k1", 300);
  if (first.status !== "refunded") throw new Error("full");
}

if (import.meta.main) demo();
