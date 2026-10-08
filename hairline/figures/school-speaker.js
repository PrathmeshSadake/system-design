/**
 * School speaker: a speaker on a pole in the middle of a round yard, six
 * houses around it, four of them in the club, each with a flag on a mast. The
 * pointer on the speaker makes one announcement: a ring spreads over the
 * ground, and each club house raises its flag as the news reaches it,
 * staggered by its distance from the pole. The other two hear nothing. The
 * slider is the stagger, in ms per unit of distance.
 */
const {
  Cam, EASE_LIFT, circ, clamp, facing, fit, hull, open, poly, prism, proj, rad, ringAt, rings, rrect, run, seg,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const YARD = 96, SZ0 = 54, SZ1 = 72, RMAX = 92, MAST = 36;
const HOUSES = [[0, 60, 1], [60, 76, 1], [120, 62, 0], [180, 80, 1], [240, 60, 1], [300, 74, 0]];

const shift = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

/** A solid whose top is smaller than its foot: a roof. */
function taper(P, front, foot, top, inner, z0, z1) {
  return { sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: open(ringAt(P, run(inner, front), z1)) };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[-YARD, -YARD, -5], [YARD, YARD, -5], [YARD, -YARD, -5], [-YARD, YARD, -5], [0, 0, SZ1], [-80, 0, 26], [77, 0, MAST]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const yard = rrect(-YARD, -YARD, YARD, YARD, YARD, 14), yi = rrect(-YARD + 2, -YARD + 2, YARD - 2, YARD - 2, YARD - 2, 14);
  put(solid(g), prism(P, front, yard, yi, -5, 0));
  const wave = mk("path", { class: "dash nf" }, g);

  // back to front: houses and the pole, by x + y
  const houses = HOUSES.map(([a, r, c]) => ({ x: r * Math.cos(rad(a)), y: r * Math.sin(rad(a)), club: !!c, d: r }));
  const parts = houses.map((h) => ({ h, k: h.x + h.y })).concat([{ h: { pole: true }, k: 0 }]).sort((a, b) => a.k - b.k);
  let horn = null;
  for (const { h } of parts) {
    if (h.pole) {
      const pr = circ(2.4, 12);
      put(solid(g), prism(P, front, pr, pr, 0, SZ0));
      const [br, bi] = rings(-9, -9, 9, 9, 3.5, 1.2);
      horn = solid(g);
      put(horn, prism(P, front, br, bi, SZ0, SZ1));
      // a round cone on each face we can see
      const cone = (r) => Array.from({ length: 24 }, (_, i) => [r * Math.cos(rad(i * 15)), (SZ0 + SZ1) / 2 + r * Math.sin(rad(i * 15))]);
      for (const r of [6, 2.4]) {
        mk("path", { d: poly(cone(r).map(([u, z]) => P(9, u, z))) + poly(cone(r).map(([u, z]) => P(u, 9, z))), class: r > 3 ? "nf" : "nf lo" }, g);
      }
      continue;
    }
    const [hr, hi] = rings(h.x - 10, h.y - 8, h.x + 10, h.y + 8, 2, 1);
    put(solid(g), prism(P, front, hr, hi, 0, 13));
    const foot = rrect(h.x - 11.5, h.y - 9.5, h.x + 11.5, h.y + 9.5, 1.5, 3), top = rrect(h.x - 10, h.y - 1, h.x + 10, h.y + 1, 1, 3);
    put(solid(g), taper(P, front, foot, top, top, 13, 24));
    // a door on the face toward the viewer
    mk("path", { d: poly(rrect(h.x - 3, 0.5, h.x + 3, 9, 1.4, 3).map((q) => P(q.u, h.y + 8, q.v))), class: "nf lo" }, g);
    if (h.club) {
      const mx = h.x + 17, my = h.y - 13;
      mk("path", { d: seg(P(mx, my, 0), P(mx, my, MAST)), class: "nf sil" }, g);
      h.flag = mk("path", { class: "sil" }, g);
      h.mx = mx; h.my = my; h.tw = tween(3); h.drawn = NaN;
    }
  }
  const club = houses.filter((h) => h.club);
  const flagD = (h, z) => poly([[0, 0], [13, 0], [13, -9], [0, -9]].map(([a, b]) => P(h.mx + a, h.my, z + b)));
  let ring = tween(0), ringDrawn = NaN, on = false;

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const h of club) {
      const z = tval(h.tw, now);
      if (z !== h.drawn) { h.drawn = z; h.flag.setAttribute("d", flagD(h, z + 9)); }
      if (!tdone(h.tw, now)) m = true;
    }
    const R = tval(ring, now);
    if (R !== ringDrawn) { ringDrawn = R; wave.setAttribute("d", R < 4 ? "" : poly(ringAt(P, circ(R, 48), 0))); }
    return m || !tdone(ring, now);
  });
  bag.add(B.unregister);

  // the speaker's rest pose on screen: the pole and the box, which never move
  const s0 = P(0, 0, 0), s1 = P(0, 0, SZ1);
  function hit([x, y]) {
    const t = clamp((y - s0[1]) / (s1[1] - s0[1]), 0, 1);
    return Math.hypot(x - (s0[0] + t * (s1[0] - s0[0])), y - (s0[1] + t * (s1[1] - s0[1]))) < 24;
  }

  function announce(a) {
    if (a === on) return;
    on = a;
    const now = performance.now();
    const D = Math.max(300, RMAX * step * 1.3);
    ring = tween(tval(ring, now), D);
    tset(ring, a ? RMAX : 0, now, 0);
    // the news spreads out from the pole: nearer houses first, and back down the same way
    for (const h of club) {
      let t = 0;
      while (t < 1 && EASE_LIFT(t) < h.d / RMAX) t += 0.01;
      tset(h.tw, a ? MAST - 9 : 3, now, a ? t * D : (RMAX - h.d) * step * 0.3);
    }
    read.textContent = a ? `${club.length} copies` : "rest";
    B.wake();
  }

  horn.sil.classList.add("hi");
  read.textContent = "rest";
  bag.add(pointer(stage, { move: (p) => announce(hit(p)), leave: () => announce(false) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "school-speaker",
  means: "A school speaker makes one announcement. Every house in the club gets its own copy and raises its flag. Point at the speaker.",
  rules: [2, 3, 5, 10],
  range: [3, 6, 10],
  tour: [[200, 84], [300, 210], [204, 130], null],
  mount,
});
