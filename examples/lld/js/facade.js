// One counter. Behind it, the kitchen, the cashier, and the bagger still exist.

export class Kitchen { cook(item) { return `cooked ${item}`; } }
export class Cashier { charge(cents) { return `paid ${cents}`; } }
export class Bagger { bag(item) { return `bagged ${item}`; } }

export class LunchCounter {
  constructor() {
    this.kitchen = new Kitchen();
    this.cashier = new Cashier();
    this.bagger = new Bagger();
  }
  order(item, cents) {
    return [this.cashier.charge(cents), this.kitchen.cook(item), this.bagger.bag(item)];
  }
}

export function demo() {
  const steps = new LunchCounter().order("soup", 400);
  if (steps.join("|") !== "paid 400|cooked soup|bagged soup") throw new Error(steps.join("|"));
}

if (import.meta.main) demo();
