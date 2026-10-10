// One shout, "speak", and each puppet answers in its own voice.

import java.util.List;

public class Polymorphism {
  interface Puppet {
    String speak();
  }

  static class Dog implements Puppet {
    public String speak() {
      return "woof";
    }
  }

  static class Cat implements Puppet {
    public String speak() {
      return "meow";
    }
  }

  static String chorus(List<Puppet> puppets) {
    StringBuilder out = new StringBuilder();
    for (Puppet puppet : puppets) {
      if (out.length() > 0) out.append(',');
      out.append(puppet.speak());
    }
    return out.toString();
  }

  public static void main(String[] args) {
    String heard = chorus(List.of(new Dog(), new Cat()));
    if (!heard.equals("woof,meow")) throw new RuntimeException(heard);
    System.out.println("ok");
  }
}
