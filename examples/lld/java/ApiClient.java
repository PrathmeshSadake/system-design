import java.util.function.Function;

public class ApiClient {
  interface Limiter { boolean allow(String key, long now); }

  final Limiter limiter;
  final Function<String, String> request;
  final int maxAttempts;
  long now;

  ApiClient(Limiter limiter, Function<String, String> request, int maxAttempts) {
    this.limiter = limiter;
    this.request = request;
    this.maxAttempts = maxAttempts;
  }

  String call(String key, String input) {
    RuntimeException last = new RuntimeException("no attempt");
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!limiter.allow(key, now)) last = new RuntimeException("limited");
      else {
        try {
          return request.apply(input);
        } catch (RuntimeException ex) {
          last = ex;
        }
      }
      now += 10L * (1L << (attempt - 1));
    }
    throw last;
  }

  public static void main(String[] args) {
    int[] calls = { 0 };
    ApiClient client = new ApiClient( (key, now) -> true, input -> {
      calls[0] += 1;
      if (calls[0] < 3) throw new RuntimeException("flaky");
      return "ok";
    }, 3);
    if (!client.call("user", "ping").equals("ok") || calls[0] != 3) throw new RuntimeException("retry");
    System.out.println("ok");
  }
}
