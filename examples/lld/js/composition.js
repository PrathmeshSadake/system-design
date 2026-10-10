// A truck has an engine. It is not a kind of engine.

export class Engine {
  constructor() {
    this.running = false;
  }
  start() {
    this.running = true;
  }
}

export class Truck {
  constructor() {
    this.engine = new Engine();
  }
  drive() {
    this.engine.start();
    return this.engine.running ? "going" : "still";
  }
}

export function demo() {
  const truck = new Truck();
  if (truck.drive() !== "going") throw new Error("drive");
  if (truck instanceof Engine) throw new Error("a truck is not an engine");
}

if (import.meta.main) demo();
