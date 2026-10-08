/**
 * Two ledgers: two account books lying open side by side, ours and the
 * bank's, with the same six rows. On each row the left page has a line of
 * writing and the right page the amount, as dots. One row does not match: the
 * bank's book has one dot more, and that row lifts out of both books, bright.
 * The pointer runs down the rows: the row under it lights up in both books,
 * and the row that differs lifts higher. The slider is the lift.
 *
 * The pattern: scrub and pick, with a hit test on each row's own rest height,
 * so the raised row never hides the row behind it.
 */
const {
  Cam, fit, facing, open, proj, prism, rings, ringAt, run, seg,
  tdone, tset, tval, tween, unproj, disposer, mk, place, pointer, put, register, solid,
} = HL;

const R = 6, RH = 10, X0 = 6, ZP = 6, YL = 26, YW = 56, BOOK_B = 68, ODD = 3;
const OURS = [2, 4, 1, 3, 2, 3], BANK = [2, 4, 1, 4, 2, 3], WRITE = [16, 11, 18, 13, 9, 15];
const xc = (i) => X0 + RH / 2 + i * RH, XE = X0 + R * RH + 4;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let L = value;
  const C = Cam(45, 0.5, 1.85);
  fit(C, [[-4, -4, 0], [XE + 4, BOOK_B + YW + 4, 0], [XE + 4, -4, 0], [-4, BOOK_B + YW + 4, 0], [xc(ODD), 0, ZP + 16]], 200, 172);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, z0, z1, r = 3, b = 1) => { const [o, i] = rings(x0, y0, x1, y1, r, b); const s = solid(parent); put(s, prism(P, front, o, i, z0, z1)); return s; };

  const rows = Array.from({ length: R }, () => ({ parts: [], z: tween(0) }));
  [OURS, BANK].forEach((amounts, bi) => {
    const y0 = bi * BOOK_B, bk = mk("g", {}, g);
    // the cover, then two pages either side of the gutter
    box(bk, -4, y0 - 4, XE + 4, y0 + YW + 4, 0, 2, 4, 1.4);
    for (const [a, b] of [[y0, y0 + YL], [y0 + YL + 1, y0 + YW]]) {
      box(bk, 0, a, XE, b, 2, ZP, 3, 1);
      // the edges of the leaves, along the page block's near sides
      const near = run(rings(0, a, XE, b, 3, 1)[0], front);
      mk("path", { d: open(ringAt(P, near, 3.4)) + open(ringAt(P, near, 4.7)), class: "nf lo" }, bk);
    }
    // ruled lines between the rows
    let d = "";
    for (let i = 0; i <= R; i++) d += seg(P(X0 + i * RH, y0 + 3, ZP), P(X0 + i * RH, y0 + YW - 3, ZP));
    mk("path", { d, class: "nf lo" }, bk);
    for (let i = 0; i < R; i++) {
      const s = solid(bk), write = mk("path", { class: "nf lo" }, bk), dots = [];
      for (let k = 0; k < amounts[i]; k++) dots.push(mk("circle", { r: 1.6, class: "dot m" }, bk));
      rows[i].parts.push({ y0, s, write, dots, n: amounts[i] });
    }
  });

  function draw(i, h) {
    const row = rows[i];
    if (h === row.drawn) return;
    row.drawn = h;
    const x = xc(i);
    for (const p of row.parts) {
      if (h > 0.4) { const [o, n] = rings(x - RH / 2 + 0.8, p.y0 + 1, x + RH / 2 - 0.8, p.y0 + YW - 1, 1.6, 0.6); put(p.s, prism(P, front, o, n, ZP + Math.max(0, h - 1.6), ZP + h)); }
      else put(p.s, { sil: "", crease: "" });
      p.write.setAttribute("d", seg(P(x, p.y0 + 4, ZP + h), P(x, p.y0 + 4 + WRITE[i], ZP + h)));
      p.dots.forEach((el, k) => place(el, P(x, p.y0 + YW - 5 - (p.n - 1 - k) * 4.5 - 1, ZP + h)));
    }
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    rows.forEach((row, i) => { draw(i, tval(row.z, now)); if (!tdone(row.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: each row on its own rest height, the raised one first
  const restH = (i) => (i === ODD ? L * 0.5 : 0);
  function hit([sx, sy]) {
    const order = [ODD, ...rows.keys()].filter((i, k, a) => a.indexOf(i) === k);
    for (const i of order) {
      const q = unproj(C, sx, sy, ZP + restH(i)), inBook = (q[1] > -2 && q[1] < YW + 2) || (q[1] > BOOK_B - 2 && q[1] < BOOK_B + YW + 2);
      if (inBook && Math.abs(q[0] - xc(i)) <= RH / 2) return i;
    }
    return -1;
  }

  let act = -2;
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now();
    act = a;
    rows.forEach((row, i) => {
      tset(row.z, i === ODD ? (a === ODD ? L : restH(i)) : 0, now, 0);
      const on = a < 0 ? i === ODD : i === a;
      for (const p of row.parts) {
        p.s.sil.classList.toggle("hi", on && i === ODD);
        p.dots.forEach((el) => el.setAttribute("class", on ? "dot" : "dot m"));
      }
    });
    read.textContent = a < 0 ? "rest" : `row ${101 + a} · ${a === ODD ? "differs" : "same"}`;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { L = v; setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "two-ledgers",
  means: "Our money book and the bank's, open side by side. Run the pointer down the rows: the one row that does not match lifts out of both.",
  rules: [1, 4, 5, 10],
  range: [6, 10, 16],
  tour: [[122, 172], [148, 190], [187, 205], null],
  mount,
});
