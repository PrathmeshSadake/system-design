import java.util.HashMap;
import java.util.Map;
import java.util.function.IntSupplier;

public class MemoryDb {
  static class Row {
    final int value;
    final int expiresAt;
    Row(int value, int expiresAt) { this.value = value; this.expiresAt = expiresAt; }
  }

  final IntSupplier now;
  final Map<String, Row> rows = new HashMap<>();
  Map<String, Row> tx;

  MemoryDb(IntSupplier now) { this.now = now; }

  void put(String key, int value, int ttl) {
    int expiresAt = ttl > 0 ? now.getAsInt() + ttl : 0;
    write(key, new Row(value, expiresAt));
  }

  Integer get(String key) {
    Row row = read(key);
    if (row == null) return null;
    if (row.expiresAt != 0 && row.expiresAt <= now.getAsInt()) {
      write(key, null);
      return null;
    }
    return row.value;
  }

  void begin() {
    if (tx != null) throw new IllegalStateException("already open");
    tx = new HashMap<>();
  }

  void commit() {
    if (tx == null) throw new IllegalStateException("no tx");
    for (Map.Entry<String, Row> entry : tx.entrySet()) {
      if (entry.getValue() == null) rows.remove(entry.getKey());
      else rows.put(entry.getKey(), entry.getValue());
    }
    tx = null;
  }

  void rollback() {
    if (tx == null) throw new IllegalStateException("no tx");
    tx = null;
  }

  Row read(String key) {
    if (tx != null && tx.containsKey(key)) return tx.get(key);
    return rows.get(key);
  }

  void write(String key, Row row) {
    if (tx != null) tx.put(key, row);
    else if (row == null) rows.remove(key);
    else rows.put(key, row);
  }

  public static void main(String[] args) {
    int[] time = {0};
    MemoryDb db = new MemoryDb(() -> time[0]);
    db.put("a", 1, 5);
    db.begin();
    db.put("a", 2, 0);
    db.put("b", 3, 0);
    if (db.get("b") == null || db.get("b") != 3) throw new RuntimeException("see own write");
    db.rollback();
    if (db.get("a") == null || db.get("a") != 1 || db.get("b") != null) throw new RuntimeException("rollback");
    time[0] = 5;
    if (db.get("a") != null) throw new RuntimeException("ttl");
    db.begin();
    db.put("c", 4, 0);
    db.commit();
    if (db.get("c") == null || db.get("c") != 4) throw new RuntimeException("commit");
    System.out.println("ok");
  }
}
