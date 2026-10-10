// The latch is the only way in. Callers cannot poke the coins.

public class Encapsulation {
  static class PiggyBank {
    private int cents;

    void deposit(int next) {
      if (next <= 0) throw new IllegalArgumentException("deposit a positive number of cents");
      cents += next;
    }

    void spend(int next) {
      if (next <= 0 || next > cents) throw new IllegalStateException("not enough, or a bad amount");
      cents -= next;
    }

    int balance() {
      return cents;
    }
  }

  public static void main(String[] args) {
    PiggyBank bank = new PiggyBank();
    bank.deposit(100);
    bank.spend(40);
    if (bank.balance() != 60) throw new RuntimeException("balance");
    boolean blocked = false;
    try {
      bank.spend(1000);
    } catch (IllegalStateException ex) {
      blocked = true;
    }
    if (!blocked || bank.balance() != 60) throw new RuntimeException("the bank must refuse");
    System.out.println("ok");
  }
}
