public class Decorator {
  interface Gift { String open(); }

  static class PlainGift implements Gift {
    public String open() { return "toy"; }
  }

  static class Wrapped implements Gift {
    final Gift gift;
    Wrapped(Gift gift) { this.gift = gift; }
    public String open() { return "paper(" + gift.open() + ")"; }
  }

  static class Ribboned implements Gift {
    final Gift gift;
    Ribboned(Gift gift) { this.gift = gift; }
    public String open() { return "ribbon(" + gift.open() + ")"; }
  }

  public static void main(String[] args) {
    Gift gift = new Ribboned(new Wrapped(new PlainGift()));
    if (!gift.open().equals("ribbon(paper(toy))")) throw new RuntimeException(gift.open());
    System.out.println("ok");
  }
}
