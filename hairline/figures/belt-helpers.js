/**
 * Belt helpers: three conveyor belts of notes, and a team of four helpers,
 * game pawns with a wide foot, a tapering body and a round head. Three stand
 * at the ends of the three belts, one each; the fourth waits on a bench,
 * because two helpers of one team never share a belt. At rest the one on the
 * bench is the bright mark. The pointer picks a helper; it hops, and its
 * neighbours hop a little less, staggered outwards. The slider is the hop.
 */
const {
  Cam, circ, facing, fit, hull, open, poly, prism, proj, rings, ringAt, rrect, run,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const PITCH = 26, NW = 19, BL = 3 * PITCH + 4, BW = 28, GAP = 13, ZB = 5, ZT = 17, NT = 1.6;
const HX = BL + 22, BENCH = [BL + 8, 3 * (BW + GAP) + 1, 26, 26, 10], FALL = [1, 0.45, 0.2];
const SC = 1.9, V = [0.612, 0.5]; // the direction to the camera, in (x, z)
const by = (k) => k * (BW + GAP);

function belt(P, x0, x1, z0, z1, y0, y1, b) {
  const r = (z1 - z0) / 2, at = (ring, y) => ring.map((q) => P(q.u, y, q.v));
  const prof = rrect(x0, z0, x1, z1, r, 6), inner = rrect(x0 + b, z0 + b, x1 - b, z1 - b, r - b, 6);
  return {
    sil: poly(hull(at(prof, y0).concat(at(prof, y1)))),
    crease: open(at(run(inner, (q) => q.nu * V[0] + q.nv * V[1] > 0), y1)),
  };
}
const disc = (R, x, y) => circ(R, 20).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

/** A solid whose top ring is smaller than its foot: the pawn's body. */
function taper(P, front, foot, top, inner, z0, z1) {
  return { sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: open(ringAt(P, run(inner, front), z1)) };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let L = value;
  const C = Cam(45, 0.5, SC);
  const YE = by(2) + BW;
  fit(C, [[-10, -8, 0], [BL + 6, -8, 0], [HX + 12, YE + 30, 0], [-10, YE + 8, 0], [HX, -8, 38 + 18], [BENCH[0], BENCH[1] + BENCH[3], 0], [BENCH[0] + BENCH[2], BENCH[1] + BENCH[3], 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const [br, bi] = rings(-10, -8, BL + 6, YE + 8, 8, 2);
  put(solid(g), prism(P, front, br, bi, 0, ZB));
  for (let k = 0; k < 3; k++) {
    put(solid(g), belt(P, -5, BL, ZB, ZT, by(k), by(k) + BW, 1.3));
    for (let i = 0; i < 3; i++) {
      const x0 = i * PITCH + 4, [r, n] = rings(x0, by(k) + 4, x0 + NW, by(k) + BW - 4, 2.2, 0.8);
      put(solid(g), prism(P, front, r, n, ZT, ZT + NT));
    }
  }
  // The bench: a plank on two legs, painted before the pawns.
  const [bx, byy, bw, bd, bh] = BENCH, bench = mk("g", {}, g);
  for (const y of [byy + 3, byy + bd - 9]) {
    const [r, n] = rings(bx + 4, y, bx + bw - 4, y + 6, 2, 0.8);
    put(solid(bench), prism(P, front, r, n, 0, bh));
  }
  const [pr, pi] = rings(bx, byy, bx + bw, byy + bd, 3, 1.2);
  put(solid(bench), prism(P, front, pr, pi, bh, bh + 3.5));

  const spots = [0, 1, 2].map((k) => [HX, by(k) + BW / 2, 0]).concat([[bx + bw / 2, byy + bd / 2, bh + 3.5]]);
  const pawns = spots.map(([x, y, z0]) => {
    const grp = mk("g", {}, g), base = solid(grp), body = solid(grp), collar = solid(grp);
    const head = mk("path", { class: "sil" }, grp);
    return { grp, x, y, z0, base, body, collar, head, z: tween(0), drawn: NaN, hit: P(x, y, z0 + 14) };
  });
  pawns[2].grp.after(bench); // the bench is nearer than the third pawn, farther than the fourth
  const parts = (p) => [p.base.sil, p.body.sil, p.collar.sil, p.head];

  function draw(p, h) {
    if (h === p.drawn) return;
    p.drawn = h;
    const z = p.z0 + h, { x, y } = p;
    put(p.base, prism(P, front, disc(8.6, x, y), disc(7.3, x, y), z, z + 4));
    put(p.body, taper(P, front, disc(6.2, x, y), disc(3.2, x, y), disc(2.5, x, y), z + 4, z + 22));
    put(p.collar, prism(P, front, disc(5.1, x, y), disc(4, x, y), z + 22, z + 25));
    const c = P(x, y, z + 31), R = 6.4 * SC;
    const ring = [];
    for (let k = 0; k < 28; k++) ring.push([c[0] + R * Math.cos((k / 28) * 2 * Math.PI), c[1] + R * Math.sin((k / 28) * 2 * Math.PI)]);
    p.head.setAttribute("d", poly(ring));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const p of pawns) { draw(p, tval(p.z, now)); if (!tdone(p.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : 3;
    act = a;
    pawns.forEach((p, i) => {
      const d = Math.abs(i - from);
      tset(p.z, a < 0 ? 0 : L * (FALL[d] ?? 0), now, d * 45);
      for (const el of parts(p)) el.classList.toggle("hi", i === (a < 0 ? 3 : a));
    });
    read.textContent = a < 0 ? "rest" : a === 3 ? "helper 4 · idle" : `helper ${a + 1} · belt ${a}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (q) => {
      // Picked by each pawn's resting middle, which never moves.
      let best = -1, bd2 = 30 * 30;
      pawns.forEach((p, i) => { const d2 = (q[0] - p.hit[0]) ** 2 + (q[1] - p.hit[1]) ** 2; if (d2 < bd2) { bd2 = d2; best = i; } });
      setActive(best);
    },
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { L = v; if (act >= 0) { const a = act; act = -2; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "belt-helpers",
  means: "Three belts, four helpers. Each belt gets exactly one helper, so the fourth waits on the bench. Point at a helper to see its job.",
  rules: [1, 2, 5, 9],
  range: [6, 12, 18],
  tour: [[332, 143], [225, 197], [164, 203], null],
  mount,
});
