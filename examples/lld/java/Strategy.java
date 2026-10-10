public class Strategy {
  interface Pricing { int price(int cents); }

  static class Trip {
    final int fare;
    final Pricing pricing;
    Trip(int fare, Pricing pricing) { this.fare = fare; this.pricing = pricing; }
    int due() { return pricing.price(fare); }
  }

  public static void main(String[] args) {
    if (new Trip(100, cents -> cents).due() != 100) throw new RuntimeException("day");
    if (new Trip(100, cents -> (int) Math.round(cents * 1.5)).due() != 150) throw new RuntimeException("night");
    System.out.println("ok");
  }
}
