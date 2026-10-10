// Ask the wallet to pay. Do not reach through the customer into the wallet's coins.

export class Wallet {
  constructor(cents) { this.cents = cents; }
  pay(cents) {
    if (cents > this.cents) throw new Error("short");
    this.cents -= cents;
    return this.cents;
  }
}

export class Customer {
  constructor(wallet) { this.wallet = wallet; }
  pay(cents) { return this.wallet.pay(cents); }
}

export function demo() {
  const customer = new Customer(new Wallet(100));
  if (customer.pay(40) !== 60) throw new Error("pay");
}

if (import.meta.main) demo();
