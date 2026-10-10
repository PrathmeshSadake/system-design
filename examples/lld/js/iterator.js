// Walk a shelf from the left without the caller knowing it is an array.

export class Shelf {
  constructor(items) { this.items = items.slice(); }
  walk() {
    let i = 0;
    const items = this.items;
    return {
      next() {
        if (i >= items.length) return { done: true };
        return { done: false, value: items[i++] };
      },
    };
  }
}

export function demo() {
  const shelf = new Shelf(["cup", "plate"]);
  const it = shelf.walk();
  const seen = [];
  for (let step = it.next(); !step.done; step = it.next()) seen.push(step.value);
  if (seen.join(",") !== "cup,plate") throw new Error(seen.join(","));
}

if (import.meta.main) demo();
