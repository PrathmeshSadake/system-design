import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Wallet {
  static class Entry {
    final String from;
    final String to;
    final int cents;
    Entry(String from, String to, int cents) { this.from = from; this.to = to; this.cents = cents; }
  }

  final Map<String, Integer> balances = new HashMap<>();
  final List<Entry> ledger = new ArrayList<>();

  void open(String id, int cents) { balances.put(id, cents); }

  void transfer(String from, String to, int cents) {
    if (cents <= 0) throw new IllegalArgumentException("amount");
    Integer left = balances.get(from);
    Integer right = balances.get(to);
    if (left == null || right == null) throw new IllegalArgumentException("account");
    if (left < cents) throw new IllegalStateException("funds");
    balances.put(from, left - cents);
    balances.put(to, right + cents);
    ledger.add(new Entry(from, to, cents));
  }

  List<Entry> history(String id) {
    List<Entry> rows = new ArrayList<>();
    for (Entry row : ledger) if (row.from.equals(id) || row.to.equals(id)) rows.add(row);
    return rows;
  }

  public static void main(String[] args) {
    Wallet wallet = new Wallet();
    wallet.open("ada", 500);
    wallet.open("bo", 100);
    wallet.transfer("ada", "bo", 200);
    boolean broke = false;
    try { wallet.transfer("ada", "bo", 400); } catch (IllegalStateException ex) { broke = true; }
    if (!broke || wallet.balances.get("ada") != 300 || wallet.balances.get("bo") != 300) throw new RuntimeException("atomic");
    if (wallet.history("ada").size() != 1) throw new RuntimeException("history");
    System.out.println("ok");
  }
}
