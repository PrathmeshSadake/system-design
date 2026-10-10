import java.util.ArrayList;
import java.util.List;

public class Restaurant {
  static class Table {
    final String id;
    final int seats;
    Table(String id, int seats) { this.id = id; this.seats = seats; }
  }

  static class Hold {
    final int id;
    final String table;
    Hold(int id, String table) { this.id = id; this.table = table; }
  }

  static class Reservation {
    final String table;
    final int start;
    final int end;
    Reservation(String table, int start, int end) { this.table = table; this.start = start; this.end = end; }
  }

  final List<Table> tables = new ArrayList<>();
  final List<Reservation> reservations = new ArrayList<>();
  int next = 1;

  void addTable(String id, int seats) { tables.add(new Table(id, seats)); }

  Hold reserve(int party, int start, int minutes) {
    if (party < 1 || minutes < 1) throw new IllegalArgumentException("party");
    int end = start + minutes;
    for (Table table : tables) {
      if (table.seats >= party && free(table.id, start, end)) {
        reservations.add(new Reservation(table.id, start, end));
        return new Hold(next++, table.id);
      }
    }
    throw new IllegalStateException("no table");
  }

  boolean free(String table, int start, int end) {
    for (Reservation row : reservations) {
      if (row.table.equals(table) && row.start < end && start < row.end) return false;
    }
    return true;
  }

  public static void main(String[] args) {
    Restaurant room = new Restaurant();
    room.addTable("two", 2);
    room.addTable("four", 4);
    if (!room.reserve(2, 18, 90).table.equals("two")) throw new RuntimeException("smallest fit");
    if (!room.reserve(2, 19, 60).table.equals("four")) throw new RuntimeException("two top is busy");
    boolean none = false;
    try { room.reserve(4, 19, 30); } catch (IllegalStateException ex) { none = true; }
    if (!none) throw new RuntimeException("four is taken");
    System.out.println("ok");
  }
}
