// Hand the helper in through the constructor. A setter is for the rare optional part.

import java.util.function.IntSupplier;

public class DependencyInjection {
  static class Greeting {
    private final IntSupplier hour;

    Greeting(IntSupplier hour) {
      this.hour = hour;
    }

    String say() {
      return hour.getAsInt() < 12 ? "morning" : "afternoon";
    }
  }

  public static void main(String[] args) {
    if (!new Greeting(() -> 9).say().equals("morning")) throw new RuntimeException("morning");
    if (!new Greeting(() -> 15).say().equals("afternoon")) throw new RuntimeException("afternoon");
    System.out.println("ok");
  }
}
