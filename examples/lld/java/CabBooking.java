import java.util.HashMap;
import java.util.Map;

public class CabBooking {
  static class Driver {
    final String id;
    final int x;
    final int y;
    boolean free = true;
    Driver(String id, int x, int y) { this.id = id; this.x = x; this.y = y; }
  }

  static class Trip {
    final String id;
    final String rider;
    final String driver;
    String status;
    Trip(String id, String rider, String driver) {
      this.id = id;
      this.rider = rider;
      this.driver = driver;
      this.status = "matched";
    }
  }

  private final Map<String, Driver> drivers = new HashMap<>();
  private final Map<String, Trip> trips = new HashMap<>();
  private int next = 1;

  void join(String id, int x, int y) { drivers.put(id, new Driver(id, x, y)); }

  Trip request(String rider, int x, int y) {
    Driver best = null;
    int dist = Integer.MAX_VALUE;
    for (Driver driver : drivers.values()) {
      if (!driver.free) continue;
      int d = Math.abs(driver.x - x) + Math.abs(driver.y - y);
      if (d < dist) { dist = d; best = driver; }
    }
    if (best == null) throw new IllegalStateException("no cars");
    best.free = false;
    Trip trip = new Trip("t" + next++, rider, best.id);
    trips.put(trip.id, trip);
    return trip;
  }

  void start(String id) { move(id, "matched", "started"); }

  void complete(String id) {
    Trip trip = move(id, "started", "completed");
    drivers.get(trip.driver).free = true;
  }

  private Trip move(String id, String from, String to) {
    Trip trip = trips.get(id);
    if (trip == null || !trip.status.equals(from)) throw new IllegalStateException("bad trip state");
    trip.status = to;
    return trip;
  }

  public static void main(String[] args) {
    CabBooking stand = new CabBooking();
    stand.join("near", 1, 1);
    stand.join("far", 9, 9);
    Trip trip = stand.request("ada", 0, 0);
    if (!trip.driver.equals("near")) throw new RuntimeException("nearest");
    stand.start(trip.id);
    stand.complete(trip.id);
    if (!stand.drivers.get("near").free) throw new RuntimeException("free again");
    System.out.println("ok");
  }
}
