export class Subscription {
  constructor(user, price, period, due) {
    this.user = user;
    this.price = price;
    this.period = period;
    this.due = due;
    this.invoices = [];
  }
  bill(now, pay) {
    const made = [];
    while (this.due <= now) {
      const invoice = { user: this.user, cents: this.price, at: this.due, status: "open" };
      if (pay(invoice)) invoice.status = "paid";
      else invoice.status = "failed";
      this.invoices.push(invoice);
      made.push(invoice);
      if (invoice.status === "failed") break;
      this.due += this.period;
    }
    return made;
  }
}

export function demo() {
  let balance = 1500;
  const sub = new Subscription("ada", 1000, 30, 0);
  const pay = (invoice) => {
    if (balance < invoice.cents) return false;
    balance -= invoice.cents;
    return true;
  };
  const first = sub.bill(0, pay);
  if (first.length !== 1 || first[0].status !== "paid" || sub.due !== 30) throw new Error("renew");
  const second = sub.bill(30, pay);
  if (second[0].status !== "failed" || sub.due !== 30 || balance !== 500) throw new Error("stop on failure");
}

if (import.meta.main) demo();
