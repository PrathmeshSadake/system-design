// New prices arrive as new classes. The checkout loop stays shut.

export class Checkout {
  constructor(pricing) {
    this.pricing = pricing;
  }
  due(cents) {
    return this.pricing.apply(cents);
  }
}

export class FullPrice {
  apply(cents) {
    return cents;
  }
}

export class PercentOff {
  constructor(percent) {
    this.percent = percent;
  }
  apply(cents) {
    return Math.round(cents * (100 - this.percent) / 100);
  }
}

export function demo() {
  if (new Checkout(new FullPrice()).due(200) !== 200) throw new Error("full");
  if (new Checkout(new PercentOff(10)).due(200) !== 180) throw new Error("ten off");
}

if (import.meta.main) demo();
