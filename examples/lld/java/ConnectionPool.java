import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class ConnectionPool {
  static class Ticket {
    final int now;
    String conn;
    Ticket(int now) { this.now = now; }
  }

  static class Lease {
    final String conn;
    final Ticket ticket;
    Lease(String conn, Ticket ticket) { this.conn = conn; this.ticket = ticket; }
  }

  final int max;
  final int timeout;
  final Deque<String> idle = new ArrayDeque<>();
  final List<Ticket> waiters = new ArrayList<>();
  int open;
  int next = 1;

  ConnectionPool(int max, int timeout) { this.max = max; this.timeout = timeout; }

  Lease acquire(int now) {
    dropLate(now);
    if (!idle.isEmpty()) return new Lease(idle.removeLast(), null);
    if (open < max) {
      open += 1;
      return new Lease("c" + next++, null);
    }
    Ticket ticket = new Ticket(now);
    waiters.add(ticket);
    return new Lease(null, ticket);
  }

  void release(String conn, int now) {
    dropLate(now);
    if (!waiters.isEmpty()) waiters.remove(0).conn = conn;
    else idle.addLast(conn);
  }

  void dropLate(int now) {
    waiters.removeIf(ticket -> now >= ticket.now + timeout);
  }

  public static void main(String[] args) {
    ConnectionPool pool = new ConnectionPool(1, 5);
    Lease first = pool.acquire(0);
    Lease waiting = pool.acquire(1);
    if (!"c1".equals(first.conn) || waiting.conn != null || pool.waiters.size() != 1) throw new RuntimeException("limit");
    pool.release(first.conn, 2);
    if (!"c1".equals(waiting.ticket.conn) || !pool.waiters.isEmpty()) throw new RuntimeException("handed over");
    Lease blocked = pool.acquire(3);
    if (blocked.conn != null) throw new RuntimeException("still busy");
    pool.dropLate(8);
    if (!pool.waiters.isEmpty()) throw new RuntimeException("timeout");
    System.out.println("ok");
  }
}
