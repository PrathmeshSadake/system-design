// The interview version: a map plus a doubly linked list for O(1) LRU, and frequency lists for LFU.

class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.freq = 1;
    this.prev = null;
    this.next = null;
  }
}

function link() {
  const head = new Node(null, null);
  const tail = new Node(null, null);
  head.next = tail;
  tail.prev = head;
  return { head, tail };
}

function pushFront(list, node) {
  node.prev = list.head;
  node.next = list.head.next;
  list.head.next.prev = node;
  list.head.next = node;
}

function unlink(node) {
  node.prev.next = node.next;
  node.next.prev = node.prev;
}

export class LruCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.list = link();
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return undefined;
    unlink(node);
    pushFront(this.list, node);
    return node.value;
  }
  put(key, value) {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.get(key);
      return;
    }
    if (this.map.size === this.capacity) {
      const victim = this.list.tail.prev;
      unlink(victim);
      this.map.delete(victim.key);
    }
    const node = new Node(key, value);
    this.map.set(key, node);
    pushFront(this.list, node);
  }
}

export class LfuCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.freqs = new Map();
    this.min = 1;
  }
  bucket(freq) {
    if (!this.freqs.has(freq)) this.freqs.set(freq, link());
    return this.freqs.get(freq);
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return undefined;
    const list = this.bucket(node.freq);
    unlink(node);
    if (list.head.next === list.tail && this.min === node.freq) this.min += 1;
    node.freq += 1;
    pushFront(this.bucket(node.freq), node);
    return node.value;
  }
  put(key, value) {
    if (this.capacity < 1) throw new Error("capacity");
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.get(key);
      return;
    }
    if (this.map.size === this.capacity) {
      const list = this.bucket(this.min);
      const victim = list.tail.prev;
      unlink(victim);
      this.map.delete(victim.key);
    }
    const node = new Node(key, value);
    this.map.set(key, node);
    this.min = 1;
    pushFront(this.bucket(1), node);
  }
}

export function demo() {
  const lru = new LruCache(2);
  lru.put("a", 1);
  lru.put("b", 2);
  if (lru.get("a") !== 1) throw new Error("touch a");
  lru.put("c", 3);
  if (lru.get("b") !== undefined || lru.get("c") !== 3) throw new Error("evict least recent");
  const lfu = new LfuCache(2);
  lfu.put("a", 1);
  lfu.put("b", 2);
  lfu.get("a");
  lfu.get("a");
  lfu.put("c", 3);
  if (lfu.get("b") !== undefined || lfu.get("a") !== 1) throw new Error("evict least frequent");
}

if (import.meta.main) demo();
