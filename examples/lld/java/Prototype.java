import java.util.ArrayList;
import java.util.List;

public class Prototype {
  static class Sheep {
    final String name;
    final List<String> tags;

    Sheep(String name, List<String> tags) {
      this.name = name;
      this.tags = new ArrayList<>(tags);
    }

    Sheep cloneSheep() {
      return new Sheep(name, tags);
    }
  }

  public static void main(String[] args) {
    Sheep dolly = new Sheep("Dolly", List.of("soft"));
    Sheep copy = dolly.cloneSheep();
    copy.tags.add("clone");
    if (dolly.tags.contains("clone")) throw new RuntimeException("clone must not share the tag list");
    if (!copy.name.equals("Dolly") || copy.tags.size() != 2) throw new RuntimeException("copy");
    System.out.println("ok");
  }
}
