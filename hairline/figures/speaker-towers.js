/**
 * Speaker towers: one speaker cabinet at the head of a row of four gateway
 * towers, wired to them all along the ground. Each tower has its own little
 * crowd of players at its foot. The speaker says the top ten once; the pointer
 * picks a tower, and that tower's players hop as it passes the news on, the
 * nearest first. The slider is how high they hop.
 */
const {
  Cam, circ, facing, fit, hull, open, poly, prism, proj, rings, ringAt, rrect, run, unproj,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const TX = [56, 92, 128, 164], TH = [50, 58, 46, 54], NAMES = ["A", "B", "C", "D"];
// each tower's players, [dx, dy] around a spot in front of the tower, straight below it on screen
const CROWD = [
  [[-6, -5], [6, -3], [0, 7]],
  [[-5, -2], [6, 4]],
  [[-7, -5], [5, -6], [-5, 7], [7, 5]],
  [[-6, -4], [6, -5], [0, 7]],
];
const CX = 24, CY = 44, X1 = TX[3] + CX + 14, Y1 = CY + 16;
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let hop = value;
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-8, -10, -5], [X1, Y1, -5], [X1, -10, -5], [-8, Y1, -5], [TX[1], 15, 72]], 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-8, -10, X1, Y1, 9, 2.2);
  put(solid(g), prism(P, front, pr, pi, -5, 0));

  // The wire, a dashed guide along the ground from the speaker past every tower's foot.
  mk("path", { d: open([P(26, 15, 0), P(TX[3], 15, 0)]), class: "nf dash" }, g);

  // The speaker: a cabinet, a big cone and a small one on the face toward the towers.
  const [sr, si] = rings(0, 0, 26, 30, 5, 1.6);
  put(solid(g), prism(P, front, sr, si, 0, 46));
  const onFace = (r, y, z) => circ(r, 20).map((q) => P(26, y + q.u, z + q.v));
  const cone = [mk("path", { d: poly(onFace(10, 15, 20)), class: "nf hi" }, g), mk("path", { d: poly(onFace(4.5, 15, 20)), class: "nf hi" }, g)];
  mk("path", { d: poly(onFace(3.4, 15, 38)), class: "nf" }, g);

  // Towers and players, painted back to front.
  const items = [];
  TX.forEach((x, i) => {
    items.push({ key: x + 15, tower: i });
    CROWD[i].forEach(([dx, dy], k) => items.push({ key: x + CX + dx + CY + dy, player: [i, k, x + CX + dx, CY + dy] }));
  });
  items.sort((a, b) => a.key - b.key);
  const towers = [], players = TX.map(() => []);
  for (const it of items) {
    if (it.tower !== undefined) {
      const i = it.tower, x = TX[i], h = TH[i], body = solid(g);
      const foot = rrect(x - 8, 7, x + 8, 23, 4, 4), top = rrect(x - 4, 11, x + 4, 19, 2, 4), inner = rrect(x - 2.8, 12.2, x + 2.8, 17.8, 1.2, 4);
      put(body, { sil: poly(hull(ringAt(P, foot, 0).concat(ringAt(P, top, h)))), crease: open(ringAt(P, run(inner, front), h)) });
      const cap = solid(g);
      put(cap, prism(P, front, at(circ(9, 16), x, 15), at(circ(7.6, 16), x, 15), h, h + 3.5));
      const mast = solid(g);
      put(mast, prism(P, front, at(circ(1.8, 10), x, 15), at(circ(1, 10), x, 15), h + 3.5, h + 14));
      towers.push({ i, parts: [body, cap, mast] });
    } else {
      const [i, k, x, y] = it.player;
      players[i].push({ k, x, y, el: solid(g), z: tween(0), drawn: NaN });
    }
  }
  towers.sort((a, b) => a.i - b.i);

  function drawPlayer(p, z) {
    if (z === p.drawn) return;
    p.drawn = z;
    put(p.el, prism(P, front, at(circ(5.5, 14), p.x, p.y), at(circ(4.2, 14), p.x, p.y), z, z + 5));
  }
  const B = register(stage, (_dt, now) => {
    let m = false;
    players.flat().forEach((p) => { drawPlayer(p, tval(p.z, now)); if (!tdone(p.z, now)) m = true; });
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    towers.forEach((t) => t.parts.forEach((s) => s.sil.classList.toggle("hi", t.i === a)));
    cone.forEach((c) => c.classList.toggle("hi", a === null));
    players.forEach((crowd, i) => crowd.forEach((p) => {
      // the nearest player to its tower hops first
      const d = Math.hypot(p.x - TX[i], p.y - 15), rank = crowd.filter((q) => Math.hypot(q.x - TX[i], q.y - 15) < d).length;
      tset(p.z, i === a ? hop : 0, now, i === a ? rank * 45 : 0);
      p.el.sil.classList.toggle("hi", i === a);
    }));
    read.textContent = a === null ? "rest" : `${NAMES[a]} · ${CROWD[a].length} players`;
    B.wake();
  }

  /** The tower whose column holds the pointer, read on the ground, which never moves; null off the plinth. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], 0);
    if (x < TX[0] - 20 || x > X1 || y < -14 || y > Y1 + 4) return null;
    let best = 0;
    // by screen column: a tower and its crowd stand one above the other
    const col = (tx) => Math.abs(x - y - (tx - 17));
    TX.forEach((tx, i) => { if (col(tx) < col(TX[best])) best = i; });
    return best;
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { hop = v; const a = act; act = -2; choose(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "speaker-towers",
  means: "One speaker sends the top ten to every gateway tower at once. Point at a tower: its own players hop as it passes the news on.",
  rules: [1, 2, 4, 10],
  range: [8, 14, 20],
  tour: [[164, 150], [247, 191], [278, 247], null],
  mount,
});
