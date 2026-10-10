import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class EventBus {
  static class Row {
    final Consumer<String> handler;
    final boolean async;
    Row(Consumer<String> handler, boolean async) {
      this.handler = handler;
      this.async = async;
    }
  }

  private final Map<String, List<Row>> topics = new HashMap<>();
  private final List<Runnable> queue = new ArrayList<>();

  void subscribe(String topic, Consumer<String> handler, boolean async) {
    topics.computeIfAbsent(topic, key -> new ArrayList<>()).add(new Row(handler, async));
  }

  void publish(String topic, String event) {
    for (Row row : topics.getOrDefault(topic, List.of())) {
      if (row.async) queue.add(() -> row.handler.accept(event));
      else row.handler.accept(event);
    }
  }

  void flush() {
    List<Runnable> pending = new ArrayList<>(queue);
    queue.clear();
    for (Runnable run : pending) run.run();
  }

  public static void main(String[] args) {
    EventBus bus = new EventBus();
    List<String> seen = new ArrayList<>();
    bus.subscribe("lunch", event -> seen.add("now " + event), false);
    bus.subscribe("lunch", event -> seen.add("later " + event), true);
    bus.publish("lunch", "soup");
    if (!seen.equals(List.of("now soup"))) throw new RuntimeException(seen.toString());
    bus.flush();
    if (!seen.equals(List.of("now soup", "later soup"))) throw new RuntimeException("async");
    System.out.println("ok");
  }
}
