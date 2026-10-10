// A class is a recipe. An object is one thing baked from it.

export class Book {
  constructor(title, pages) {
    this.title = title;
    this.pages = pages;
    this.page = 0;
  }
  read() {
    if (this.page < this.pages) this.page += 1;
    return this.page;
  }
}

export function demo() {
  const one = new Book("Bears", 3);
  const two = new Book("Bears", 3);
  if (one === two) throw new Error("two bakes must be two objects");
  one.read();
  if (one.page !== 1 || two.page !== 0) throw new Error("objects keep their own page");
}

if (import.meta.main) demo();
