export class ConnectionPool {
  constructor(max, timeout) {
    this.max = max;
    this.timeout = timeout;
    this.idle = [];
    this.open = 0;
    this.waiters = [];
    this.next = 1;
  }
  acquire(now) {
    this.dropLate(now);
    if (this.idle.length) return { conn: this.idle.pop(), waited: false };
    if (this.open < this.max) {
      this.open += 1;
      return { conn: `c${this.next++}`, waited: false };
    }
    const ticket = { now, conn: null };
    this.waiters.push(ticket);
    return { conn: null, waited: true, ticket };
  }
  release(conn, now) {
    this.dropLate(now);
    const ticket = this.waiters.shift();
    if (ticket) ticket.conn = conn;
    else this.idle.push(conn);
  }
  dropLate(now) {
    this.waiters = this.waiters.filter((ticket) => now < ticket.now + this.timeout);
  }
}

export function demo() {
  const pool = new ConnectionPool(1, 5);
  const first = pool.acquire(0);
  const waiting = pool.acquire(1);
  if (first.conn !== "c1" || waiting.conn !== null) throw new Error("limit");
  pool.release(first.conn, 2);
  if (waiting.ticket.conn !== "c1" || pool.waiters.length !== 0) throw new Error("handed over");
  const blocked = pool.acquire(3);
  if (blocked.conn !== null) throw new Error("still busy");
  pool.dropLate(8);
  if (pool.waiters.length !== 0) throw new Error("timeout");
}

if (import.meta.main) demo();
