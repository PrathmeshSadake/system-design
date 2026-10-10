import java.util.function.Supplier;

public class CircuitBreaker {
  final int limit;
  final int cooldown;
  String state = "closed";
  int failures;
  int openedAt;

  CircuitBreaker(int limit, int cooldown) { this.limit = limit; this.cooldown = cooldown; }

  String call(int now, Supplier<String> work) {
    if (state.equals("open")) {
      if (now < openedAt + cooldown) throw new IllegalStateException("open");
      state = "half-open";
    }
    try {
      String value = work.get();
      failures = 0;
      state = "closed";
      return value;
    } catch (RuntimeException ex) {
      failures += 1;
      if (state.equals("half-open") || failures >= limit) {
        state = "open";
        openedAt = now;
      }
      throw ex;
    }
  }

  public static void main(String[] args) {
    CircuitBreaker breaker = new CircuitBreaker(2, 10);
    Supplier<String> fail = () -> { throw new IllegalStateException("down"); };
    try { breaker.call(0, fail); } catch (RuntimeException ignored) {}
    try { breaker.call(1, fail); } catch (RuntimeException ignored) {}
    if (!breaker.state.equals("open")) throw new RuntimeException("opened");
    boolean blocked = false;
    try { breaker.call(5, () -> "no"); } catch (RuntimeException ex) { blocked = true; }
    if (!blocked) throw new RuntimeException("still open");
    String value = breaker.call(11, () -> "up");
    if (!value.equals("up") || !breaker.state.equals("closed")) throw new RuntimeException("half open healed");
    System.out.println("ok");
  }
}
