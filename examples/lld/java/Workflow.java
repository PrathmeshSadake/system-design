import java.util.ArrayList;
import java.util.List;

public class Workflow {
  static class Step {
    final String id;
    final List<String> needs;
    final Runnable work;
    String status = "pending";
    Step(String id, List<String> needs, Runnable work) { this.id = id; this.needs = needs; this.work = work; }
  }

  final List<Step> steps = new ArrayList<>();

  void add(String id, List<String> needs, Runnable work) { steps.add(new Step(id, needs, work)); }

  List<Step> ready() {
    List<Step> out = new ArrayList<>();
    for (Step step : steps) {
      if (!step.status.equals("pending")) continue;
      boolean ok = true;
      for (String need : step.needs) if (!by(need).status.equals("done")) ok = false;
      if (ok) out.add(step);
    }
    return out;
  }

  String run(String id) {
    Step step = by(id);
    if (!ready().contains(step)) throw new IllegalStateException("blocked");
    try {
      step.work.run();
      step.status = "done";
    } catch (RuntimeException ex) {
      step.status = "failed";
    }
    return step.status;
  }

  void retry(String id) {
    Step step = by(id);
    if (!step.status.equals("failed")) throw new IllegalStateException("not failed");
    step.status = "pending";
  }

  Step by(String id) {
    for (Step step : steps) if (step.id.equals(id)) return step;
    throw new IllegalArgumentException("missing");
  }

  public static void main(String[] args) {
    int[] pay = {0};
    Workflow flow = new Workflow();
    flow.add("reserve", List.of(), () -> {});
    flow.add("pay", List.of("reserve"), () -> {
      pay[0] += 1;
      if (pay[0] < 2) throw new IllegalStateException("bank");
    });
    flow.add("ship", List.of("pay"), () -> {});
    if (!flow.ready().get(0).id.equals("reserve")) throw new RuntimeException("deps");
    flow.run("reserve");
    if (!flow.run("pay").equals("failed")) throw new RuntimeException("first pay fails");
    boolean blocked = false;
    try { flow.run("ship"); } catch (IllegalStateException ex) { blocked = true; }
    if (!blocked) throw new RuntimeException("ship waits");
    flow.retry("pay");
    if (!flow.run("pay").equals("done") || !flow.run("ship").equals("done")) throw new RuntimeException("recovered");
    System.out.println("ok");
  }
}
