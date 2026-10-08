/**
 * Three rooms: three walled trays side by side, the kitchen, the register and
 * delivery. Each holds the same order on a plate stamped with the same
 * three-dot order number, but shaped for its room: two pizzas to bake, stacks
 * of coins to collect, a closed box to carry. The pointer picks a room and its
 * plate lifts out, the neighbours stirring less, staggered outwards. At rest
 * the register's plate is lifted a little, bright. The slider is the lift.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, ringAt, rings, rrect, run, unproj,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const NAMES = ["kitchen", "register", "delivery"];
const N = 3, RW = 54, PITCH = 64, WH = 6.5, WT = 2.4, PL = 38, REST = 1;
const disc = (x, y, r, b) => [rrect(x - r, y - r, x + r, y + r, r, 6), rrect(x - r + b, y - r + b, x + r - b, y + r - b, r - b, 6)];
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

/** What each room makes of the order, on the plate's top (z 0): solids [ring, inner, z0, z1], rims [ring, z], dots [x, y]. */
const KIT = [
  { s: [[...disc(-7, -5, 8.5, 1.8), 0, 1.8], [...disc(8, 4, 8.5, 1.8), 0, 1.8]], rims: [], dots: [[-9, -7], [-4, -4], [-8, -1], [6, 2], [10, 6], [9, 0]] },
  { s: [[...disc(-11, 2, 5.5, 1), 0, 6], [...disc(0, -3, 5.5, 1), 0, 10], [...disc(11, -8, 5.5, 1), 0, 14]],
    rims: [[-11, 2, 2], [-11, 2, 4], [0, -3, 2.5], [0, -3, 5], [0, -3, 7.5], [11, -8, 2.8], [11, -8, 5.6], [11, -8, 8.4], [11, -8, 11.2]], dots: [] },
  { s: [[...rings(-12, -12, 12, 9, 2, 1.2), 0, 7]], rims: [], dots: [] },
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 1.85);
  fit(C, [[0, 0, 0], [(N - 1) * PITCH + RW, 0, 0], [0, RW, 0], [(N - 1) * PITCH + RW, RW, 0], [RW / 2, RW / 2, 2 + 20 + 15]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const path = (d, cls, parent) => mk("path", { d, class: cls }, parent);

  const rooms = [];
  for (let i = 0; i < N; i++) {
    const x0 = i * PITCH, cx = x0 + RW / 2, cy = RW / 2, rg = mk("g", {}, g);
    const outer = rrect(x0, 0, x0 + RW, RW, 6, 6), inner = rrect(x0 + WT, WT, x0 + RW - WT, RW - WT, 6 - WT, 6);
    path(poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "sil", rg);
    path(poly(ringAt(P, inner, WH)), "nf", rg);
    path(open(ringAt(P, run(inner, (q) => !front(q)), 0.5)), "nf lo", rg);
    // the order: one plate, the same number, the room's own shape on top
    const og = mk("g", {}, rg), [pr, pi] = rings(cx - PL / 2, cy - PL / 2, cx + PL / 2, cy + PL / 2, 4, 1.4);
    const plate = solid(og), parts = KIT[i].s.map(([ring, inn, z0, z1]) => ({ ring: shift(ring, cx, cy), inn: shift(inn, cx, cy), z0, z1, el: solid(og) }));
    const rims = KIT[i].rims.map(([x, y, z]) => ({ ring: shift(rrect(x - 5.5, y - 5.5, x + 5.5, y + 5.5, 5.5, 6), cx, cy), z, el: path("", "nf lo", og) }));
    const dots = KIT[i].dots.map(([x, y]) => ({ x: cx + x, y: cy + y, dz: 1.8, el: flatDot(og, C, 0.9, "dot m") }));
    const code = [-4, 0, 4].map((d) => ({ x: cx + d, y: cy + 15, dz: 0, el: flatDot(og, C, 0.9, "dot m") }));
    if (i === 2) rims.push({ ring: shift(rrect(-12, -12, 12, 9, 2, 4), cx, cy), z: 5, el: path("", "nf lo", og) });
    // the near wall, in front of the order
    const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
    path(poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo", rg);
    path(open(oT), "nf lo", rg);
    path(open(iF), "nf", rg);
    path(open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil", rg);
    rooms.push({ pr, pi, plate, parts, rims, dots: dots.concat(code), t: tween(i === REST ? 0.3 : 0), drawn: NaN });
  }
  function shift(ring, dx, dy) { return ring.map((q) => ({ ...q, u: q.u + dx, v: q.v + dy })); }

  function draw(r, f) {
    const z = 0.5 + lift * f;
    if (z === r.drawn) return;
    r.drawn = z;
    put(r.plate, prism(P, front, r.pr, r.pi, z, z + 3.5));
    const top = z + 3.5;
    for (const p of r.parts) put(p.el, prism(P, front, p.ring, p.inn, top + p.z0, top + p.z1));
    for (const m of r.rims) m.el.setAttribute("d", open(ringAt(P, run(m.ring, front), top + m.z)));
    for (const d of r.dots) place(d.el, P(d.x, d.y, top + d.dz));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const r of rooms) { draw(r, tval(r.t, now)); if (!tdone(r.t, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on the floor, which never moves: the room whose footprint holds the pointer.
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, 0);
    if (y < -4 || y > RW + 4) return -1;
    const i = Math.round((x - RW / 2) / PITCH);
    return i >= 0 && i < N && Math.abs(x - (i * PITCH + RW / 2)) < RW / 2 + 5 ? i : -1;
  }

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act === null || act < 0 ? REST : act;
    act = a;
    rooms.forEach((r, i) => {
      const f = a < 0 ? (i === REST ? 0.3 : 0) : i === a ? 1 : 0.18 / Math.abs(i - a);
      tset(r.t, f, now, Math.abs(i - from) * 50);
      r.plate.sil.classList.toggle("hi", i === (a < 0 ? REST : a));
    });
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; rooms.forEach((r) => { r.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "three-rooms",
  means: "The same order sits in three rooms, shaped for each: pizzas to bake, coins to collect, a box to carry. Point at a room to lift its order.",
  rules: [1, 2, 4, 10],
  range: [8, 14, 20],
  tour: [[116, 131], [200, 173], [284, 215], null],
  mount,
});
