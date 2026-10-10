export class Buffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = [];
    this.takers = [];
    this.putters = [];
  }
  put(value) {
    if (this.takers.length) {
      this.takers.shift()(value);
      return Promise.resolve();
    }
    if (this.items.length < this.capacity) {
      this.items.push(value);
      return Promise.resolve();
    }
    return new Promise((resolve) => this.putters.push({ value, resolve }));
  }
  take() {
    if (this.items.length) {
      const value = this.items.shift();
      const parked = this.putters.shift();
      if (parked) {
        this.items.push(parked.value);
        parked.resolve();
      }
      return Promise.resolve(value);
    }
    return new Promise((resolve) => this.takers.push(resolve));
  }
}

export async function demo() {
  const buffer = new Buffer(2);
  await buffer.put(1);
  await buffer.put(2);
  let parked = false;
  const third = buffer.put(3).then(() => { parked = true; });
  await Promise.resolve();
  if (parked) throw new Error("full buffer waits");
  if (await buffer.take() !== 1) throw new Error("first");
  await third;
  if (!parked || (await buffer.take()) !== 2 || (await buffer.take()) !== 3) throw new Error("order");
}

if (import.meta.main) await demo();
