// A penguin is a bird. It is not a flying bird.

import java.util.List;

public class Lsp {
  static class Bird {
    final String name;

    Bird(String name) {
      this.name = name;
    }
  }

  static class FlyingBird extends Bird {
    FlyingBird(String name) {
      super(name);
    }

    String fly() {
      return name + " flies";
    }
  }

  static class Penguin extends Bird {
    Penguin(String name) {
      super(name);
    }

    String swim() {
      return name + " swims";
    }
  }

  static String migrate(List<FlyingBird> flock) {
    StringBuilder out = new StringBuilder();
    for (FlyingBird bird : flock) out.append(bird.fly());
    return out.toString();
  }

  public static void main(String[] args) {
    if (!migrate(List.of(new FlyingBird("sparrow"))).equals("sparrow flies")) {
      throw new RuntimeException("migrate");
    }
    Penguin penguin = new Penguin("pip");
    if (!penguin.swim().equals("pip swims")) throw new RuntimeException("swim");
    System.out.println("ok");
  }
}
