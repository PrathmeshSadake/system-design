export class Shortener {
  constructor() {
    this.links = new Map();
    this.byCode = new Map();
    this.clicks = [];
    this.next = 1;
  }
  shorten(user, url) {
    const code = this.next.toString(36);
    this.next += 1;
    const link = { code, user, url, created: this.clicks.length };
    this.links.set(`${user}:${url}`, link);
    this.byCode.set(code, link);
    return link;
  }
  resolve(code) {
    const link = this.byCode.get(code);
    if (!link) throw new Error("unknown");
    return link;
  }
  click(code, at) {
    const link = this.resolve(code);
    this.clicks.push({ code, at, user: link.user });
    return link.url;
  }
}

export function demo() {
  const app = new Shortener();
  const link = app.shorten("ada", "https://example.com/long");
  if (app.click(link.code, 1) !== "https://example.com/long") throw new Error("resolve");
  if (app.clicks.length !== 1) throw new Error("click stored");
  let missing = false;
  try { app.resolve("nope"); } catch { missing = true; }
  if (!missing) throw new Error("unknown code");
}

if (import.meta.main) demo();
