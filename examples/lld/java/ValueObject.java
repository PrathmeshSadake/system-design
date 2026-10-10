public class ValueObject {
  static final class Money {
    final int cents;
    Money(int cents) { this.cents = cents; }
    Money plus(Money other) { return new Money(cents + other.cents); }
    public boolean equals(Object other) {
      return other instanceof Money money && money.cents == cents;
    }
  }

  public static void main(String[] args) {
    Money a = new Money(100);
    Money b = a.plus(new Money(50));
    if (a.cents != 100 || b.cents != 150) throw new RuntimeException("plus must not edit the old money");
    if (!b.equals(new Money(150))) throw new RuntimeException("equal by value");
    System.out.println("ok");
  }
}
