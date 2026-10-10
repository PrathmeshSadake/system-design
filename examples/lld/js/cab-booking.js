export class CabStand {
  constructor() {
    this.drivers = new Map();
    this.trips = new Map();
    this.next = 1;
  }
  join(id, x, y) { this.drivers.set(id, { id, x, y, free: true }); }
  request(rider, x, y) {
    let best = null;
    let dist = Infinity;
    for (const driver of this.drivers.values()) {
      if (!driver.free) continue;
      const d = Math.abs(driver.x - x) + Math.abs(driver.y - y);
      if (d < dist) { dist = d; best = driver; }
    }
    if (!best) throw new Error("no cars");
    best.free = false;
    const trip = { id: `t${this.next++}`, rider, driver: best.id, status: "matched" };
    this.trips.set(trip.id, trip);
    return trip;
  }
  start(id) { this.move(id, "matched", "started"); }
  complete(id) {
    const trip = this.move(id, "started", "completed");
    this.drivers.get(trip.driver).free = true;
  }
  move(id, from, to) {
    const trip = this.trips.get(id);
    if (!trip || trip.status !== from) throw new Error("bad trip state");
    trip.status = to;
    return trip;
  }
}

export function demo() {
  const stand = new CabStand();
  stand.join("near", 1, 1);
  stand.join("far", 9, 9);
  const trip = stand.request("ada", 0, 0);
  if (trip.driver !== "near") throw new Error("nearest");
  stand.start(trip.id);
  stand.complete(trip.id);
  if (!stand.drivers.get("near").free) throw new Error("free again");
}

if (import.meta.main) demo();
