import java.util.ArrayList;
import java.util.List;
import java.util.function.IntFunction;

public class Retry {
  static <T> T retry(IntFunction<T> work, int attempts, List<Integer> waits) {
    RuntimeException last = null;
    for (int attempt = 1; attempt <= attempts; attempt++) {
      try {
        return work.apply(attempt);
      } catch (RuntimeException ex) {
        last = ex;
        if (attempt < attempts) waits.add(10 * (1 << (attempt - 1)));
      }
    }
    throw last;
  }

  public static void main(String[] args) {
    List<Integer> waits = new ArrayList<>();
    int[] calls = {0};
    String value = retry(attempt -> {
      calls[0] += 1;
      if (attempt < 3) throw new IllegalStateException("no");
      return "yes";
    }, 3, waits);
    if (!value.equals("yes") || calls[0] != 3 || !waits.equals(List.of(10, 20))) throw new RuntimeException("backoff");
    System.out.println("ok");
  }
}
