public class Singleton {
  static class TrophyCase {
    private static TrophyCase one;
    final long created = System.nanoTime();

    private TrophyCase() {}

    static synchronized TrophyCase get() {
      if (one == null) one = new TrophyCase();
      return one;
    }
  }

  public static void main(String[] args) {
    TrophyCase a = TrophyCase.get();
    TrophyCase b = TrophyCase.get();
    if (a != b) throw new RuntimeException("two callers must see one trophy");
    System.out.println("ok");
  }
}
