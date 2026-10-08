/**
 * Ship hull: an open hull seen from above, a square stern, a pointed bow and
 * sides that slope in towards the keel, split by three bulkheads into four
 * rooms. Each room holds its own water. The pointer picks a room and only that
 * room floods, its water rising to near the rim, while the walls keep the
 * others low and dry. At rest a little leak in room 3 is the bright mark.
 * The slider is how high the flooded room fills.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, lerp, open, poly, proj, ringAt, run, seg, unproj,
  tween, tset, tval, tdone, disposer, mk, pointer, register,
} = HL;

const H = 22, ZF = 3, WALLS = [44, 86, 126], BOW = 172, WT = 1.6, SC = 1.8;
const REST = [2, 2.5, 8, 1.5], LOW = 2, LEAK = 2;
const BASE = fillet([[0, -27], [0, 27], [6, 31], [112, 31], [BOW, 0], [112, -31], [6, -31]], [3, 3, 6, 34, 3, 34, 6]);
const XS = [0, ...WALLS, BOW];

/** The hull's outline at height h, or its inside one: the sides slope in and the stern rakes towards the keel. */
function plan(h, inside) {
  const t = h / H;
  return BASE.map(([x, y]) => {
    const X = inside ? 2.6 + x * 0.965 : x, Y = inside ? y * 0.915 : y;
    return [lerp(7 + X * 0.9, X, t), Y * lerp(0.58, 1, t)];
  });
}
/** A ring of samples with outward normals, as the kernel's rings carry. */
function ring(pts) {
  const n = pts.length, area = pts.reduce((a, p, i) => a + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1], 0), s = Math.sign(area);
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return { u: p[0], v: p[1], nu: (s * dy) / l, nv: (-s * dx) / l };
  });
}
/** The polygon cut to the slab x0 <= x <= x1. */
function clipX(pts, x0, x1) {
  const cut = (P, keep, xc) => P.flatMap((p, i) => {
    const q = P[(i + 1) % P.length], a = keep(p), b = keep(q), m = [xc, p[1] + ((q[1] - p[1]) * (xc - p[0])) / (q[0] - p[0])];
    return a && b ? [q] : a ? [m] : b ? [m, q] : [];
  });
  return cut(cut(pts, (p) => p[0] >= x0, x0), (p) => p[0] <= x1, x1);
}
/** Where the polygon crosses the line at x: its two y. */
function span(pts, x) {
  const ys = [];
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if ((p[0] - x) * (q[0] - x) <= 0 && p[0] !== q[0]) ys.push(p[1] + ((q[1] - p[1]) * (x - p[0])) / (q[0] - p[0])); });
  return [Math.min(...ys), Math.max(...ys)];
}
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let FULL = value;
  const C = Cam(45, 0.5, SC);
  fit(C, BASE.map(([x, y]) => [x, y, H]).concat(BASE.map(([x, y]) => [x, y, 0])), 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const deck = ring(plan(H, false)), keel = ring(plan(0, false)), rim = ring(plan(H, true));

  mk("path", { class: "sil", d: poly(hull(ringAt(P, deck, H).concat(ringAt(P, keel, 0)))) }, g);
  mk("path", { class: "nf", d: poly(ringAt(P, rim, H)) }, g);

  // Room by room from the stern: its water, then the bulkhead in front of it.
  const rooms = [];
  for (let k = 0; k < 4; k++) {
    const el = mk("path", {}, g);
    rooms.push({ k, el, waves: mk("path", { class: "nf" }, g), z: tween(REST[k]), drawn: NaN });
    if (k < 3) {
      const x = WALLS[k], [a0, a1] = span(plan(H, true), x + WT), [b0, b1] = span(plan(ZF, true), x + WT);
      mk("path", { class: "lo", d: poly([P(x + WT, a0, H), P(x + WT, a1, H), P(x + WT, b1, ZF), P(x + WT, b0, ZF)]) }, g);
      const [c0, c1] = span(plan(H, true), x);
      mk("path", { class: "nf", d: poly([P(x, c0, H), P(x, c1, H), P(x + WT, a1, H), P(x + WT, a0, H)]) }, g);
    }
  }

  // The near side, one opaque piece from the rim's inner edge down to the keel.
  const iF = LR(ringAt(P, run(rim, front), H)), oT = LR(ringAt(P, run(deck, front), H)), oB = LR(ringAt(P, run(keel, front), 0));
  mk("path", { class: "fo", d: poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]) }, g);
  mk("path", { class: "nf lo", d: open(oT) }, g);
  mk("path", { class: "nf", d: open(iF) }, g);
  mk("path", { class: "nf sil", d: open([oT[0], ...oB, oT[oT.length - 1]]) }, g);

  function draw(r, lvl) {
    if (lvl === r.drawn) return;
    r.drawn = lvl;
    const z = ZF + lvl, pts = clipX(plan(z, true), XS[r.k] + (r.k ? WT : 0), XS[r.k + 1]).filter((p, i, A) => Math.hypot(p[0] - A[(i + 1) % A.length][0], p[1] - A[(i + 1) % A.length][1]) > 0.05);
    r.el.setAttribute("d", poly(fillet(pts, pts.map(() => 1.5), 2).map(([x, y]) => P(x, y, z))));
    // Three ripples on water deep enough to be a flood, kept inside its edge.
    const x0 = XS[r.k] + 7, x1 = Math.min(XS[r.k + 1] - 7, BOW - 30), rip = [];
    for (const f of lvl > 5 ? [-0.28, 0, 0.28] : []) {
      const line = [];
      for (let x = x0; x <= x1; x += 2.5) {
        const [y0, y1] = span(pts, x);
        if (!Number.isFinite(y0 + y1)) continue;
        line.push(P(x, clamp((y0 + y1) / 2 + f * (y1 - y0) + 1.3 * Math.sin(x / 2.2), y0 + 3, y1 - 3), z));
      }
      if (line.length > 1) rip.push(open(line));
    }
    r.waves.setAttribute("d", rip.join(""));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const r of rooms) { draw(r, tval(r.z, now)); if (!tdone(r.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    for (const r of rooms) {
      tset(r.z, a < 0 ? REST[r.k] : r.k === a ? FULL : LOW, now, 0);
      r.el.classList.toggle("hi", r.k === (a < 0 ? LEAK : a));
    }
    read.textContent = a < 0 ? "rest" : `room ${a + 1} · flooded`;
    B.wake();
  }

  const inside = plan(H, true);
  bag.add(pointer(stage, {
    move: (p) => {
      // Tested on the rim's plane, which never moves; the water never decides.
      const [x, y] = unproj(C, p[0], p[1], H);
      if (x <= 2 || x >= BOW - 4) return setActive(-1);
      const [y0, y1] = span(inside, x);
      setActive(y > y0 - 8 && y < y1 + 8 ? XS.findIndex((w) => w > x) - 1 : -1);
    },
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { FULL = clamp(v, 6, H - ZF - 2); if (act >= 0) { const a = act; act = -2; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "ship-hull",
  means: "Walls split a ship into rooms. Point at a room and only it floods; the walls keep the water out of the others, so the ship stays up.",
  rules: [1, 4, 5, 6],
  range: [11, 14.5, 17],
  tour: [[136, 117], [191, 144], [292, 195], null],
  mount,
});
