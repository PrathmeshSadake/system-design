// Association uses. Aggregation shares. Composition owns, and destroys with the owner.

export class Teacher {
  constructor(name) {
    this.name = name;
  }
}

export class Classroom {
  constructor(teacher) {
    this.teacher = teacher; // association: the teacher lives outside the room
    this.pencils = []; // aggregation: pencils can move to another room
  }
  addPencil(pencil) {
    this.pencils.push(pencil);
  }
}

export class House {
  constructor() {
    this.rooms = [{ name: "kitchen" }]; // composition: rooms die with the house
  }
}

export function demo() {
  const teacher = new Teacher("Ada");
  const room = new Classroom(teacher);
  room.addPencil("red");
  const house = new House();
  if (room.teacher !== teacher) throw new Error("teacher is shared, not owned");
  if (house.rooms.length !== 1) throw new Error("rooms");
  if (room.pencils[0] !== "red") throw new Error("pencil");
}

if (import.meta.main) demo();
