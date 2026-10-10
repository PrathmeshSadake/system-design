import java.util.HashMap;
import java.util.Map;
import java.util.function.LongSupplier;

public class Cache {
  static class Node {
    final String key;
    String value;
    long expiresAt;
    Node prev;
    Node next;
    Node(String key, String value, long expiresAt) {
      this.key = key;
      this.value = value;
      this.expiresAt = expiresAt;
    }
  }

  private final int capacity;
  private final LongSupplier clock;
  private int size;
  private final Map<String, Node> store = new HashMap<>();
  private final Node head = new Node(null, null, 0);
  private final Node tail = new Node(null, null, 0);

  Cache(int capacity, LongSupplier clock) {
    this.capacity = capacity;
    this.clock = clock;
    head.next = tail;
    tail.prev = head;
  }

  private void addFront(Node node) {
    node.prev = head;
    node.next = head.next;
    head.next.prev = node;
    head.next = node;
  }

  private void unlink(Node node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  String get(String key) {
    Node node = store.get(key);
    if (node == null) return null;
    if (node.expiresAt != Long.MAX_VALUE && node.expiresAt <= clock.getAsLong()) {
      unlink(node);
      store.remove(key);
      size -= 1;
      return null;
    }
    unlink(node);
    addFront(node);
    return node.value;
  }

  void set(String key, String value, Long ttl) {
    long expiresAt = ttl == null ? Long.MAX_VALUE : clock.getAsLong() + ttl;
    Node existing = store.get(key);
    if (existing != null) {
      existing.value = value;
      existing.expiresAt = expiresAt;
      unlink(existing);
      addFront(existing);
      return;
    }
    if (size == capacity) {
      Node victim = tail.prev;
      unlink(victim);
      store.remove(victim.key);
      size -= 1;
    }
    Node node = new Node(key, value, expiresAt);
    store.put(key, node);
    addFront(node);
    size += 1;
  }

  public static void main(String[] args) {
    long[] time = {0};
    Cache cache = new Cache(2, () -> time[0]);
    cache.set("a", "1", null);
    cache.set("b", "2", null);
    if (!"1".equals(cache.get("a"))) throw new RuntimeException("touch");
    cache.set("c", "3", null);
    if (cache.get("b") != null || !"1".equals(cache.get("a")) || !"3".equals(cache.get("c"))) {
      throw new RuntimeException("lru");
    }
    Cache ttl = new Cache(2, () -> time[0]);
    ttl.set("a", "1", 5L);
    time[0] = 5;
    if (ttl.get("a") != null) throw new RuntimeException("ttl");
    System.out.println("ok");
  }
}
