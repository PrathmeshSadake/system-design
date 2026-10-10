// A note goes along the desk. The first child who can answer it keeps it.

export class Handler {
  setNext(next) { this.next = next; return next; }
  handle(request) {
    if (this.accepts(request)) return this.answer(request);
    if (this.next) return this.next.handle(request);
    return "nobody";
  }
}

export class SmallJobs extends Handler {
  accepts(request) { return request.cents <= 100; }
  answer(request) { return `small ${request.cents}`; }
}

export class BigJobs extends Handler {
  accepts(request) { return request.cents <= 1000; }
  answer(request) { return `big ${request.cents}`; }
}

export function demo() {
  const small = new SmallJobs();
  small.setNext(new BigJobs());
  if (small.handle({ cents: 40 }) !== "small 40") throw new Error("small");
  if (small.handle({ cents: 400 }) !== "big 400") throw new Error("big");
  if (small.handle({ cents: 4000 }) !== "nobody") throw new Error("nobody");
}

if (import.meta.main) demo();
