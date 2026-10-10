public class Visitor {
  interface Shape { int accept(Ask ask); }
  interface Ask { int visitCircle(Circle circle); int visitSquare(Square square); }

  static class Circle implements Shape {
    final int radius;
    Circle(int radius) { this.radius = radius; }
    public int accept(Ask ask) { return ask.visitCircle(this); }
  }

  static class Square implements Shape {
    final int side;
    Square(int side) { this.side = side; }
    public int accept(Ask ask) { return ask.visitSquare(this); }
  }

  public static void main(String[] args) {
    Ask area = new Ask() {
      public int visitCircle(Circle circle) { return (int) Math.round(Math.PI * circle.radius * circle.radius); }
      public int visitSquare(Square square) { return square.side * square.side; }
    };
    if (new Circle(1).accept(area) != 3 || new Square(3).accept(area) != 9) throw new RuntimeException("area");
    System.out.println("ok");
  }
}
