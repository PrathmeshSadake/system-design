import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Leaderboard {
  static class Row {
    final String name;
    final int score;
    final int at;
    Row(String name, int score, int at) { this.name = name; this.score = score; this.at = at; }
  }

  final Map<String, Row> rows = new HashMap<>();

  void submit(String name, int score, int at) {
    Row prev = rows.get(name);
    if (prev == null || score > prev.score || (score == prev.score && at < prev.at)) rows.put(name, new Row(name, score, at));
  }

  List<Row> top(int n) {
    List<Row> all = new ArrayList<>(rows.values());
    all.sort(Comparator.comparingInt((Row row) -> row.score).reversed().thenComparingInt(row -> row.at).thenComparing(row -> row.name));
    return all.subList(0, Math.min(n, all.size()));
  }

  public static void main(String[] args) {
    Leaderboard board = new Leaderboard();
    board.submit("bo", 10, 5);
    board.submit("ada", 10, 1);
    board.submit("cy", 8, 0);
    board.submit("bo", 9, 2);
    String names = board.top(3).stream().map(row -> row.name).reduce((a, b) -> a + "," + b).orElse("");
    if (!names.equals("ada,bo,cy")) throw new RuntimeException(names);
    System.out.println("ok");
  }
}
