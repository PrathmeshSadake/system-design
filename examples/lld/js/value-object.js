// Two moneys with the same cents are interchangeable. You cannot change the cents in place.

export class Money {
  constructor(cents) {
    if (!Number.isInteger(cents)) throw new Error("cents must be whole");
    this.cents = cents;
  }
  plus(other) { return new Money(this.cents + other.cents); }
  equals(other) { return other instanceof Money && other.cents === this.cents; }
}

export function demo() {
  const a = new Money(100);
  const b = a.plus(new Money(50));
  if (a.cents !== 100 || b.cents !== 150) throw new Error("plus must not edit the old money");
  if (!b.equals(new Money(150))) throw new Error("equal by value");
}

if (import.meta.main) demo();
