public class Specification {
  static class Person {
    final int years;
    final boolean member;
    Person(int years, boolean member) { this.years = years; this.member = member; }
  }

  interface Rule { boolean ok(Person person); }

  static class AtLeast implements Rule {
    final int years;
    AtLeast(int years) { this.years = years; }
    public boolean ok(Person person) { return person.years >= years; }
  }

  static class Member implements Rule {
    public boolean ok(Person person) { return person.member; }
  }

  static class And implements Rule {
    final Rule left;
    final Rule right;
    And(Rule left, Rule right) { this.left = left; this.right = right; }
    public boolean ok(Person person) { return left.ok(person) && right.ok(person); }
  }

  public static void main(String[] args) {
    Rule rule = new And(new AtLeast(10), new Member());
    if (!rule.ok(new Person(12, true))) throw new RuntimeException("allowed");
    if (rule.ok(new Person(12, false))) throw new RuntimeException("not a member");
    if (rule.ok(new Person(8, true))) throw new RuntimeException("too young");
    System.out.println("ok");
  }
}
