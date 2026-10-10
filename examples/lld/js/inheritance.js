// A toy truck is a toy. It can be hugged, and it can also roll.

export class Toy {
  constructor(name) {
    this.name = name;
  }
  hug() {
    return `hug ${this.name}`;
  }
}

export class Truck extends Toy {
  roll() {
    return `${this.name} rolls`;
  }
}

export function demo() {
  const truck = new Truck("red");
  if (truck.hug() !== "hug red" || truck.roll() !== "red rolls") throw new Error("truck");
  if (!(truck instanceof Toy)) throw new Error("a truck is a toy");
}

if (import.meta.main) demo();
