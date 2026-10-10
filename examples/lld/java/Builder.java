import java.util.ArrayList;
import java.util.List;

public class Builder {
  static class BurgerBuilder {
    private final List<String> parts = new ArrayList<>();

    BurgerBuilder bun() { parts.add("bun"); return this; }
    BurgerBuilder patty() { parts.add("patty"); return this; }
    BurgerBuilder cheese() { parts.add("cheese"); return this; }

    List<String> build() {
      if (!parts.contains("bun") || !parts.contains("patty")) {
        throw new IllegalStateException("a burger needs a bun and a patty");
      }
      return List.copyOf(parts);
    }
  }

  public static void main(String[] args) {
    List<String> burger = new BurgerBuilder().bun().patty().cheese().bun().build();
    if (!burger.equals(List.of("bun", "patty", "cheese", "bun"))) throw new RuntimeException(burger.toString());
    boolean refused = false;
    try { new BurgerBuilder().cheese().build(); } catch (IllegalStateException ex) { refused = true; }
    if (!refused) throw new RuntimeException("incomplete burger must be refused");
    System.out.println("ok");
  }
}
