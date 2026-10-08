/**
 * Room doors: four rooms on a floor, three square and the last one round (an
 * outside system that speaks differently). Between each pair stands the kind
 * of doorway that pair needs: a low pair of doors under a counter (an API you
 * ask at), a tall pair of swinging doors (events passed through), and, before
 * the round room, a translator's booth with a shuttered window (the
 * anti-corruption layer). The pointer picks a doorway: its doors swing open,
 * or the booth's shutter goes up; the others answer less, staggered by
 * distance. At rest the booth is bright and the events doors stand ajar. The
 * slider is how far a door opens, in degrees.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, rad, ringAt, rings, rrect, run, unproj,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const S0 = 40, G = 62, WH = 5, DH = 22, LW = 8.6, HW = 10.5;
/** The doorways, each at the centre of a gap; `ax` is the axis its doors stand across. */
const UNITS = [
  { name: "door · api", c: [51, 25], ax: "x", h: 9 },
  { name: "door · events", c: [20, 51], ax: "y", h: 18 },
  { name: "translator", c: [92, 51], booth: true },
];
const REST_OPEN = [0, 0.35, 0], BRIGHT = 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let maxA = value;
  const C = Cam(45, 0.5, 1.95);
  const X1 = G + S0;
  fit(C, [[0, 0, 0], [X1, 0, 0], [0, X1, 0], [X1, X1, 0], [20, 51, DH]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const path = (d, cls, parent = g) => mk("path", { d, class: cls }, parent);
  const box = (x0, y0, x1, y1, r, b, z0, z1, parent = g) => {
    const s = solid(parent), [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };
  /** A room: a low walled tray, drawn whole since nothing stands inside it. */
  const room = (x0, y0, r) => {
    const n = r > 10 ? 14 : 6, o = rrect(x0, y0, x0 + S0, y0 + S0, r, n), i = rrect(x0 + 2.2, y0 + 2.2, x0 + S0 - 2.2, y0 + S0 - 2.2, r - 2.2, n);
    path(poly(hull(ringAt(P, o, 0).concat(ringAt(P, o, WH)))), "sil");
    path(poly(ringAt(P, i, WH)), "nf");
    path(open(ringAt(P, run(i, (q) => !front(q)), 0.4)), "nf lo");
  };
  const units = UNITS.map((u) => ({ ...u, t: tween(0), drawn: NaN }));

  /** A box across a doorway: `w` along the doors' line, `d` through it. */
  const across = (u, w, d, z0, z1, r, b, parent) => {
    const [x, y] = u.c, [hx, hy] = u.ax === "x" ? [d, w] : [w, d];
    return box(x - hx, y - hy, x + hx, y + hy, r, b, z0, z1, parent);
  };
  /** A doorway: two posts, a lintel, two leaves that swing apart, and for the API a counter over the low leaves. */
  function doorway(u) {
    const dg = mk("g", {}, g), [x, y] = u.c, X = u.ax === "x";
    const post = (k) => (X ? box(x - 1.3, y + k * HW - 1.3, x + 1.3, y + k * HW + 1.3, 0.9, 0.4, 0, DH, dg) : box(x + k * HW - 1.3, y - 1.3, x + k * HW + 1.3, y + 1.3, 0.9, 0.4, 0, DH, dg));
    post(-1);
    u.leaves = X ? [{ h: [x, y - 8], dir: 90 }, { h: [x, y + 8], dir: 270 }] : [{ h: [x - 8, y], dir: 0 }, { h: [x + 8, y], dir: 180 }];
    u.leaves.forEach((L) => { L.el = solid(dg); });
    u.sgn = X ? -1 : 1;
    post(1);
    across(u, HW + 1.3, 1.6, DH - 2.4, DH, 1, 0.5, dg);
    if (u.h < 12) across(u, 8, 3.2, u.h + 1.5, u.h + 3, 1.2, 0.6, dg);
  }
  const base = rrect(0, -0.65, LW, 0.65, 0.6, 2), core = rrect(0.4, -0.25, LW - 0.4, 0.25, 0.2, 2);
  function drawLeaves(u, f) {
    for (const L of u.leaves) {
      const a = rad(L.dir + u.sgn * f * maxA), c = Math.cos(a), s = Math.sin(a);
      const tf = (q) => ({ u: L.h[0] + q.u * c - q.v * s, v: L.h[1] + q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c });
      put(L.el, prism(P, front, base.map(tf), core.map(tf), 0.6, u.h));
    }
  }
  /** The translator's booth, its window on the near face, and a shutter that slides up. */
  function booth(u) {
    const bg = mk("g", {}, g), [x, y] = u.c;
    u.body = box(x - 9, y - 6.5, x + 9, y + 6.5, 2.4, 1, 0, 18, bg);
    box(x - 10.5, y - 8, x + 10.5, y + 8, 2.8, 1.2, 18, 20.5, bg);
    path(poly(rrect(x - 5, 6, x + 5, 13, 1.5, 3).map((q) => P(q.u, y + 6.5, q.v))), "nf lo", bg);
    u.shutter = path("", "", bg);
  }
  function drawShutter(u, f) {
    const z = 5.4 + f * 7.5, [x, y] = u.c;
    u.shutter.setAttribute("d", poly(rrect(x - 5.8, z, x + 5.8, z + 8.4, 1.5, 3).map((q) => P(q.u, y + 6.9, q.v))));
  }

  room(0, 0, 6);
  doorway(units[0]);
  doorway(units[1]);
  room(G, 0, 6);
  room(0, G, 6);
  booth(units[2]);
  room(G, G, S0 / 2);
  const draw = (u, f) => (u.booth ? drawShutter(u, f) : drawLeaves(u, f));
  units.forEach((u) => draw(u, 0));

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const u of units) {
      const f = tval(u.t, now);
      if (f !== u.drawn) { u.drawn = f; draw(u, f); }
      if (!tdone(u.t, now)) m = true;
    }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on the floor, which never moves: the doorway nearest the pointer, within reach.
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, 0);
    let best = -1, bd = 17;
    units.forEach((u, i) => { const d = Math.hypot(x - u.c[0], y - u.c[1]); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = units[a >= 0 ? a : BRIGHT].c;
    act = a;
    units.forEach((u, i) => {
      tset(u.t, a < 0 ? REST_OPEN[i] : i === a ? 1 : 0.12, now, (Math.hypot(u.c[0] - from[0], u.c[1] - from[1]) / G) * 50);
      const hi = i === (a < 0 ? BRIGHT : a);
      if (u.booth) u.body.sil.classList.toggle("hi", hi);
      else u.leaves.forEach((L) => L.el.sil.classList.toggle("hi", hi));
    });
    read.textContent = a < 0 ? "rest" : units[a].name;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { maxA = v; units.forEach((u) => { u.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "room-doors",
  means: "Rooms joined only where they need to talk: a desk to ask at, doors for news, and a translator before the room that speaks differently.",
  rules: [1, 2, 4, 6],
  range: [45, 70, 90],
  tour: [[157, 145], [236, 148], [257, 194], null],
  mount,
});
