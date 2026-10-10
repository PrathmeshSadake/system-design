// Many trees on a map. The heavy sprite is shared. Each tree keeps only its spot.

const sprites = new Map();

export function sprite(kind) {
  if (!sprites.has(kind)) sprites.set(kind, { kind, bytes: 1000 });
  return sprites.get(kind);
}

export class Tree {
  constructor(kind, x, y) {
    this.sprite = sprite(kind);
    this.x = x;
    this.y = y;
  }
}

export function demo() {
  const a = new Tree("oak", 1, 2);
  const b = new Tree("oak", 8, 9);
  if (a.sprite !== b.sprite) throw new Error("oaks must share one sprite");
  if (a.x === b.x) throw new Error("spots stay on the tree");
  sprite("pine");
  if (sprites.size !== 2) throw new Error("two kinds");
}

if (import.meta.main) demo();
