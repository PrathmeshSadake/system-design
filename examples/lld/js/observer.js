// One bell. Whoever signed the sheet hears it. The bell does not know their chores.

export class Bell {
  constructor() { this.listeners = []; }
  subscribe(listener) { this.listeners.push(listener); }
  ring(message) { return this.listeners.map((listener) => listener(message)); }
}

export function demo() {
  const bell = new Bell();
  const heard = [];
  bell.subscribe((message) => heard.push(`a:${message}`));
  bell.subscribe((message) => heard.push(`b:${message}`));
  bell.ring("lunch");
  if (heard.join(",") !== "a:lunch,b:lunch") throw new Error(heard.join(","));
}

if (import.meta.main) demo();
