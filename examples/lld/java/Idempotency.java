import java.util.HashMap;
import java.util.Map;

public class Idempotency {
  static class Receipt {
    final String key;
    final int cents;
    final String id;
    Receipt(String key, int cents, String id) {
      this.key = key;
      this.cents = cents;
      this.id = id;
    }
  }

  static class Cashier {
    final Map<String, Receipt> done = new HashMap<>();
    Receipt charge(String key, int cents) {
      Receipt existing = done.get(key);
      if (existing != null) return existing;
      Receipt receipt = new Receipt(key, cents, "r" + (done.size() + 1));
      done.put(key, receipt);
      return receipt;
    }
  }

  public static void main(String[] args) {
    Cashier cashier = new Cashier();
    Receipt first = cashier.charge("k1", 500);
    Receipt again = cashier.charge("k1", 500);
    if (first != again) throw new RuntimeException("same key must return the same receipt");
    if (cashier.charge("k2", 500).id.equals(first.id)) throw new RuntimeException("new key is a new charge");
    System.out.println("ok");
  }
}
