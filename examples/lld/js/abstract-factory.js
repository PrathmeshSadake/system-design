// A kit builds a whole matching family: button and field from the same theme.

export class DarkKit {
  button() { return "dark button"; }
  field() { return "dark field"; }
}

export class LightKit {
  button() { return "light button"; }
  field() { return "light field"; }
}

export function screen(kit) {
  return `${kit.button()} + ${kit.field()}`;
}

export function demo() {
  if (screen(new DarkKit()) !== "dark button + dark field") throw new Error("dark");
  if (screen(new LightKit()) !== "light button + light field") throw new Error("light");
}

if (import.meta.main) demo();
