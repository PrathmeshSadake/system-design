import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Set;

public class Collections {
  public static void main(String[] args) {
    Map<String, Integer> byId = new HashMap<>();
    byId.put("a", 1);
    Set<String> seen = new HashSet<>();
    seen.add("a");
    seen.add("a");
    seen.add("b");
    if (seen.size() != 2 || byId.get("a") != 1) throw new RuntimeException("map or set");
    Queue<String> line = new ArrayDeque<>();
    line.add("first");
    line.add("second");
    if (!line.remove().equals("first")) throw new RuntimeException("queue");
    PriorityQueue<String> heap = new PriorityQueue<>();
    heap.add("low");
    heap.add("high");
    if (!heap.remove().equals("high")) throw new RuntimeException("heap");
    System.out.println("ok");
  }
}
