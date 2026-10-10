// Spots have sizes. Pricing can surge when the lot is nearly full.

const SIZE = { bike: 1, car: 2, truck: 3 };

export class ParkingLot {
  constructor(spots, { base = 10, surgeAt = 0.8, surge = 2 } = {}) {
    this.spots = spots.map((spot) => ({ ...spot, vehicle: null }));
    this.tickets = new Map();
    this.base = base;
    this.surgeAt = surgeAt;
    this.surge = surge;
    this.nextId = 1;
  }
  occupancy() {
    const taken = this.spots.filter((spot) => spot.vehicle).length;
    return taken / this.spots.length;
  }
  park(vehicle) {
    const need = SIZE[vehicle.type];
    const spot = this.spots.find((item) => !item.vehicle && SIZE[item.type] >= need);
    if (!spot) throw new Error("full");
    spot.vehicle = vehicle;
    const ticket = { id: `t${this.nextId++}`, spotId: spot.id, vehicle, inAt: vehicle.at };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }
  leave(ticketId, at) {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error("unknown ticket");
    const spot = this.spots.find((item) => item.id === ticket.spotId);
    const hours = Math.max(1, Math.ceil((at - ticket.inAt) / 60));
    const rate = this.occupancy() >= this.surgeAt ? this.base * this.surge : this.base;
    const fee = hours * rate * SIZE[ticket.vehicle.type];
    spot.vehicle = null;
    this.tickets.delete(ticketId);
    return fee;
  }
}

export function demo() {
  const lot = new ParkingLot([
    { id: "b1", type: "bike" },
    { id: "c1", type: "car" },
    { id: "t1", type: "truck" },
  ]);
  const truck = lot.park({ type: "truck", at: 0 });
  const car = lot.park({ type: "car", at: 0 });
  const bike = lot.park({ type: "bike", at: 0 });
  if (truck.spotId !== "t1" || car.spotId !== "c1" || bike.spotId !== "b1") throw new Error("sizes");
  let refused = false;
  try { lot.park({ type: "bike", at: 0 }); } catch { refused = true; }
  if (!refused) throw new Error("a full lot must refuse");
  const fee = lot.leave(car.id, 60);
  if (fee !== 40) throw new Error(`fee ${fee}`);
}

if (import.meta.main) demo();
