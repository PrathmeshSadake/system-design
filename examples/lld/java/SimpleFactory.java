public class SimpleFactory {
  interface Greeter { String hello(String name); }

  static Greeter makeGreeter(String kind) {
    if (kind.equals("wave")) return name -> "wave " + name;
    if (kind.equals("bow")) return name -> "bow " + name;
    throw new IllegalArgumentException("unknown kind " + kind);
  }

  public static void main(String[] args) {
    if (!makeGreeter("wave").hello("Ada").equals("wave Ada")) throw new RuntimeException("wave");
    if (!makeGreeter("bow").hello("Ada").equals("bow Ada")) throw new RuntimeException("bow");
    boolean refused = false;
    try { makeGreeter("shout"); } catch (IllegalArgumentException ex) { refused = true; }
    if (!refused) throw new RuntimeException("unknown kind must be refused");
    System.out.println("ok");
  }
}
