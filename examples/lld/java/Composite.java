import java.util.List;

public class Composite {
  interface Drawing { String draw(); }

  static class Circle implements Drawing {
    final String name;
    Circle(String name) { this.name = name; }
    public String draw() { return name; }
  }

  static class Group implements Drawing {
    final List<Drawing> parts;
    Group(List<Drawing> parts) { this.parts = parts; }
    public String draw() {
      StringBuilder out = new StringBuilder();
      for (Drawing part : parts) {
        if (out.length() > 0) out.append('+');
        out.append(part.draw());
      }
      return out.toString();
    }
  }

  public static void main(String[] args) {
    Drawing picture = new Group(List.of(new Circle("sun"), new Group(List.of(new Circle("tree"), new Circle("bird")))));
    if (!picture.draw().equals("sun+tree+bird")) throw new RuntimeException(picture.draw());
    System.out.println("ok");
  }
}
