import java.util.HashMap;
import java.util.Map;

public class LruCache {
  static class Node {
    final String key;
    String value;
    int freq = 1;
    Node prev, next;
    Node(String key, String value) { this.key = key; this.value = value; }
  }

  static class List {
    final Node head = new Node(null, null);
    final Node tail = new Node(null, null);
    List() { head.next = tail; tail.prev = head; }
    boolean empty() { return head.next == tail; }
    void addFront(Node node) {
      node.prev = head;
      node.next = head.next;
      head.next.prev = node;
      head.next = node;
    }
    void unlink(Node node) {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    Node popBack() {
      if (empty()) return null;
      Node node = tail.prev;
      unlink(node);
      return node;
    }
  }

  static class Lru {
    final int capacity;
    final Map<String, Node> map = new HashMap<>();
    final List list = new List();
    Lru(int capacity) { this.capacity = capacity; }
    String get(String key) {
      Node node = map.get(key);
      if (node == null) return null;
      list.unlink(node);
      list.addFront(node);
      return node.value;
    }
    void put(String key, String value) {
      Node existing = map.get(key);
      if (existing != null) {
        existing.value = value;
        get(key);
        return;
      }
      if (map.size() == capacity) {
        Node victim = list.popBack();
        map.remove(victim.key);
      }
      Node node = new Node(key, value);
      map.put(key, node);
      list.addFront(node);
    }
  }

  static class Lfu {
    final int capacity;
    final Map<String, Node> map = new HashMap<>();
    final Map<Integer, List> freqs = new HashMap<>();
    int min = 1;
    Lfu(int capacity) { this.capacity = capacity; }
    List bucket(int freq) { return freqs.computeIfAbsent(freq, key -> new List()); }
    String get(String key) {
      Node node = map.get(key);
      if (node == null) return null;
      List list = bucket(node.freq);
      list.unlink(node);
      if (list.empty() && min == node.freq) min += 1;
      node.freq += 1;
      bucket(node.freq).addFront(node);
      return node.value;
    }
    void put(String key, String value) {
      Node existing = map.get(key);
      if (existing != null) {
        existing.value = value;
        get(key);
        return;
      }
      if (map.size() == capacity) {
        Node victim = bucket(min).popBack();
        map.remove(victim.key);
      }
      Node node = new Node(key, value);
      map.put(key, node);
      min = 1;
      bucket(1).addFront(node);
    }
  }

  public static void main(String[] args) {
    Lru lru = new Lru(2);
    lru.put("a", "1");
    lru.put("b", "2");
    if (!"1".equals(lru.get("a"))) throw new RuntimeException("touch");
    lru.put("c", "3");
    if (lru.get("b") != null || !"3".equals(lru.get("c"))) throw new RuntimeException("lru");
    Lfu lfu = new Lfu(2);
    lfu.put("a", "1");
    lfu.put("b", "2");
    lfu.get("a");
    lfu.get("a");
    lfu.put("c", "3");
    if (lfu.get("b") != null || !"1".equals(lfu.get("a"))) throw new RuntimeException("lfu");
    System.out.println("ok");
  }
}
