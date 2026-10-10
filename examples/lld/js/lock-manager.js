export class LockManager {
  constructor() {
    this.locks = new Map();
  }
  tryLock(key, owner, ttl, now) {
    const row = this.locks.get(key);
    if (row && row.until > now && row.owner !== owner) return false;
    this.locks.set(key, { owner, until: now + ttl });
    return true;
  }
  unlock(key, owner, now) {
    const row = this.locks.get(key);
    if (!row || row.until <= now) return false;
    if (row.owner !== owner) throw new Error("not owner");
    this.locks.delete(key);
    return true;
  }
}

export function demo() {
  const locks = new LockManager();
  if (!locks.tryLock("seat", "ada", 5, 0)) throw new Error("first");
  if (locks.tryLock("seat", "bo", 5, 1)) throw new Error("held");
  if (!locks.tryLock("seat", "ada", 5, 2)) throw new Error("renew");
  if (locks.tryLock("seat", "bo", 5, 6)) throw new Error("still ada");
  if (!locks.tryLock("seat", "bo", 5, 7)) throw new Error("expired");
}

if (import.meta.main) demo();
