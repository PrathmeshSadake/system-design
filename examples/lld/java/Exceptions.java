public class Exceptions {
  static class BadRequest extends RuntimeException {
    BadRequest(String message) { super(message); }
  }

  static class RuleBroken extends RuntimeException {
    RuleBroken(String message) { super(message); }
  }

  static class Seat {
    private boolean taken;
    void reserve(String name) {
      if (name == null || name.isBlank()) throw new BadRequest("name is required");
      if (taken) throw new RuleBroken("seat already taken");
      taken = true;
    }
  }

  public static void main(String[] args) {
    Seat seat = new Seat();
    seat.reserve("Ada");
    boolean rule = false;
    try { seat.reserve("Bo"); } catch (RuleBroken ex) { rule = true; }
    if (!rule) throw new RuntimeException("second reserve");
    boolean bad = false;
    try { new Seat().reserve(" "); } catch (BadRequest ex) { bad = true; }
    if (!bad) throw new RuntimeException("blank name");
    System.out.println("ok");
  }
}
