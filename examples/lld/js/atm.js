export class Atm {
  constructor(cash) {
    this.cash = cash;
    this.accounts = new Map();
  }
  open(id, pin, balance) {
    this.accounts.set(id, { pin, balance });
  }
  withdraw(id, pin, amount) {
    const account = this.auth(id, pin);
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount");
    if (amount > account.balance) throw new Error("funds");
    if (amount > this.cash) throw new Error("cash");
    account.balance -= amount;
    this.cash -= amount;
    return account.balance;
  }
  deposit(id, pin, amount) {
    const account = this.auth(id, pin);
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount");
    account.balance += amount;
    this.cash += amount;
    return account.balance;
  }
  auth(id, pin) {
    const account = this.accounts.get(id);
    if (!account || account.pin !== pin) throw new Error("auth");
    return account;
  }
}

export function demo() {
  const atm = new Atm(40);
  atm.open("ada", "1234", 100);
  if (atm.withdraw("ada", "1234", 30) !== 70) throw new Error("balance");
  let broke = false;
  try { atm.withdraw("ada", "1234", 90); } catch { broke = true; }
  if (!broke || atm.cash !== 10) throw new Error("funds stay put");
  let empty = false;
  try { atm.withdraw("ada", "1234", 20); } catch { empty = true; }
  if (!empty) throw new Error("machine cash");
}

if (import.meta.main) demo();
