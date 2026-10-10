import java.util.List;
import java.util.Map;

public class FoodOrder {
  private static final Map<String, List<String>> NEXT = Map.of(
      "placed", List.of("confirmed", "cancelled"),
      "confirmed", List.of("preparing", "cancelled"),
      "preparing", List.of("out"),
      "out", List.of("delivered"),
      "delivered", List.of(),
      "cancelled", List.of());

  String status = "placed";

  void advance(String next) {
    if (!NEXT.get(status).contains(next)) throw new IllegalStateException(status + " cannot become " + next);
    status = next;
  }

  public static void main(String[] args) {
    FoodOrder order = new FoodOrder();
    order.advance("confirmed");
    order.advance("preparing");
    order.advance("out");
    order.advance("delivered");
    boolean refused = false;
    try { order.advance("cancelled"); } catch (IllegalStateException ex) { refused = true; }
    if (!refused || !order.status.equals("delivered")) throw new RuntimeException("delivered stays delivered");
    System.out.println("ok");
  }
}
