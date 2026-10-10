import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

public class Notification {
  static class Attempt {
    final String name;
    final boolean ok;
    Attempt(String name, boolean ok) { this.name = name; this.ok = ok; }
  }

  static class Result {
    final String status;
    final String via;
    final List<Attempt> attempts;
    Result(String status, String via, List<Attempt> attempts) {
      this.status = status;
      this.via = via;
      this.attempts = attempts;
    }
  }

  final Map<String, Supplier<String>> channels = new LinkedHashMap<>();

  Result send(String message, String[] names) {
    List<Attempt> attempts = new ArrayList<>();
    for (String name : names) {
      try {
        channels.get(name).get();
        attempts.add(new Attempt(name, true));
        return new Result("sent", name, attempts);
      } catch (RuntimeException ex) {
        attempts.add(new Attempt(name, false));
      }
    }
    return new Result("failed", null, attempts);
  }

  public static void main(String[] args) {
    int[] sms = {0};
    Notification notifier = new Notification();
    notifier.channels.put("email", () -> { throw new IllegalStateException("down"); });
    notifier.channels.put("sms", () -> {
      sms[0] += 1;
      if (sms[0] < 2) throw new IllegalStateException("busy");
      return "sms-id";
    });
    notifier.channels.put("push", () -> "push-id");
    Result failed = notifier.send("hi", new String[] {"email"});
    if (!failed.status.equals("failed")) throw new RuntimeException("no fallback");
    Result sent = notifier.send("hi", new String[] {"email", "sms", "sms", "push"});
    if (!"sms".equals(sent.via) || sent.attempts.size() != 3) throw new RuntimeException("retry then success");
    System.out.println("ok");
  }
}
