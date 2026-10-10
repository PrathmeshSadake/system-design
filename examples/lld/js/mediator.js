// Children do not shout at each other. They tell the teacher, and the teacher tells the rest.

export class Teacher {
  constructor() { this.children = []; }
  join(child) { this.children.push(child); child.teacher = this; }
  say(from, message) {
    return this.children.filter((child) => child !== from).map((child) => child.hear(from.name, message));
  }
}

export class Child {
  constructor(name) { this.name = name; }
  speak(message) { return this.teacher.say(this, message); }
  hear(from, message) { return `${this.name} heard ${from}: ${message}`; }
}

export function demo() {
  const teacher = new Teacher();
  const ada = new Child("Ada");
  const bo = new Child("Bo");
  teacher.join(ada);
  teacher.join(bo);
  const heard = ada.speak("hi");
  if (heard.length !== 1 || heard[0] !== "Bo heard Ada: hi") throw new Error(String(heard));
}

if (import.meta.main) demo();
