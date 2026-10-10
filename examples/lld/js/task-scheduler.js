export class Scheduler {
  constructor() {
    this.jobs = [];
    this.next = 1;
  }
  add(name, runAt, priority, every = 0) {
    const job = { id: this.next++, name, runAt, priority, every, runs: 0 };
    this.jobs.push(job);
    return job;
  }
  tick(now) {
    const due = this.jobs.filter((job) => job.runAt <= now).sort((a, b) => b.priority - a.priority || a.runAt - b.runAt);
    const ran = [];
    for (const job of due) {
      job.runs += 1;
      ran.push(job.name);
      if (job.every > 0) job.runAt = now + job.every;
      else this.jobs = this.jobs.filter((row) => row !== job);
    }
    return ran;
  }
}

export function demo() {
  const scheduler = new Scheduler();
  scheduler.add("low", 5, 1);
  scheduler.add("high", 5, 9);
  scheduler.add("daily", 5, 2, 10);
  if (scheduler.tick(5).join(",") !== "high,daily,low") throw new Error("priority");
  if (scheduler.tick(14).join(",") !== "") throw new Error("not yet");
  if (scheduler.tick(15).join(",") !== "daily") throw new Error("recur");
}

if (import.meta.main) demo();
