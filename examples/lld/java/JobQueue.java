import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class JobQueue {
  static class Job {
    final String name;
    final int priority;
    int attempts;
    final Runnable work;
    Job(String name, int priority, Runnable work) { this.name = name; this.priority = priority; this.work = work; }
  }

  static class Outcome {
    final String name;
    final String status;
    Outcome(String name, String status) { this.name = name; this.status = status; }
  }

  final int maxAttempts;
  final List<Job> ready = new ArrayList<>();
  final List<Job> dead = new ArrayList<>();

  JobQueue(int maxAttempts) { this.maxAttempts = maxAttempts; }

  void push(String name, int priority, Runnable work) {
    ready.add(new Job(name, priority, work));
    ready.sort(Comparator.comparingInt((Job job) -> job.priority).reversed());
  }

  Outcome work() {
    if (ready.isEmpty()) return null;
    Job job = ready.remove(0);
    try {
      job.work.run();
      return new Outcome(job.name, "done");
    } catch (RuntimeException ex) {
      job.attempts += 1;
      if (job.attempts >= maxAttempts) {
        dead.add(job);
        return new Outcome(job.name, "dead");
      }
      ready.add(job);
      ready.sort(Comparator.comparingInt((Job row) -> row.priority).reversed());
      return new Outcome(job.name, "retry");
    }
  }

  public static void main(String[] args) {
    int[] tries = {0};
    JobQueue queue = new JobQueue(2);
    queue.push("slow", 1, () -> {});
    queue.push("hot", 5, () -> {
      tries[0] += 1;
      if (tries[0] < 2) throw new IllegalStateException("blip");
    });
    Outcome first = queue.work();
    if (!first.name.equals("hot") || !first.status.equals("retry")) throw new RuntimeException("priority then retry");
    if (!queue.work().status.equals("done")) throw new RuntimeException("hot succeeds");
    if (!queue.work().name.equals("slow")) throw new RuntimeException("then the rest");
    queue.push("bad", 1, () -> { throw new IllegalStateException("nope"); });
    if (!queue.work().status.equals("retry")) throw new RuntimeException("first miss");
    if (!queue.work().status.equals("dead") || queue.dead.size() != 1) throw new RuntimeException("dlq");
    System.out.println("ok");
  }
}
