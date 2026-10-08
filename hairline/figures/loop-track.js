/**
 * Loop track: a toy oval track on a slab, round three station huts in the
 * infield: inform, optimize, operate, told apart by one, two and three dots
 * on their fronts. A train of three tubs rides the loop and only ever rolls
 * forward. The pointer picks a hut: its platform rises and it takes the bright
 * stroke, and the train rolls on round the loop to stop beside it. At rest the
 * train is parked on the near straight, bright. The slider is the rise.
 */
const {
  Cam, facing, fit, hull, open, poly, proj, prism, rings, ringAt, rrect, run, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

const X1 = 170, Y1 = 116, R = 58, GA = 6;
const HUTS = [
  { x: 34, y: 58, name: "inform" },
  { x: 106, y: 30, name: "optimize" },
  { x: 118, y: 86, name: "operate" },
];
const HW = 13, HD = 10, WALL = 14, RIDGE = 25;

/** The ring turned by (c, s) and moved to (cx, cy). */
const spin = (ring, cx, cy, c, s) => ring.map((q) => ({ ...q, u: cx + q.u * c - q.v * s, v: cy + q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-12, -12, -5], [X1 + 12, Y1 + 12, -5], [X1 + 12, -12, -5], [-12, Y1 + 12, -5], [34, 58, RIDGE + 16], [106, 30, RIDGE + 16]], 200, 166);
  const P = proj(C), front = facing(C);

  // the centre line of the track, and its length walked sample by sample
  const line = rrect(0, 0, X1, Y1, R, 16), pts = line.map((q) => [q.u, q.v]), cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1], b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const T = cum[pts.length];
  const at = (s) => {
    s = ((s % T) + T) % T;
    let i = 0;
    while (cum[i + 1] < s) i++;
    const a = pts[i], b = pts[(i + 1) % pts.length], k = (s - cum[i]) / (cum[i + 1] - cum[i]);
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return { x: a[0] + dx * k, y: a[1] + dy * k, c: dx / d, s: dy / d };
  };
  const sNear = (x, y) => {
    let best = 0, bd = Infinity;
    for (let i = 0; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - x, pts[i][1] - y); if (d < bd) { bd = d; best = i; } }
    return cum[best];
  };

  const g = mk("g", {}, svg);
  const [sr, si] = rings(-12, -12, X1 + 12, Y1 + 12, 30, 2);
  put(solid(g), prism(P, front, sr, si, -5, 0));
  // two rails and their sleepers, laid on the slab
  const railO = rrect(-GA, -GA, X1 + GA, Y1 + GA, R + GA, 16), railI = rrect(GA, GA, X1 - GA, Y1 - GA, R - GA, 16);
  mk("path", { d: poly(ringAt(P, railO, 0)), class: "nf" }, g);
  mk("path", { d: poly(ringAt(P, railI, 0)), class: "nf" }, g);
  let ties = "";
  for (let s = 0; s < T; s += 9) {
    const q = at(s), nx = -q.s * (GA + 2), ny = q.c * (GA + 2);
    ties += "M" + P(q.x - nx, q.y - ny, 0).join(",") + "L" + P(q.x + nx, q.y + ny, 0).join(",");
  }
  mk("path", { d: ties, class: "nf lo" }, g);

  // the huts: walls, a pitched roof, and their dots on the face toward the track
  const layer = mk("g", {}, g);
  const huts = HUTS.map((h, i) => {
    const grp = mk("g", {}, layer), base = solid(grp), wall = solid(grp), roof = solid(grp), dots = [];
    for (let k = 0; k <= i; k++) dots.push(mk("circle", { r: 1.4, class: "dot m" }, grp));
    return { ...h, i, grp, base, wall, roof, dots, z: tween(0), drawn: NaN, s: sNear(h.x, h.y), key: h.x + h.y };
  });
  function drawHut(h, z) {
    if (z === h.drawn) return;
    h.drawn = z;
    const [br, bi] = rings(h.x - HW - 6, h.y - HD - 6, h.x + HW + 6, h.y + HD + 6, 4, 1.4);
    put(h.base, prism(P, front, br, bi, 0, z += 2));
    const [wr, wi] = rings(h.x - HW, h.y - HD, h.x + HW, h.y + HD, 3, 1.2);
    put(h.wall, prism(P, front, wr, wi, z, z + WALL));
    const foot = rrect(h.x - HW - 3, h.y - HD - 3, h.x + HW + 3, h.y + HD + 3, 3, 4);
    const top = rrect(h.x - HW - 3, h.y - 1.6, h.x + HW + 3, h.y + 1.6, 1.5, 4);
    const inner = rrect(h.x - HW - 2, h.y - 0.6, h.x + HW + 2, h.y + 0.6, 0.5, 4);
    put(h.roof, { sil: poly(hull(ringAt(P, foot, z + WALL).concat(ringAt(P, top, z + RIDGE)))), crease: open(ringAt(P, run(inner, front), z + RIDGE)) });
    h.dots.forEach((el, k) => place(el, P(h.x + HW, h.y + (k - (h.dots.length - 1) / 2) * 4.5, z + WALL * 0.55)));
  }

  // the train: three tubs that flare upward, each turned along the track
  const cFoot = rrect(-7, -4, 7, 4, 2.5, 4), cTop = rrect(-10, -6, 10, 6, 3.5, 4), cIn = rrect(-8.6, -4.6, 8.6, 4.6, 2.5, 4);
  const tubs = [0, 1, 2].map((k) => ({ grp: mk("g", {}, layer), off: k * 24, key: 0 }));
  tubs.forEach((t) => { t.sol = solid(t.grp); t.sol.sil.classList.add("hi"); });
  let cDrawn = NaN;
  function drawCart(s) {
    if (s === cDrawn) return;
    cDrawn = s;
    for (const t of tubs) {
      const q = at(s - t.off);
      t.key = q.x + q.y;
      const foot = spin(cFoot, q.x, q.y, q.c, q.s), top = spin(cTop, q.x, q.y, q.c, q.s), inn = spin(cIn, q.x, q.y, q.c, q.s);
      put(t.sol, { sil: poly(hull(ringAt(P, foot, 1).concat(ringAt(P, top, 11)))), crease: poly(ringAt(P, inn, 11)) });
    }
  }

  // back to front: the cart goes between the huts by depth, regrouped only when that order changes
  let order = "";
  function sortLayer() {
    const items = [...huts, ...tubs].sort((a, b) => a.key - b.key), o = items.map((it) => (it.sol ? "t" + it.off : it.i)).join("");
    if (o === order) return;
    order = o;
    items.forEach((it) => layer.append(it.grp));
  }

  const PARK = sNear(80, Y1);
  const tw = tween(PARK);
  let goal = PARK, act = -1;

  const B = register(stage, (_dt, now) => {
    huts.forEach((h) => drawHut(h, tval(h.z, now)));
    drawCart(tval(tw, now));
    sortLayer();
    return !tdone(tw, now) || huts.some((h) => !tdone(h.z, now));
  });
  bag.add(B.unregister);

  /** Rolls the cart forward to track position s, never backward. */
  function roll(s, now) {
    const ahead = (((s - goal) % T) + T) % T;
    if (ahead > 0.5) { goal += ahead; tset(tw, goal, now, 0); }
  }
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    huts.forEach((h) => {
      tset(h.z, h.i === a ? lift : 0, now, 0);
      h.base.sil.classList.toggle("hi", h.i === a); h.wall.sil.classList.toggle("hi", h.i === a); h.roof.sil.classList.toggle("hi", h.i === a);
      h.dots.forEach((el) => el.classList.toggle("m", h.i !== a));
    });
    tubs.forEach((t) => t.sol.sil.classList.toggle("hi", a < 0));
    roll(a < 0 ? PARK : huts[a].s, now);
    read.textContent = a < 0 ? "rest" : huts[a].name;
    B.wake();
  }

  /** The hut nearest the pointer, read on the plane at half the walls' height, which never moves. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], WALL / 2);
    let best = -1, bd = 34;
    huts.forEach((h) => { const d = Math.hypot(h.x - x, h.y - y); if (d < bd) { bd = d; best = h.i; } });
    return best;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (act >= 0) { tset(huts[act].z, lift, performance.now(), 0); B.wake(); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "loop-track",
  means: "A toy train rolls round a loop past three huts: inform, optimize, operate. Pick a hut and the train rolls on to it, round and round.",
  rules: [1, 4, 5, 8],
  range: [4, 8, 14],
  tour: [[146, 104], [252, 126], [205, 162], null],
  mount,
});
