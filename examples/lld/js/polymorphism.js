// One shout, "speak", and each puppet answers in its own voice.

export class Puppet {
  speak() {
    return "...";
  }
}

export class Dog extends Puppet {
  speak() {
    return "woof";
  }
}

export class Cat extends Puppet {
  speak() {
    return "meow";
  }
}

export function chorus(puppets) {
  return puppets.map((p) => p.speak());
}

export function demo() {
  const heard = chorus([new Dog(), new Cat()]);
  if (heard.join(",") !== "woof,meow") throw new Error(heard.join(","));
}

if (import.meta.main) demo();
