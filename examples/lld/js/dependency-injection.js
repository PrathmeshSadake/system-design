// Hand the helper in. Do not let the class go and build the real one itself.

export class Clock {
  constructor(now) {
    this.now = now;
  }
}

export class Greeting {
  constructor(clock) {
    this.clock = clock;
  }
  say(hour) {
    const h = hour ?? this.clock.now();
    return h < 12 ? "morning" : "afternoon";
  }
}

export function demo() {
  const fixed = new Greeting(new Clock(() => 9));
  if (fixed.say() !== "morning") throw new Error("morning");
  const later = new Greeting({ now: () => 15 });
  if (later.say() !== "afternoon") throw new Error("afternoon");
}

if (import.meta.main) demo();
