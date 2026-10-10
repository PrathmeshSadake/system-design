import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ParkingLot {
  static int size(String type) {
    if (type.equals("bike")) return 1;
    if (type.equals("car")) return 2;
    if (type.equals("truck")) return 3;
    throw new IllegalArgumentException(type);
  }

  static class Spot {
    final String id;
    final String type;
    String vehicle;
    Spot(String id, String type) { this.id = id; this.type = type; }
  }

  static class Ticket {
    final String id;
    final String spotId;
    final String vehicleType;
    final int inAt;
    Ticket(String id, String spotId, String vehicleType, int inAt) {
      this.id = id;
      this.spotId = spotId;
      this.vehicleType = vehicleType;
      this.inAt = inAt;
    }
  }

  final List<Spot> spots = new ArrayList<>();
  final Map<String, Ticket> tickets = new HashMap<>();
  int nextId = 1;

  ParkingLot add(String id, String type) { spots.add(new Spot(id, type)); return this; }

  double occupancy() {
    int taken = 0;
    for (Spot spot : spots) if (spot.vehicle != null) taken += 1;
    return (double) taken / spots.size();
  }

  Ticket park(String type, int at) {
    Spot chosen = null;
    for (Spot spot : spots) {
      if (spot.vehicle == null && size(spot.type) >= size(type)) { chosen = spot; break; }
    }
    if (chosen == null) throw new IllegalStateException("full");
    chosen.vehicle = type;
    Ticket ticket = new Ticket("t" + nextId++, chosen.id, type, at);
    tickets.put(ticket.id, ticket);
    return ticket;
  }

  int leave(String ticketId, int at) {
    Ticket ticket = tickets.get(ticketId);
    if (ticket == null) throw new IllegalArgumentException("unknown ticket");
    int hours = Math.max(1, (int) Math.ceil((at - ticket.inAt) / 60.0));
    int rate = occupancy() >= 0.8 ? 20 : 10;
    int fee = hours * rate * size(ticket.vehicleType);
    for (Spot spot : spots) if (spot.id.equals(ticket.spotId)) spot.vehicle = null;
    tickets.remove(ticketId);
    return fee;
  }

  public static void main(String[] args) {
    ParkingLot lot = new ParkingLot().add("b1", "bike").add("c1", "car").add("t1", "truck");
    Ticket truck = lot.park("truck", 0);
    Ticket car = lot.park("car", 0);
    Ticket bike = lot.park("bike", 0);
    if (!truck.spotId.equals("t1") || !car.spotId.equals("c1") || !bike.spotId.equals("b1")) {
      throw new RuntimeException("sizes");
    }
    boolean refused = false;
    try { lot.park("bike", 0); } catch (IllegalStateException ex) { refused = true; }
    if (!refused) throw new RuntimeException("full");
    if (lot.leave(car.id, 60) != 40) throw new RuntimeException("fee");
    System.out.println("ok");
  }
}
