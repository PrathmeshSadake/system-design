import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Hotel {
  static class Stay {
    final int id;
    final String room;
    final String guest;
    final int checkIn;
    final int checkOut;
    Stay(int id, String room, String guest, int checkIn, int checkOut) {
      this.id = id;
      this.room = room;
      this.guest = guest;
      this.checkIn = checkIn;
      this.checkOut = checkOut;
    }
  }

  final Map<String, String> rooms = new LinkedHashMap<>();
  final List<Stay> stays = new ArrayList<>();
  int next = 1;

  void addRoom(String id, String type) { rooms.put(id, type); }

  Stay reserve(String type, int checkIn, int checkOut, String guest) {
    if (checkOut <= checkIn) throw new IllegalArgumentException("range");
    String chosen = null;
    for (Map.Entry<String, String> room : rooms.entrySet()) {
      if (room.getValue().equals(type) && free(room.getKey(), checkIn, checkOut)) {
        chosen = room.getKey();
        break;
      }
    }
    if (chosen == null) throw new IllegalStateException("sold out");
    Stay stay = new Stay(next++, chosen, guest, checkIn, checkOut);
    stays.add(stay);
    return stay;
  }

  void cancel(int id) {
    if (!stays.removeIf(stay -> stay.id == id)) throw new IllegalArgumentException("missing");
  }

  boolean free(String room, int checkIn, int checkOut) {
    for (Stay stay : stays) {
      if (stay.room.equals(room) && stay.checkIn < checkOut && checkIn < stay.checkOut) return false;
    }
    return true;
  }

  public static void main(String[] args) {
    Hotel hotel = new Hotel();
    hotel.addRoom("101", "queen");
    Stay stay = hotel.reserve("queen", 1, 3, "ada");
    boolean full = false;
    try { hotel.reserve("queen", 2, 4, "bo"); } catch (IllegalStateException ex) { full = true; }
    if (!full) throw new RuntimeException("overlap");
    hotel.reserve("queen", 3, 4, "cy");
    hotel.cancel(stay.id);
    hotel.reserve("queen", 1, 2, "ada");
    System.out.println("ok");
  }
}
