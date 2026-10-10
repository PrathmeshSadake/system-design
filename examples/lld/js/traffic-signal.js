const CYCLE = [
  { name: "green", span: 4 },
  { name: "yellow", span: 1 },
  { name: "red", span: 4 },
];

export class Signal {
  constructor() {
    this.index = 0;
    this.left = CYCLE[0].span;
    this.emergency = false;
  }
  color() {
    return this.emergency ? "red" : CYCLE[this.index].name;
  }
  tick() {
    if (this.emergency) return this.color();
    this.left -= 1;
    if (this.left === 0) {
      this.index = (this.index + 1) % CYCLE.length;
      this.left = CYCLE[this.index].span;
    }
    return this.color();
  }
  emergencyStop() {
    this.emergency = true;
  }
  resume() {
    this.emergency = false;
  }
}

export function demo() {
  const signal = new Signal();
  if (signal.color() !== "green") throw new Error("start");
  signal.tick();
  signal.tick();
  signal.tick();
  if (signal.tick() !== "yellow") throw new Error("yellow");
  if (signal.tick() !== "red") throw new Error("red");
  signal.emergencyStop();
  if (signal.tick() !== "red") throw new Error("hold");
  signal.resume();
  if (signal.color() !== "red") throw new Error("same phase");
}

if (import.meta.main) demo();
