import java.util.List;

public class TemplateMethod {
  abstract static class Sandwich {
    final List<String> make() {
      return List.of(bread(), filling(), bread());
    }
    String bread() { return "bread"; }
    abstract String filling();
  }

  static class CheeseSandwich extends Sandwich {
    String filling() { return "cheese"; }
  }

  static class JamSandwich extends Sandwich {
    String filling() { return "jam"; }
  }

  public static void main(String[] args) {
    if (!new CheeseSandwich().make().equals(List.of("bread", "cheese", "bread"))) throw new RuntimeException("cheese");
    if (!new JamSandwich().make().equals(List.of("bread", "jam", "bread"))) throw new RuntimeException("jam");
    System.out.println("ok");
  }
}
