// Copy a sheep, including its tags, without calling the flock again.

export class Sheep {
  constructor(name, tags) {
    this.name = name;
    this.tags = tags.slice();
  }
  clone() {
    return new Sheep(this.name, this.tags);
  }
}

export function demo() {
  const dolly = new Sheep("Dolly", ["soft"]);
  const copy = dolly.clone();
  copy.tags.push("clone");
  if (dolly.tags.includes("clone")) throw new Error("clone must not share the tag list");
  if (copy.name !== "Dolly" || copy.tags.length !== 2) throw new Error("copy");
}

if (import.meta.main) demo();
