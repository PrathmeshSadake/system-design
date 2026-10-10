// The latch is the only way in. Callers cannot poke the coins.

export class PiggyBank {
  #cents = 0;

  deposit(cents) {
    if (cents <= 0) throw new Error("deposit a positive number of cents");
    this.#cents += cents;
  }

  spend(cents) {
    if (cents <= 0 || cents > this.#cents) throw new Error("not enough, or a bad amount");
    this.#cents -= cents;
  }

  balance() {
    return this.#cents;
  }
}

export function demo() {
  const bank = new PiggyBank();
  bank.deposit(100);
  bank.spend(40);
  if (bank.balance() !== 60) throw new Error("balance");
  let blocked = false;
  try {
    bank.spend(1000);
  } catch {
    blocked = true;
  }
  if (!blocked || bank.balance() !== 60) throw new Error("the bank must refuse");
}

if (import.meta.main) demo();
