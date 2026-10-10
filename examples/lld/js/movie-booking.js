export class Show {
  constructor(seats, now) {
    this.seats = new Map(seats.map((id) => [id, { state: "free", by: null, until: 0 }]));
    this.now = now;
  }
  lock(seatId, user, ttl = 5) {
    const seat = this.seat(seatId);
    this.expire(seat);
    if (seat.state === "sold") throw new Error("sold");
    if (seat.state === "held" && seat.by !== user) throw new Error("held");
    seat.state = "held";
    seat.by = user;
    seat.until = this.now() + ttl;
  }
  confirm(seatId, user) {
    const seat = this.seat(seatId);
    this.expire(seat);
    if (seat.state !== "held" || seat.by !== user) throw new Error("no lock");
    seat.state = "sold";
    seat.until = 0;
  }
  seat(id) {
    const seat = this.seats.get(id);
    if (!seat) throw new Error("no seat");
    return seat;
  }
  expire(seat) {
    if (seat.state === "held" && seat.until <= this.now()) {
      seat.state = "free";
      seat.by = null;
    }
  }
}

export function demo() {
  let time = 0;
  const show = new Show(["A1"], () => time);
  show.lock("A1", "ada");
  let blocked = false;
  try { show.lock("A1", "bo"); } catch { blocked = true; }
  if (!blocked) throw new Error("lock");
  time = 5;
  show.lock("A1", "bo");
  show.confirm("A1", "bo");
  if (show.seats.get("A1").state !== "sold") throw new Error("sold");
}

if (import.meta.main) demo();
