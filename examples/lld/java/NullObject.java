import java.util.ArrayList;
import java.util.List;

public class NullObject {
  interface Log { void write(String line); }

  static class RealLog implements Log {
    final List<String> lines = new ArrayList<>();
    public void write(String line) { lines.add(line); }
  }

  static class QuietLog implements Log {
    public void write(String line) {}
  }

  static void work(Log log) {
    log.write("started");
    log.write("finished");
  }

  public static void main(String[] args) {
    RealLog log = new RealLog();
    work(log);
    if (!log.lines.equals(List.of("started", "finished"))) throw new RuntimeException(log.lines.toString());
    work(new QuietLog());
    System.out.println("ok");
  }
}
