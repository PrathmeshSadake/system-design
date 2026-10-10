// A lamp is off, on, or broken. The same press does different work in each mood.

export class Off {
  press(lamp) { lamp.mood = new On(); return "lit"; }
}
export class On {
  press(lamp) { lamp.mood = new Off(); return "dark"; }
}
export class Broken {
  press() { return "still broken"; }
}

export class Lamp {
  constructor() { this.mood = new Off(); }
  press() { return this.mood.press(this); }
}

export function demo() {
  const lamp = new Lamp();
  if (lamp.press() !== "lit" || lamp.press() !== "dark") throw new Error("toggle");
  lamp.mood = new Broken();
  if (lamp.press() !== "still broken") throw new Error("broken");
}

if (import.meta.main) demo();
