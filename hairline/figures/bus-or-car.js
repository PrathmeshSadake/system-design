/**
 * Bus or car: a long bus and a small car parked side by side, noses the same
 * way, and two riders waiting at the kerb in front of them. Each seat is a
 * window dot: twelve on the bus, two on the car. The pointer picks a vehicle;
 * the riders walk to its door, one after the other, and two of its windows
 * light. In the bus ten stay dark; in the car every seat is taken. The slider
 * is the gap between the two riders setting off, in ms.
 */
const {
  Cam, facing, fit, hull, open, poly, proj, prism, rings, ringAt, rrect, run, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

const BUS = { x0: 0, y0: 0, x1: 104, y1: 34, z0: 4, z1: 44, wheels: [16, 84], name: "bus" };
const CAR = { x0: 54, y0: 58, x1: 104, y1: 84, z0: 4, z1: 17, wheels: [64, 94], name: "car" };
const HOME = [[140, 40], [146, 54]];
const DOOR = [[[118, 24], [118, 11]], [[90, 93], [79, 93]]];
const WR = 6.5;

/** A wheel standing on the visible side of a body, at y. */
const wheel = (P, x, y) => poly(Array.from({ length: 20 }, (_, k) => P(x + WR * Math.cos((k / 20) * 6.283), y, WR + WR * Math.sin((k / 20) * 6.283))));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.52);
  fit(C, [[-8, -8, -4], [158, 102, -4], [158, -8, -4], [-8, 102, -4], [0, 0, 46]], 200, 166);
  const P = proj(C), front = facing(C), SC = Math.abs(P(1, -1, 0)[0] - P(0, 0, 0)[0]) / Math.SQRT2;

  const g = mk("g", {}, svg);
  const [gr, gi] = rings(-8, -8, 158, 102, 12, 2);
  put(solid(g), prism(P, front, gr, gi, -4, 0));
  mk("path", { d: open([P(-2, 46, 0), P(152, 46, 0)]), class: "nf dash" }, g);

  // the bus: a tall body, a band along its windows, twelve seats, two wheels
  const bus = { ...BUS, grp: mk("g", {}, g), key: 0 };
  bus.body = solid(bus.grp);
  const [br, bi] = rings(BUS.x0, BUS.y0, BUS.x1, BUS.y1, 7, 1.6);
  put(bus.body, prism(P, front, br, bi, BUS.z0, BUS.z1));
  mk("path", { d: open([P(6, BUS.y1, 22), P(98, BUS.y1, 22)]) + open([P(6, BUS.y1, 38), P(98, BUS.y1, 38)]), class: "nf lo" }, bus.grp);
  mk("path", { d: open([P(BUS.x1, 5, 24), P(BUS.x1, 29, 24)]), class: "nf lo" }, bus.grp);
  bus.seats = Array.from({ length: 12 }, () => mk("circle", { r: 1.7, class: "dot off" }, bus.grp));
  bus.seats.forEach((el, k) => place(el, P(90 - (k % 6) * 15.5, BUS.y1, k < 6 ? 33 : 27)));

  // the car: a low body, a cabin narrower than it with a sloping windscreen, two seats, two wheels
  const car = { ...CAR, grp: mk("g", {}, g), key: (CAR.x0 + CAR.x1 + CAR.y0 + CAR.y1) / 2 };
  car.body = solid(car.grp);
  const [cr, ci] = rings(CAR.x0, CAR.y0, CAR.x1, CAR.y1, 6, 1.4);
  put(car.body, prism(P, front, cr, ci, CAR.z0, CAR.z1));
  const foot = rrect(60, 60, 90, 82, 4, 4), top = rrect(64, 63, 80, 79, 3, 4), inner = rrect(65.4, 64.4, 78.6, 77.6, 1.6, 4);
  car.cab = solid(car.grp);
  put(car.cab, { sil: poly(hull(ringAt(P, foot, CAR.z1).concat(ringAt(P, top, 30)))), crease: open(ringAt(P, run(inner, front), 30)) });
  car.seats = [0, 1].map(() => mk("circle", { r: 1.7, class: "dot off" }, car.grp));
  car.seats.forEach((el, k) => place(el, P(68 + k * 10, 80.4, 23.5)));
  for (const v of [bus, car]) for (const wx of v.wheels) mk("path", { d: wheel(P, wx, v.y1 + 0.6), class: "sil" }, v.grp);

  // the riders: a peg body and a round head each
  const layer = mk("g", {}, g);
  layer.append(car.grp);
  const riders = HOME.map(([x, y], i) => ({ i, grp: mk("g", {}, layer), x: tween(x), y: tween(y), key: x + y, drawn: "" }));
  riders.forEach((r) => { r.body = solid(r.grp); r.head = mk("path", { class: "sil hi" }, r.grp); r.body.sil.classList.add("hi"); });
  function drawRider(r, x, y) {
    const k = x.toFixed(2) + "," + y.toFixed(2);
    if (k === r.drawn) return;
    r.drawn = k; r.key = x + y;
    const [pr, pi] = rings(x - 3.4, y - 3.4, x + 3.4, y + 3.4, 3.4, 1);
    put(r.body, prism(P, front, pr, pi, 0, 11));
    const c = P(x, y, 15.5), s = 3.6 * SC;
    r.head.setAttribute("d", poly(Array.from({ length: 16 }, (_, j) => [c[0] + s * Math.cos(j * 0.3927), c[1] + s * Math.sin(j * 0.3927)])));
  }

  let order = "";
  function sortLayer() {
    const items = [car, ...riders].sort((a, b) => a.key - b.key), o = items.map((it) => (it === car ? "c" : it.i)).join("");
    if (o === order) return;
    order = o;
    items.forEach((it) => layer.append(it.grp));
  }

  const B = register(stage, (_dt, now) => {
    riders.forEach((r) => drawRider(r, tval(r.x, now), tval(r.y, now)));
    sortLayer();
    return riders.some((r) => !tdone(r.x, now) || !tdone(r.y, now));
  });
  bag.add(B.unregister);

  let act = -1;
  const vs = [bus, car];
  function choose(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    riders.forEach((r, i) => {
      const to = a < 0 ? HOME[i] : DOOR[a][i], delay = (a < 0 ? 1 - i : i) * stag;
      tset(r.x, to[0], now, delay); tset(r.y, to[1], now, delay);
      r.body.sil.classList.toggle("hi", a < 0); r.head.classList.toggle("hi", a < 0);
    });
    vs.forEach((v, j) => {
      v.body.sil.classList.toggle("hi", j === a);
      if (v.cab) v.cab.sil.classList.toggle("hi", j === a);
      v.seats.forEach((el, k) => { el.classList.toggle("off", !(j === a && k < 2)); });
    });
    read.textContent = a < 0 ? "rest" : a === 0 ? "bus · 10 empty" : "car · fits";
    B.wake();
  }

  /** Each vehicle's rest box, tried on planes from its foot to its roof; the car stands in front, so it is tried first. */
  function hit(p) {
    const over = (v, top) => {
      for (let z = 0; z <= top; z += 3) { const [x, y] = unproj(C, p[0], p[1], z); if (x > v.x0 - 3 && x < v.x1 + 3 && y > v.y0 - 3 && y < v.y1 + 3) return true; }
      return false;
    };
    return over(CAR, 30) ? 1 : over(BUS, BUS.z1) ? 0 : -1;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "bus-or-car",
  means: "Two riders and two rides: a big bus and a small car. Pick one. In the bus ten seats sit empty; the car fits just right.",
  rules: [1, 2, 4, 10],
  range: [0, 60, 140],
  tour: [[250, 118], [185, 186], null],
  mount,
});
