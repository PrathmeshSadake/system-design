import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VersionedKv {
  static class View {
    final String value;
    final int version;
    View(String value, int version) { this.value = value; this.version = version; }
  }

  final Map<String, List<String>> rows = new HashMap<>();

  int put(String key, String value, int expected) {
    List<String> history = rows.computeIfAbsent(key, ignored -> new ArrayList<>());
    if (history.size() != expected) throw new IllegalStateException("conflict " + history.size());
    history.add(value);
    return history.size();
  }

  View get(String key) {
    List<String> history = rows.get(key);
    if (history == null || history.isEmpty()) return null;
    return new View(history.get(history.size() - 1), history.size());
  }

  String at(String key, int version) {
    List<String> history = rows.getOrDefault(key, List.of());
    if (version < 1 || version > history.size()) throw new IllegalArgumentException("version");
    return history.get(version - 1);
  }

  public static void main(String[] args) {
    VersionedKv store = new VersionedKv();
    if (store.put("a", "one", 0) != 1) throw new RuntimeException("first");
    boolean clash = false;
    try { store.put("a", "two", 0); } catch (IllegalStateException ex) { clash = true; }
    if (!clash) throw new RuntimeException("stale write");
    store.put("a", "two", 1);
    if (!store.get("a").value.equals("two") || !store.at("a", 1).equals("one")) throw new RuntimeException("history");
    System.out.println("ok");
  }
}
