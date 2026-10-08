/**
 * Board game: an order's life as a board. Six square tiles turn a corner
 * (placed, reserved, paid, packed, shipped, delivered) and two round tiles sit
 * off to the side (cancelled, refunded), the dead ends. One pawn stands on one
 * tile. The pointer picks a tile: the pawn hops there, the tiles already passed
 * sink, and only the tiles it may move to next rise, staggered out from it.
 * The slider is how high the allowed tiles rise.
 */
const {
  Cam, circ, clamp, facing, fit, hull, poly, prism, proj, rings, ringAt, unproj,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const PITCH = 30, T = 24, S = 1.75, BASE = 4, SUNK = 1.4;
// [col, row, name, round, next...]: the moves printed on the board.
const TILES = [
  [0, 0, "placed", 0, 1, 6], [1, 0, "reserved", 0, 2, 6], [2, 0, "paid", 0, 3, 7], [3, 0, "packed", 0, 4],
  [3, 1, "shipped", 0, 5], [3, 2, "delivered", 0], [1, 1.15, "cancelled", 1], [2, 1.15, "refunded", 1],
];
// How far along each tile is: the main tiles before it count as passed.
const RANK = [0, 1, 2, 3, 4, 5, 2, 3], REST = 2;
const cx = (t) => t[0] * PITCH + PITCH / 2, cy = (t) => t[1] * PITCH + PITCH / 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, S);
  fit(C, [[-8, -8, -6], [4 * PITCH + 8, 3 * PITCH + 8, -6], [4 * PITCH + 8, -8, -6], [-8, 3 * PITCH + 8, -6], [PITCH * 2, PITCH / 2, 44]], 200, 170);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [br, bi] = rings(-8, -8, 4 * PITCH + 8, 3 * PITCH + 8, 10, 2.2);
  put(solid(g), prism(P, front, br, bi, -6, 0));

  // Tiles painted back to front, by the sum of their column and row.
  const tiles = TILES.map((t, k) => {
    const x = cx(t), y = cy(t), h = T / 2;
    const [ring, inner] = t[3] ? [circ(h, 12).map((q) => ({ ...q, u: q.u + x, v: q.v + y })), circ(h - 1.6, 12).map((q) => ({ ...q, u: q.u + x, v: q.v + y }))] : rings(x - h, y - h, x + h, y + h, 4, 1.4);
    return { k, t, x, y, ring, inner, next: t.slice(4), z: tween(BASE), drawn: NaN };
  });
  tiles.slice().sort((a, b) => a.t[0] + a.t[1] - (b.t[0] + b.t[1])).forEach((tl) => {
    tl.el = solid(g); tl.dot = flatDot(g, C, 1.7, "dot off");
  });

  // The pawn: a foot, a body that tapers, a collar and a round head.
  const pawn = mk("g", {}, g), parts = [solid(pawn), solid(pawn), solid(pawn)], head = mk("path", {}, pawn);
  parts.forEach((p) => p.sil.classList.add("hi")); head.classList.add("hi");
  const ringAround = (r, x, y) => circ(r, 14).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
  function drawPawn(x, y, z) {
    const a = ringAround(8, x, y), b = ringAround(6.6, x, y);
    put(parts[0], prism(P, front, a, b, z, z + 3.2));
    const lo = ringAround(5.6, x, y), hiR = ringAround(2.4, x, y);
    put(parts[1], { sil: poly(hull(ringAt(P, lo, z + 3.2).concat(ringAt(P, hiR, z + 20)))), crease: "" });
    put(parts[2], prism(P, front, ringAround(4.8, x, y), ringAround(3.6, x, y), z + 19, z + 21));
    const c = P(x, y, z + 26.5), pts = [];
    for (let k = 0; k < 24; k++) { const t = (k / 24) * Math.PI * 2; pts.push([c[0] + 6 * S * Math.cos(t), c[1] + 6 * S * Math.sin(t)]); }
    head.setAttribute("d", poly(pts));
  }

  const px = tween(cx(TILES[REST])), py = tween(cy(TILES[REST]));
  let xA = cx(TILES[REST]), yA = cy(TILES[REST]), xB = xA, yB = yA, at = -1, behind = null;
  const topAt = (x, y) => {
    let best = tiles[0];
    for (const tl of tiles) if (Math.hypot(tl.x - x, tl.y - y) < Math.hypot(best.x - x, best.y - y)) best = tl;
    return best;
  };

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const tl of tiles) {
      const h = tval(tl.z, now);
      if (!tdone(tl.z, now)) m = true;
      if (h === tl.drawn) continue;
      tl.drawn = h;
      put(tl.el, prism(P, front, tl.ring, tl.inner, 0, h));
      place(tl.dot, P(tl.x, tl.y, h));
    }
    const x = tval(px, now), y = tval(py, now), d = Math.hypot(xB - xA, yB - yA);
    const p = d === 0 ? 1 : clamp(Math.hypot(x - xA, y - yA) / d, 0, 1);
    const under = topAt(x, y);
    if (under !== behind) { behind = under; under.dot.after(pawn); }
    drawPawn(x, y, tval(under.z, now) + Math.sin(Math.PI * p) * 22);
    return m || !tdone(px, now) || !tdone(py, now);
  });
  bag.add(B.unregister);

  function choose(k) {
    if (k === at) return;
    at = k;
    const now = performance.now(), on = k === null ? REST : k, cur = tiles[on];
    tiles.forEach((tl) => {
      const passed = tl.k < 6 && tl.k < RANK[on];
      const allowed = cur.next.includes(tl.k);
      const h = allowed ? BASE + lift : passed ? SUNK : BASE;
      tset(tl.z, h, now, Math.hypot(tl.t[0] - cur.t[0], tl.t[1] - cur.t[1]) * 40);
      tl.dot.setAttribute("class", allowed ? "dot m" : "dot off");
      tl.el.sil.classList.toggle("hi", k !== null && tl === cur);
    });
    xA = tval(px, now); yA = tval(py, now); xB = cur.x; yB = cur.y;
    tset(px, xB, now, 0); tset(py, yB, now, 0);
    const n = cur.next.length, nx = n ? `${n} move${n > 1 ? "s" : ""}` : "end";
    read.textContent = k === null ? "rest" : `${cur.t[2]} · ${nx}`;
    B.wake();
  }

  /** The tile under the pointer, read on the plane of the tiles' resting tops. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], BASE);
    const tl = topAt(x, y);
    return Math.abs(tl.x - x) < PITCH * 0.75 && Math.abs(tl.y - y) < PITCH * 0.75 ? tl.k : null;
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; const k = at; at = -1; choose(k); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "board-game",
  means: "An order is a pawn on a board game. Point at a square: the pawn hops there, and only the squares it may move to next rise.",
  rules: [1, 2, 5, 10],
  range: [4, 8, 13],
  tour: [[181, 118], [256, 155], [215, 176], null],
  mount,
});
