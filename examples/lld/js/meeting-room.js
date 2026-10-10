export class MeetingBook {
  constructor() {
    this.rooms = new Set();
    this.bookings = [];
    this.next = 1;
  }
  addRoom(id) {
    this.rooms.add(id);
  }
  book(room, start, end, title) {
    if (!this.rooms.has(room)) throw new Error("no room");
    if (end <= start) throw new Error("range");
    const clash = this.bookings.some((row) => row.room === room && row.start < end && start < row.end);
    if (clash) throw new Error("conflict");
    const row = { id: this.next++, room, start, end, title };
    this.bookings.push(row);
    return row;
  }
  cancel(id) {
    const index = this.bookings.findIndex((row) => row.id === id);
    if (index < 0) throw new Error("missing");
    this.bookings.splice(index, 1);
  }
}

export function demo() {
  const book = new MeetingBook();
  book.addRoom("oak");
  const first = book.book("oak", 9, 10, "stand up");
  let clash = false;
  try { book.book("oak", 9, 11, "overlap"); } catch { clash = true; }
  if (!clash) throw new Error("conflict");
  book.book("oak", 10, 11, "touches the end");
  book.cancel(first.id);
  book.book("oak", 9, 10, "free again");
}

if (import.meta.main) demo();
