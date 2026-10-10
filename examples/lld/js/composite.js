// A drawing is a circle, or a group of drawings. You draw both the same way.

export class Circle {
  constructor(name) { this.name = name; }
  draw() { return this.name; }
}

export class Group {
  constructor(parts) { this.parts = parts; }
  draw() { return this.parts.map((part) => part.draw()).join("+"); }
}

export function demo() {
  const picture = new Group([new Circle("sun"), new Group([new Circle("tree"), new Circle("bird")])]);
  if (picture.draw() !== "sun+tree+bird") throw new Error(picture.draw());
}

if (import.meta.main) demo();
