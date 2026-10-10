// Association uses. Aggregation shares. Composition owns.

import java.util.ArrayList;
import java.util.List;

public class Relationships {
  static class Teacher {
    final String name;

    Teacher(String name) {
      this.name = name;
    }
  }

  static class Classroom {
    final Teacher teacher;
    final List<String> pencils = new ArrayList<>();

    Classroom(Teacher teacher) {
      this.teacher = teacher;
    }
  }

  static class House {
    final List<String> rooms = new ArrayList<>(List.of("kitchen"));
  }

  public static void main(String[] args) {
    Teacher teacher = new Teacher("Ada");
    Classroom room = new Classroom(teacher);
    room.pencils.add("red");
    House house = new House();
    if (room.teacher != teacher) throw new RuntimeException("teacher is shared");
    if (house.rooms.size() != 1 || !room.pencils.get(0).equals("red")) {
      throw new RuntimeException("rooms or pencils");
    }
    System.out.println("ok");
  }
}
