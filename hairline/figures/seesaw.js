/**
 * Seesaw: a plank on a stand. On one end sits a single block, one copy that
 * answers at once; on the other a stack of three, every copy checked before
 * answering. Where the pointer presses along the plank tips it (a spring on
 * the angle): the end that goes down is the choice, and its load takes the
 * bright edge. At rest the heavier, sure end leans down a little. The slider
 * is the largest tilt, in degrees.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, prism, proj, rad, rrect, run, unproj,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const PZ = 24, HALF = 74, PW = 13, PT = 3, REST = -5;
const E = [Math.SQRT1_2, -Math.SQRT1_2], A = [Math.SQRT1_2, Math.SQRT1_2];

/** The world point of plank-local (u along the plank, v across, w up from its top face), tipped th degrees. */
const W = (th, u, v, w) => {
  const c = Math.cos(rad(th)), s = Math.sin(rad(th)), b = u * c - w * s;
  return [b * E[0] + v * A[0], b * E[1] + v * A[1], PZ + u * s + w * c];
};
/** A rounded block in the plank's frame: silhouette from the hull of its two rings, crease from the top ring's near run. */
function block(P, front, th, u0, u1, v0, v1, w0, w1, r, b) {
  const ring = (k) => rrect(u0 + k, v0 + k, u1 - k, v1 - k, r - k * 0.6, 4);
  const at = (rg, w) => rg.map((q) => P(...W(th, q.u, q.v, w)));
  const world = (rg) => rg.map((q) => ({ ...q, nu: q.nu * E[0] + q.nv * A[0], nv: q.nu * E[1] + q.nv * A[1] }));
  const o = ring(0);
  return { sil: poly(hull(at(o, w0).concat(at(o, w1)))), crease: open(at(run(world(ring(b)), front), w1)) };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let max = value;
  const C = Cam(45, 0.5, 2.05);
  const span = [-1, 1].flatMap((sg) => [[sg * 86 * E[0] + 22 * A[0], sg * 86 * E[1] + 22 * A[1], -4], [sg * 86 * E[0] - 22 * A[0], sg * 86 * E[1] - 22 * A[1], -4]]);
  fit(C, span.concat([W(16, -HALF, 0, 16), W(-16, HALF, 0, 30), W(16, HALF, 0, 0)]), 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the ground pad and the stand, both turned to the plank's line
  const turn = (rg) => rg.map((q) => ({ u: q.u * E[0] + q.v * A[0], v: q.u * E[1] + q.v * A[1], nu: q.nu * E[0] + q.nv * A[0], nv: q.nu * E[1] + q.nv * A[1] }));
  put(solid(g), prism(P, front, turn(rrect(-86, -22, 86, 22, 16, 6)), turn(rrect(-84, -20, 84, 20, 14, 6)), -4, 0));
  const foot = turn(rrect(-14, -9, 14, 9, 3, 4)), top = turn(rrect(-2.5, -7, 2.5, 7, 1.2, 4));
  mk("path", { d: poly(hull(foot.map((q) => P(q.u, q.v, 0)).concat(top.map((q) => P(q.u, q.v, PZ - 1))))), class: "sil" }, g);
  mk("path", { d: open(run(foot, front).map((q) => P(q.u, q.v, 0.01))), class: "nf lo" }, g);

  const plank = solid(g), fast = solid(g), sure = [solid(g), solid(g), solid(g)];
  const pin = mk("circle", { r: 1.4, class: "dot m" }, g);
  const th = spring(REST, { eps: 0.01 });
  let drawn = NaN;

  function draw(a) {
    if (a === drawn) return;
    drawn = a;
    put(plank, block(P, front, a, -HALF, HALF, -PW, PW, -PT, 0, 4, 1.4));
    put(fast, block(P, front, a, -HALF + 6, -HALF + 22, -8, 8, 0, 14, 2.5, 1.2));
    sure.forEach((s, k) => put(s, block(P, front, a, HALF - 23 + k * 0.6, HALF - 5 + k * 0.6, -9, 9, k * 9, k * 9 + 8, 2.5, 1.2)));
    const c = P(...W(a, 0, PW, -PT / 2));
    pin.setAttribute("cx", c[0]); pin.setAttribute("cy", c[1]);
  }

  const B = register(stage, (dt) => { const m = stepS(th, dt); draw(th.x); return m; });
  bag.add(B.unregister);

  let over = null;
  function aim() {
    // the pointer is put on the plane of the pivot, which never moves, and read along the plank's line
    const t = over ? (over[0] * E[0] + over[1] * E[1]) : null;
    const on = t !== null && Math.abs(t) < HALF + 14 && Math.abs(over[0] * A[0] + over[1] * A[1]) < 40;
    th.t = on ? -clamp(t / 60, -1, 1) * max : REST;
    const sureDown = on ? t >= 0 : true;
    fast.sil.classList.toggle("hi", !sureDown);
    sure[2].sil.classList.toggle("hi", sureDown);
    read.textContent = !on ? "rest" : sureDown ? "sure · slower" : "fast · may lag";
    B.wake();
  }

  aim();
  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], PZ); aim(); },
    leave: () => { over = null; aim(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { max = v; aim(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "seesaw",
  means: "A seesaw: one block on one end answers fast, three on the other check first and answer slower. Press an end down to choose.",
  rules: [1, 3, 5, 8],
  range: [7, 11, 16],
  tour: [[90, 150], [320, 150], [240, 150], null],
  mount,
});
