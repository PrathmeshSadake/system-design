/**
 * Cut wall: seven wooden blocks on a board, tied peg to peg by threads. Three
 * are tied tightly to each other, four to each other, and only one thread runs
 * between the two bunches. A low wall slides across the board under the
 * threads; every thread that crosses it pulls taut and takes the bright edge.
 * The pointer's x places the wall. At rest it stands in the natural gap, where
 * one thread crosses. The slider is how far a crossing thread pulls up.
 */
const {
  Cam, facing, fit, open, prism, proj, rings, clamp, unproj,
  spring, stepS, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const BLOCKS = [[10, 14], [26, 4], [24, 26], [64, 8], [82, 0], [84, 22], [66, 30]];
const TIES = [[0, 1], [0, 2], [1, 2], [3, 4], [4, 5], [5, 6], [6, 3], [3, 5], [2, 3]];
const HB = 12, PEG = 4, BX0 = -10, BX1 = 100, BY0 = -14, BY1 = 44, WALL = 9, REST_W = 45;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pull = value;
  const C = Cam(45, 0.5, 2.5);
  fit(C, [[BX0, BY0, -3], [BX1, BY0, -3], [BX0, BY1, -3], [BX1, BY1, -3], [26, 4, HB + PEG + 12]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1) => {
    const s = solid(parent), [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };

  box(g, BX0, BY0, BX1, BY1, 5, 1.8, -3, 0);
  const field = mk("g", {}, g);
  const blocks = BLOCKS.map(([x, y]) => {
    const bg = mk("g", {}, field);
    box(bg, x - 6, y - 6, x + 6, y + 6, 2.4, 1, 0, HB);
    box(bg, x - 1.8, y - 1.8, x + 1.8, y + 1.8, 1.8, 0.6, HB, HB + PEG);
    return { x, y, g: bg };
  });
  const wallG = mk("g", {}, field), wall = solid(wallG);
  const [wr, wi] = rings(-1, BY0 + 1, 1, BY1 - 1, 1, 0.4);
  const threads = TIES.map(([a, b]) => ({ a: BLOCKS[a], b: BLOCKS[b], el: mk("path", { class: "nf" }, g), t: tween(0), drawn: NaN }));

  const w = spring(REST_W, { eps: 0.02 });
  let wDrawn = NaN, order = "";
  function drawWall() {
    if (w.x === wDrawn) return;
    wDrawn = w.x;
    const shift = (r) => r.map((q) => ({ ...q, u: q.u + w.x }));
    put(wall, prism(P, front, shift(wr), shift(wi), 0, WALL));
    // The wall is a plane at x = w: whatever stands at a larger x is in front of it.
    const behind = blocks.filter((b) => b.x < w.x), ahead = blocks.filter((b) => b.x >= w.x);
    const key = behind.length + "";
    if (key !== order) { order = key; field.append(...behind.map((b) => b.g), wallG, ...ahead.map((b) => b.g)); }
  }
  function drawThread(th, f) {
    if (f === th.drawn) return;
    th.drawn = f;
    const z = HB + PEG, pts = [];
    for (let k = 0; k <= 12; k++) {
      const s = k / 12, bow = 4 * s * (1 - s);
      pts.push(P(th.a[0] + (th.b[0] - th.a[0]) * s, th.a[1] + (th.b[1] - th.a[1]) * s, z - 2.5 * bow * (1 - f) + pull * bow * f));
    }
    th.el.setAttribute("d", open(pts));
  }

  const B = register(stage, (dt, now) => {
    const m = stepS(w, dt);
    drawWall();
    let t = false;
    for (const th of threads) { drawThread(th, tval(th.t, now)); if (!tdone(th.t, now)) t = true; }
    return m || t;
  });
  bag.add(B.unregister);

  /** Places the wall's target, and pulls the threads that cross it there: the choice reads the target, never the moving wall. */
  function place(x, live) {
    w.t = clamp(x, BX0 + 3, BX1 - 3);
    const now = performance.now();
    let n = 0;
    threads.forEach((th) => {
      const cross = (th.a[0] - w.t) * (th.b[0] - w.t) < 0;
      if (cross) n++;
      tset(th.t, cross ? 1 : 0, now, Math.abs((th.a[0] + th.b[0]) / 2 - w.t) * 1.2);
      th.el.classList.toggle("hi", cross);
    });
    read.textContent = live ? `${n} cross` : "rest";
    B.wake();
  }
  place(REST_W, false);

  bag.add(pointer(stage, {
    move: (p) => place(unproj(C, p[0], p[1], 0)[0], true),
    leave: () => place(REST_W, false),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pull = v; threads.forEach((th) => { th.drawn = NaN; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "cut-wall",
  means: "Blocks tied together by threads. Slide the wall between them: cut in the gap and only one thread crosses, cut through a bunch and many do.",
  rules: [1, 3, 4, 6],
  range: [2, 6, 10],
  tour: [[152, 145], [253, 196], [288, 213], null],
  mount,
});
