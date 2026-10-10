import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class Observer {
  static class Bell {
    final List<Consumer<String>> listeners = new ArrayList<>();
    void subscribe(Consumer<String> listener) { listeners.add(listener); }
    void ring(String message) { for (Consumer<String> listener : listeners) listener.accept(message); }
  }

  public static void main(String[] args) {
    Bell bell = new Bell();
    List<String> heard = new ArrayList<>();
    bell.subscribe(message -> heard.add("a:" + message));
    bell.subscribe(message -> heard.add("b:" + message));
    bell.ring("lunch");
    if (!heard.equals(List.of("a:lunch", "b:lunch"))) throw new RuntimeException(heard.toString());
    System.out.println("ok");
  }
}
