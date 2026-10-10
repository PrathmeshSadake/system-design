// JavaScript runs your functions one at a time, so a module instance is the safe singleton.
// The Java file next to this uses the holder class, which is safe when threads race.

export class Settings {
  constructor() {
    this.retries = 3;
  }
}

export const settings = new Settings();

export function demo() {
  if (settings.retries !== 3) throw new Error("retries");
  const again = settings;
  again.retries = 4;
  if (settings.retries !== 4) throw new Error("one shared object");
}

if (import.meta.main) demo();
