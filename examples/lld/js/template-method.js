// The recipe steps stay in the parent. The child fills in the one step that varies.

export class Sandwich {
  make() {
    return [this.bread(), this.filling(), this.bread()];
  }
  bread() { return "bread"; }
}

export class CheeseSandwich extends Sandwich {
  filling() { return "cheese"; }
}

export class JamSandwich extends Sandwich {
  filling() { return "jam"; }
}

export function demo() {
  if (new CheeseSandwich().make().join(",") !== "bread,cheese,bread") throw new Error("cheese");
  if (new JamSandwich().make().join(",") !== "bread,jam,bread") throw new Error("jam");
}

if (import.meta.main) demo();
