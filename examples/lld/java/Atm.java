import java.util.HashMap;
import java.util.Map;

public class Atm {
  static class Account {
    final String pin;
    int balance;
    Account(String pin, int balance) { this.pin = pin; this.balance = balance; }
  }

  int cash;
  final Map<String, Account> accounts = new HashMap<>();

  Atm(int cash) { this.cash = cash; }
  void open(String id, String pin, int balance) { accounts.put(id, new Account(pin, balance)); }

  int withdraw(String id, String pin, int amount) {
    Account account = auth(id, pin);
    if (amount <= 0) throw new IllegalArgumentException("amount");
    if (amount > account.balance) throw new IllegalStateException("funds");
    if (amount > cash) throw new IllegalStateException("cash");
    account.balance -= amount;
    cash -= amount;
    return account.balance;
  }

  Account auth(String id, String pin) {
    Account account = accounts.get(id);
    if (account == null || !account.pin.equals(pin)) throw new IllegalArgumentException("auth");
    return account;
  }

  public static void main(String[] args) {
    Atm atm = new Atm(40);
    atm.open("ada", "1234", 100);
    if (atm.withdraw("ada", "1234", 30) != 70) throw new RuntimeException("balance");
    boolean broke = false;
    try { atm.withdraw("ada", "1234", 90); } catch (IllegalStateException ex) { broke = true; }
    if (!broke || atm.cash != 10) throw new RuntimeException("funds stay put");
    boolean empty = false;
    try { atm.withdraw("ada", "1234", 20); } catch (IllegalStateException ex) { empty = true; }
    if (!empty) throw new RuntimeException("machine cash");
    System.out.println("ok");
  }
}
