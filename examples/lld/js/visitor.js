// The shapes stay put. A new question, "how much paint," is a visitor that walks them.

export class Circle {
  constructor(radius) { this.radius = radius; }
  accept(visitor) { return visitor.visitCircle(this); }
}

export class Square {
  constructor(side) { this.side = side; }
  accept(visitor) { return visitor.visitSquare(this); }
}

export const area = {
  visitCircle: (circle) => Math.round(Math.PI * circle.radius * circle.radius),
  visitSquare: (square) => square.side * square.side,
};

export function demo() {
  const shapes = [new Circle(1), new Square(3)];
  const areas = shapes.map((shape) => shape.accept(area));
  if (areas[0] !== 3 || areas[1] !== 9) throw new Error(areas.join(","));
}

if (import.meta.main) demo();
