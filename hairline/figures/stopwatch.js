/**
 * Stopwatch: a stopwatch standing on its edge, its crown on top and a button
 * at the shoulder. Once round the dial is a whole card payment, 400 ms. A
 * small slice at the top of the dial, marked out by its own fine ticks, is
 * all the time the fraud check gets. The pointer turns the hand, but only
 * inside the slice: the ticks it has swept light up, and past the slice's
 * edge the hand stops. The slider is the size of the slice.
 *
 * The pattern: a continuous answer with a clamped reach. The pointer is read
 * on the dial's own plane, which never moves, and the hand follows on a spring.
 */
const {
  Cam, circ, fit, hull, poly, proj, prism, rings, spring, stepS, facing,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

const R = 42, T = 11, ZC = 50, LAP = 400, REST = 0.62;
const TAU = 2 * Math.PI;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let budget = value;
  const C = Cam(45, 0.5, 2.5);
  fit(C, [[-R, 0, ZC - R], [R, T, ZC - R], [-R, T, ZC + R], [R, 0, ZC + R], [0, T / 2, ZC + R + 13]], 200, 162);
  const P = proj(C), front = facing(C);
  /** A point on the dial's face: r out from the middle, at a turn of a (0 at the top, clockwise). */
  const F = (r, a, y = T) => P(r * Math.sin(a), y, ZC + r * Math.cos(a));
  const ring = (r, y, n = 48) => Array.from({ length: n }, (_, k) => F(r, (k / n) * TAU, y));
  const g = mk("g", {}, svg);
  const shift = (rg, x, y) => rg.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

  // the crown, then the case over its foot
  put(solid(g), prism(P, front, shift(circ(2.4, 16), 0, T / 2), shift(circ(1.6, 16), 0, T / 2), ZC + R - 2, ZC + R + 7));
  put(solid(g), prism(P, front, shift(circ(6, 20), 0, T / 2), shift(circ(5, 20), 0, T / 2), ZC + R + 7, ZC + R + 13));
  const bx = R * Math.sin(0.85), bz = ZC + R * Math.cos(0.85);
  put(solid(g), prism(P, front, ...rings(bx - 3.5, T / 2 - 3.5, bx + 3.5, T / 2 + 3.5, 3, 1), bz - 2, bz + 9));
  const caseS = solid(g);
  put(caseS, { sil: poly(hull(ring(R, 0).concat(ring(R, T)))), crease: poly(ring(R, T)) });
  mk("path", { d: poly(ring(R - 6, T)), class: "nf lo" }, g);

  // the slice, and the dial's coarse ticks outside it
  const slice = mk("path", { class: "nf" }, g);
  const ticks = mk("g", {}, g);
  let fine = [];
  const hand = mk("path", { class: "sil hi" }, g);
  mk("path", { d: poly(ring(3.2, T, 16)), class: "" }, g);

  const ang = (ms) => (ms / LAP) * TAU;
  let lit = -1;
  function drawSlice() {
    const a1 = ang(budget), pts = [F(0, 0)];
    for (let k = 0; k <= 12; k++) pts.push(F(R - 15, (k / 12) * a1));
    slice.setAttribute("d", poly(pts));
    // coarse ticks every 20 ms outside the slice, fine ones every 5 ms inside it
    ticks.replaceChildren();
    for (let k = 0; k < 20; k++) {
      const t = (k / 20) * TAU;
      if (t > 0.01 && t < a1 + 0.05) continue;
      place(mk("circle", { r: 1.3, class: "dot off" }, ticks), F(R - 11, t));
    }
    fine = [];
    for (let k = 0; k <= Math.round(budget / 5); k++) {
      const el = mk("circle", { r: 1.1, class: "dot off" }, ticks);
      place(el, F(R - 11, ang(k * 5)));
      fine.push(el);
    }
    lit = -1;
  }

  const hs = spring(budget * REST, { eps: 0.05 });
  let drawn = NaN;
  function drawHand(ms) {
    if (ms === drawn) return;
    drawn = ms;
    const a = ang(ms), s = 1.4;
    hand.setAttribute("d", poly([F(R - 13, a), F(s, a + Math.PI / 2), F(7, a + Math.PI), F(s, a - Math.PI / 2)]));
    // the fine ticks, one every 5 ms of the slice; the ones the hand has swept light up
    const on = Math.floor(ms / 5 + 0.001);
    if (on !== lit) { lit = on; fine.forEach((el, k) => el.setAttribute("class", k <= on ? "dot m" : "dot off")); }
  }
  drawSlice();

  const B = register(stage, (dt) => {
    const m = stepS(hs, dt);
    drawHand(hs.x);
    return m;
  });
  bag.add(B.unregister);

  // the pointer, read on the dial's plane: its turn from the top, clamped into the slice
  const O = F(0, 0), ex = P(1, T, ZC), ez = P(0, T, ZC + 1);
  const a = [ex[0] - O[0], ex[1] - O[1]], b = [ez[0] - O[0], ez[1] - O[1]], det = a[0] * b[1] - a[1] * b[0];
  let over = false;
  function aim([sx, sy]) {
    over = true;
    const qx = sx - O[0], qy = sy - O[1];
    const u = (qx * b[1] - qy * b[0]) / det, v = (a[0] * qy - a[1] * qx) / det;
    let ms = ((Math.atan2(u, v) + TAU) % TAU) / TAU * LAP;
    if (ms > budget) ms = ms > budget + (LAP - budget) / 2 ? 0 : budget;
    hs.t = ms;
    read.textContent = `${Math.round(ms)} ms`;
    B.wake();
  }
  function leave() { over = false; hs.t = budget * REST; read.textContent = "rest"; B.wake(); }

  bag.add(pointer(stage, { move: aim, leave }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { budget = v; hs.t = Math.min(hs.t, budget); if (!over) hs.t = budget * REST; drawSlice(); drawn = NaN; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "stopwatch",
  means: "A stopwatch: once round is a whole card payment. The fraud check gets only the small slice at the top. Turn the hand inside it.",
  rules: [1, 3, 5, 8],
  range: [30, 50, 80],
  tour: [[215, 70], [240, 90], [180, 70], null],
  mount,
});
