import java.util.HashMap;
import java.util.Map;

public class LockManager {
  static class Row {
    final String owner;
    final int until;
    Row(String owner, int until) { this.owner = owner; this.until = until; }
  }

  final Map<String, Row> locks = new HashMap<>();

  boolean tryLock(String key, String owner, int ttl, int now) {
    Row row = locks.get(key);
    if (row != null && row.until > now && !row.owner.equals(owner)) return false;
    locks.put(key, new Row(owner, now + ttl));
    return true;
  }

  public static void main(String[] args) {
    LockManager locks = new LockManager();
    if (!locks.tryLock("seat", "ada", 5, 0)) throw new RuntimeException("first");
    if (locks.tryLock("seat", "bo", 5, 1)) throw new RuntimeException("held");
    if (!locks.tryLock("seat", "ada", 5, 2)) throw new RuntimeException("renew");
    if (locks.tryLock("seat", "bo", 5, 6)) throw new RuntimeException("still ada");
    if (!locks.tryLock("seat", "bo", 5, 7)) throw new RuntimeException("expired");
    System.out.println("ok");
  }
}
