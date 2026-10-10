import java.util.HashMap;
import java.util.Map;
import java.util.function.IntSupplier;

public class MovieBooking {
  static class Seat {
    String state = "free";
    String by;
    int until;
  }

  private final Map<String, Seat> seats = new HashMap<>();
  private final IntSupplier now;

  MovieBooking(String[] ids, IntSupplier now) {
    this.now = now;
    for (String id : ids) seats.put(id, new Seat());
  }

  void lock(String seatId, String user, int ttl) {
    Seat seat = seat(seatId);
    expire(seat);
    if (seat.state.equals("sold")) throw new IllegalStateException("sold");
    if (seat.state.equals("held") && !seat.by.equals(user)) throw new IllegalStateException("held");
    seat.state = "held";
    seat.by = user;
    seat.until = now.getAsInt() + ttl;
  }

  void confirm(String seatId, String user) {
    Seat seat = seat(seatId);
    expire(seat);
    if (!seat.state.equals("held") || !seat.by.equals(user)) throw new IllegalStateException("no lock");
    seat.state = "sold";
    seat.until = 0;
  }

  private Seat seat(String id) {
    Seat seat = seats.get(id);
    if (seat == null) throw new IllegalArgumentException("no seat");
    return seat;
  }

  private void expire(Seat seat) {
    if (seat.state.equals("held") && seat.until <= now.getAsInt()) {
      seat.state = "free";
      seat.by = null;
    }
  }

  public static void main(String[] args) {
    int[] time = {0};
    MovieBooking show = new MovieBooking(new String[] {"A1"}, () -> time[0]);
    show.lock("A1", "ada", 5);
    boolean blocked = false;
    try { show.lock("A1", "bo", 5); } catch (IllegalStateException ex) { blocked = true; }
    if (!blocked) throw new RuntimeException("lock");
    time[0] = 5;
    show.lock("A1", "bo", 5);
    show.confirm("A1", "bo");
    if (!show.seats.get("A1").state.equals("sold")) throw new RuntimeException("sold");
    System.out.println("ok");
  }
}
