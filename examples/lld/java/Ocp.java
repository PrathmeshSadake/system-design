// New prices arrive as new classes. The checkout stays shut.

public class Ocp {
  interface Pricing {
    int apply(int cents);
  }

  static class Checkout {
    final Pricing pricing;

    Checkout(Pricing pricing) {
      this.pricing = pricing;
    }

    int due(int cents) {
      return pricing.apply(cents);
    }
  }

  static class FullPrice implements Pricing {
    public int apply(int cents) {
      return cents;
    }
  }

  static class PercentOff implements Pricing {
    final int percent;

    PercentOff(int percent) {
      this.percent = percent;
    }

    public int apply(int cents) {
      return Math.round(cents * (100 - percent) / 100f);
    }
  }

  public static void main(String[] args) {
    if (new Checkout(new FullPrice()).due(200) != 200) throw new RuntimeException("full");
    if (new Checkout(new PercentOff(10)).due(200) != 180) throw new RuntimeException("ten off");
    System.out.println("ok");
  }
}
