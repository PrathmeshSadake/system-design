import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Vending {
  static final int[] DENOMS = {25, 10, 5, 1};

  static class Item {
    final int price;
    int stock;
    Item(int price, int stock) { this.price = price; this.stock = stock; }
  }

  static class Sale {
    final boolean ok;
    final String item;
    final List<int[]> change;
    final List<Integer> refund;
    Sale(boolean ok, String item, List<int[]> change, List<Integer> refund) {
      this.ok = ok;
      this.item = item;
      this.change = change;
      this.refund = refund;
    }
  }

  final Map<String, Item> items = new LinkedHashMap<>();
  final Map<Integer, Integer> box = new LinkedHashMap<>();
  final List<Integer> inserted = new ArrayList<>();

  Vending() {
    for (int denom : DENOMS) box.put(denom, 0);
  }

  void add(String id, int price, int stock) { items.put(id, new Item(price, stock)); }
  void load(int denom, int count) { box.put(denom, box.get(denom) + count); }
  void insert(int denom) { inserted.add(denom); }

  int credit() {
    int sum = 0;
    for (int coin : inserted) sum += coin;
    return sum;
  }

  List<Integer> refund() {
    List<Integer> coins = new ArrayList<>(inserted);
    inserted.clear();
    return coins;
  }

  Sale buy(String id) {
    Item item = items.get(id);
    if (item == null || item.stock < 1) throw new IllegalStateException("out of stock");
    int credit = credit();
    if (credit < item.price) throw new IllegalStateException("insert more");
    Map<Integer, Integer> pool = new LinkedHashMap<>(box);
    for (int coin : inserted) pool.put(coin, pool.get(coin) + 1);
    List<int[]> plan = planChange(pool, credit - item.price);
    if (plan == null) return new Sale(false, null, null, refund());
    for (int coin : inserted) box.put(coin, box.get(coin) + 1);
    for (int[] row : plan) box.put(row[0], box.get(row[0]) - row[1]);
    inserted.clear();
    item.stock -= 1;
    return new Sale(true, id, plan, null);
  }

  static List<int[]> planChange(Map<Integer, Integer> pool, int cents) {
    List<int[]> plan = new ArrayList<>();
    int left = cents;
    for (int denom : DENOMS) {
      int use = Math.min(pool.get(denom), left / denom);
      if (use > 0) plan.add(new int[] {denom, use});
      left -= use * denom;
    }
    return left == 0 ? plan : null;
  }

  public static void main(String[] args) {
    Vending machine = new Vending();
    machine.add("soda", 65, 1);
    machine.load(10, 5);
    machine.insert(25);
    machine.insert(25);
    boolean shortPay = false;
    try { machine.buy("soda"); } catch (IllegalStateException ex) { shortPay = true; }
    if (!shortPay) throw new RuntimeException("needs 65");
    machine.insert(25);
    Sale sold = machine.buy("soda");
    int back = 0;
    for (int[] row : sold.change) back += row[0] * row[1];
    if (!sold.ok || back != 10) throw new RuntimeException("dime back");
    machine.insert(25);
    if (machine.refund().get(0) != 25) throw new RuntimeException("refund");
    Vending empty = new Vending();
    empty.add("soda", 30, 1);
    empty.insert(25);
    empty.insert(10);
    Sale stuck = empty.buy("soda");
    int refund = 0;
    for (int coin : stuck.refund) refund += coin;
    if (stuck.ok || refund != 35) throw new RuntimeException("cannot make a nickel");
    System.out.println("ok");
  }
}
