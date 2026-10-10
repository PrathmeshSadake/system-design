// A plain printer should not be forced to scan.

public class Isp {
  interface Printer {
    String print(String text);
  }

  interface Scanner {
    String scan();
  }

  static class PlainPrinter implements Printer {
    public String print(String text) {
      return "printed " + text;
    }
  }

  static class Copier implements Printer, Scanner {
    private final Printer printer;

    Copier(Printer printer) {
      this.printer = printer;
    }

    public String print(String text) {
      return printer.print(text);
    }

    public String scan() {
      return "scanned";
    }
  }

  public static void main(String[] args) {
    Printer printer = new PlainPrinter();
    if (!printer.print("note").equals("printed note")) throw new RuntimeException("print");
    if (!new Copier(printer).scan().equals("scanned")) throw new RuntimeException("scan");
    System.out.println("ok");
  }
}
