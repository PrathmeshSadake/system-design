// Wrap a gift. Each wrap adds something and still looks like a gift.

export class PlainGift {
  open() { return "toy"; }
}

export class Wrapped {
  constructor(gift) { this.gift = gift; }
  open() { return `paper(${this.gift.open()})`; }
}

export class Ribboned {
  constructor(gift) { this.gift = gift; }
  open() { return `ribbon(${this.gift.open()})`; }
}

export function demo() {
  const gift = new Ribboned(new Wrapped(new PlainGift()));
  if (gift.open() !== "ribbon(paper(toy))") throw new Error(gift.open());
}

if (import.meta.main) demo();
