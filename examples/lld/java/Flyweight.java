import java.util.HashMap;
import java.util.Map;

public class Flyweight {
  static class Sprite {
    final String kind;
    Sprite(String kind) { this.kind = kind; }
  }

  static final Map<String, Sprite> SPRITES = new HashMap<>();

  static Sprite sprite(String kind) {
    return SPRITES.computeIfAbsent(kind, Sprite::new);
  }

  static class Tree {
    final Sprite sprite;
    final int x;
    final int y;
    Tree(String kind, int x, int y) {
      this.sprite = sprite(kind);
      this.x = x;
      this.y = y;
    }
  }

  public static void main(String[] args) {
    Tree a = new Tree("oak", 1, 2);
    Tree b = new Tree("oak", 8, 9);
    if (a.sprite != b.sprite) throw new RuntimeException("oaks must share one sprite");
    if (a.x == b.x) throw new RuntimeException("spots stay on the tree");
    sprite("pine");
    if (SPRITES.size() != 2) throw new RuntimeException("two kinds");
    System.out.println("ok");
  }
}
