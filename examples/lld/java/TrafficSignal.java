public class TrafficSignal {
  static final String[] NAMES = {"green", "yellow", "red"};
  static final int[] SPANS = {4, 1, 4};
  int index;
  int left = 4;
  boolean emergency;

  String color() { return emergency ? "red" : NAMES[index]; }

  String tick() {
    if (emergency) return color();
    left -= 1;
    if (left == 0) {
      index = (index + 1) % NAMES.length;
      left = SPANS[index];
    }
    return color();
  }

  public static void main(String[] args) {
    TrafficSignal signal = new TrafficSignal();
    if (!signal.color().equals("green")) throw new RuntimeException("start");
    signal.tick();
    signal.tick();
    signal.tick();
    if (!signal.tick().equals("yellow")) throw new RuntimeException("yellow");
    if (!signal.tick().equals("red")) throw new RuntimeException("red");
    signal.emergency = true;
    if (!signal.tick().equals("red")) throw new RuntimeException("hold");
    signal.emergency = false;
    if (!signal.color().equals("red")) throw new RuntimeException("same phase");
    System.out.println("ok");
  }
}
