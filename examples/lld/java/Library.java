import java.util.HashMap;
import java.util.Map;

public class Library {
  static class Book {
    final int copies;
    int out;
    Book(int copies) { this.copies = copies; }
  }

  static class Loan {
    final String bookId;
    final String member;
    final int on;
    final int due;
    Loan(String bookId, String member, int on) {
      this.bookId = bookId;
      this.member = member;
      this.on = on;
      this.due = on + 14;
    }
  }

  private final Map<String, Book> books = new HashMap<>();
  private final Map<String, Loan> loans = new HashMap<>();

  void addBook(String id, int copies) { books.put(id, new Book(copies)); }

  Loan borrow(String bookId, String member, int on) {
    Book book = books.get(bookId);
    if (book == null || book.out >= book.copies) throw new IllegalStateException("unavailable");
    book.out += 1;
    Loan loan = new Loan(bookId, member, on);
    loans.put(member + ":" + bookId, loan);
    return loan;
  }

  boolean giveBack(String bookId, String member, int on) {
    Loan loan = loans.remove(member + ":" + bookId);
    if (loan == null) throw new IllegalStateException("not borrowed");
    books.get(bookId).out -= 1;
    return on > loan.due;
  }

  public static void main(String[] args) {
    Library library = new Library();
    library.addBook("b1", 1);
    library.borrow("b1", "ada", 0);
    boolean refused = false;
    try { library.borrow("b1", "bo", 1); } catch (IllegalStateException ex) { refused = true; }
    if (!refused) throw new RuntimeException("only one copy");
    if (!library.giveBack("b1", "ada", 20)) throw new RuntimeException("late");
    library.borrow("b1", "bo", 21);
    System.out.println("ok");
  }
}
