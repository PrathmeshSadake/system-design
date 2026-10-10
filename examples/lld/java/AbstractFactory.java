public class AbstractFactory {
  interface Kit {
    String button();
    String field();
  }

  static class DarkKit implements Kit {
    public String button() { return "dark button"; }
    public String field() { return "dark field"; }
  }

  static class LightKit implements Kit {
    public String button() { return "light button"; }
    public String field() { return "light field"; }
  }

  static String screen(Kit kit) {
    return kit.button() + " + " + kit.field();
  }

  public static void main(String[] args) {
    if (!screen(new DarkKit()).equals("dark button + dark field")) throw new RuntimeException("dark");
    if (!screen(new LightKit()).equals("light button + light field")) throw new RuntimeException("light");
    System.out.println("ok");
  }
}
