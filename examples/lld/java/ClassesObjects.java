// A class is a recipe. An object is one thing baked from it.

public class ClassesObjects {
  static class Book {
    final String title;
    final int pages;
    int page;

    Book(String title, int pages) {
      this.title = title;
      this.pages = pages;
    }

    int read() {
      if (page < pages) page += 1;
      return page;
    }
  }

  public static void main(String[] args) {
    Book one = new Book("Bears", 3);
    Book two = new Book("Bears", 3);
    if (one == two) throw new RuntimeException("two bakes must be two objects");
    one.read();
    if (one.page != 1 || two.page != 0) throw new RuntimeException("objects keep their own page");
    System.out.println("ok");
  }
}
