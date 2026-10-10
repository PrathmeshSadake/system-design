public class Demeter {
  static class Wallet {
    private int cents;
    Wallet(int cents) { this.cents = cents; }
    int pay(int next) {
      if (next > cents) throw new IllegalStateException("short");
      cents -= next;
      return cents;
    }
  }

  static class Customer {
    private final Wallet wallet;
    Customer(Wallet wallet) { this.wallet = wallet; }
    int pay(int cents) { return wallet.pay(cents); }
  }

  public static void main(String[] args) {
    Customer customer = new Customer(new Wallet(100));
    if (customer.pay(40) != 60) throw new RuntimeException("pay");
    System.out.println("ok");
  }
}
