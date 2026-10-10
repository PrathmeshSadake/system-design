const RANK = { debug: 10, info: 20, warn: 30, error: 40 };

export class Logger {
  constructor(level, appenders) {
    this.level = level;
    this.appenders = appenders;
  }
  log(level, message) {
    if (RANK[level] < RANK[this.level]) return;
    const row = { level, message };
    for (const appender of this.appenders) appender(row);
  }
}

export function demo() {
  const memory = [];
  const logger = new Logger("info", [
    (row) => memory.push(row),
    (row) => {
      if (row.level === "error") memory.push({ level: "alert", message: row.message });
    },
  ]);
  logger.log("debug", "hidden");
  logger.log("info", "saved");
  logger.log("error", "boom");
  if (memory.map((row) => row.level).join(",") !== "info,error,alert") throw new Error(memory.map((row) => row.level).join(","));
}

if (import.meta.main) demo();
