// A toy truck is a toy. It can be hugged, and it can also roll.

public class Inheritance {
  static class Toy {
    final String name;

    Toy(String name) {
      this.name = name;
    }

    String hug() {
      return "hug " + name;
    }
  }

  static class Truck extends Toy {
    Truck(String name) {
      super(name);
    }

    String roll() {
      return name + " rolls";
    }
  }

  public static void main(String[] args) {
    Truck truck = new Truck("red");
    if (!truck.hug().equals("hug red") || !truck.roll().equals("red rolls")) {
      throw new RuntimeException("truck");
    }
    Toy asToy = truck;
    if (!asToy.hug().equals("hug red")) throw new RuntimeException("a truck is a toy");
    System.out.println("ok");
  }
}
