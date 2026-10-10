// Build a burger step by step, and refuse to serve one with no bun.

export class BurgerBuilder {
  constructor() {
    this.parts = [];
  }
  bun() { this.parts.push("bun"); return this; }
  patty() { this.parts.push("patty"); return this; }
  cheese() { this.parts.push("cheese"); return this; }
  build() {
    if (!this.parts.includes("bun") || !this.parts.includes("patty")) {
      throw new Error("a burger needs a bun and a patty");
    }
    return this.parts.slice();
  }
}

export function demo() {
  const burger = new BurgerBuilder().bun().patty().cheese().bun().build();
  if (burger.join(",") !== "bun,patty,cheese,bun") throw new Error(burger.join(","));
  let refused = false;
  try { new BurgerBuilder().cheese().build(); } catch { refused = true; }
  if (!refused) throw new Error("incomplete burger must be refused");
}

if (import.meta.main) demo();
