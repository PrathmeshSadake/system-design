import java.util.ArrayDeque;
import java.util.Deque;

public class Command {
  static class Light { boolean on; }

  interface Order { void run(); void undo(); }

  static class Toggle implements Order {
    final Light light;
    Toggle(Light light) { this.light = light; }
    public void run() { light.on = !light.on; }
    public void undo() { light.on = !light.on; }
  }

  static class Remote {
    final Deque<Order> history = new ArrayDeque<>();
    void press(Order order) { order.run(); history.push(order); }
    void undo() { if (!history.isEmpty()) history.pop().undo(); }
  }

  public static void main(String[] args) {
    Light light = new Light();
    Remote remote = new Remote();
    remote.press(new Toggle(light));
    if (!light.on) throw new RuntimeException("on");
    remote.undo();
    if (light.on) throw new RuntimeException("undo");
    System.out.println("ok");
  }
}
