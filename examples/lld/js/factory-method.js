// The parent knows the delivery story. Each child decides which transport to build.

export class Logistics {
  deliver(box) {
    return this.createTransport().carry(box);
  }
}

export class RoadLogistics extends Logistics {
  createTransport() {
    return { carry: (box) => `truck ${box}` };
  }
}

export class SeaLogistics extends Logistics {
  createTransport() {
    return { carry: (box) => `ship ${box}` };
  }
}

export function demo() {
  if (new RoadLogistics().deliver("toys") !== "truck toys") throw new Error("road");
  if (new SeaLogistics().deliver("toys") !== "ship toys") throw new Error("sea");
}

if (import.meta.main) demo();
