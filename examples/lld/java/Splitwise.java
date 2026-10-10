import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Splitwise {
  static class Transfer {
    final String from;
    final String to;
    final int cents;
    Transfer(String from, String to, int cents) {
      this.from = from;
      this.to = to;
      this.cents = cents;
    }
  }

  private final Map<String, Integer> net = new LinkedHashMap<>();

  private void ensure(String user) { net.putIfAbsent(user, 0); }

  void addExpense(String paidBy, int amount, String type, Map<String, Integer> raw, List<String> users) {
    if (amount <= 0) throw new IllegalArgumentException("amount must be positive cents");
    ensure(paidBy);
    Map<String, Integer> shares = sharesOf(amount, type, raw, users);
    int sum = 0;
    for (int share : shares.values()) sum += share;
    if (sum != amount) throw new IllegalArgumentException("shares must add up to the amount");
    for (String user : shares.keySet()) ensure(user);
    for (Map.Entry<String, Integer> entry : shares.entrySet()) {
      int paid = entry.getKey().equals(paidBy) ? amount : 0;
      net.put(entry.getKey(), net.get(entry.getKey()) + paid - entry.getValue());
    }
    if (!shares.containsKey(paidBy)) net.put(paidBy, net.get(paidBy) + amount);
  }

  private Map<String, Integer> sharesOf(int amount, String type, Map<String, Integer> raw, List<String> users) {
    if (type.equals("equal")) {
      if (users.isEmpty()) throw new IllegalArgumentException("nobody to split with");
      int base = amount / users.size();
      int extra = amount - base * users.size();
      Map<String, Integer> shares = new LinkedHashMap<>();
      for (String user : users) shares.put(user, base + (extra-- > 0 ? 1 : 0));
      return shares;
    }
    if (type.equals("exact")) return new LinkedHashMap<>(raw);
    if (type.equals("percent")) {
      int pct = 0;
      for (int value : raw.values()) pct += value;
      if (pct != 100) throw new IllegalArgumentException("percents must add to 100");
      Map<String, Integer> shares = new LinkedHashMap<>();
      int used = 0;
      int index = 0;
      for (Map.Entry<String, Integer> entry : raw.entrySet()) {
        if (index == raw.size() - 1) shares.put(entry.getKey(), amount - used);
        else {
          int share = amount * entry.getValue() / 100;
          shares.put(entry.getKey(), share);
          used += share;
        }
        index += 1;
      }
      return shares;
    }
    throw new IllegalArgumentException("unknown split");
  }

  int balance(String user) { return net.getOrDefault(user, 0); }

  List<Transfer> simplify() {
    List<String> debtors = new ArrayList<>();
    List<String> creditors = new ArrayList<>();
    Map<String, Integer> left = new LinkedHashMap<>();
    for (Map.Entry<String, Integer> entry : net.entrySet()) {
      if (entry.getValue() < 0) {
        debtors.add(entry.getKey());
        left.put(entry.getKey(), -entry.getValue());
      } else if (entry.getValue() > 0) {
        creditors.add(entry.getKey());
        left.put(entry.getKey(), entry.getValue());
      }
    }
    List<Transfer> transfers = new ArrayList<>();
    int i = 0;
    int j = 0;
    while (i < debtors.size() && j < creditors.size()) {
      String from = debtors.get(i);
      String to = creditors.get(j);
      int cents = Math.min(left.get(from), left.get(to));
      transfers.add(new Transfer(from, to, cents));
      left.put(from, left.get(from) - cents);
      left.put(to, left.get(to) - cents);
      if (left.get(from) == 0) i += 1;
      if (left.get(to) == 0) j += 1;
    }
    return transfers;
  }

  public static void main(String[] args) {
    Splitwise book = new Splitwise();
    book.addExpense("Ada", 300, "equal", Map.of(), List.of("Ada", "Bo", "Cy"));
    if (book.balance("Ada") != 200 || book.balance("Bo") != -100) throw new RuntimeException("equal");
    book.addExpense("Bo", 100, "exact", Map.of("Ada", 40, "Bo", 60), List.of());
    if (book.balance("Ada") != 160) throw new RuntimeException("exact");
    Splitwise percents = new Splitwise();
    Map<String, Integer> pct = new LinkedHashMap<>();
    pct.put("Bo", 25);
    pct.put("Cy", 75);
    percents.addExpense("Ada", 200, "percent", pct, List.of());
    if (percents.balance("Bo") != -50 || percents.balance("Cy") != -150 || percents.balance("Ada") != 200) {
      throw new RuntimeException("percent");
    }
    int moved = 0;
    for (Transfer transfer : book.simplify()) moved += transfer.cents;
    int owed = 0;
    for (int cents : book.net.values()) if (cents > 0) owed += cents;
    if (moved != owed) throw new RuntimeException("simplify");
    System.out.println("ok");
  }
}
