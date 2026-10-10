// Balances are cents. Positive means the person is owed. Shares must add up to the amount.

export class Splitwise {
  constructor() {
    this.net = new Map();
  }

  ensure(user) {
    if (!this.net.has(user)) this.net.set(user, 0);
  }

  addExpense(paidBy, amount, split) {
    if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount must be positive cents");
    this.ensure(paidBy);
    const shares = this.sharesOf(amount, split);
    let sum = 0;
    for (const share of Object.values(shares)) sum += share;
    if (sum !== amount) throw new Error("shares must add up to the amount");
    for (const user of Object.keys(shares)) this.ensure(user);
    for (const [user, share] of Object.entries(shares)) {
      const paid = user === paidBy ? amount : 0;
      this.net.set(user, this.net.get(user) + paid - share);
    }
    if (!Object.hasOwn(shares, paidBy)) this.net.set(paidBy, this.net.get(paidBy) + amount);
  }

  sharesOf(amount, split) {
    if (split.type === "equal") {
      const users = split.users;
      if (!users.length) throw new Error("nobody to split with");
      const base = Math.floor(amount / users.length);
      let extra = amount - base * users.length;
      const shares = {};
      for (const user of users) {
        shares[user] = base + (extra > 0 ? 1 : 0);
        if (extra > 0) extra -= 1;
      }
      return shares;
    }
    if (split.type === "exact") return { ...split.shares };
    if (split.type === "percent") {
      let pct = 0;
      for (const value of Object.values(split.shares)) pct += value;
      if (pct !== 100) throw new Error("percents must add to 100");
      const users = Object.keys(split.shares);
      const shares = {};
      let used = 0;
      users.forEach((user, index) => {
        if (index === users.length - 1) shares[user] = amount - used;
        else {
          shares[user] = Math.floor(amount * split.shares[user] / 100);
          used += shares[user];
        }
      });
      return shares;
    }
    throw new Error("unknown split");
  }

  balance(user) {
    return this.net.get(user) ?? 0;
  }

  simplify() {
    const debtors = [];
    const creditors = [];
    for (const [user, cents] of this.net) {
      if (cents < 0) debtors.push({ user, left: -cents });
      else if (cents > 0) creditors.push({ user, left: cents });
    }
    const transfers = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const cents = Math.min(debtors[i].left, creditors[j].left);
      transfers.push({ from: debtors[i].user, to: creditors[j].user, cents });
      debtors[i].left -= cents;
      creditors[j].left -= cents;
      if (debtors[i].left === 0) i += 1;
      if (creditors[j].left === 0) j += 1;
    }
    return transfers;
  }
}

export function demo() {
  const book = new Splitwise();
  book.addExpense("Ada", 300, { type: "equal", users: ["Ada", "Bo", "Cy"] });
  if (book.balance("Ada") !== 200 || book.balance("Bo") !== -100) throw new Error("equal");
  book.addExpense("Bo", 100, { type: "exact", shares: { Ada: 40, Bo: 60 } });
  if (book.balance("Ada") !== 160) throw new Error("exact");
  const percents = new Splitwise();
  percents.addExpense("Ada", 200, { type: "percent", shares: { Bo: 25, Cy: 75 } });
  if (percents.balance("Bo") !== -50 || percents.balance("Cy") !== -150 || percents.balance("Ada") !== 200) {
    throw new Error("percent");
  }
  const transfers = book.simplify();
  const moved = transfers.reduce((sum, row) => sum + row.cents, 0);
  const owed = [...book.net.values()].filter((cents) => cents > 0).reduce((sum, cents) => sum + cents, 0);
  if (moved !== owed) throw new Error("simplify must settle what is owed");
}

if (import.meta.main) demo();
