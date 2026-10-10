import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class PubSub {
  static class Member {
    final String consumer;
    final Function<String, String> handler;
    Member(String consumer, Function<String, String> handler) {
      this.consumer = consumer;
      this.handler = handler;
    }
  }

  static class Group {
    int cursor;
    final List<Member> members = new ArrayList<>();
  }

  private final Map<String, Group> groups = new LinkedHashMap<>();

  void subscribe(String topic, String groupName, String consumer, Function<String, String> handler) {
    groups.computeIfAbsent(topic + ":" + groupName, key -> new Group()).members.add(new Member(consumer, handler));
  }

  List<String> publish(String topic, String message) {
    List<String> delivered = new ArrayList<>();
    for (Map.Entry<String, Group> entry : groups.entrySet()) {
      if (!entry.getKey().startsWith(topic + ":")) continue;
      Group group = entry.getValue();
      if (group.members.isEmpty()) continue;
      Member member = group.members.get(group.cursor % group.members.size());
      group.cursor += 1;
      delivered.add(member.handler.apply(message));
    }
    return delivered;
  }

  public static void main(String[] args) {
    PubSub broker = new PubSub();
    List<String> seen = new ArrayList<>();
    broker.subscribe("news", "email", "a", message -> { seen.add("a " + message); return "a"; });
    broker.subscribe("news", "email", "b", message -> { seen.add("b " + message); return "b"; });
    broker.subscribe("news", "audit", "c", message -> { seen.add("c " + message); return "c"; });
    broker.publish("news", "one");
    broker.publish("news", "two");
    if (!seen.equals(List.of("a one", "c one", "b two", "c two"))) throw new RuntimeException(seen.toString());
    System.out.println("ok");
  }
}
