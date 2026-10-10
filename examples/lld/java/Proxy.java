import java.util.Set;

public class Proxy {
  interface Door { String open(); }

  static class Vault implements Door {
    public String open() { return "jewels"; }
  }

  static class Guard implements Door {
    final Door vault;
    final Set<String> allowed;
    final String badge;

    Guard(Door vault, Set<String> allowed, String badge) {
      this.vault = vault;
      this.allowed = allowed;
      this.badge = badge;
    }

    public String open() {
      if (!allowed.contains(badge)) throw new SecurityException("no entry");
      return vault.open();
    }
  }

  public static void main(String[] args) {
    if (!new Guard(new Vault(), Set.of("gold"), "gold").open().equals("jewels")) {
      throw new RuntimeException("allowed");
    }
    boolean blocked = false;
    try { new Guard(new Vault(), Set.of("gold"), "tin").open(); }
    catch (SecurityException ex) { blocked = true; }
    if (!blocked) throw new RuntimeException("stranger must be stopped");
    System.out.println("ok");
  }
}
