// Sync listeners run before publish returns. Async listeners are queued and flushed.

export class EventBus {
  constructor() {
    this.topics = new Map();
    this.queue = [];
  }
  subscribe(topic, handler, mode = "sync") {
    if (!this.topics.has(topic)) this.topics.set(topic, []);
    this.topics.get(topic).push({ handler, mode });
    return () => {
      const left = this.topics.get(topic).filter((row) => row.handler !== handler);
      this.topics.set(topic, left);
    };
  }
  publish(topic, event) {
    const rows = this.topics.get(topic) ?? [];
    const sync = [];
    for (const row of rows) {
      if (row.mode === "async") this.queue.push(() => row.handler(event));
      else sync.push(row.handler(event));
    }
    return sync;
  }
  flush() {
    const pending = this.queue.splice(0);
    return pending.map((run) => run());
  }
}

export function demo() {
  const bus = new EventBus();
  const seen = [];
  bus.subscribe("lunch", (event) => seen.push(`now ${event}`));
  bus.subscribe("lunch", (event) => seen.push(`later ${event}`), "async");
  bus.subscribe("bell", (event) => seen.push(event));
  bus.publish("lunch", "soup");
  if (seen.join(",") !== "now soup") throw new Error(seen.join(","));
  bus.flush();
  if (seen.join(",") !== "now soup,later soup") throw new Error("async");
  bus.publish("bell", "ring");
  if (!seen.includes("ring")) throw new Error("topic");
}

if (import.meta.main) demo();
