public class State {
  interface Mood { String press(Lamp lamp); }

  static class Off implements Mood {
    public String press(Lamp lamp) { lamp.mood = new On(); return "lit"; }
  }

  static class On implements Mood {
    public String press(Lamp lamp) { lamp.mood = new Off(); return "dark"; }
  }

  static class Broken implements Mood {
    public String press(Lamp lamp) { return "still broken"; }
  }

  static class Lamp {
    Mood mood = new Off();
    String press() { return mood.press(this); }
  }

  public static void main(String[] args) {
    Lamp lamp = new Lamp();
    if (!lamp.press().equals("lit") || !lamp.press().equals("dark")) throw new RuntimeException("toggle");
    lamp.mood = new Broken();
    if (!lamp.press().equals("still broken")) throw new RuntimeException("broken");
    System.out.println("ok");
  }
}
