// Loading, adding, and formatting are three reasons to change, so they are split.

import java.util.ArrayList;
import java.util.List;

public class SolidRefactor {
  record Line(String name, int cents) {}

  static List<Line> loadLines(String text) {
    List<Line> lines = new ArrayList<>();
    for (String part : text.split(",")) {
      if (part.isEmpty()) continue;
      String[] bits = part.split(":");
      lines.add(new Line(bits[0], Integer.parseInt(bits[1])));
    }
    return lines;
  }

  static int totalOf(List<Line> lines) {
    int sum = 0;
    for (Line line : lines) sum += line.cents;
    return sum;
  }

  static String formatTotal(List<Line> lines) {
    return "total " + totalOf(lines);
  }

  public static void main(String[] args) {
    List<Line> lines = loadLines("milk:80,bread:50");
    if (totalOf(lines) != 130) throw new RuntimeException("total");
    if (!formatTotal(lines).equals("total 130")) throw new RuntimeException("format");
    System.out.println("ok");
  }
}
