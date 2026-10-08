/**
 * Locker bank: eight lockers in two rows on one cabinet, each door numbered
 * with dots, louvres at its top and a handle on its free edge. The pointer
 * picks the locker under it: that door swings open on its hinge and the
 * parcel inside slides out to the sill with the bright stroke. Give the key, get what is inside. At
 * rest locker 3 stands ajar. The pointer is read on the cabinet's front face,
 * which never moves. The slider is how far a door swings, in degrees.
 */
const {
  Cam, facing, fit, poly, proj, prism, rad, rings, rrect, seg, open,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const CW = 24, CH = 32, D = 20, BASE = 7, NC = 4, DEEP = 15, AJAR = 30, START = 2;
const X1 = NC * CW, ZT = BASE + 2 * CH + 4;
/** Each locker's parcel: width, depth and height, a different value behind each key. */
const ITEMS = [[10, 6, 14], [11, 5, 9], [8, 7, 16], [10, 6, 12], [9, 7, 10], [11, 5, 13], [9, 7, 15], [8, 6, 8]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let swing = value;
  const C = Cam(45, 0.5, 2.3);
  fit(C, [[-3, 0, 0], [X1 + 3, 0, ZT], [X1 + 3, D, 0], [-3, D + CW, 0], [-3, D, ZT]], 200, 162);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);

  const [cr, ci] = rings(-3, 0, X1 + 3, D, 3, 1.4);
  put(solid(g), prism(P, front, cr, ci, 0, ZT));
  mk("path", { d: open([P(0, D, BASE - 1), P(X1, D, BASE - 1)]), class: "nf lo" }, g);

  const lockers = [];
  for (let row = 0; row <= 1; row++) for (let c = 0; c < NC; c++) {
    const n = (1 - row) * NC + c + 1, xl = c * CW + 1.5, xr = (c + 1) * CW - 1.5;
    const zb = BASE + row * CH + 1.5, zt = BASE + (row + 1) * CH - 1.5, k = n - 1;
    const grp = mk("g", {}, g), F = (x, z) => P(x, D, z);
    // the recess: the floor seam, and the back wall's two edges as far as the opening shows them
    mk("path", { d: poly(rrect(xl, zb, xr, zt, 2, 4).map((q) => F(q.u, q.v))), class: "lo" }, grp);
    mk("path", {
      d: seg(F(xl, zb), P(xl, D - DEEP, zb)) + open([P(xl, D - DEEP, zt - DEEP * 0.82), P(xl, D - DEEP, zb), P(xr - DEEP, D - DEEP, zb)]),
      class: "nf lo",
    }, grp);
    const item = solid(grp);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    const marks = mk("path", { class: "nf lo" }, grp), dots = [];
    for (let j = 0; j < n; j++) dots.push(mk("circle", { r: 1.1, class: "dot m" }, grp));
    lockers.push({ grp, n, xl, xr, zb, zt, item, back, face, marks, dots, it: ITEMS[k], o: tween(0), drawn: NaN, a: tween(k === START ? AJAR : 0) });
  }
  lockers.sort((p, q) => p.n - q.n);

  /** The door of locker L swung `a` degrees about its left edge, toward the viewer. It stands 1.3 proud of the face: that is its thickness. */
  function draw(L, a, o) {
    if (o !== L.drawn) {
      const [w, dp, h] = L.it, [ir, ii] = rings(L.xl + 2.5, D - 2.5 - dp + o, L.xl + 2.5 + w, D - 2.5 + o, 1.6, 0.8);
      put(L.item, prism(P, front, ir, ii, L.zb, L.zb + h));
      L.drawn = o;
    }
    const DW = L.xr - L.xl, s = Math.sin(rad(a)), c = Math.cos(rad(a));
    const w = (u, z) => P(L.xl + u * c - 1.3 * s, D + u * s + 1.3 * c, z), wb = (u, z) => P(L.xl + u * c, D + u * s, z);
    const ring = rrect(0, L.zb, DW, L.zt, 2.2, 4);
    L.back.setAttribute("d", poly(ring.map((q) => wb(q.u, q.v))));
    L.face.setAttribute("d", poly(ring.map((q) => w(q.u, q.v))));
    let m = "";
    for (let v = 0; v < 3; v++) m += seg(w(5, L.zt - 4 - v * 2.6), w(DW - 5, L.zt - 4 - v * 2.6));
    m += seg(w(DW - 3.5, L.zb + 11), w(DW - 3.5, L.zb + 17));
    L.marks.setAttribute("d", m);
    L.dots.forEach((el, j) => place(el, w(5 + (j % 4) * 3.2, L.zb + 6.5 - Math.floor(j / 4) * 3)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const L of lockers) { draw(L, tval(L.a, now), tval(L.o, now)); if (!tdone(L.a, now) || !tdone(L.o, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // The hit test reads the front face, y = D, which never moves: screen to (x, z) on that plane.
  const O = P(0, D, 0), ex = P(1, D, 0), ez = P(0, D, 1);
  const e1 = [ex[0] - O[0], ex[1] - O[1]], e2 = [ez[0] - O[0], ez[1] - O[1]], det = e1[0] * e2[1] - e1[1] * e2[0];
  function hit([sx, sy]) {
    const qx = sx - O[0], qy = sy - O[1], x = (qx * e2[1] - qy * e2[0]) / det, z = (e1[0] * qy - e1[1] * qx) / det;
    if (x < 0 || x > X1 || z < BASE || z > BASE + 2 * CH) return -1;
    return (z > BASE + CH ? 0 : NC) + Math.min(NC - 1, Math.floor(x / CW));
  }

  let act = null;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), lit = k < 0 ? START : k;
    g.append(lockers[lit].grp); // the open locker's door and parcel stand in front of every closed door
    lockers.forEach((L, j) => {
      tset(L.a, j === k ? swing : k < 0 && j === START ? AJAR : 0, now, 0);
      tset(L.o, j === k ? L.it[1] : 0, now, j === k ? 120 : 0);
      L.item.sil.classList.toggle("hi", j === lit);
    });
    read.textContent = k < 0 ? "rest" : `locker ${k + 1}`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { swing = v; if (act >= 0) { tset(lockers[act].a, v, performance.now(), 0); B.wake(); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "locker-bank",
  means: "A bank of numbered lockers. Point at one and its door swings open to show what is inside: give the key, get the thing.",
  rules: [1, 4, 5, 10],
  range: [60, 90, 115],
  tour: [[223, 201], [184, 129], [262, 220], null],
  mount,
});
