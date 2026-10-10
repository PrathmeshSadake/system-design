export class ShoppingCart {
  constructor() {
    this.lines = new Map();
  }
  add(sku, price, qty = 1) {
    if (!Number.isInteger(price) || price < 0 || qty < 1) throw new Error("line");
    const line = this.lines.get(sku) ?? { sku, price, qty: 0 };
    if (line.qty > 0 && line.price !== price) throw new Error("price changed");
    line.qty += qty;
    this.lines.set(sku, line);
  }
  setQty(sku, qty) {
    if (qty === 0) this.lines.delete(sku);
    else if (qty > 0) this.lines.get(sku).qty = qty;
    else throw new Error("qty");
  }
  total() {
    let cents = 0;
    for (const line of this.lines.values()) cents += line.price * line.qty;
    return cents;
  }
}

export function demo() {
  const cart = new ShoppingCart();
  cart.add("mug", 500, 2);
  cart.add("tea", 300);
  if (cart.total() !== 1300) throw new Error("total");
  cart.setQty("tea", 0);
  if (cart.total() !== 1000) throw new Error("removed");
}

if (import.meta.main) demo();
