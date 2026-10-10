import java.util.LinkedHashMap;
import java.util.Map;

public class ShoppingCart {
  static class Line {
    final String sku;
    final int price;
    int qty;
    Line(String sku, int price, int qty) { this.sku = sku; this.price = price; this.qty = qty; }
  }

  final Map<String, Line> lines = new LinkedHashMap<>();

  void add(String sku, int price, int qty) {
    if (price < 0 || qty < 1) throw new IllegalArgumentException("line");
    Line line = lines.get(sku);
    if (line == null) lines.put(sku, new Line(sku, price, qty));
    else {
      if (line.price != price) throw new IllegalStateException("price changed");
      line.qty += qty;
    }
  }

  void setQty(String sku, int qty) {
    if (qty == 0) lines.remove(sku);
    else if (qty > 0) lines.get(sku).qty = qty;
    else throw new IllegalArgumentException("qty");
  }

  int total() {
    int cents = 0;
    for (Line line : lines.values()) cents += line.price * line.qty;
    return cents;
  }

  public static void main(String[] args) {
    ShoppingCart cart = new ShoppingCart();
    cart.add("mug", 500, 2);
    cart.add("tea", 300, 1);
    if (cart.total() != 1300) throw new RuntimeException("total");
    cart.setQty("tea", 0);
    if (cart.total() != 1000) throw new RuntimeException("removed");
    System.out.println("ok");
  }
}
