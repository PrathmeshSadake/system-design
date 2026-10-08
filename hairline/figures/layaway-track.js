/**
 * Layaway track: a short train on a track, an engine pulling five open
 * wagons, one wagon for each step of a payment. At rest the first three
 * wagons carry their crates (those steps are done) and the third is bright.
 * The pointer picks the wagon whose step fails: it turns bright, the wagons
 * before it carry their crates, and they uncouple and roll back one by one,
 * the nearest first, which is the undo in reverse order. The slider is the
 * stagger between them.
 *
 * The pattern: one of many, staggered outwards from the pointer, so the
 * stagger itself is the reverse order. A hit test on the wagons' rest centres.
 */
const {
  Cam, fit, facing, poly, proj, prism, rings, rrect, ringAt, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 5, PITCH = 28, LEN = 23, BW = 20, ZB = 4, ZT = 14, CRATE = 8, BACKOFF = 9, DONE = 3, LIT = 2;
const STEPS = ["check", "hold", "ledger", "capture", "receipt"];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const L0 = N * PITCH, X1 = L0 + 32;
  const C = Cam(45, 0.5, 1.6);
  fit(C, [[-BACKOFF * 4 - 8, -6, -4], [X1 + 6, BW + 8, -4], [X1 + 6, -6, -4], [-BACKOFF * 4 - 8, BW + 8, -4], [L0 + 6, 0, 30], [L0 - 2, 0, 28]], 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const put6 = (s, x0, y0, x1, y1, z0, z1, r = 3, b = 1) => { const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); };
  const box = (parent, ...a) => { const s = solid(parent); put6(s, ...a); return s; };
  const wheel = (xc) => { const pts = []; for (let k = 0; k < 20; k++) { const t = (k / 20) * 2 * Math.PI; pts.push(P(xc + 3.6 * Math.cos(t), BW + 0.6, 3.8 + 3.6 * Math.sin(t))); } return poly(pts); };

  // the bed and its two rails
  box(g, -BACKOFF * 4 - 8, -6, X1 + 6, BW + 8, -4, 0, 6, 2);
  box(g, -BACKOFF * 4 - 6, 2, X1 + 4, 4.5, 0, 1.4, 1, 0.4);
  box(g, -BACKOFF * 4 - 6, 15.5, X1 + 4, 18, 0, 1.4, 1, 0.4);

  const wagons = [];
  for (let j = 0; j < N; j++) {
    const grp = mk("g", {}, g), body = solid(grp), rim = mk("path", { class: "nf lo" }, grp);
    const crate = solid(grp), wheels = mk("path", {}, grp), hitch = mk("path", { class: "nf lo" }, grp);
    wagons.push({ x0: j * PITCH, body, rim, crate, wheels, hitch, dx: tween(0), h: tween(j < DONE ? CRATE : 0), drawn: "" });
  }

  // the engine: a body, a cab with a roof and a window at its back, a chimney at its front
  const eng = mk("g", {}, g);
  box(eng, L0, 1, X1, BW - 1, ZB, ZT, 3, 1);
  box(eng, L0, 2, L0 + 11, BW - 2, ZT, 26, 2.5, 1);
  box(eng, L0 - 2, 0, L0 + 13, BW, 26, 28, 2.5, 0.8);
  mk("path", { d: poly(rrect(L0 + 2.5, 17, L0 + 8.5, 23, 1.5, 3).map((q) => P(q.u, BW - 2, q.v))), class: "nf lo" }, eng);
  box(eng, L0 + 22, BW / 2 - 3, L0 + 28, BW / 2 + 3, ZT, 23, 2.5, 0.8);
  mk("path", { d: wheel(L0 + 7) + wheel(X1 - 7), class: "" }, eng);
  mk("path", { d: seg(P(L0 - 5, BW / 2, 8), P(L0, BW / 2, 8)), class: "nf lo" }, eng);

  function draw(j, dx, h) {
    const w = wagons[j], key = dx + "," + h;
    if (key === w.drawn) return;
    w.drawn = key;
    const x0 = w.x0 + dx, x1 = x0 + LEN;
    put6(w.body, x0, 0, x1, BW, ZB, ZT, 3, 1);
    w.rim.setAttribute("d", poly(ringAt(P, rrect(x0 + 2, 2, x1 - 2, BW - 2, 2, 3), ZT)));
    if (h > 0.6) put6(w.crate, x0 + 5, 4, x1 - 5, BW - 4, ZT - 1, ZT - 1 + h, 2, 0.8);
    else put(w.crate, { sil: "", crease: "" });
    w.wheels.setAttribute("d", wheel(x0 + 5) + wheel(x1 - 5));
    w.hitch.setAttribute("d", seg(P(x1, BW / 2, 8), P(x1 + 3, BW / 2, 8)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    wagons.forEach((w, j) => { draw(j, tval(w.dx, now), tval(w.h, now)); if (!tdone(w.dx, now) || !tdone(w.h, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: the wagons' rest centres, which never move
  const centres = wagons.map((w) => P(w.x0 + LEN / 2, BW / 2, ZT));
  function hit([x, y]) {
    let best = -1, bd = 30;
    centres.forEach((c, j) => { const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = j; } });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    wagons.forEach((w, j) => {
      const done = a < 0 ? j < DONE : j < a;
      tset(w.h, done ? CRATE : 0, now, 0);
      // the undo runs from the failed wagon outwards: the nearest finished step first
      tset(w.dx, a >= 0 && j < a ? -BACKOFF * (a - j) : 0, now, a >= 0 && j < a ? (a - 1 - j) * stag : 0);
      w.body.sil.classList.toggle("hi", j === (a < 0 ? LIT : a));
    });
    read.textContent = a < 0 ? "rest" : `${STEPS[a]} · undo ${a}`;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "layaway-track",
  means: "A train of five steps. Point at the wagon that fails: the finished ones before it roll back one by one, the nearest first.",
  rules: [1, 2, 4, 6],
  range: [30, 70, 120],
  tour: [[233, 159], [170, 127], [265, 174], null],
  mount,
});
