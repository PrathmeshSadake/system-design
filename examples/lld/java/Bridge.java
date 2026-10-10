public class Bridge {
  interface Device { String toggle(); }

  static class Tv implements Device {
    boolean on;
    public String toggle() { on = !on; return on ? "tv on" : "tv off"; }
  }

  static class Radio implements Device {
    boolean on;
    public String toggle() { on = !on; return on ? "radio on" : "radio off"; }
  }

  static class Remote {
    final Device device;
    Remote(Device device) { this.device = device; }
    String press() { return device.toggle(); }
  }

  public static void main(String[] args) {
    if (!new Remote(new Tv()).press().equals("tv on")) throw new RuntimeException("tv");
    if (!new Remote(new Radio()).press().equals("radio on")) throw new RuntimeException("radio");
    System.out.println("ok");
  }
}
