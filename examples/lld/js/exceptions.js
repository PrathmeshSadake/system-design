// A bad argument is the caller's fault. A broken rule is the object's state. Say which.

export class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequest";
  }
}
export class RuleBroken extends Error {
  constructor(message) {
    super(message);
    this.name = "RuleBroken";
  }
}

export class Seat {
  constructor() { this.taken = false; }
  reserve(name) {
    if (!name) throw new BadRequest("name is required");
    if (this.taken) throw new RuleBroken("seat already taken");
    this.taken = true;
  }
}

export function demo() {
  const seat = new Seat();
  seat.reserve("Ada");
  let kind = "";
  try { seat.reserve("Bo"); } catch (err) { kind = err.name; }
  if (kind !== "RuleBroken") throw new Error(kind);
  try { new Seat().reserve(""); } catch (err) { kind = err.name; }
  if (kind !== "BadRequest") throw new Error(kind);
}

if (import.meta.main) demo();
