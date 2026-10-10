import { ShoppingCart } from "./shopping-cart.js";

const NEXT = {
  placed: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export class Order {
  constructor(id, lines, total) {
    this.id = id;
    this.lines = lines;
    this.total = total;
    this.status = "placed";
  }
  advance(next) {
    if (!NEXT[this.status].includes(next)) throw new Error(`${this.status} cannot become ${next}`);
    this.status = next;
  }
}

export class OrderBook {
  constructor() {
    this.orders = new Map();
    this.next = 1;
  }
  checkout(cart) {
    const lines = [...cart.lines.values()].map((line) => ({ ...line }));
    if (!lines.length) throw new Error("empty");
    const order = new Order(`o${this.next++}`, lines, cart.total());
    this.orders.set(order.id, order);
    return order;
  }
}

export function demo() {
  const cart = new ShoppingCart();
  cart.add("mug", 500, 2);
  const book = new OrderBook();
  const order = book.checkout(cart);
  order.advance("paid");
  order.advance("shipped");
  let late = false;
  try { order.advance("cancelled"); } catch { late = true; }
  if (!late) throw new Error("shipped cannot cancel");
  order.advance("delivered");
}

if (import.meta.main) demo();
