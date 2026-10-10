public class Validation {
  static int parseQuantity(String raw) {
    if (raw == null || !raw.matches("[1-9][0-9]*")) {
      throw new IllegalArgumentException("quantity must be a positive whole number");
    }
    return Integer.parseInt(raw);
  }

  static class Stock {
    private int onHand;
    Stock(int onHand) { this.onHand = onHand; }
    void take(int quantity) {
      if (quantity > onHand) throw new IllegalStateException("not enough stock");
      onHand -= quantity;
    }
    int onHand() { return onHand; }
  }

  public static void main(String[] args) {
    if (parseQuantity("2") != 2) throw new RuntimeException("parse");
    boolean bad = false;
    try { parseQuantity("0"); } catch (IllegalArgumentException ex) { bad = true; }
    if (!bad) throw new RuntimeException("zero is not a quantity here");
    Stock stock = new Stock(2);
    stock.take(2);
    if (stock.onHand() != 0) throw new RuntimeException("take");
    System.out.println("ok");
  }
}
