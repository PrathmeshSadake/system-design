// The remote and the device vary on their own. A remote holds a device.

export class Tv {
  constructor() { this.on = false; }
  toggle() { this.on = !this.on; return this.on ? "tv on" : "tv off"; }
}

export class Radio {
  constructor() { this.on = false; }
  toggle() { this.on = !this.on; return this.on ? "radio on" : "radio off"; }
}

export class Remote {
  constructor(device) { this.device = device; }
  press() { return this.device.toggle(); }
}

export function demo() {
  if (new Remote(new Tv()).press() !== "tv on") throw new Error("tv");
  if (new Remote(new Radio()).press() !== "radio on") throw new Error("radio");
}

if (import.meta.main) demo();
