import java.util.ArrayList;
import java.util.List;

public class Memento {
  static class Envelope {
    final List<String> marks;
    Envelope(List<String> marks) { this.marks = List.copyOf(marks); }
  }

  static class Canvas {
    private final List<String> marks = new ArrayList<>();
    void draw(String mark) { marks.add(mark); }
    Envelope save() { return new Envelope(marks); }
    void restore(Envelope envelope) {
      marks.clear();
      marks.addAll(envelope.marks);
    }
    String shown() { return String.join(",", marks); }
  }

  public static void main(String[] args) {
    Canvas canvas = new Canvas();
    canvas.draw("sun");
    Envelope saved = canvas.save();
    canvas.draw("cloud");
    canvas.restore(saved);
    if (!canvas.shown().equals("sun")) throw new RuntimeException(canvas.shown());
    System.out.println("ok");
  }
}
