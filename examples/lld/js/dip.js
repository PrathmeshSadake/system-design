// The lamp names a socket, not a particular power brick.

export class Lamp {
  constructor(power) {
    this.power = power;
  }
  glow() {
    return this.power.supply() ? "lit" : "dark";
  }
}

export class Battery {
  supply() {
    return true;
  }
}

export class Unplugged {
  supply() {
    return false;
  }
}

export function demo() {
  if (new Lamp(new Battery()).glow() !== "lit") throw new Error("battery");
  if (new Lamp(new Unplugged()).glow() !== "dark") throw new Error("unplugged");
}

if (import.meta.main) demo();
