/**
 * Balance scale: a beam on a post with a pan hanging from each end and a
 * needle on top that says the beam is level. Each pan has eight hollows for
 * marbles: the left pan records what was taken, the right pan what was given.
 * The pointer's place from left to right is the size of a trade: that many
 * marbles drop into both pans at once, in pairs, so the beam never tips. The
 * answer is small on purpose: the beam that does not move is the point.
 * At rest the beam is bright and each pan holds three. The slider is the
 * stagger between pairs.
 *
 * The pattern: one of many, chosen by a fixed band of the stage, with the
 * pairs dropping in a stagger from the first.
 */
const {
  Cam, circ, fit, facing, hull, open, poly, proj, prism, rings, ringAt, run,
  tdone, tset, tval, tween, seg, disposer, mk, place, pointer, put, register, solid,
} = HL;

const L = 54, PZ = 26, PR0 = 11, PR1 = 18, BZ = 70, DROP = 26, SLOTS = 8, REST = 3;
const D = [Math.SQRT1_2, -Math.SQRT1_2];
/** A ring moved to (cx, cy), and turned by `a` radians. */
const shift = (ring, cx, cy, a = 0) => {
  const c = Math.cos(a), s = Math.sin(a);
  return ring.map((q) => ({ u: cx + c * q.u - s * q.v, v: cy + s * q.u + c * q.v, nu: c * q.nu - s * q.nv, nv: s * q.nu + c * q.nv }));
};
// the hollows in a pan: one ring of seven round a middle one
const SLOT = [[0, 0], ...[0, 1, 2, 3, 4, 5, 6].map((k) => [9 * Math.cos((k * 2 * Math.PI) / 7 + 0.4), 9 * Math.sin((k * 2 * Math.PI) / 7 + 0.4)])];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.9);
  const ex = L * D[0] + PR1, ey = L * D[1] - PR1;
  fit(C, [[ex, ey, PZ - 4], [-ex, -ey, PZ - 4], [ex, -ey, PZ], [-ex, ey, PZ], [0, 0, BZ + 14], [ex, ey, PZ + DROP]], 200, 160);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (ring, inner, z0, z1, cls) => { const s = solid(g); put(s, prism(P, front, ring, inner, z0, z1)); if (cls) s.sil.classList.add(cls); return s; };

  // the foot and the post
  box(circ(16, 24), circ(14, 24), 0, 4);
  box(...rings(-3, -3, 3, 3, 3, 1), 4, BZ - 2);

  // the pans, each a shallow bowl on three strings, with eight hollows
  const pans = [-1, 1].map((side) => {
    const cx = side * L * D[0], cy = side * L * D[1];
    const foot = shift(circ(PR0, 24), cx, cy), top = shift(circ(PR1, 28), cx, cy), inner = shift(circ(PR1 - 1.6, 28), cx, cy);
    const s = solid(g);
    put(s, { sil: poly(hull(ringAt(P, foot, PZ - 6).concat(ringAt(P, top, PZ)))), crease: open(ringAt(P, run(inner, front), PZ)) });
    mk("path", { d: poly(ringAt(P, top, PZ)), class: "nf" }, g);
    const strings = [0.5, 2.6, 4.7].map((a) => seg(P(cx + PR1 * Math.cos(a), cy + PR1 * Math.sin(a), PZ), P(cx, cy, BZ)));
    mk("path", { d: strings.join(""), class: "nf lo" }, g);
    const marbles = SLOT.map(([u, v], j) => ({ u: cx + u, v: cy + v, el: mk("circle", { r: 3, class: "dot off" }, g), z: tween(0), drawn: NaN }));
    return { marbles };
  });

  // the beam, level across the screen, with a cap and a needle standing up from its middle
  const bar = rings(-L - 3, -2.4, L + 3, 2.4, 2.4, 0.8).map((r) => shift(r, 0, 0, -Math.PI / 4));
  const beam = box(bar[0], bar[1], BZ, BZ + 4);
  box(circ(5, 20), circ(4, 20), BZ - 2, BZ + 6);
  box(...rings(-1.2, -1.2, 1.2, 1.2, 1.2, 0.4), BZ + 6, BZ + 18);

  const all = pans.flatMap((p) => p.marbles);
  function draw(m, z) {
    if (z === m.drawn) return;
    m.drawn = z;
    place(m.el, P(m.u, m.v, PZ - 1 + z));
  }
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const m of all) { draw(m, tval(m.z, now)); if (!tdone(m.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // the trade's size: a fixed band of the stage's width
  const size = (x) => Math.max(1, Math.min(SLOTS, Math.ceil((x - 60) / 35)));

  let act = -2;
  function setTrade(k) {
    if (k === act) return;
    const now = performance.now(), was = act;
    act = k;
    for (const p of pans) p.marbles.forEach((m, j) => {
      const full = j < (k < 0 ? REST : k), fresh = k > 0 && full && !(j < (was < 0 ? REST : was));
      // a marble newly in the trade starts above its pan and drops, pair by pair
      if (fresh) { m.z = tween(DROP); tset(m.z, 0, now, j * stag); } else tset(m.z, 0, now, 0);
      m.el.setAttribute("class", full ? (k > 0 ? "dot" : "dot m") : "dot off");
    });
    beam.sil.classList.toggle("hi", k < 0);
    read.textContent = k < 0 ? "rest" : `-${k} · +${k}`;
    B.wake();
  }
  setTrade(-1);

  bag.add(pointer(stage, { move: (p) => setTrade(size(p[0])), leave: () => setTrade(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "balance-scale",
  means: "A balance scale. Every trade is written twice: marbles taken go in one pan, marbles given in the other, so it always stays level.",
  rules: [2, 4, 5, 10],
  range: [0, 50, 100],
  tour: [[110, 160], [300, 160], [200, 160], null],
  mount,
});
