// A missing logger still has the methods. Callers do not check for nothing every time.

export class RealLog {
  constructor() { this.lines = []; }
  write(line) { this.lines.push(line); }
}

export class QuietLog {
  write() {}
}

export function work(log) {
  log.write("started");
  log.write("finished");
}

export function demo() {
  const log = new RealLog();
  work(log);
  if (log.lines.join(",") !== "started,finished") throw new Error(log.lines.join(","));
  work(new QuietLog());
}

if (import.meta.main) demo();
