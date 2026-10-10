import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class TaskScheduler {
  static class Job {
    final String name;
    int runAt;
    final int priority;
    final int every;
    Job(String name, int runAt, int priority, int every) {
      this.name = name;
      this.runAt = runAt;
      this.priority = priority;
      this.every = every;
    }
  }

  final List<Job> jobs = new ArrayList<>();

  void add(String name, int runAt, int priority, int every) {
    jobs.add(new Job(name, runAt, priority, every));
  }

  List<String> tick(int now) {
    List<Job> due = new ArrayList<>();
    for (Job job : jobs) if (job.runAt <= now) due.add(job);
    due.sort(Comparator.comparingInt((Job job) -> job.priority).reversed().thenComparingInt(job -> job.runAt));
    List<String> ran = new ArrayList<>();
    for (Job job : due) {
      ran.add(job.name);
      if (job.every > 0) job.runAt = now + job.every;
      else jobs.remove(job);
    }
    return ran;
  }

  public static void main(String[] args) {
    TaskScheduler scheduler = new TaskScheduler();
    scheduler.add("low", 5, 1, 0);
    scheduler.add("high", 5, 9, 0);
    scheduler.add("daily", 5, 2, 10);
    if (!String.join(",", scheduler.tick(5)).equals("high,daily,low")) throw new RuntimeException("priority");
    if (!scheduler.tick(14).isEmpty()) throw new RuntimeException("not yet");
    if (!String.join(",", scheduler.tick(15)).equals("daily")) throw new RuntimeException("recur");
    System.out.println("ok");
  }
}
