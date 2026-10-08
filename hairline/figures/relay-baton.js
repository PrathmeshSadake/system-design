/**
 * Relay baton: a relay track of four legs (inventory, payment, warehouse,
 * shipping) on one long plinth, with a coach's stand behind it holding a
 * clipboard of four dots, the plan. The pointer picks a leg: the baton slides
 * to it and that leg lifts, the legs already run sink, the legs still to run
 * wait, staggered out from the leg picked. The clipboard's dots fill for the
 * legs already done. The slider is the stagger, in ms.
 */
const {
  Cam, facing, fillet, fit, hull, poly, prism, proj, rings, unproj, rrect, ringAt, open, run,
  tween, tset, tval, tdone, flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const N = 4, LEG = 44, GAP = 7, W = 32, R = 4.2, BL = 26;
const NAMES = ["inventory", "payment", "warehouse", "shipping"];
const DONE = 1, WAIT = 5, ON = 15, REST = 1;
const x0 = (i) => i * (LEG + GAP), xm = (i) => x0(i) + LEG / 2;
const XE = x0(N - 1) + LEG;
const SX = XE / 2, SY = -34, SH = 46;

/** The top of leg i when leg a has the baton; at rest (a null) leg 1 is run and the baton waits at leg 2's line. */
const top = (i, a) => (i < (a ?? REST) ? DONE : i === a ? ON : WAIT);
const restX = x0(REST) + BL / 2 + 3;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-14, -12, -6], [XE + 14, W + 12, -6], [XE + 14, -12, -6], [-14, W + 12, -6], [SX - 14, SY - 14, SH + 24]], 200, 170);
  const P = proj(C), front = facing(C);
  const box = (el, a, b, c, d, z0, z1, r, k) => { const [g0, g1] = rings(a, b, c, d, r, k); put(el, prism(P, front, g0, g1, z0, z1)); };
  const g = mk("g", {}, svg);

  // The coach's stand, behind the track: a tapered post, a deck, and a clipboard tilted at the track.
  const foot = rrect(SX - 11, SY - 11, SX + 11, SY + 11, 5, 4), cap = rrect(SX - 6, SY - 6, SX + 6, SY + 6, 3, 4);
  const post = solid(g);
  put(post, { sil: poly(hull(ringAt(P, foot, 0).concat(ringAt(P, cap, SH)))), crease: open(ringAt(P, run(rrect(SX - 4.6, SY - 4.6, SX + 4.6, SY + 4.6, 2, 4), front), SH)) });
  box(solid(g), SX - 13, SY - 13, SX + 13, SY + 13, SH, SH + 4, 4, 1.4);
  const tilt = (u, v) => P(SX + u, SY + 9 - v * 0.5, SH + 6 + v * 0.85);
  const board = fillet([[-11, 0], [11, 0], [11, 22], [-11, 22]], [2.5, 2.5, 2.5, 2.5]).map(([u, v]) => tilt(u, v));
  mk("path", { d: poly(board.map((p) => [p[0], p[1] + 2.4])), class: "lo" }, g);
  mk("path", { d: poly(board), class: "sil" }, g);
  mk("path", { d: poly(fillet([[-4, 19], [4, 19], [4, 23.5], [-4, 23.5]], [1, 1, 1, 1]).map(([u, v]) => tilt(u, v))), class: "nf" }, g);
  const plan = [];
  for (let k = 0; k < N; k++) { const c = mk("circle", { r: 1.6, class: "dot off" }, g); place(c, tilt(0, 3.5 + k * 4.2)); plan.push(c); }

  // The plinth is a stadium, its ends full rounds with a lane line; then the four legs, each with
  // its lane lines and its number in dots at its start.
  const RR = W / 2 + 12, so = rrect(-14, -12, XE + 14, W + 12, RR, 14), si = rrect(-12, -10, XE + 12, W + 10, RR - 2, 14);
  put(solid(g), prism(P, front, so, si, -6, 0));
  mk("path", { d: poly(ringAt(P, rrect(-7, -5, XE + 7, W + 5, RR - 7, 14), 0)), class: "nf lo" }, g);
  const legs = [];
  for (let i = 0; i < N; i++) {
    const el = solid(g), lanes = mk("path", { class: "nf lo" }, g), dots = [];
    for (let k = 0; k <= i; k++) dots.push(flatDot(g, C, 1.3, "dot off"));
    const [ring, inner] = rings(x0(i), 0, x0(i) + LEG, W, 5, 1.6);
    legs.push({ el, lanes, dots, ring, inner, h: tween(top(i, null)), drawn: NaN });
  }

  // The baton: a rod lying along the track, its near end cap as the crease.
  const baton = solid(g);
  const bx = tween(restX);
  let xA = restX, xB = restX, zA = WAIT, zB = WAIT, bzNow = WAIT;
  baton.sil.classList.add("hi");
  function drawBaton(x, z) {
    const e0 = [], e1 = [];
    for (let k = 0; k < 16; k++) {
      const t = (k / 16) * Math.PI * 2, y = W / 2 + R * Math.cos(t), zz = z + R + R * Math.sin(t);
      e0.push(P(x - BL / 2, y, zz)); e1.push(P(x + BL / 2, y, zz));
    }
    put(baton, { sil: poly(hull(e0.concat(e1))), crease: poly(e1) });
  }
  function drawLeg(i, h) {
    const L = legs[i];
    if (h === L.drawn) return;
    L.drawn = h;
    put(L.el, prism(P, front, L.ring, L.inner, 0, h));
    L.lanes.setAttribute("d", [W / 3, (2 * W) / 3].map((y) => open([P(x0(i) + 12, y, h), P(x0(i) + LEG - 4, y, h)])).join(""));
    L.dots.forEach((d, k) => place(d, P(x0(i) + 5, 4 + k * 5.2 + (W - 8 - i * 5.2) / 2, h)));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    legs.forEach((L, i) => { drawLeg(i, tval(L.h, now)); if (!tdone(L.h, now)) m = true; });
    // The baton hops from leg to leg, high enough to clear a leg still rising.
    const x = tval(bx, now), p = xB === xA ? 1 : (x - xA) / (xB - xA);
    bzNow = zA + (zB - zA) * p + Math.sin(Math.PI * Math.min(1, Math.max(0, p))) * 16;
    drawBaton(x, bzNow);
    return m || !tdone(bx, now);
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now(), at = a === null ? REST : a;
    const tops = legs.map((_, i) => top(i, a));
    legs.forEach((L, i) => {
      tset(L.h, tops[i], now, Math.abs(i - at) * step);
      L.el.sil.classList.toggle("hi", i === a);
      L.dots.forEach((d) => d.classList.toggle("off", i !== at || a === null));
      L.dots.forEach((d) => d.classList.toggle("m", i === at && a !== null));
    });
    xA = tval(bx, now); zA = bzNow; xB = a === null ? restX : xm(a); zB = a === null ? WAIT : ON;
    tset(bx, xB, now, 0);
    plan.forEach((d, k) => { d.classList.toggle("m", k < at); d.classList.toggle("off", k >= at); });
    read.textContent = a === null ? "rest" : `leg ${a + 1} · ${NAMES[a]}`;
    B.wake();
  }

  /** The leg under the pointer, read on the plane of the waiting legs' tops; null off the track. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], WAIT);
    if (y < -12 || y > W + 12 || x < -12 || x > XE + 12) return null;
    let best = 0;
    for (let i = 1; i < N; i++) if (Math.abs(x - xm(i)) < Math.abs(x - xm(best))) best = i;
    return best;
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "relay-baton",
  means: "A coach plans a relay of four legs. Point at a leg: the baton goes there, legs already run sink, and the rest wait their turn.",
  rules: [1, 2, 5, 8],
  range: [20, 45, 70],
  tour: [[118, 149], [227, 202], [282, 231], null],
  mount,
});
