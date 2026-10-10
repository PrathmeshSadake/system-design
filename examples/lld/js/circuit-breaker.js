export class CircuitBreaker {
  constructor(limit, cooldown) {
    this.limit = limit;
    this.cooldown = cooldown;
    this.state = "closed";
    this.failures = 0;
    this.openedAt = 0;
  }
  async call(now, work) {
    if (this.state === "open") {
      if (now < this.openedAt + this.cooldown) throw new Error("open");
      this.state = "half-open";
    }
    try {
      const value = await work();
      this.failures = 0;
      this.state = "closed";
      return value;
    } catch (error) {
      this.failures += 1;
      if (this.state === "half-open" || this.failures >= this.limit) {
        this.state = "open";
        this.openedAt = now;
      }
      throw error;
    }
  }
}

export async function demo() {
  let boom = true;
  const breaker = new CircuitBreaker(2, 10);
  const fail = () => { throw new Error("down"); };
  await breaker.call(0, fail).catch(() => {});
  await breaker.call(1, fail).catch(() => {});
  if (breaker.state !== "open") throw new Error("opened");
  let blocked = false;
  try { await breaker.call(5, async () => "no"); } catch { blocked = true; }
  if (!blocked) throw new Error("still open");
  boom = false;
  const value = await breaker.call(11, async () => (boom ? fail() : "up"));
  if (value !== "up" || breaker.state !== "closed") throw new Error("half open healed");
}

if (import.meta.main) await demo();
