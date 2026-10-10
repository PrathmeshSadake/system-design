import java.util.HashMap;
import java.util.Map;
import java.util.function.BiFunction;

public class Payment {
  static class Row {
    final String key;
    final int cents;
    int refunded;
    String status;
    Row(String key, int cents, String status) { this.key = key; this.cents = cents; this.status = status; }
  }

  final BiFunction<String, Integer, Boolean> bank;
  final Map<String, Row> charges = new HashMap<>();
  int calls;

  Payment(BiFunction<String, Integer, Boolean> bank) { this.bank = bank; }

  Row charge(String key, String user, int cents) {
    if (charges.containsKey(key)) return charges.get(key);
    if (cents <= 0) throw new IllegalArgumentException("amount");
    calls += 1;
    boolean ok = bank.apply(user, cents);
    Row row = new Row(key, cents, ok ? "captured" : "failed");
    charges.put(key, row);
    return row;
  }

  Row refund(String key, int cents) {
    Row row = charges.get(key);
    if (row == null || !row.status.equals("captured")) throw new IllegalStateException("no capture");
    if (cents < 1 || row.refunded + cents > row.cents) throw new IllegalStateException("refund");
    row.refunded += cents;
    if (row.refunded == row.cents) row.status = "refunded";
    return row;
  }

  public static void main(String[] args) {
    Payment gateway = new Payment((user, cents) -> true);
    Row first = gateway.charge("k1", "ada", 500);
    Row again = gateway.charge("k1", "ada", 500);
    if (again != first || gateway.calls != 1) throw new RuntimeException("idempotent");
    gateway.refund("k1", 200);
    if (!first.status.equals("captured") || first.refunded != 200) throw new RuntimeException("partial");
    gateway.refund("k1", 300);
    if (!first.status.equals("refunded")) throw new RuntimeException("full");
    System.out.println("ok");
  }
}
