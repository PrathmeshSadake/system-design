/**
 * Copy boards: the leader is a big board on two legs, with four lines of
 * changes written on it, the newest one bright. Three small slates lean in
 * front of it, the followers, each holding a copy of the first three lines.
 * The pointer picks a slate: the new change hops from the leader's ledge to
 * it as a trail of dots, and the slate's fourth line is written once they
 * land. The slider is the stagger between the dots, in ms.
 */
const {
  Cam, facing, fit, fillet, poly, prism, proj, rad, rings, seg, solid, put, mk, place,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const LX0 = 8, LX1 = 92, LZ0 = 30, LZ1 = 74, LT = 4;          // the leader board
const SW = 30, SH = 28, TILT = 28, YB = 66, ZB = 4, SX = [-6, 35, 76]; // the slates
const LINES = [[0.78, 0.9], [0.6, 0.62], [0.42, 0.8], [0.24, 0.55]];    // [height share, length share]
const NDOT = 3, ARC = 26, LIFT = 0;

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
  let stag = value;
  const C = Cam(45, 0.5, 1.86);
  fit(C, [[LX0 - 14, 0, 0], [LX1, 0, LZ1], [SX[0], YB, 0], [SX[2] + SW, YB, 0], [LX0, 0, LZ1 + 4], [SX[0], YB, ZB + LIFT + SH]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const block = (x0, y0, z0, x1, y1, z1, r = 1.5, b = 0.7) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b), s = solid(g);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };

  // the leader: two legs, the board, a frame inset on its face, a ledge, and four written lines
  block(LX0 + 6, 0, 0, LX0 + 10, LT, LZ0);
  block(LX1 - 10, 0, 0, LX1 - 6, LT, LZ0);
  const board = block(LX0, 0, LZ0, LX1, LT, LZ1, 2, 0.8);
  const fr = fillet([[LX0 + 4, LZ0 + 4], [LX1 - 4, LZ0 + 4], [LX1 - 4, LZ1 - 4], [LX0 + 4, LZ1 - 4]], [2, 2, 2, 2]);
  mk("path", { d: poly(fr.map(([x, z]) => P(x, LT, z))), class: "nf lo" }, g);
  const lead = LINES.map(([h, l], i) => mk("path", {
    d: seg(P(LX0 + 10, LT, LZ0 + 4 + h * (LZ1 - LZ0 - 8)), P(LX0 + 10 + l * (LX1 - LX0 - 20), LT, LZ0 + 4 + h * (LZ1 - LZ0 - 8))),
    class: i === 3 ? "nf hi" : "nf",
  }, g));
  block(LX0 + 2, LT, LZ0 - 2, LX1 - 2, LT + 5, LZ0 + 1, 1.2, 0.6);
  const ledge = [LX0 + 30, LT + 2.5, LZ0 + 2];

  // the slates, leaning back toward the board on a low foot
  const shape = fillet([[0, 0], [SW, 0], [SW, SH], [0, SH]], [2.5, 2.5, 2.5, 2.5]);
  const inset = fillet([[3, 3], [SW - 3, 3], [SW - 3, SH - 3], [3, SH - 3]], [1.5, 1.5, 1.5, 1.5]);
  /** Slate x0 standing up by e (0 leans back on its foot, 1 stands upright, lifted to take the change): a point on its face, t behind it. */
  const pose = (x0, e) => {
    const s = Math.sin(rad(TILT - (TILT - 4) * e)), c = Math.cos(rad(TILT - (TILT - 4) * e)), z = ZB + LIFT * Math.max(e, 0);
    return (u, v, t = 0) => P(x0 + u, YB - v * s - t * c, z + v * c - t * s);
  };
  const lineAt = (w, i, f) => seg(w(5, 4 + LINES[i][0] * (SH - 8)), w(5 + f * LINES[i][1] * (SW - 10), 4 + LINES[i][0] * (SH - 8)));
  const slates = SX.map((x0, k) => {
    const sl = { k, x0, up: tween(0), len: tween(0), dots: [], drawn: "" };
    sl.back = mk("path", { class: "lo" }, g);
    sl.face = mk("path", { class: "sil" }, g);
    sl.inset = mk("path", { class: "nf lo" }, g);
    sl.lines = mk("path", { class: "nf" }, g);
    sl.fourth = mk("path", { class: "nf" }, g);
    block(x0 - 2, YB - 3, 0, x0 + SW + 2, YB + 3, ZB, 1.4, 0.6);
    const w = pose(x0, 0);
    sl.outline = [w(-4, -4), w(SW + 4, -4), w(SW + 4, SH + 4), w(-4, SH + 4)];
    return sl;
  });
  const LIFT_TOP = (sl, e) => {
    const s = Math.sin(rad(TILT - (TILT - 4) * e)), c = Math.cos(rad(TILT - (TILT - 4) * e));
    return [sl.x0 + SW / 2, YB - (SH - 4) * s, ZB + LIFT * Math.max(e, 0) + (SH - 4) * c];
  };
  // the dots of each slate, painted last: at rest they all wait on the ledge
  for (const sl of slates) for (let j = 0; j < NDOT; j++) sl.dots.push({ el: mk("circle", { r: 1.7, class: "dot m" }, g), t: tween(0) });
  const boardHull = [P(LX0, 0, LZ1), P(LX1, 0, LZ1), P(LX1, LT, LZ0 - 2), P(LX1 - 6, LT, 0), P(LX0 + 6, LT, 0), P(LX0, LT, LZ0)];

  function draw(now) {
    let m = false;
    for (const sl of slates) {
      const e = tval(sl.up, now), f = tval(sl.len, now), key = e + "," + f;
      if (!tdone(sl.len, now) || !tdone(sl.up, now)) m = true;
      if (key !== sl.drawn) {
        sl.drawn = key;
        const w = pose(sl.x0, e);
        sl.back.setAttribute("d", poly(shape.map(([u, v]) => w(u, v, 1.6))));
        sl.face.setAttribute("d", poly(shape.map(([u, v]) => w(u, v))));
        sl.inset.setAttribute("d", poly(inset.map(([u, v]) => w(u, v))));
        sl.lines.setAttribute("d", [0, 1, 2].map((i) => lineAt(w, i, 1)).join(""));
        sl.fourth.setAttribute("d", f > 0.02 ? lineAt(w, 3, f) : "");
        sl.top = LIFT_TOP(sl, e);
        sl.dots.forEach((d) => { d.drawn = NaN; });
      }
      sl.dots.forEach((d, j) => {
        const t = tval(d.t, now);
        if (!tdone(d.t, now)) m = true;
        if (t === d.drawn) return;
        d.drawn = t;
        const a = [ledge[0] + j * 5, ledge[1], ledge[2]], b = [sl.top[0] - 4 + j * 4, sl.top[1], sl.top[2] + 3];
        place(d.el, P(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + ARC * Math.sin(Math.PI * t)));
      });
    }
    return m;
  }
  const B = register(stage, (_dt, now) => draw(now));
  bag.add(B.unregister);

  let act = -2;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now();
    slates.forEach((sl, i) => {
      const on = i === k;
      // the trail leaves in order from the ledge; the line is written as the last dot lands
      sl.dots.forEach((d, j) => { tset(d.t, on ? 1 : 0, now, on ? j * stag : (NDOT - 1 - j) * stag); d.el.setAttribute("class", on ? "dot" : "dot m"); });
      tset(sl.len, on ? 1 : 0, now, on ? 420 + (NDOT - 1) * stag : 0);
      // the others lean further back, out of its way, spreading out from it
      tset(sl.up, on ? 1 : k < 0 ? 0 : -0.7, now, k < 0 ? 0 : Math.abs(i - k) * stag);
      sl.face.classList.toggle("hi", on);
      sl.fourth.classList.toggle("hi", on);
    });
    lead[3].classList.toggle("hi", k < 0 || k === 3);
    board.sil.classList.toggle("hi", k === 3);
    read.textContent = k < 0 ? "rest" : k === 3 ? "leader" : `follower ${k + 1}`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, {
    move: (p) => {
      const k = slates.findIndex((sl) => inside(p, sl.outline));
      choose(k >= 0 ? k : inside(p, boardHull) ? 3 : -1);
    },
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "copy-boards",
  means: "A big leader board takes every new line, and small follower slates copy it. Point at a slate to send the newest change to it.",
  rules: [1, 2, 4, 8],
  range: [0, 60, 120],
  tour: [[150, 230], [212, 250], [272, 262], null],
  mount,
});
