// A cache with a swappable eviction rule, a time to live, and a swappable store.

class Node {
  constructor(key, value, expiresAt) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
    this.freq = 1;
    this.prev = null;
    this.next = null;
  }
}

class List {
  constructor() {
    this.head = new Node(null, null, 0);
    this.tail = new Node(null, null, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  addFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  popBack() {
    const node = this.tail.prev;
    if (node === this.head) return null;
    this.remove(node);
    return node;
  }
  get empty() {
    return this.head.next === this.tail;
  }
}

export class LruPolicy {
  constructor() { this.list = new List(); }
  onPut(node) { this.list.addFront(node); }
  onGet(node) { this.list.remove(node); this.list.addFront(node); }
  forget(node) { this.list.remove(node); }
  evict() { return this.list.popBack(); }
}

export class LfuPolicy {
  constructor() {
    this.freqs = new Map();
    this.min = 1;
  }
  bucket(freq) {
    if (!this.freqs.has(freq)) this.freqs.set(freq, new List());
    return this.freqs.get(freq);
  }
  onPut(node) {
    node.freq = 1;
    this.min = 1;
    this.bucket(1).addFront(node);
  }
  onGet(node) {
    const list = this.bucket(node.freq);
    list.remove(node);
    if (list.empty && this.min === node.freq) this.min += 1;
    node.freq += 1;
    this.bucket(node.freq).addFront(node);
  }
  forget(node) { this.bucket(node.freq).remove(node); }
  evict() {
    const node = this.bucket(this.min).popBack();
    return node;
  }
}

export class MapStore {
  constructor() { this.data = new Map(); }
  get(key) { return this.data.get(key); }
  set(key, node) { this.data.set(key, node); }
  delete(key) { this.data.delete(key); }
  has(key) { return this.data.has(key); }
}

export class LogStore {
  constructor(inner) {
    this.inner = inner;
    this.log = [];
  }
  get(key) { this.log.push(`get ${key}`); return this.inner.get(key); }
  set(key, node) { this.log.push(`set ${key}`); this.inner.set(key, node); }
  delete(key) { this.log.push(`delete ${key}`); this.inner.delete(key); }
  has(key) { return this.inner.has(key); }
}

export class Cache {
  constructor({ capacity, policy, store, now }) {
    if (capacity < 1) throw new Error("capacity");
    this.capacity = capacity;
    this.policy = policy;
    this.store = store;
    this.now = now ?? (() => Date.now());
    this.size = 0;
  }
  get(key) {
    const node = this.store.get(key);
    if (!node) return undefined;
    if (node.expiresAt !== null && node.expiresAt <= this.now()) {
      this.policy.forget(node);
      this.remove(node);
      return undefined;
    }
    this.policy.onGet(node);
    return node.value;
  }
  set(key, value, ttlMs = null) {
    const expiresAt = ttlMs === null ? null : this.now() + ttlMs;
    const existing = this.store.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = expiresAt;
      this.policy.onGet(existing);
      return;
    }
    if (this.size === this.capacity) {
      const victim = this.policy.evict();
      if (victim) this.remove(victim);
    }
    const node = new Node(key, value, expiresAt);
    this.store.set(key, node);
    this.policy.onPut(node);
    this.size += 1;
  }
  remove(node) {
    this.store.delete(node.key);
    this.size -= 1;
  }
}

export function demo() {
  const lru = new Cache({ capacity: 2, policy: new LruPolicy(), store: new MapStore(), now: () => 0 });
  lru.set("a", 1);
  lru.set("b", 2);
  lru.get("a");
  lru.set("c", 3);
  if (lru.get("b") !== undefined || lru.get("a") !== 1 || lru.get("c") !== 3) throw new Error("lru");
  let time = 0;
  const ttl = new Cache({ capacity: 2, policy: new LruPolicy(), store: new MapStore(), now: () => time });
  ttl.set("a", 1, 5);
  time = 5;
  if (ttl.get("a") !== undefined) throw new Error("ttl");
  const log = new LogStore(new MapStore());
  const watched = new Cache({ capacity: 2, policy: new LfuPolicy(), store: log, now: () => 0 });
  watched.set("a", 1);
  watched.get("a");
  watched.get("a");
  watched.set("b", 2);
  watched.set("c", 3);
  if (watched.get("a") !== 1 || watched.get("b") !== undefined || watched.get("c") !== 3) {
    throw new Error("lfu keeps the hot key");
  }
  if (!log.log.includes("set a")) throw new Error("store log");
}

if (import.meta.main) demo();
