/**
 * Signposts: a library on a long floor. Four bookcases stand in a row at the
 * front; behind them two signs on posts each stand over a pair of bookcases,
 * and one tall sign over both. Thin dashed cords hang from each sign to the
 * two below it. The pointer picks a bookcase: it slides forward with the
 * bright stroke, its two cords turn solid, and the two signs on its route
 * rise, spreading back from the shelf to the top sign. Every shelf is the same
 * three hops from the top: a balanced tree. At rest shelf 3's route is half
 * raised. The slider is how high a sign rises.
 */
const {
  Cam, facing, fit, open, prism, proj, rings, seg, tdone, tset, tval, tween,
  disposer, mk, pointer, put, register, solid,
} = HL;

const SX = [0, 25, 50, 75], SY = 22, BX = [12.5, 62.5], BY = 4, RX = 37.5, RY = -8;
const BKW = 19, BKD = 9, BKH = 22, BW = 22, BH = 9, HB = 34, HR = 54, PULL = 8, START = 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 2.15);
  fit(C, [[-14, -14, -4], [89, -14, -4], [89, 34 + PULL, -4], [-14, 34 + PULL, -4], [RX, RY, HR + BH + 20]], 200, 164);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);

  const [pr, pi] = rings(-14, -14, 89, 34, 8, 2.2);
  put(solid(g), prism(P, front, pr, pi, -4, 0));

  // Signs: the top one, then the two below it. Each holds a post, a board and its cords.
  const signs = [[RX, RY, HR], [BX[0], BY, HB], [BX[1], BY, HB]].map(([x, y, h]) => ({ x, y, h, z: tween(0) }));
  for (const s of signs) {
    s.cords = [mk("path", { class: "dash" }, g), mk("path", { class: "dash" }, g)];
    s.post = solid(g); s.board = solid(g);
  }
  const shelves = SX.map((x, i) => {
    const el = solid(g), books = mk("path", { class: "nf lo" }, g);
    return { x, i, el, books, o: tween(0) };
  });

  /** What hangs below sign j: the two signs under the top one, or two bookcases' tops. */
  const below = (j) => (j === 0 ? signs.slice(1).map((s) => [s.x, s.y, null, s]) : [0, 1].map((k) => [SX[(j - 1) * 2 + k], SY, BKH, shelves[(j - 1) * 2 + k]]));

  function drawSign(s, j, dz) {
    const h = s.h + dz;
    const [r, ri] = rings(s.x - 1.3, s.y - 1.3, s.x + 1.3, s.y + 1.3, 1, 0.5);
    put(s.post, prism(P, front, r, ri, 0, h));
    const [br, bi] = rings(s.x - BW / 2, s.y - 1.6, s.x + BW / 2, s.y + 1.6, 1.4, 0.6);
    put(s.board, prism(P, front, br, bi, h, h + BH));
    below(j).forEach(([x, y, top, t], k) => {
      const zt = top === null ? t.h + tval(t.z, performance.now()) + BH : top, yy = top === null ? y : y + tval(t.o, performance.now());
      s.cords[k].setAttribute("d", open([P(s.x + (k ? 6 : -6), s.y, h), P(x, yy - (top === null ? 0 : BKD / 2), zt)]));
    });
  }

  function drawShelf(s, o) {
    const x0 = s.x - BKW / 2, y0 = SY - BKD / 2 + o, y1 = y0 + BKD, [r, ri] = rings(x0, y0, x0 + BKW, y1, 1.6, 0.9);
    put(s.el, prism(P, front, r, ri, 0, BKH));
    let d = seg(P(x0 + 1.5, y1, 7.5), P(x0 + BKW - 1.5, y1, 7.5)) + seg(P(x0 + 1.5, y1, 15), P(x0 + BKW - 1.5, y1, 15));
    for (const z0 of [1, 8.5, 16]) for (let j = 0; j < 5; j++) {
      const bx = x0 + 3.5 + j * 2.9, top = z0 + 3.8 + ((j * 3 + s.i + z0) % 3) * 0.8;
      d += seg(P(bx, y1, z0 + 0.4), P(bx, y1, top));
    }
    s.books.setAttribute("d", d);
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const s of shelves) { drawShelf(s, tval(s.o, now)); if (!tdone(s.o, now)) moving = true; }
    signs.forEach((s, j) => { drawSign(s, j, tval(s.z, now)); if (!tdone(s.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // One row of bookcases: the pointer takes the one whose rest centre is nearest on screen.
  const cx = SX.map((x) => P(x, SY, BKH / 2));
  function hit([sx, sy]) {
    if (sy < cx[0][1] - 110 || sy > cx[3][1] + 50) return -1;
    let best = -1, bd = 30;
    cx.forEach((p, i) => { const e = Math.abs(p[0] - sx); if (e < bd) { bd = e; best = i; } });
    return best;
  }

  let act = null;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), i = k < 0 ? START : k, b = (i >> 1) + 1, f = k < 0 ? 0.5 : 1;
    // the shelf is hop three: it moves first, its sign 60ms later, the top sign 120ms later
    shelves.forEach((s, j) => { tset(s.o, j === i ? PULL * f : 0, now, 0); s.el.sil.classList.toggle("hi", j === i); });
    signs.forEach((s, j) => tset(s.z, j === 0 || j === b ? lift * f : 0, now, j === 0 ? 120 : 60));
    signs.forEach((s, j) => s.cords.forEach((c, n) => c.setAttribute("class", (j === 0 && n === b - 1) || (j === b && n === (i & 1)) ? "nf" : "dash")));
    read.textContent = k < 0 ? "rest" : `shelf ${k + 1} · 3 hops`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; const a = act; act = null; choose(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "signposts",
  means: "A library with signs. Point at a shelf and the signs on the way to it rise: every shelf is the same three hops from the top sign.",
  rules: [1, 2, 5, 6],
  range: [6, 12, 20],
  tour: [[169, 175], [207, 194], [131, 156], null],
  mount,
});
