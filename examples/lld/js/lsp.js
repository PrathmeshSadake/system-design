// A penguin is a bird. It is not a flying bird. Do not promise fly and then refuse.

export class Bird {
  constructor(name) {
    this.name = name;
  }
}

export class FlyingBird extends Bird {
  fly() {
    return `${this.name} flies`;
  }
}

export class Penguin extends Bird {
  swim() {
    return `${this.name} swims`;
  }
}

export function migrate(flock) {
  return flock.map((bird) => bird.fly());
}

export function demo() {
  const moved = migrate([new FlyingBird("sparrow")]);
  if (moved[0] !== "sparrow flies") throw new Error(moved[0]);
  const penguin = new Penguin("pip");
  if (penguin.swim() !== "pip swims") throw new Error("swim");
  if (typeof penguin.fly === "function") throw new Error("penguin must not pretend to fly");
}

if (import.meta.main) demo();
