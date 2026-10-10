// The lamp names a socket, not a particular power brick.

public class Dip {
  interface Power {
    boolean supply();
  }

  static class Lamp {
    final Power power;

    Lamp(Power power) {
      this.power = power;
    }

    String glow() {
      return power.supply() ? "lit" : "dark";
    }
  }

  static class Battery implements Power {
    public boolean supply() {
      return true;
    }
  }

  static class Unplugged implements Power {
    public boolean supply() {
      return false;
    }
  }

  public static void main(String[] args) {
    if (!new Lamp(new Battery()).glow().equals("lit")) throw new RuntimeException("battery");
    if (!new Lamp(new Unplugged()).glow().equals("dark")) throw new RuntimeException("unplugged");
    System.out.println("ok");
  }
}
