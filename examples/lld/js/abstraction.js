// A remote with two buttons. The child does not see the wires.

export class Lamp {
  #on = false;
  press() {
    this.#on = !this.#on;
    return this.#on ? "lit" : "dark";
  }
}

export function demo() {
  const lamp = new Lamp();
  if (lamp.press() !== "lit" || lamp.press() !== "dark") throw new Error("toggle");
}

if (import.meta.main) demo();
