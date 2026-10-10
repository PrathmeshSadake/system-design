import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class OrderManagement {
  static final Map<String, List<String>> NEXT = Map.of(
      "placed", List.of("paid", "cancelled"),
      "paid", List.of("shipped", "cancelled"),
      "shipped", List.of("delivered"),
      "delivered", List.of(),
      "cancelled", List.of());

  static class Order {
    final String id;
    final int total;
    String status = "placed";
    Order(String id, int total) { this.id = id; this.total = total; }
    void advance(String next) {
      if (!NEXT.get(status).contains(next)) throw new IllegalStateException(status + " cannot become " + next);
      status = next;
    }
  }

  final Map<String, Order> orders = new LinkedHashMap<>();
  int next = 1;

  Order checkout(ShoppingCart cart) {
    if (cart.lines.isEmpty()) throw new IllegalStateException("empty");
    Order order = new Order("o" + next++, cart.total());
    orders.put(order.id, order);
    return order;
  }

  public static void main(String[] args) {
    ShoppingCart cart = new ShoppingCart();
    cart.add("mug", 500, 2);
    Order order = new OrderManagement().checkout(cart);
    order.advance("paid");
    order.advance("shipped");
    boolean late = false;
    try { order.advance("cancelled"); } catch (IllegalStateException ex) { late = true; }
    if (!late) throw new RuntimeException("shipped cannot cancel");
    order.advance("delivered");
    System.out.println("ok");
  }
}
