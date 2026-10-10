// One class adds the bill. Another prints it.

import java.util.List;

public class Srp {
  record Line(String name, int cents) {}

  static class Bill {
    final List<Line> lines;

    Bill(List<Line> lines) {
      this.lines = lines;
    }

    int total() {
      int sum = 0;
      for (Line line : lines) sum += line.cents;
      return sum;
    }
  }

  static class ReceiptPrinter {
    String print(Bill bill) {
      StringBuilder out = new StringBuilder();
      for (Line line : bill.lines) out.append(line.name).append(' ').append(line.cents).append('\n');
      out.append("total ").append(bill.total());
      return out.toString();
    }
  }

  public static void main(String[] args) {
    Bill bill = new Bill(List.of(new Line("milk", 80), new Line("bread", 50)));
    String text = new ReceiptPrinter().print(bill);
    if (bill.total() != 130 || !text.contains("total 130")) throw new RuntimeException(text);
    System.out.println("ok");
  }
}
