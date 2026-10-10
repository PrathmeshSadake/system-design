import java.util.HashMap;
import java.util.Map;

public class Inventory {
  static class Row {
    int onHand;
    int held;
    Row(int onHand) { this.onHand = onHand; }
  }

  static class Hold {
    final String sku;
    final int qty;
    Hold(String sku, int qty) { this.sku = sku; this.qty = qty; }
  }

  final Map<String, Row> rows = new HashMap<>();
  final Map<String, Hold> holds = new HashMap<>();

  void add(String sku, int onHand) { rows.put(sku, new Row(onHand)); }
  int available(String sku) {
    Row row = rows.get(sku);
    return row == null ? 0 : row.onHand - row.held;
  }

  void reserve(String id, String sku, int qty) {
    if (holds.containsKey(id)) throw new IllegalStateException("duplicate hold");
    Row row = rows.get(sku);
    if (row == null || qty < 1 || qty > row.onHand - row.held) throw new IllegalStateException("stock");
    row.held += qty;
    holds.put(id, new Hold(sku, qty));
  }

  void commit(String id) {
    Hold hold = take(id);
    Row row = rows.get(hold.sku);
    row.held -= hold.qty;
    row.onHand -= hold.qty;
  }

  void release(String id) {
    Hold hold = take(id);
    rows.get(hold.sku).held -= hold.qty;
  }

  Hold take(String id) {
    Hold hold = holds.remove(id);
    if (hold == null) throw new IllegalStateException("no hold");
    return hold;
  }

  public static void main(String[] args) {
    Inventory stock = new Inventory();
    stock.add("mug", 2);
    stock.reserve("o1", "mug", 2);
    boolean over = false;
    try { stock.reserve("o2", "mug", 1); } catch (IllegalStateException ex) { over = true; }
    if (!over || stock.available("mug") != 0) throw new RuntimeException("held is not free");
    stock.release("o1");
    stock.reserve("o2", "mug", 1);
    stock.commit("o2");
    if (stock.available("mug") != 1) throw new RuntimeException("sold one");
    System.out.println("ok");
  }
}
