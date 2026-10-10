// The trip stays the same. The way you pay for it can be swapped.

export class Trip {
  constructor(fare, pricing) {
    this.fare = fare;
    this.pricing = pricing;
  }
  due() { return this.pricing.price(this.fare); }
}

export const daytime = { price: (cents) => cents };
export const night = { price: (cents) => Math.round(cents * 1.5) };

export function demo() {
  if (new Trip(100, daytime).due() !== 100) throw new Error("day");
  if (new Trip(100, night).due() !== 150) throw new Error("night");
}

if (import.meta.main) demo();
