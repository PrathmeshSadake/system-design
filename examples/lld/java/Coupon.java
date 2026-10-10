import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

public class Coupon {
  static class Facts {
    final int cents;
    final boolean newCustomer;
    Facts(int cents, boolean newCustomer) { this.cents = cents; this.newCustomer = newCustomer; }
  }

  static class Rule {
    final String code;
    final String kind;
    final int percent;
    final int cents;
    final Predicate<Facts> eligible;
    Rule(String code, String kind, int percent, int cents, Predicate<Facts> eligible) {
      this.code = code;
      this.kind = kind;
      this.percent = percent;
      this.cents = cents;
      this.eligible = eligible;
    }
  }

  static class Quote {
    final int total;
    final List<String> applied;
    Quote(int total, List<String> applied) { this.total = total; this.applied = applied; }
  }

  final Map<String, Rule> rules = new LinkedHashMap<>();

  Quote price(int cents, String[] codes, Facts facts) {
    List<Rule> eligible = new ArrayList<>();
    for (String code : codes) {
      Rule rule = rules.get(code);
      if (rule != null && rule.eligible.test(facts)) eligible.add(rule);
    }
    Rule best = null;
    for (Rule rule : eligible) {
      if (rule.kind.equals("percent") && (best == null || rule.percent > best.percent)) best = rule;
    }
    List<Rule> chosen = new ArrayList<>();
    if (best != null) chosen.add(best);
    for (Rule rule : eligible) if (rule.kind.equals("flat")) chosen.add(rule);
    int total = cents;
    for (Rule rule : chosen) if (rule.kind.equals("percent")) total = total * (100 - rule.percent) / 100;
    for (Rule rule : chosen) if (rule.kind.equals("flat")) total = Math.max(0, total - rule.cents);
    List<String> applied = new ArrayList<>();
    for (Rule rule : chosen) applied.add(rule.code);
    return new Quote(total, applied);
  }

  public static void main(String[] args) {
    Coupon engine = new Coupon();
    engine.rules.put("TEN", new Coupon.Rule("TEN", "percent", 10, 0, facts -> facts.cents >= 1000));
    engine.rules.put("FIVE", new Coupon.Rule("FIVE", "percent", 5, 0, facts -> true));
    engine.rules.put("SAVE2", new Coupon.Rule("SAVE2", "flat", 0, 200, facts -> facts.newCustomer));
    Quote deal = engine.price(2000, new String[] {"FIVE", "TEN", "SAVE2"}, new Facts(2000, true));
    if (deal.total != 1600 || !String.join(",", deal.applied).equals("TEN,SAVE2")) throw new RuntimeException(deal.total + " " + deal.applied);
    Quote small = engine.price(500, new String[] {"TEN"}, new Facts(500, false));
    if (small.total != 500) throw new RuntimeException("not eligible");
    System.out.println("ok");
  }
}
