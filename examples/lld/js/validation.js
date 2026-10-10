// Check the shape at the door. Check the business rule inside the object.

export function parseQuantity(raw) {
  if (typeof raw !== "string" || !/^[1-9][0-9]*$/.test(raw)) {
    throw new Error("quantity must be a positive whole number");
  }
  return Number(raw);
}

export class Stock {
  constructor(onHand) { this.onHand = onHand; }
  take(quantity) {
    if (quantity > this.onHand) throw new Error("not enough stock");
    this.onHand -= quantity;
  }
}

export function demo() {
  if (parseQuantity("2") !== 2) throw new Error("parse");
  let bad = false;
  try { parseQuantity("0"); } catch { bad = true; }
  if (!bad) throw new Error("zero is not a quantity here");
  const stock = new Stock(2);
  stock.take(2);
  if (stock.onHand !== 0) throw new Error("take");
}

if (import.meta.main) demo();
