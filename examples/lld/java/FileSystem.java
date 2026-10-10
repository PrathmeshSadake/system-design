import java.util.HashMap;
import java.util.Map;

public class FileSystem {
  static class Node {
    final String kind;
    final Map<String, Node> children = new HashMap<>();
    String text;
    String mode;
    Node(String kind, String mode) { this.kind = kind; this.mode = mode; }
  }

  final Node root = new Node("dir", "rw");

  void mkdir(String path) {
    Node node = walk(path, true);
    if (!node.kind.equals("dir")) throw new IllegalStateException("not a dir");
  }

  void write(String path, String text) {
    require(path);
    Parent parent = parentOf(path);
    Node existing = parent.node.children.get(parent.name);
    if (existing != null && !existing.kind.equals("file")) throw new IllegalStateException("not a file");
    Node file = new Node("file", existing == null ? "rw" : existing.mode);
    file.text = text;
    parent.node.children.put(parent.name, file);
  }

  String read(String path) {
    Node node = walk(path, false);
    if (!node.kind.equals("file")) throw new IllegalStateException("not a file");
    if (!node.mode.contains("r")) throw new IllegalStateException("denied");
    return node.text;
  }

  void chmod(String path, String mode) { walk(path, false).mode = mode; }

  Node walk(String path, boolean create) {
    Node node = root;
    for (String part : parts(path)) {
      if (!node.kind.equals("dir")) throw new IllegalStateException("not a dir");
      if (!node.children.containsKey(part)) {
        if (!create) throw new IllegalArgumentException("missing");
        node.children.put(part, new Node("dir", "rw"));
      }
      node = node.children.get(part);
    }
    return node;
  }

  static class Parent {
    final Node node;
    final String name;
    Parent(Node node, String name) { this.node = node; this.name = name; }
  }

  Parent parentOf(String path) {
    String[] parts = parts(path);
    String name = parts[parts.length - 1];
    Node parent = root;
    for (int i = 0; i < parts.length - 1; i++) {
      if (!parent.children.containsKey(parts[i])) parent.children.put(parts[i], new Node("dir", "rw"));
      parent = parent.children.get(parts[i]);
    }
    return new Parent(parent, name);
  }

  void require(String path) {
    String[] parts = parts(path);
    if (parts.length < 2) return;
    StringBuilder dir = new StringBuilder();
    for (int i = 0; i < parts.length - 1; i++) dir.append("/").append(parts[i]);
    if (!walk(dir.toString(), false).mode.contains("w")) throw new IllegalStateException("denied");
  }

  static String[] parts(String path) {
    return java.util.Arrays.stream(path.split("/")).filter(part -> !part.isEmpty()).toArray(String[]::new);
  }

  public static void main(String[] args) {
    FileSystem fs = new FileSystem();
    fs.mkdir("/home/ada");
    fs.write("/home/ada/note.txt", "hi");
    fs.chmod("/home/ada/note.txt", "r");
    if (!fs.read("/home/ada/note.txt").equals("hi")) throw new RuntimeException("read");
    fs.chmod("/home/ada", "");
    boolean denied = false;
    try { fs.write("/home/ada/other.txt", "no"); } catch (IllegalStateException ex) { denied = true; }
    if (!denied) throw new RuntimeException("dir permission");
    System.out.println("ok");
  }
}
