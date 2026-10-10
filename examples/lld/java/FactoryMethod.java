public class FactoryMethod {
  interface Transport { String carry(String box); }

  abstract static class Logistics {
    abstract Transport createTransport();

    String deliver(String box) {
      return createTransport().carry(box);
    }
  }

  static class RoadLogistics extends Logistics {
    Transport createTransport() {
      return box -> "truck " + box;
    }
  }

  static class SeaLogistics extends Logistics {
    Transport createTransport() {
      return box -> "ship " + box;
    }
  }

  public static void main(String[] args) {
    if (!new RoadLogistics().deliver("toys").equals("truck toys")) throw new RuntimeException("road");
    if (!new SeaLogistics().deliver("toys").equals("ship toys")) throw new RuntimeException("sea");
    System.out.println("ok");
  }
}
