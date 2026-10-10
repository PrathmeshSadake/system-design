// The holder class is initialized once, by the class loader, even if threads race.

public class ThreadSafeSingleton {
  static class Settings {
    final int retries = 3;

    private Settings() {}

    private static class Holder {
      static final Settings ONE = new Settings();
    }

    static Settings get() {
      return Holder.ONE;
    }
  }

  public static void main(String[] args) throws Exception {
    Settings[] seen = new Settings[8];
    Thread[] threads = new Thread[seen.length];
    for (int i = 0; i < threads.length; i++) {
      int n = i;
      threads[i] = new Thread(() -> seen[n] = Settings.get());
    }
    for (Thread thread : threads) thread.start();
    for (Thread thread : threads) thread.join();
    for (Settings settings : seen) {
      if (settings != Settings.get()) throw new RuntimeException("racy second instance");
    }
    System.out.println("ok");
  }
}
