import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

public class Subscription {
  static class Invoice {
    final int cents;
    final int at;
    String status = "open";
    Invoice(int cents, int at) { this.cents = cents; this.at = at; }
  }

  final int price;
  final int period;
  int due;
  final List<Invoice> invoices = new ArrayList<>();

  Subscription(int price, int period, int due) {
    this.price = price;
    this.period = period;
    this.due = due;
  }

  List<Invoice> bill(int now, Predicate<Invoice> pay) {
    List<Invoice> made = new ArrayList<>();
    while (due <= now) {
      Invoice invoice = new Invoice(price, due);
      invoice.status = pay.test(invoice) ? "paid" : "failed";
      invoices.add(invoice);
      made.add(invoice);
      if (invoice.status.equals("failed")) break;
      due += period;
    }
    return made;
  }

  public static void main(String[] args) {
    int[] balance = {1500};
    Subscription sub = new Subscription(1000, 30, 0);
    List<Invoice> first = sub.bill(0, invoice -> {
      if (balance[0] < invoice.cents) return false;
      balance[0] -= invoice.cents;
      return true;
    });
    if (first.size() != 1 || !first.get(0).status.equals("paid") || sub.due != 30) throw new RuntimeException("renew");
    List<Invoice> second = sub.bill(30, invoice -> {
      if (balance[0] < invoice.cents) return false;
      balance[0] -= invoice.cents;
      return true;
    });
    if (!second.get(0).status.equals("failed") || sub.due != 30 || balance[0] != 500) throw new RuntimeException("stop on failure");
    System.out.println("ok");
  }
}
