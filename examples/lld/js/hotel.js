export class Hotel {
  constructor() {
    this.rooms = new Map();
    this.stays = [];
    this.next = 1;
  }
  addRoom(id, type) {
    this.rooms.set(id, type);
  }
  reserve(type, checkIn, checkOut, guest) {
    if (checkOut <= checkIn) throw new Error("range");
    const room = [...this.rooms.entries()].find(([id, kind]) => kind === type && this.free(id, checkIn, checkOut));
    if (!room) throw new Error("sold out");
    const stay = { id: this.next++, room: room[0], guest, checkIn, checkOut };
    this.stays.push(stay);
    return stay;
  }
  cancel(id) {
    const index = this.stays.findIndex((stay) => stay.id === id);
    if (index < 0) throw new Error("missing");
    this.stays.splice(index, 1);
  }
  free(room, checkIn, checkOut) {
    return !this.stays.some((stay) => stay.room === room && stay.checkIn < checkOut && checkIn < stay.checkOut);
  }
}

export function demo() {
  const hotel = new Hotel();
  hotel.addRoom("101", "queen");
  const stay = hotel.reserve("queen", 1, 3, "ada");
  let full = false;
  try { hotel.reserve("queen", 2, 4, "bo"); } catch { full = true; }
  if (!full) throw new Error("overlap");
  hotel.reserve("queen", 3, 4, "cy");
  hotel.cancel(stay.id);
  hotel.reserve("queen", 1, 2, "ada");
}

if (import.meta.main) demo();
