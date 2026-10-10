// A map finds by key. A set keeps uniques. A queue is first in, first out. A heap pops the smallest.

export class MinHeap {
  constructor() { this.a = []; }
  push(item) {
    this.a.push(item);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p].rank <= this.a[i].rank) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  pop() {
    if (this.a.length === 0) return undefined;
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length > 0) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let s = i;
        if (l < this.a.length && this.a[l].rank < this.a[s].rank) s = l;
        if (r < this.a.length && this.a[r].rank < this.a[s].rank) s = r;
        if (s === i) break;
        [this.a[s], this.a[i]] = [this.a[i], this.a[s]];
        i = s;
      }
    }
    return top;
  }
}

export function demo() {
  const byId = new Map();
  byId.set("a", 1);
  const seen = new Set(["a", "a", "b"]);
  if (seen.size !== 2 || byId.get("a") !== 1) throw new Error("map or set");
  const line = ["first", "second"];
  if (line.shift() !== "first") throw new Error("queue");
  const heap = new MinHeap();
  heap.push({ rank: 3, name: "low" });
  heap.push({ rank: 1, name: "high" });
  if (heap.pop().name !== "high" || heap.pop().name !== "low") throw new Error("heap");
}

if (import.meta.main) demo();
