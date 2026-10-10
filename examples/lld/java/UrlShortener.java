import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UrlShortener {
  static class Link {
    final String code;
    final String user;
    final String url;
    Link(String code, String user, String url) { this.code = code; this.user = user; this.url = url; }
  }

  final Map<String, Link> byCode = new HashMap<>();
  final List<String> clicks = new ArrayList<>();
  int next = 1;

  Link shorten(String user, String url) {
    String code = Integer.toString(next++, 36);
    Link link = new Link(code, user, url);
    byCode.put(code, link);
    return link;
  }

  Link resolve(String code) {
    Link link = byCode.get(code);
    if (link == null) throw new IllegalArgumentException("unknown");
    return link;
  }

  String click(String code) {
    Link link = resolve(code);
    clicks.add(code);
    return link.url;
  }

  public static void main(String[] args) {
    UrlShortener app = new UrlShortener();
    Link link = app.shorten("ada", "https://example.com/long");
    if (!app.click(link.code).equals("https://example.com/long")) throw new RuntimeException("resolve");
    if (app.clicks.size() != 1) throw new RuntimeException("click stored");
    boolean missing = false;
    try { app.resolve("nope"); } catch (IllegalArgumentException ex) { missing = true; }
    if (!missing) throw new RuntimeException("unknown code");
    System.out.println("ok");
  }
}
