export class Library {
  constructor() {
    this.books = new Map();
    this.loans = new Map();
  }
  addBook(id, copies) {
    this.books.set(id, { copies, out: 0 });
  }
  borrow(bookId, member, on) {
    const book = this.books.get(bookId);
    if (!book || book.out >= book.copies) throw new Error("unavailable");
    book.out += 1;
    const loan = { bookId, member, on, due: on + 14 };
    this.loans.set(`${member}:${bookId}`, loan);
    return loan;
  }
  giveBack(bookId, member, on) {
    const loan = this.loans.get(`${member}:${bookId}`);
    if (!loan) throw new Error("not borrowed");
    this.books.get(bookId).out -= 1;
    this.loans.delete(`${member}:${bookId}`);
    return { late: on > loan.due };
  }
}

export function demo() {
  const library = new Library();
  library.addBook("b1", 1);
  library.borrow("b1", "ada", 0);
  let refused = false;
  try { library.borrow("b1", "bo", 1); } catch { refused = true; }
  if (!refused) throw new Error("only one copy");
  if (library.giveBack("b1", "ada", 20).late !== true) throw new Error("late");
  library.borrow("b1", "bo", 21);
}

if (import.meta.main) demo();
