public class RichModel {
  static class Account {
    private int cents;
    Account(int cents) {
      if (cents < 0) throw new IllegalArgumentException("start at zero or more");
      this.cents = cents;
    }
    void withdraw(int next) {
      if (next <= 0) throw new IllegalArgumentException("withdraw a positive amount");
      if (next > cents) throw new IllegalStateException("insufficient");
      cents -= next;
    }
    int cents() { return cents; }
  }

  public static void main(String[] args) {
    Account account = new Account(100);
    account.withdraw(30);
    if (account.cents() != 70) throw new RuntimeException("balance");
    boolean blocked = false;
    try { account.withdraw(1000); } catch (IllegalStateException ex) { blocked = true; }
    if (!blocked || account.cents() != 70) throw new RuntimeException("rule escaped");
    System.out.println("ok");
  }
}
