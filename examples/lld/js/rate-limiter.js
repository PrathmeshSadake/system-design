// Four limiters. allow(key, now) is the only question callers ask.

export class TokenBucket {
  constructor(capacity, refillPerMs) {
    this.capacity = capacity;
    this.refillPerMs = refillPerMs;
    this.buckets = new Map();
  }
  allow(key, now, cost = 1) {
    const row = this.buckets.get(key) ?? { tokens: this.capacity, at: now };
    const tokens = Math.min(this.capacity, row.tokens + (now - row.at) * this.refillPerMs);
    if (tokens < cost) {
      this.buckets.set(key, { tokens, at: now });
      return false;
    }
    this.buckets.set(key, { tokens: tokens - cost, at: now });
    return true;
  }
}

export class LeakyBucket {
  constructor(capacity, leakPerMs) {
    this.capacity = capacity;
    this.leakPerMs = leakPerMs;
    this.rows = new Map();
  }
  allow(key, now) {
    const row = this.rows.get(key) ?? { water: 0, at: now };
    const water = Math.max(0, row.water - (now - row.at) * this.leakPerMs);
    if (water + 1 > this.capacity) {
      this.rows.set(key, { water, at: now });
      return false;
    }
    this.rows.set(key, { water: water + 1, at: now });
    return true;
  }
}

export class FixedWindow {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.rows = new Map();
  }
  allow(key, now) {
    const start = Math.floor(now / this.windowMs) * this.windowMs;
    const row = this.rows.get(key);
    const count = row && row.start === start ? row.count : 0;
    if (count + 1 > this.limit) return false;
    this.rows.set(key, { start, count: count + 1 });
    return true;
  }
}

export class SlidingWindow {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.hits = new Map();
  }
  allow(key, now) {
    const prev = (this.hits.get(key) ?? []).filter((at) => now - at < this.windowMs);
    if (prev.length >= this.limit) {
      this.hits.set(key, prev);
      return false;
    }
    prev.push(now);
    this.hits.set(key, prev);
    return true;
  }
}

export function demo() {
  const tokens = new TokenBucket(2, 0);
  if (!tokens.allow("a", 0) || !tokens.allow("a", 0) || tokens.allow("a", 0)) throw new Error("token");
  const leak = new LeakyBucket(1, 0);
  if (!leak.allow("a", 0) || leak.allow("a", 0)) throw new Error("leak");
  const fixed = new FixedWindow(1, 10);
  if (!fixed.allow("a", 5) || fixed.allow("a", 6) || !fixed.allow("a", 10)) throw new Error("fixed");
  const slide = new SlidingWindow(2, 10);
  if (!slide.allow("a", 0) || !slide.allow("a", 5) || slide.allow("a", 9) || !slide.allow("a", 10)) {
    throw new Error("slide");
  }
}

if (import.meta.main) demo();
