export class Wallet {
  constructor() {
    this.balances = new Map();
    this.ledger = [];
  }
  open(id, cents) {
    this.balances.set(id, cents);
  }
  transfer(from, to, cents, note) {
    if (!Number.isInteger(cents) || cents <= 0) throw new Error("amount");
    const left = this.balances.get(from);
    const right = this.balances.get(to);
    if (left === undefined || right === undefined) throw new Error("account");
    if (left < cents) throw new Error("funds");
    this.balances.set(from, left - cents);
    this.balances.set(to, right + cents);
    this.ledger.push({ from, to, cents, note });
  }
  history(id) {
    return this.ledger.filter((row) => row.from === id || row.to === id);
  }
}

export function demo() {
  const wallet = new Wallet();
  wallet.open("ada", 500);
  wallet.open("bo", 100);
  wallet.transfer("ada", "bo", 200, "lunch");
  let broke = false;
  try { wallet.transfer("ada", "bo", 400, "too much"); } catch { broke = true; }
  if (!broke || wallet.balances.get("ada") !== 300 || wallet.balances.get("bo") !== 300) throw new Error("atomic");
  if (wallet.history("ada").length !== 1) throw new Error("history");
}

if (import.meta.main) demo();
