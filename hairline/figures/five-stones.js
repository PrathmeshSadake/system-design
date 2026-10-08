/**
 * Five stones: five round posts in a ring on a low plinth. Three of them
 * already carry a dot on top: an earlier majority that agreed on an answer.
 * The pointer raises the three posts nearest it, a new majority, staggered
 * outwards from the nearest; the others sink. Any two groups of three out of
 * five share a post, and the shared post nearest the pointer takes the bright
 * edge: it is the one that speaks up. The slider is the stagger, in ms.
 */
const {
  Cam, circ, facing, fit, prism, proj, rad, unproj, tween, tset, tval, tdone,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const N = 5, RING = 48, R = 11, UP = 42, DOWN = 9, OLD = [0, 1, 2], REST = [24, 31, 26, 13, 17];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let step = value;
  const C = Cam(45, 0.5, 1.95);
  fit(C, [[-70, -70, -5], [70, 70, -5], [70, -70, -5], [-70, 70, -5], [-RING, -RING * 0.3, UP + 4], [RING, RING, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const shift = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

  put(solid(g), prism(P, front, circ(70, 56), circ(68, 56), -5, 0));
  // the posts, at angles chosen so the old majority sits at the back left, and painted back to front
  const posts = Array.from({ length: N }, (_, i) => {
    const a = rad(-160 + i * 72), x = RING * Math.cos(a), y = RING * Math.sin(a);
    return { i, x, y, ring: shift(circ(R, 24), x, y), inner: shift(circ(R - 1.6, 24), x, y), tw: tween(REST[i]), drawn: NaN };
  });
  posts.slice().sort((a, b) => a.x + a.y - (b.x + b.y)).forEach((p) => {
    p.el = solid(g);
    p.dot = OLD.includes(p.i) ? flatDot(p.el.g, C, 2.2, "dot m") : null;
  });

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const p of posts) {
      const h = tval(p.tw, now);
      if (!tdone(p.tw, now)) moving = true;
      if (h === p.drawn) continue;
      p.drawn = h;
      put(p.el, prism(P, front, p.ring, p.inner, 0, h));
      if (p.dot) place(p.dot, P(p.x, p.y, h));
    }
    return moving;
  });
  bag.add(B.unregister);

  let key = null;
  /** Raises the three posts nearest the ground point q (null: back to rest), staggered by rank. */
  function choose(q) {
    const order = q ? posts.slice().sort((a, b) => Math.hypot(a.x - q[0], a.y - q[1]) - Math.hypot(b.x - q[0], b.y - q[1])) : [];
    const group = order.slice(0, 3), k = group.map((p) => p.i).sort().join();
    if (k === key) return;
    key = k;
    const now = performance.now();
    const shared = group.find((p) => OLD.includes(p.i));
    posts.forEach((p) => {
      const rank = q ? order.indexOf(p) : Math.abs(p.i - 1);
      tset(p.tw, !q ? REST[p.i] : rank < 3 ? UP : DOWN, now, rank * step);
      p.el.sil.classList.toggle("hi", q ? p === shared : p.i === 1);
    });
    const n = group.filter((p) => OLD.includes(p.i)).length;
    read.textContent = q ? `3 of 5 · ${n} shared` : "rest";
    B.wake();
  }

  choose(null);
  bag.add(pointer(stage, {
    // the pointer is put on a fixed plane at the posts' middle height, which never moves
    move: (p) => { const q = unproj(C, p[0], p[1], 20); choose(Math.hypot(q[0], q[1]) < 86 ? q : null); },
    leave: () => choose(null),
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { step = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "five-stones",
  means: "Five posts in a ring. Point to raise the three nearest, a majority. Any two groups of three share a post, so two answers never both win.",
  rules: [1, 2, 4, 5],
  range: [20, 45, 80],
  tour: [[183, 194], [278, 170], [163, 110], null],
  mount,
});
