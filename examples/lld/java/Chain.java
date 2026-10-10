public class Chain {
  static class Request { final int cents; Request(int cents) { this.cents = cents; } }

  abstract static class Handler {
    Handler next;
    Handler setNext(Handler next) { this.next = next; return next; }
    String handle(Request request) {
      if (accepts(request)) return answer(request);
      if (next != null) return next.handle(request);
      return "nobody";
    }
    abstract boolean accepts(Request request);
    abstract String answer(Request request);
  }

  static class SmallJobs extends Handler {
    boolean accepts(Request request) { return request.cents <= 100; }
    String answer(Request request) { return "small " + request.cents; }
  }

  static class BigJobs extends Handler {
    boolean accepts(Request request) { return request.cents <= 1000; }
    String answer(Request request) { return "big " + request.cents; }
  }

  public static void main(String[] args) {
    Handler small = new SmallJobs();
    small.setNext(new BigJobs());
    if (!small.handle(new Request(40)).equals("small 40")) throw new RuntimeException("small");
    if (!small.handle(new Request(400)).equals("big 400")) throw new RuntimeException("big");
    if (!small.handle(new Request(4000)).equals("nobody")) throw new RuntimeException("nobody");
    System.out.println("ok");
  }
}
