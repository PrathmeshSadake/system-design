import java.util.ArrayList;
import java.util.List;

public class Mediator {
  static class Teacher {
    final List<Child> children = new ArrayList<>();
    void join(Child child) { children.add(child); child.teacher = this; }
    List<String> say(Child from, String message) {
      List<String> heard = new ArrayList<>();
      for (Child child : children) if (child != from) heard.add(child.hear(from.name, message));
      return heard;
    }
  }

  static class Child {
    final String name;
    Teacher teacher;
    Child(String name) { this.name = name; }
    List<String> speak(String message) { return teacher.say(this, message); }
    String hear(String from, String message) { return name + " heard " + from + ": " + message; }
  }

  public static void main(String[] args) {
    Teacher teacher = new Teacher();
    Child ada = new Child("Ada");
    Child bo = new Child("Bo");
    teacher.join(ada);
    teacher.join(bo);
    List<String> heard = ada.speak("hi");
    if (heard.size() != 1 || !heard.get(0).equals("Bo heard Ada: hi")) throw new RuntimeException(heard.toString());
    System.out.println("ok");
  }
}
