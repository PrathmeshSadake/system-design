// Each button press is an object. The remote can do it, and can take it back.

export class Light {
  constructor() { this.on = false; }
}

export class Toggle {
  constructor(light) { this.light = light; }
  run() { this.light.on = !this.light.on; }
  undo() { this.light.on = !this.light.on; }
}

export class Remote {
  constructor() { this.history = []; }
  press(command) { command.run(); this.history.push(command); }
  undo() {
    const command = this.history.pop();
    if (command) command.undo();
  }
}

export function demo() {
  const light = new Light();
  const remote = new Remote();
  const toggle = new Toggle(light);
  remote.press(toggle);
  if (!light.on) throw new Error("on");
  remote.undo();
  if (light.on) throw new Error("undo");
  remote.press(new Toggle(light));
  remote.press(new Toggle(light));
  if (light.on) throw new Error("two toggles");
}

if (import.meta.main) demo();
