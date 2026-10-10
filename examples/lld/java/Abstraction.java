// A remote with two buttons. The caller does not see the wires.

public class Abstraction {
  interface Switch {
    String press();
  }

  static class Lamp implements Switch {
    private boolean on;

    public String press() {
      on = !on;
      return on ? "lit" : "dark";
    }
  }

  public static void main(String[] args) {
    Switch lamp = new Lamp();
    if (!lamp.press().equals("lit") || !lamp.press().equals("dark")) {
      throw new RuntimeException("toggle");
    }
    System.out.println("ok");
  }
}
