import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Elevator {
  static class Car {
    final int id;
    int floor;
    int dir;
    final Set<Integer> stops = new HashSet<>();
    Car(int id) { this.id = id; }
  }

  final int floors;
  final List<Car> cars = new ArrayList<>();

  Elevator(int count, int floors) {
    this.floors = floors;
    for (int id = 0; id < count; id++) cars.add(new Car(id));
  }

  int request(int floor) {
    if (floor < 0 || floor >= floors) throw new IllegalArgumentException("no such floor");
    Car best = cars.get(0);
    int score = Integer.MAX_VALUE;
    for (Car car : cars) {
      int distance = Math.abs(car.floor - floor);
      int penalty = car.dir == 0 || Integer.signum(floor - car.floor) == car.dir ? 0 : 100;
      if (distance + penalty < score) {
        score = distance + penalty;
        best = car;
      }
    }
    best.stops.add(floor);
    if (best.dir == 0 && best.floor != floor) best.dir = Integer.signum(floor - best.floor);
    return best.id;
  }

  void step() {
    for (Car car : cars) {
      if (car.stops.isEmpty()) {
        car.dir = 0;
        continue;
      }
      if (!car.stops.contains(car.floor)) {
        List<Integer> ahead = new ArrayList<>();
        for (int stop : car.stops) {
          if (car.dir >= 0 ? stop >= car.floor : stop <= car.floor) ahead.add(stop);
        }
        List<Integer> choices = ahead.isEmpty() ? new ArrayList<>(car.stops) : ahead;
        int goal = choices.stream().min(Comparator.comparingInt(stop -> Math.abs(stop - car.floor))).orElseThrow();
        car.dir = Integer.signum(goal - car.floor);
        car.floor += car.dir;
      }
      if (car.stops.contains(car.floor)) car.stops.remove(car.floor);
      if (car.stops.isEmpty()) car.dir = 0;
    }
  }

  public static void main(String[] args) {
    Elevator bank = new Elevator(2, 10);
    if (bank.request(3) != 0) throw new RuntimeException("closest idle car");
    bank.step();
    bank.step();
    bank.step();
    if (bank.cars.get(0).floor != 3 || !bank.cars.get(0).stops.isEmpty()) throw new RuntimeException("arrived");
    Car busy = bank.cars.get(1);
    busy.floor = 9;
    busy.dir = -1;
    busy.stops.add(8);
    if (bank.request(1) != 0) throw new RuntimeException("do not pull the car that is busy the other way");
    System.out.println("ok");
  }
}
