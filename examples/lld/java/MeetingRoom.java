import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MeetingRoom {
  static class Booking {
    final int id;
    final String room;
    final int start;
    final int end;
    final String title;
    Booking(int id, String room, int start, int end, String title) {
      this.id = id;
      this.room = room;
      this.start = start;
      this.end = end;
      this.title = title;
    }
  }

  final Set<String> rooms = new HashSet<>();
  final List<Booking> bookings = new ArrayList<>();
  int next = 1;

  void addRoom(String id) { rooms.add(id); }

  Booking book(String room, int start, int end, String title) {
    if (!rooms.contains(room)) throw new IllegalArgumentException("no room");
    if (end <= start) throw new IllegalArgumentException("range");
    for (Booking row : bookings) {
      if (row.room.equals(room) && row.start < end && start < row.end) throw new IllegalStateException("conflict");
    }
    Booking row = new Booking(next++, room, start, end, title);
    bookings.add(row);
    return row;
  }

  void cancel(int id) {
    if (!bookings.removeIf(row -> row.id == id)) throw new IllegalArgumentException("missing");
  }

  public static void main(String[] args) {
    MeetingRoom book = new MeetingRoom();
    book.addRoom("oak");
    Booking first = book.book("oak", 9, 10, "stand up");
    boolean clash = false;
    try { book.book("oak", 9, 11, "overlap"); } catch (IllegalStateException ex) { clash = true; }
    if (!clash) throw new RuntimeException("conflict");
    book.book("oak", 10, 11, "touches the end");
    book.cancel(first.id);
    book.book("oak", 9, 10, "free again");
    System.out.println("ok");
  }
}
