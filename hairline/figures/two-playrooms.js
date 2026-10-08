/**
 * Two playrooms: two identical rooms, blue on the left and green on the right,
 * open onto one hall. A single long door hangs on a post between them and
 * closes off one room or the other, so every kid (a dot) coming down the hall
 * plays in the room left open. The pointer picks a side: the door swings
 * across the hall to close the other room, and the kids cross over, the
 * nearest first. The live room's walls are bright. At rest blue is live. The
 * slider is the stagger between kids, in ms.
 */
const {
  Cam, facing, fit, prism, proj, rad, rings, rrect, seg, unproj,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const RW = 34, GAP = 12, RD = 40, WH = 8, WT = 2.4, HX = RW + GAP / 2, HY = RD + 2, LEAF = 36;
const ROOMS = [{ name: "blue live", x0: 0 }, { name: "green live", x0: RW + GAP }];
const SPOTS = [[5, 18], [11, 26], [17, 18], [6, 33], [14, 33], [20, 26]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 2.55);
  const X1 = 2 * RW + GAP;
  fit(C, [[-5, -5, -2], [X1 + 5, -5, -2], [-5, RD + 22, -2], [X1 + 5, RD + 22, -2], [0, 0, 14]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, r, b, z0, z1) => {
    const s = solid(g), [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };

  // the floor of both rooms and the hall in front of them
  box(-5, -5, X1 + 5, RD + 22, 5, 1.8, -2, 0);
  mk("path", { d: seg(P(-1, RD + 5, 0), P(X1 + 1, RD + 5, 0)), class: "nf lo" }, g);
  // each room: a back wall and two side walls, open to the hall
  const rooms = ROOMS.map((r) => {
    const x0 = r.x0, x1 = x0 + RW;
    return { ...r, walls: [box(x0, 0, x1, WT, 1.2, 0.5, 0, WH), box(x0, 0, x0 + WT, RD, 1.2, 0.5, 0, WH), box(x1 - WT, 0, x1, RD, 1.2, 0.5, 0, WH)] };
  });
  box(HX - 2, HY - 2, HX + 2, HY + 2, 2, 0.7, 0, 15);
  const leaf = solid(g), base = rrect(0, -0.8, LEAF, 0.8, 0.7, 2), core = rrect(0.5, -0.3, LEAF - 0.5, 0.3, 0.25, 2);
  const kids = SPOTS.map(([x, y], i) => ({ x, y, el: flatDot(g, C, 1.6, "dot m"), t: tween(0), rank: 0, i }));
  // nearest the door first
  kids.slice().sort((a, b) => Math.hypot(a.x - RW, a.y - HY) - Math.hypot(b.x - RW, b.y - HY)).forEach((k, r) => { k.rank = r; });

  const door = tween(0);
  let dDrawn = NaN;
  function drawDoor(f) {
    if (f === dDrawn) return;
    dDrawn = f;
    // f 0: the door points at green and closes it; f 1: it has swung across the hall to close blue
    const a = rad(180 * f), c = Math.cos(a), s = Math.sin(a);
    const tf = (q) => ({ u: HX + 1.5 * c + q.u * c - q.v * s, v: HY + 1.5 * s + q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c });
    put(leaf, prism(P, front, base.map(tf), core.map(tf), 0.3, 12));
  }
  function drawKid(k, f) {
    const ax = k.x, bx = k.x + RW + GAP, hx = (ax + bx) / 2, u = 1 - f;
    place(k.el, P(u * u * ax + 2 * u * f * hx + f * f * bx, u * u * k.y + 2 * u * f * (RD + 14) + f * f * k.y, 0));
  }

  const B = register(stage, (_dt, now) => {
    let m = !tdone(door, now);
    drawDoor(tval(door, now));
    for (const k of kids) { drawKid(k, tval(k.t, now)); if (!tdone(k.t, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on the floor, which never moves: the side of the post the pointer is on.
  function hit([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, 0);
    if (x < -8 || x > X1 + 8 || y < -8 || y > RD + 26) return -1;
    return x < HX ? 0 : 1;
  }

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), live = a < 0 ? 0 : a;
    act = a;
    tset(door, live, now, 0);
    kids.forEach((k) => tset(k.t, live, now, 120 + k.rank * step));
    rooms.forEach((r, i) => r.walls.forEach((w) => w.sil.classList.toggle("hi", i === live)));
    read.textContent = a < 0 ? "rest" : rooms[a].name;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "two-playrooms",
  means: "Two identical playrooms and one door. Point at a room: the door swings to close the other one, and every kid moves to the room now open.",
  rules: [1, 2, 4, 8],
  range: [20, 45, 70],
  tour: [[257, 188], [174, 146], null],
  mount,
});
