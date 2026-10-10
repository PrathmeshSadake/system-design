const NEXT = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out"],
  out: ["delivered"],
  delivered: [],
  cancelled: [],
};

export class FoodOrder {
  constructor() { this.status = "placed"; }
  advance(next) {
    if (!NEXT[this.status].includes(next)) throw new Error(`${this.status} cannot become ${next}`);
    this.status = next;
  }
}

export function demo() {
  const order = new FoodOrder();
  order.advance("confirmed");
  order.advance("preparing");
  order.advance("out");
  order.advance("delivered");
  let refused = false;
  try { order.advance("cancelled"); } catch { refused = true; }
  if (!refused || order.status !== "delivered") throw new Error("delivered stays delivered");
}

if (import.meta.main) demo();
