import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class Logging {
  static final Map<String, Integer> RANK = Map.of("debug", 10, "info", 20, "warn", 30, "error", 40);

  static class Row {
    final String level;
    final String message;
    Row(String level, String message) { this.level = level; this.message = message; }
  }

  final String level;
  final List<Consumer<Row>> appenders;
  Logging(String level, List<Consumer<Row>> appenders) { this.level = level; this.appenders = appenders; }

  void log(String level, String message) {
    if (RANK.get(level) < RANK.get(this.level)) return;
    Row row = new Row(level, message);
    for (Consumer<Row> appender : appenders) appender.accept(row);
  }

  public static void main(String[] args) {
    List<String> memory = new ArrayList<>();
    List<Consumer<Row>> appenders = List.of(
        row -> memory.add(row.level),
        row -> { if (row.level.equals("error")) memory.add("alert"); });
    Logging logger = new Logging("info", appenders);
    logger.log("debug", "hidden");
    logger.log("info", "saved");
    logger.log("error", "boom");
    if (!String.join(",", memory).equals("info,error,alert")) throw new RuntimeException(String.join(",", memory));
    System.out.println("ok");
  }
}
