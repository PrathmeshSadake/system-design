/**
 * Sticky seat: three follower desks in a row, each with its own stack of
 * pages, some further behind than others. One chair, the reader's, is pulled
 * up to a desk and stays there, so every page the reader sees comes from the
 * same copy and never jumps back in time. The pointer picks a desk and the
 * chair slides over to it on the lift curve; it does not wander on its own.
 * The slider is how far the chair is tucked in.
 */
const {
  Cam, facing, fit, hull, prism, proj, rings, solid, put, mk, flatDot, place,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const DW = 38, DD = 26, DH = 26, GAP = 16, LEG = 3.2, TOP = 3;
const PAGES = [4, 2, 3], CW = 18, CD = 16, SEAT = 14, BACK = 32;

function inside([x, y], pl) {
  let c = false;
  for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) {
    const [xi, yi] = pl[i], [xj, yj] = pl[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let tuck = value;
  const XN = 3 * DW + 2 * GAP, Y1 = DD + CD + 12;
  const C = Cam(45, 0.5, 1.9);
  fit(C, [[0, 0, 0], [XN, 0, DH + 20], [0, Y1, 0], [XN, Y1, 0], [0, 0, DH + 20], [0, Y1 + 6, BACK]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const slab = (s, x0, y0, z0, x1, y1, z1, r = 1.6, b = 0.8) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };
  const block = (...a) => slab(solid(g), ...a);

  // the desks, each a top on four legs with its stack of pages; dots on the top's front corner number it
  const desks = PAGES.map((n, k) => {
    const X = k * (DW + GAP);
    for (const [lx, ly] of [[X + 2, 2], [X + DW - 2 - LEG, 2], [X + 2, DD - 2 - LEG], [X + DW - 2 - LEG, DD - 2 - LEG]]) block(lx, ly, 0, lx + LEG, ly + LEG, DH - TOP, 1.2, 0.5);
    const top = block(X, 0, DH - TOP, X + DW, DD, DH, 2.4, 1);
    let sheet = null;
    for (let i = 0; i < n; i++) {
      const jx = [0, 1.4, -1, 0.8][i], jy = [0, -1, 1.2, 0.6][i];
      if (i < n - 1) block(X + 9 + jx, 5 + jy, DH + i * 2.4, X + 29 + jx, 19 + jy, DH + i * 2.4 + 1.6, 1.2, 0.5);
      // the top page is the one handed to the reader: it lifts and slides toward the chair
      else sheet = { el: solid(g), at: [X + 9 + jx, 5 + jy, DH + i * 2.4], v: tween(0), drawn: NaN };
    }
    for (let i = 0; i <= k; i++) place(flatDot(g, C, 0.8, "dot m"), P(X + DW - 5 - i * 3.4, DD - 3.5, DH));
    // the desk's rest box and the floor in front of it, where its chair would sit
    return { X, top, sheet, hull: hull([P(X, 0, DH + 8), P(X + DW, 0, DH + 8), P(X + DW, DD, DH), P(X + DW, Y1, 0), P(X, Y1, 0), P(X, DD, DH)]) };
  });

  // the chair: a seat on four legs and a back on the side away from the desk; it is painted last, nearest the viewer
  const chair = { legs: [0, 1, 2, 3].map(() => solid(g)), seat: solid(g), back: solid(g), x: tween(desks[0].X + (DW - CW) / 2), y: tween(-6), drawn: "" };
  chair.seat.sil.classList.add("hi");
  chair.back.sil.classList.add("hi");
  function drawChair(now) {
    const x = tval(chair.x, now), dy = tval(chair.y, now), key = x + "," + dy;
    if (key === chair.drawn) return;
    chair.drawn = key;
    const y = DD + 6 - dy;
    [[x + 1, y + 1], [x + CW - 1 - LEG * 0.8, y + 1], [x + 1, y + CD - 1 - LEG * 0.8], [x + CW - 1 - LEG * 0.8, y + CD - 1 - LEG * 0.8]]
      .forEach(([lx, ly], i) => slab(chair.legs[i], lx, ly, 0, lx + LEG * 0.8, ly + LEG * 0.8, SEAT - 2, 1, 0.4));
    slab(chair.seat, x, y, SEAT - 2, x + CW, y + CD, SEAT, 2, 0.8);
    slab(chair.back, x, y + CD - 2.6, SEAT, x + CW, y + CD, BACK, 1.2, 0.6);
  }
  function drawSheet(sh, now) {
    const v = tval(sh.v, now);
    if (v === sh.drawn) return;
    sh.drawn = v;
    const [x, y, z] = sh.at;
    slab(sh.el, x, y + 9 * v, z + 9 * v, x + 20, y + 14 + 9 * v, z + 9 * v + 1.6, 1.2, 0.5);
  }
  const B = register(stage, (_dt, now) => {
    drawChair(now);
    let m = !tdone(chair.x, now) || !tdone(chair.y, now);
    for (const d of desks) { drawSheet(d.sheet, now); if (!tdone(d.sheet.v, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), d = desks[k < 0 ? 0 : k];
    tset(chair.x, d.X + (DW - CW) / 2, now, 0);
    tset(chair.y, k < 0 ? -6 : tuck, now, 0);
    desks.forEach((ds, i) => tset(ds.sheet.v, i === (k < 0 ? 0 : k) ? 1 : 0, now, 0));
    read.textContent = k < 0 ? "rest" : `follower ${k + 1} · yours`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, {
    move: (p) => choose(desks.findIndex((ds) => inside(p, ds.hull))),
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { tuck = v; if (act >= 0) { const a = act; act = -2; choose(a); } }, destroy: bag.dispose };
}

hairline({
  name: "sticky-seat",
  means: "A reader keeps one seat at one copy desk, so the pages never jump back in time. Point at a desk to make it the reader's seat.",
  rules: [1, 4, 5, 8],
  range: [0, 4, 8],
  tour: [[150, 150], [222, 186], [290, 222], null],
  mount,
});
