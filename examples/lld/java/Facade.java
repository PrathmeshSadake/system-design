import java.util.List;

public class Facade {
  static class Kitchen { String cook(String item) { return "cooked " + item; } }
  static class Cashier { String charge(int cents) { return "paid " + cents; } }
  static class Bagger { String bag(String item) { return "bagged " + item; } }

  static class LunchCounter {
    private final Kitchen kitchen = new Kitchen();
    private final Cashier cashier = new Cashier();
    private final Bagger bagger = new Bagger();

    List<String> order(String item, int cents) {
      return List.of(cashier.charge(cents), kitchen.cook(item), bagger.bag(item));
    }
  }

  public static void main(String[] args) {
    List<String> steps = new LunchCounter().order("soup", 400);
    if (!steps.equals(List.of("paid 400", "cooked soup", "bagged soup"))) throw new RuntimeException(steps.toString());
    System.out.println("ok");
  }
}
