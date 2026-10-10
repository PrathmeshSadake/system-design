import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

public class RateLimiter {
  static class TokenBucket {
    final int capacity;
    final Map<String, double[]> rows = new HashMap<>();
    TokenBucket(int capacity) { this.capacity = capacity; }
    boolean allow(String key) {
      double[] row = rows.computeIfAbsent(key, k -> new double[] { capacity });
      if (row[0] < 1) return false;
      row[0] -= 1;
      return true;
    }
  }

  static class LeakyBucket {
    final int capacity;
    final Map<String, Integer> water = new HashMap<>();
    LeakyBucket(int capacity) { this.capacity = capacity; }
    boolean allow(String key) {
      int level = water.getOrDefault(key, 0);
      if (level + 1 > capacity) return false;
      water.put(key, level + 1);
      return true;
    }
  }

  static class FixedWindow {
    final int limit;
    final long windowMs;
    final Map<String, long[]> rows = new HashMap<>();
    FixedWindow(int limit, long windowMs) { this.limit = limit; this.windowMs = windowMs; }
    boolean allow(String key, long now) {
      long start = now / windowMs * windowMs;
      long[] row = rows.computeIfAbsent(key, k -> new long[] { start, 0 });
      if (row[0] != start) { row[0] = start; row[1] = 0; }
      if (row[1] + 1 > limit) return false;
      row[1] += 1;
      return true;
    }
  }

  static class SlidingWindow {
    final int limit;
    final long windowMs;
    final Map<String, Deque<Long>> hits = new HashMap<>();
    SlidingWindow(int limit, long windowMs) { this.limit = limit; this.windowMs = windowMs; }
    boolean allow(String key, long now) {
      Deque<Long> row = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
      while (!row.isEmpty() && now - row.peekFirst() >= windowMs) row.removeFirst();
      if (row.size() >= limit) return false;
      row.addLast(now);
      return true;
    }
  }

  public static void main(String[] args) {
    TokenBucket tokens = new TokenBucket(2);
    if (!tokens.allow("a") || !tokens.allow("a") || tokens.allow("a")) throw new RuntimeException("token");
    LeakyBucket leak = new LeakyBucket(1);
    if (!leak.allow("a") || leak.allow("a")) throw new RuntimeException("leak");
    FixedWindow fixed = new FixedWindow(1, 10);
    if (!fixed.allow("a", 5) || fixed.allow("a", 6) || !fixed.allow("a", 10)) throw new RuntimeException("fixed");
    SlidingWindow slide = new SlidingWindow(2, 10);
    if (!slide.allow("a", 0) || !slide.allow("a", 5) || slide.allow("a", 9) || !slide.allow("a", 10)) {
      throw new RuntimeException("slide");
    }
    System.out.println("ok");
  }
}
