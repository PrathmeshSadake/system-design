/**
 * Bookcases: three open bookcases standing side by side, two shelves each, a
 * library split into rooms. Each case holds one range of books and carries its
 * number as dots on its top. The pointer picks a case; its books slide out
 * toward the reader, staggered outwards from the book nearest the pointer. At
 * rest one book in the middle case stands a little proud, bright. The slider
 * is the stagger, in ms.
 */
const {
  Cam, facing, fit, prism, proj, rings, solid, put, mk, flatDot, place,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const CW = 44, GAP = 7, D = 26, H = 58, T = 3, SH = H / 2, PULL = 30, PROUD = 5, LIFT = 12;
// Each case: two shelves of book heights; 0 leaves a gap. One range of keys per case.
const CASES = [
  [[22, 19, 24, 21], [20, 23, 18, 22]],
  [[21, 24, 20, 0], [23, 19, 22, 20]],
  [[18, 22, 0, 0], [21, 24, 19, 0]],
];
const BOOK = 7.4, B0 = 2.2;

function inside([x, y], poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function hullOf(pts) {
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const XN = 3 * CW + 2 * GAP;
  const C = Cam(45, 0.5, 1.84);
  fit(C, [[0, 0, 0], [XN, 0, H], [0, D + PULL, 0], [XN, D + PULL, 0], [0, D + PULL, H + LIFT], [XN, D, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const slab = (s, x0, y0, z0, x1, y1, z1, r = 1.6, b = 0.9) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };
  const block = (x0, y0, z0, x1, y1, z1, r, b) => slab(solid(g), x0, y0, z0, x1, y1, z1, r, b);

  const cases = [], books = [];
  CASES.forEach((shelves, c) => {
    const X = c * (CW + GAP), mine = [];
    block(X, 0, 0, X + CW, T, H);                                // back panel
    block(X + T, 0, 0, X + CW - T, D, T);                        // floor
    block(X, 0, 0, X + T, D, H);                                 // left side
    shelves.forEach((hs, s) => {
      const z0 = s ? SH + T / 2 : T;
      if (s) block(X + T, 0, SH - T / 2, X + CW - T, D, SH + T / 2); // the middle shelf, over the lower books
      hs.forEach((h, j) => {
        if (!h) return;
        const x0 = X + T + B0 + j * (BOOK + 0.6);
        const bk = { c, j, x0, z0, h: s ? Math.min(h, H - T - z0 - 1.5) : Math.min(h, SH - T / 2 - z0 - 1.5), slot: mk("g", {}, g), y: tween(0), drawn: NaN };
        bk.el = solid(bk.slot);
        bk.cx = P(x0 + BOOK / 2, D, z0 + bk.h / 2)[0];
        books.push(bk); mine.push(bk);
      });
    });
    block(X + T, 0, H - T, X + CW - T, D, H);                    // top
    const dots = [];
    for (let k = 0; k <= c; k++) dots.push(flatDot(g, C, 0.75, "dot m"));
    dots.forEach((el, k) => place(el, P(X + CW / 2 + (k - c / 2) * 4.2, D - 5, H)));
    block(X + CW - T, 0, 0, X + CW, D, H);                       // right side
    // once a book is clear of its case it is nearer than every part of it: it moves to a slot painted after the case
    for (const bk of mine) bk.out = mk("g", {}, g);
    const corners = [];
    for (const x of [X, X + CW]) for (const y of [0, D]) for (const z of [0, H]) corners.push(P(x, y, z));
    cases.push({ X, books: mine, dots, hull: hullOf(corners) });
  });
  const restBook = cases[1].books[5];

  function draw(bk, now) {
    const v = tval(bk.y, now);
    if (v === bk.drawn) return;
    bk.drawn = v;
    // out first, then up: a book only lifts once it is clear of the shelf above
    const y = PULL * Math.min(1, v / PULL), z = LIFT * Math.max(0, (v - PULL) / LIFT);
    const home = y >= D - 5 ? bk.out : bk.slot;
    if (bk.el.g.parentNode !== home) home.appendChild(bk.el.g);
    slab(bk.el, bk.x0, 5 + y, bk.z0 + z, bk.x0 + BOOK, D - 3 + y, bk.z0 + bk.h + z, 1.4, 0.8);
  }
  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const bk of books) { draw(bk, now); if (!tdone(bk.y, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  let act = -1;
  function choose(c, sx) {
    const now = performance.now();
    if (c === act && c >= 0) return;
    const from = c >= 0 ? c : act;
    // the book nearest the pointer starts the spread; on leaving, the middle one does
    const list = from >= 0 ? cases[from].books : [];
    let a = 0;
    if (sx !== undefined) list.forEach((bk, i) => { if (Math.abs(bk.cx - sx) < Math.abs(list[a].cx - sx)) a = i; });
    act = c;
    books.forEach((bk) => {
      const i = list.indexOf(bk), delay = i < 0 ? 0 : Math.abs(i % 4 - a % 4) * stag + (i >> 2 !== a >> 2 ? stag / 2 : 0);
      const to = c < 0 ? (bk === restBook ? PROUD : 0) : bk.c === c ? PULL + LIFT : 0;
      tset(bk.y, to, now, delay);
      bk.el.sil.classList.toggle("hi", c < 0 ? bk === restBook : bk.c === c);
    });
    cases.forEach((cs, k) => cs.dots.forEach((d) => d.setAttribute("class", "dot" + (k === c ? "" : " m"))));
    read.textContent = c < 0 ? "rest" : `shard ${c + 1}`;
    B.wake();
  }
  // rest pose: the one proud book
  restBook.y = tween(PROUD);
  restBook.el.sil.classList.add("hi");

  bag.add(pointer(stage, {
    move: (p) => {
      let best = -1;
      cases.forEach((cs, k) => {
        if (!inside(p, cs.hull)) return;
        const cx = P(cs.X + CW / 2, D / 2, H / 2)[0];
        if (best < 0 || Math.abs(cx - p[0]) < Math.abs(P(cases[best].X + CW / 2, D / 2, H / 2)[0] - p[0])) best = k;
      });
      choose(best, p[0]);
    },
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "bookcases",
  means: "Three bookcases each hold one range of books, like shards each holding some rows. Point at a case to pull its books out.",
  rules: [1, 2, 5, 6],
  range: [0, 40, 90],
  tour: [[130, 130], [200, 170], [268, 210], null],
  mount,
});
