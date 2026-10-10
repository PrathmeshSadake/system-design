// A truck has an engine. It is not a kind of engine.

public class Composition {
  static class Engine {
    boolean running;

    void start() {
      running = true;
    }
  }

  static class Truck {
    private final Engine engine = new Engine();

    String drive() {
      engine.start();
      return engine.running ? "going" : "still";
    }
  }

  public static void main(String[] args) {
    Truck truck = new Truck();
    if (!truck.drive().equals("going")) throw new RuntimeException("drive");
    System.out.println("ok");
  }
}
