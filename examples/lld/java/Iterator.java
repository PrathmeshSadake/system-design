public class Iterator {
  static class Shelf {
    private final String[] items;
    private int index;

    Shelf(String... items) { this.items = items; }

    boolean hasNext() { return index < items.length; }

    String next() { return items[index++]; }
  }

  public static void main(String[] args) {
    Shelf shelf = new Shelf("cup", "plate");
    StringBuilder seen = new StringBuilder();
    while (shelf.hasNext()) {
      if (seen.length() > 0) seen.append(',');
      seen.append(shelf.next());
    }
    if (!seen.toString().equals("cup,plate")) throw new RuntimeException(seen.toString());
    System.out.println("ok");
  }
}
