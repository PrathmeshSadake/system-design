// The account knows how to withdraw. A bag of fields would leave the rule to every caller.

export class Account {
  constructor(cents) {
    if (cents < 0) throw new Error("start at zero or more");
    this.cents = cents;
  }
  withdraw(cents) {
    if (cents <= 0) throw new Error("withdraw a positive amount");
    if (cents > this.cents) throw new Error("insufficient");
    this.cents -= cents;
  }
}

export function demo() {
  const account = new Account(100);
  account.withdraw(30);
  if (account.cents !== 70) throw new Error("balance");
  let blocked = false;
  try { account.withdraw(1000); } catch { blocked = true; }
  if (!blocked || account.cents !== 70) throw new Error("rule escaped");
}

if (import.meta.main) demo();
