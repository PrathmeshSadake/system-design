export class Restaurant {
  constructor() {
    this.tables = [];
    this.reservations = [];
    this.next = 1;
  }
  addTable(id, seats) {
    this.tables.push({ id, seats });
  }
  reserve(party, start, minutes, name) {
    if (party < 1 || minutes < 1) throw new Error("party");
    const end = start + minutes;
    const table = this.tables.find((row) => row.seats >= party && this.free(row.id, start, end));
    if (!table) throw new Error("no table");
    const hold = { id: this.next++, table: table.id, party, start, end, name };
    this.reservations.push(hold);
    return hold;
  }
  free(table, start, end) {
    return !this.reservations.some((row) => row.table === table && row.start < end && start < row.end);
  }
}

export function demo() {
  const room = new Restaurant();
  room.addTable("two", 2);
  room.addTable("four", 4);
  const small = room.reserve(2, 18, 90, "ada");
  if (small.table !== "two") throw new Error("smallest fit");
  const later = room.reserve(2, 19, 60, "bo");
  if (later.table !== "four") throw new Error("two top is busy");
  let none = false;
  try { room.reserve(4, 19, 30, "cy"); } catch { none = true; }
  if (!none) throw new Error("four is taken");
}

if (import.meta.main) demo();
