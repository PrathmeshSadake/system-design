/**
 * Diary first: an open diary lies beside a little block castle. Each line in
 * the diary is a plan for one castle piece. The pointer picks a line (in the
 * diary, or by its piece on the castle): the lines up to it are written first,
 * and only after that do the pieces drop into place, staggered out from the
 * one picked. At rest four lines are written but only three pieces stand: the
 * fourth hangs over its place, already saved in the diary. The slider is the
 * wait between writing and building, in ms.
 */
const {
  Cam, facing, fit, hull, open, prism, proj, rings, solid, put, mk, flatDot, place, unproj,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const BX = 0, BY = 46, PW = 28, BD = 42, BT = 4, NL = 6, REST = 4, HOVER = 30;
const LEN = [0.8, 0.55, 0.9, 0.65, 0.85, 0.5];
const M = 5.5; // a merlon
const merlons = (x0, y0, x1, y1, z) => [[x0, y0], [x1 - M, y0], [x0, y1 - M], [x1 - M, y1 - M]].map(([x, y]) => [x, y, z, x + M, y + M, z + M]);
// the castle's six pieces, in the order they are built; each is a list of boxes [x0, y0, z0, x1, y1, z1]
const PIECES = [
  [[66, 4, 0, 82, 20, 20]],
  [[100, 4, 0, 116, 20, 20]],
  [[82, 7, 0, 100, 17, 15]],
  [[65, 3, 20, 83, 21, 25], ...merlons(65, 3, 83, 21, 25)],
  [[99, 3, 20, 117, 21, 25], ...merlons(99, 3, 117, 21, 25)],
  [[84.5, 7, 15, 90, 12.5, 20.5], [92, 7, 15, 97.5, 12.5, 20.5], [84.5, 11.5, 15, 90, 17, 20.5], [92, 11.5, 15, 97.5, 17, 20.5]],
];
const PAINT = [0, 3, 2, 5, 1, 4]; // back to front: the left tower, the wall, the right tower

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let wait = value;
  const C = Cam(45, 0.5, 1.84);
  fit(C, [[BX, BY, 0], [BX + 2 * PW + 4, BY + BD, 0], [BX, BY + BD, 0], [117, 3, 0], [117, 21, 0], [65, 3, 30.5 + HOVER]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const slab = (s, x0, y0, z0, x1, y1, z1, r = 1.6, b = 0.8) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
  };

  // the diary: a cover, two page blocks, and a written line per entry
  slab(solid(g), BX - 2, BY - 2, 0, BX + 2 * PW + 6, BY + BD + 2, 1.6, 2.4, 1);
  const pageTop = BT;
  slab(solid(g), BX, BY, 1.6, BX + PW + 0.6, BY + BD, pageTop, 2, 0.9);
  slab(solid(g), BX + PW + 3.4, BY, 1.6, BX + 2 * PW + 4, BY + BD, pageTop, 2, 0.9);
  const row = (i) => { const x0 = i < 3 ? BX + 4 : BX + PW + 7.4; return [x0, BY + 9 + (i % 3) * 11]; };
  const lines = Array.from({ length: NL }, (_, i) => ({ el: mk("path", { class: "nf" }, g), v: tween(i < REST ? 1 : 0), drawn: NaN }));
  const nib = flatDot(g, C, 1.3, "dot");

  // the castle, piece by piece; each piece hangs HOVER above its place until it is built
  const pieces = PIECES.map((boxes) => ({ boxes, els: [], v: tween(0), drawn: NaN }));
  for (const k of PAINT) pieces[k].els = pieces[k].boxes.map(() => solid(g));
  pieces.forEach((pc, k) => { pc.v = tween(k < REST - 1 ? 1 : k === REST - 1 ? 0.5 : 0); });

  function drawLine(i, now) {
    const ln = lines[i], v = tval(ln.v, now);
    if (v === ln.drawn) return;
    ln.drawn = v;
    const [x, y] = row(i);
    // handwriting: a loose wave along the line, drawn out as far as v has written
    const end = v * LEN[i] * (PW - 7), pts = [];
    for (let u = 0; u <= end; u += 0.6) pts.push(P(x + u, y + 1.4 * Math.sin(u * 1.15 + i), pageTop));
    ln.el.setAttribute("d", v > 0.02 && pts.length > 1 ? open(pts) : "");
  }
  function drawPiece(pc, now) {
    const v = tval(pc.v, now);
    if (v === pc.drawn) return;
    pc.drawn = v;
    pc.boxes.forEach((b, j) => {
      if (v < 0.02) { pc.els[j].sil.setAttribute("d", ""); pc.els[j].cr.setAttribute("d", ""); return; }
      const dz = (1 - v) * HOVER * 2;
      slab(pc.els[j], b[0], b[1], b[2] + dz, b[3], b[4], b[5] + dz, b[3] - b[0] < 7 ? 1 : 2, b[3] - b[0] < 7 ? 0.5 : 0.9);
    });
  }
  let n = REST;
  const B = register(stage, (_dt, now) => {
    let m = false;
    lines.forEach((ln, i) => { drawLine(i, now); if (!tdone(ln.v, now)) m = true; });
    pieces.forEach((pc) => { drawPiece(pc, now); if (!tdone(pc.v, now)) m = true; });
    const [x, y] = row(n - 1);
    place(nib, P(x + tval(lines[n - 1].v, now) * LEN[n - 1] * (PW - 7) + 2.6, y, pageTop));
    return m;
  });
  bag.add(B.unregister);

  let act = null;
  /** Writes lines 1 to k at once, then builds pieces 1 to k after the wait. k 0 puts the rest pose back. */
  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now(), to = k || REST;
    n = to;
    lines.forEach((ln, i) => {
      tset(ln.v, i < to ? 1 : 0, now, Math.abs(i - (to - 1)) * 40);
      ln.el.classList.toggle("hi", i === to - 1);
    });
    pieces.forEach((pc, i) => {
      const goal = k ? (i < k ? 1 : 0) : i < REST - 1 ? 1 : i === REST - 1 ? 0.5 : 0;
      // the castle only moves once its line is saved: building waits; taking down does not
      tset(pc.v, goal, now, goal > tval(pc.v, now) ? wait + Math.abs(i - (to - 1)) * 40 : 0);
    });
    read.textContent = k ? `line ${k} · saved` : "rest";
    B.wake();
  }
  choose(0);

  const castle = pieces.map((pc) => hull(pc.boxes.flatMap((b) => [P(b[0], b[1], b[2]), P(b[3], b[1], b[2]), P(b[0], b[4], b[2]), P(b[3], b[4], b[2]), P(b[0], b[1], b[5]), P(b[3], b[1], b[5]), P(b[0], b[4], b[5]), P(b[3], b[4], b[5])])));
  const inside = ([x, y], pl) => {
    let c = false;
    for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) if ((pl[i][1] > y) !== (pl[j][1] > y) && x < ((pl[j][0] - pl[i][0]) * (y - pl[i][1])) / (pl[j][1] - pl[i][1]) + pl[i][0]) c = !c;
    return c;
  };
  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], pageTop);
      if (x > BX - 2 && x < BX + 2 * PW + 6 && y > BY - 2 && y < BY + BD + 2) {
        const r = Math.max(0, Math.min(2, Math.floor((y - BY - 3.5) / 11)));
        return choose((x < BX + PW + 2 ? 0 : 3) + r + 1);
      }
      // on the castle, the topmost piece under the pointer
      let k = -1;
      castle.forEach((h, i) => { if (inside(p, h)) k = Math.max(k, i); });
      choose(k + 1);
    },
    leave: () => choose(0),
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { wait = v; }, destroy: bag.dispose };
}

hairline({
  name: "diary-first",
  means: "Every change is written in the diary first, and only then built into the castle, so after a crash the diary says what to finish.",
  rules: [1, 2, 4, 5],
  range: [150, 400, 800],
  tour: [[110, 205], [168, 238], [290, 150], null],
  mount,
});
