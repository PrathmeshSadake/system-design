// A round peg cannot enter a square hole until an adapter wraps it.

export class RoundPeg {
  constructor(radius) { this.radius = radius; }
}

export class SquareHole {
  constructor(width) { this.width = width; }
  fits(square) { return square.width <= this.width; }
}

export class PegAdapter {
  constructor(peg) { this.width = peg.radius * 2; }
}

export function demo() {
  const hole = new SquareHole(10);
  const peg = new RoundPeg(4);
  if (!hole.fits(new PegAdapter(peg))) throw new Error("adapted peg should fit");
  if (hole.fits(new PegAdapter(new RoundPeg(8)))) throw new Error("too wide");
}

if (import.meta.main) demo();
