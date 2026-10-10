export class JobQueue {
  constructor(maxAttempts = 3) {
    this.maxAttempts = maxAttempts;
    this.ready = [];
    this.dead = [];
  }
  push(name, priority, work) {
    this.ready.push({ name, priority, attempts: 0, work });
    this.ready.sort((a, b) => b.priority - a.priority);
  }
  work() {
    const job = this.ready.shift();
    if (!job) return null;
    try {
      job.work();
      return { name: job.name, status: "done" };
    } catch (error) {
      job.attempts += 1;
      if (job.attempts >= this.maxAttempts) {
        this.dead.push(job);
        return { name: job.name, status: "dead", error: error.message };
      }
      this.ready.push(job);
      this.ready.sort((a, b) => b.priority - a.priority);
      return { name: job.name, status: "retry", error: error.message };
    }
  }
}

export function demo() {
  let tries = 0;
  const queue = new JobQueue(2);
  queue.push("slow", 1, () => {});
  queue.push("hot", 5, () => {
    tries += 1;
    if (tries < 2) throw new Error("blip");
  });
  const first = queue.work();
  if (first.name !== "hot" || first.status !== "retry") throw new Error("priority then retry");
  if (queue.work().status !== "done") throw new Error("hot succeeds");
  if (queue.work().name !== "slow") throw new Error("then the rest");
  queue.push("bad", 1, () => { throw new Error("nope"); });
  if (queue.work().status !== "retry") throw new Error("first miss");
  if (queue.work().status !== "dead" || queue.dead.length !== 1) throw new Error("dlq");
}

if (import.meta.main) demo();
