/**
 * The big book: an open ledger on the desk, the final word, its lines filled
 * in up to halfway down the right page, and a rack of note slips queued up in
 * front of it, the next one nearest the book. Each slip is an order waiting
 * to be written in. The pointer picks a slip: it stands up and lifts, the
 * slips nearer the book lean toward it and the ones behind lean back, in turn
 * from the one picked. At rest the book is bright. The slider is the stagger.
 */
const {
  Cam, clamp, facing, fit, open, poly, proj, prism, rad, rings, unproj,
  tset, tval, tdone, tween, mk, place, pointer, put, register, disposer, solid,
} = HL;

const N = 7, G = 11, X0 = 50, W = 26, H = 30, Y0 = 14, TK = 1.4, FIRST = 12;
const REST = -14, BACK = -26, FWD = 18, LIFT = 12;
const BX0 = 66, BX1 = 158, BY0 = -2, BY1 = 58;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-24, 6, 0], [BX1, BY0, 0], [BX1, BY1, 0], [-24, BY1, 0], [X0 - (N - 1) * G, Y0, H + LIFT], [BX0, BY0, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [dr, di] = rings(-28, -8, BX1 + 6, BY1 + 6, 10, 2);
  put(solid(g), prism(P, front, dr, di, -4, 0));

  // the rack the slips stand in: a long low trough
  const [rr, ri] = rings(X0 - (N - 1) * G - 8, Y0 - 4, X0 + 6, Y0 + W + 4, 4, 1.6);
  put(solid(g), prism(P, front, rr, ri, 0, 5));

  // the slips, back (far from the book) to front
  const slips = [];
  for (let k = N - 1; k >= 0; k--) {
    const grp = mk("g", {}, g);
    slips[k] = { k, n: FIRST + k, grp, back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), lines: mk("path", { class: "nf lo" }, grp), a: tween(REST), z: tween(0) };
  }
  /** Slip k leaning th degrees (toward the book is positive) and lifted. */
  function pose(k, th, lift) {
    const x = X0 - k * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (u, v) => P(x + v * s, Y0 + u, 5 + v * c + lift);
    const wb = (u, v) => P(x + v * s - TK * c, Y0 + u, 5 + v * c + TK * s + lift);
    const R = [[0, 0], [W, 0], [W, H], [0, H]];
    return {
      back: poly(R.map(([u, v]) => wb(u, v))),
      face: poly(R.map(([u, v]) => w(u, v))),
      lines: [H - 7, H - 12, H - 17, H - 22].map((v, j) => open([w(4, v), w(j === 3 ? 12 : W - 4, v)])).join(""),
    };
  }

  // the book: a cover, two page blocks either side of the spine, and its written lines
  const book = mk("g", {}, g), cover = solid(book);
  const [cr, ci] = rings(BX0, BY0, BX1, BY1, 4, 1.4);
  put(cover, prism(P, front, cr, ci, 0, 2));
  const mid = (BX0 + BX1) / 2;
  [[BX0 + 3, mid - 1], [mid + 1, BX1 - 3]].forEach(([a, b]) => { const [pr, pi] = rings(a, BY0 + 3, b, BY1 - 3, 3, 1.2); put(solid(book), prism(P, front, pr, pi, 2, 7)); });
  let done = "", todo = "";
  for (let j = 0; j < 6; j++) {
    const y = BY0 + 10 + j * 8.5;
    done += open([P(BX0 + 9, y, 7), P(mid - 7, y, 7)]);
    (j < 3 ? (s) => { done += s; } : (s) => { todo += s; })(open([P(mid + 7, y, 7), P(BX1 - 9, y, 7)]));
  }
  mk("path", { d: done, class: "nf" }, book);
  mk("path", { d: todo, class: "nf lo" }, book);
  // where the next slip will be written: one dot at the head of the first blank line
  const pen = mk("circle", { r: 2, class: "dot m" }, book);
  place(pen, P(mid + 7, BY0 + 10 + 3 * 8.5, 7));

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const s of slips) {
      const q = pose(s.k, tval(s.a, now), tval(s.z, now));
      s.back.setAttribute("d", q.back); s.face.setAttribute("d", q.face); s.lines.setAttribute("d", q.lines);
      if (!tdone(s.a, now) || !tdone(s.z, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  let act = -1;
  /** a is a slip, N is the book, -1 is rest. The stagger spreads out from the slip picked, or the one let go. */
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 && a < N ? a : act >= 0 && act < N ? act : 0;
    act = a;
    for (const s of slips) {
      const on = a >= 0 && a < N, th = !on ? REST : s.k > a ? BACK : s.k < a ? FWD : 0;
      const delay = Math.abs(s.k - from) * stag;
      tset(s.a, th, now, delay); tset(s.z, on && s.k === a ? LIFT : 0, now, delay);
      s.face.classList.toggle("hi", s.k === a);
    }
    cover.sil.classList.toggle("hi", a < 0 || a === N);
    read.textContent = a < 0 ? "rest" : a === N ? "book · final word" : `slip ${FIRST + a} · queued`;
    B.wake();
  }
  cover.sil.classList.add("hi");

  // hit bands along the slips' RESTING top edges, in the band's own (s, r) coordinates; they never move
  const top = (k) => P(X0 - k * G + H * Math.sin(rad(REST)), Y0 + W / 2, 5 + H * Math.cos(rad(REST)));
  const t0 = top(0), t1 = top(1), d = [t1[0] - t0[0], t1[1] - t0[1]];
  const e0 = P(0, 0, 0), e1 = P(0, 1, 0), e = [e1[0] - e0[0], e1[1] - e0[1]], det = d[0] * e[1] - d[1] * e[0];
  function hit([x, y]) {
    const [bx, by] = unproj(C, x, y, 7);
    if (bx > BX0 && bx < BX1 && by > BY0 && by < BY1) return N;
    const qx = x - t0[0], qy = y - t0[1], s = (qx * e[1] - qy * e[0]) / det, r = (d[0] * qy - d[1] * qx) / det;
    if (Math.abs(r) > W / 2 + 4 || s < -0.6 || s > N - 0.4) return -1;
    return clamp(Math.round(s), 0, N - 1);
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "big-book",
  means: "Order slips wait in a queue by the big book, the final word. Pick a slip: it is safe in line until it is written in the book.",
  rules: [1, 2, 4, 6],
  range: [0, 40, 90],
  tour: [[150, 120], [120, 110], [260, 170], null],
  mount,
});
