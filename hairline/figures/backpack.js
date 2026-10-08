/**
 * Backpack: an open backpack close at hand, and a pantry shelf far away at the
 * back holding one of each snack: juice, cookies, an apple, crackers. The
 * backpack already holds copies of the cookies and the crackers. The pointer
 * picks a snack on the shelf. If its copy is in the backpack, that copy lifts
 * at once: a hit. If not, the shelf's snack lifts, and a copy makes the long
 * trip down to the backpack's free pocket: a miss, which leaves a copy for next
 * time. The slider is the height of the trip's arc.
 */
const {
  Cam, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

/** Each snack: name, footprint w × d, height, corner radius. */
const SNACKS = [["juice", 7, 7, 16, 1.5], ["cookie", 10, 10, 12, 5], ["apple", 10, 10, 10, 5], ["cracker", 12, 6, 14, 1.6]];
const SHELF = [10, 27, 44, 61], SY = 9, SZ = 24, IN = [1, 3];
const BX0 = 8, BX1 = 46, BY0 = 52, BY1 = 68, BH = 24, SLOT = [16.5, 27, 37.5], BYC = 60, SIT = 19, LIFT = 14;

const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let arc = value;
  const C = Cam(45, 0.5, 2.3);
  fit(C, [[-6, -4, -4], [74, -4, -4], [74, 76, -4], [-6, 76, -4], [0, 0, 40], [SHELF[0], SY, SZ + 16 + LIFT]], 200, 166);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1) => { const s = solid(parent); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const snack = (parent, k, x, y, z, el) => { const [, w, d, h, r] = SNACKS[k], s = el || solid(parent); const [o, i] = rings(x - w / 2, y - d / 2, x + w / 2, y + d / 2, r, 0.7); put(s, prism(P, front, o, i, z, z + h)); return s; };

  box(g, -6, -4, 74, 76, 8, 2.2, -4, 0);
  // the pantry: a wall, a shelf board on it, one of each snack
  box(g, -2, -2, 72, 1.5, 1.2, 0.5, 0, 40);
  box(g, -2, 1.5, 72, 17, 1.6, 0.8, SZ - 2.2, SZ);
  const shelf = SHELF.map((x, k) => ({ x, k, el: solid(g), z: tween(0), drawn: NaN }));
  // the long trip, painted on the floor
  mk("path", { d: open([P(52, 19, 0), P(52, 38, 0), P(SLOT[2], 42, 0), P(SLOT[2], BY0 - 1, 0)]), class: "dash" }, g);

  // the backpack: a body that narrows to its open top, a handle, a front pocket; its near half is painted after what is inside
  const foot = rrect(BX0, BY0, BX1, BY1, 7, 6), top = rrect(BX0 + 2, BY0 + 1.5, BX1 - 2, BY1 - 1.5, 6, 6);
  const inner = rrect(BX0 + 3.8, BY0 + 3.3, BX1 - 3.8, BY1 - 3.3, 4.2, 6);
  mk("path", { d: open([P(BX0 + 12, BY0 + 3, BH), P(BX0 + 14, BY0 + 3, BH + 11), P(BX1 - 14, BY0 + 3, BH + 11), P(BX1 - 12, BY0 + 3, BH)]), class: "nf" }, g);
  mk("path", { d: poly(hull(ringAt(P, foot, 0).concat(ringAt(P, top, BH)))), class: "sil" }, g);
  mk("path", { d: poly(ringAt(P, inner, BH)), class: "nf" }, g);
  const inside = mk("g", {}, g);
  const copies = IN.map((k, j) => ({ k, el: snack(inside, k, SLOT[j], BYC, SIT), z: tween(0), drawn: NaN, slot: j }));
  const iF = LR(ringAt(P, run(inner, front), BH)), oT = LR(ringAt(P, run(top, front), BH)), oB = LR(ringAt(P, run(foot, front), 0));
  mk("path", { d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), class: "fo" }, g);
  mk("path", { d: open(iF), class: "nf" }, g);
  mk("path", { d: open(oT), class: "nf lo" }, g);
  mk("path", { d: open([oT[0], ...oB, oT[oT.length - 1]]), class: "nf sil" }, g);
  const pocket = rrect(BX0 + 7, 2.5, BX1 - 7, 12, 3, 5).map((q) => P(q.u, BY1 + 0.3, q.v));
  mk("path", { d: poly(pocket), class: "nf" }, g);
  mk("path", { d: open([P(BX0 + 8, BY1 + 0.3, 9), P(BX1 - 8, BY1 + 0.3, 9)]), class: "nf lo" }, g);

  // the copy that makes the trip on a miss: shelf to the free pocket, along an arc
  const trip = { el: solid(inside), p: tween(0), k: 0, drawn: "" };

  function draw(now) {
    let moving = false;
    for (const s of shelf) {
      const z = tval(s.z, now);
      if (z !== s.drawn) { s.drawn = z; snack(g, s.k, s.x, SY, SZ + z, s.el); }
      if (!tdone(s.z, now)) moving = true;
    }
    for (const c of copies) {
      const z = tval(c.z, now);
      if (z !== c.drawn) { c.drawn = z; snack(inside, c.k, SLOT[c.slot], BYC, SIT + z, c.el); }
      if (!tdone(c.z, now)) moving = true;
    }
    const p = tval(trip.p, now), key = trip.k + ":" + p.toFixed(4) + ":" + arc;
    if (key !== trip.drawn) {
      trip.drawn = key;
      if (p < 0.02) { trip.el.sil.setAttribute("d", ""); trip.el.cr.setAttribute("d", ""); }
      else snack(inside, trip.k, lerp(SHELF[trip.k], SLOT[2], p), lerp(SY, BYC, p), lerp(SZ + LIFT, SIT, p) + Math.sin(Math.PI * p) * arc, trip.el);
    }
    return moving || !tdone(trip.p, now);
  }
  const B = register(stage, (_dt, now) => draw(now));
  bag.add(B.unregister);

  // The shelf never moves: the pointer takes the snack whose rest centre is nearest on screen.
  const mid = SHELF.map((x, k) => P(x, SY, SZ + SNACKS[k][3] / 2));
  function hit([sx, sy]) {
    let best = -1, bd = 26;
    mid.forEach((p, k) => { const e = Math.hypot(p[0] - sx, (p[1] - sy) * 0.6); if (e < bd) { bd = e; best = k; } });
    return best;
  }

  let act = null;
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), cached = IN.includes(k);
    shelf.forEach((s) => { tset(s.z, s.k === k && !cached ? LIFT : 0, now, 0); s.el.sil.classList.toggle("hi", false); });
    copies.forEach((c) => { tset(c.z, c.k === k ? LIFT : 0, now, 0); c.el.sil.classList.toggle("hi", c.k === k || (k < 0 && c.k === IN[0])); });
    if (k >= 0 && !cached) { if (trip.k !== k) { trip.k = k; trip.p = tween(0); } tset(trip.p, 1, now, 250); } else tset(trip.p, 0, now, 0);
    trip.el.sil.classList.toggle("hi", k >= 0 && !cached);
    read.textContent = k < 0 ? "rest" : `${SNACKS[k][0]} · ${cached ? "hit" : "miss"}`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { arc = v; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "backpack",
  means: "A backpack close by, a pantry far away. Point at a snack: a copy in the backpack is a quick hit, else a long trip that leaves a copy.",
  rules: [1, 4, 6, 8],
  range: [4, 12, 22],
  tour: [[232, 114], [260, 132], [288, 141], null],
  mount,
});
