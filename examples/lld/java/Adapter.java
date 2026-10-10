public class Adapter {
  static class RoundPeg {
    final double radius;
    RoundPeg(double radius) { this.radius = radius; }
  }

  static class Square {
    final double width;
    Square(double width) { this.width = width; }
  }

  static class SquareHole {
    final double width;
    SquareHole(double width) { this.width = width; }
    boolean fits(Square square) { return square.width <= width; }
  }

  static class PegAdapter extends Square {
    PegAdapter(RoundPeg peg) { super(peg.radius * 2); }
  }

  public static void main(String[] args) {
    SquareHole hole = new SquareHole(10);
    if (!hole.fits(new PegAdapter(new RoundPeg(4)))) throw new RuntimeException("adapted peg should fit");
    if (hole.fits(new PegAdapter(new RoundPeg(8)))) throw new RuntimeException("too wide");
    System.out.println("ok");
  }
}
