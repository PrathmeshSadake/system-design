/**
 * Echo stacks: two stacks of toy blocks on two plinths, joined by a dashed
 * copy line on the floor. The leader, on the taller plinth, takes every
 * write; the follower copies it. The pointer's height sets how many blocks
 * the leader holds, and they land at once; the follower hears about it only
 * after the lag, then its blocks drop in too. At rest the follower is two
 * blocks behind. The slider is the lag, in ms.
 */
const {
  Cam, facing, fit, prism, proj, rings, seg, solid, put, mk,
  tween, tset, tval, tdone, register, pointer, disposer,
} = HL;

const BW = 26, BH = 11, MAX = 7, DROP = 16, ZL = 9, ZF = 4;
const LEAD = [0, 46], FOLL = [46, 0];                         // plinth corners [x, y]
const JIT = [[0, 0], [1.6, -1.2], [-1.2, 1.4], [1.4, 1.2], [-1.5, -1], [1.2, -1.5], [-1, 1.2]];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lag = value;
  const C = Cam(45, 0.5, 2.2);
  fit(C, [[LEAD[0] - 4, LEAD[1] - 4, 0], [LEAD[0] + BW + 4, LEAD[1] + BW + 4, 0], [FOLL[0] + BW + 4, FOLL[1] - 4, 0],
    [LEAD[0] - 4, LEAD[1] + BW + 4, 0], [LEAD[0], LEAD[1], ZL + MAX * BH + 4]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const block = (s, x0, y0, z0, x1, y1, z1, r = 2.6, b = 1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
  };

  // the copy line, on the floor from plinth to plinth, painted before both
  const a = P(LEAD[0] + BW + 4, LEAD[1] + BW / 2, 0), b = P(FOLL[0] + BW / 2, FOLL[1] + BW + 4, 0);
  mk("path", { d: seg(a, b), class: "nf dash" }, g);

  function stack([x0, y0], zb, n0) {
    block(solid(g), x0 - 4, y0 - 4, 0, x0 + BW + 4, y0 + BW + 4, zb, 4, 1.4);
    const blocks = [];
    for (let i = 0; i < MAX; i++) blocks.push({ i, el: solid(g), v: tween(i < n0 ? 1 : 0), drawn: NaN });
    const draw = (now) => {
      let m = false;
      for (const bk of blocks) {
        const v = tval(bk.v, now);
        if (!tdone(bk.v, now)) m = true;
        if (v === bk.drawn) continue;
        bk.drawn = v;
        if (v < 0.02) { bk.el.sil.setAttribute("d", ""); bk.el.cr.setAttribute("d", ""); continue; }
        const [jx, jy] = JIT[bk.i], z = zb + bk.i * BH + (1 - v) * DROP;
        block(bk.el, x0 + jx, y0 + jy, z, x0 + jx + BW, y0 + jy + BW, z + BH - 0.8);
      }
      return m;
    };
    return { blocks, draw, n: n0 };
  }
  const lead = stack(LEAD, ZL, 5), foll = stack(FOLL, ZF, 3);

  /** Sets a stack to n blocks, the change spreading from its top. */
  function fill(st, n, now) {
    const top = Math.max(n, st.n) - 1;
    st.blocks.forEach((bk) => tset(bk.v, bk.i < n ? 1 : 0, now, Math.abs(top - bk.i) * 40));
    st.n = n;
  }
  function mark() {
    lead.blocks.forEach((bk) => bk.el.sil.classList.toggle("hi", bk.i === lead.n - 1));
  }
  mark();

  let want = null, due = 0, over = false;
  // the lag read out is what the follower really holds: the blocks that have landed
  const landed = (now) => foll.blocks.filter((bk) => tval(bk.v, now) > 0.98).length;
  function say(now = performance.now()) { read.textContent = over ? `lag ${Math.max(0, lead.n - landed(now))}` : "rest"; }
  const B = register(stage, (_dt, now) => {
    // the follower hears of the leader's count only once the lag has passed
    if (want !== null && now >= due) { fill(foll, want, now); want = null; say(); }
    const m1 = lead.draw(now), m2 = foll.draw(now);
    if (m2) say(now);
    return m1 || m2 || want !== null;
  });
  bag.add(B.unregister);

  const base = P(LEAD[0] + BW / 2, LEAD[1] + BW / 2, ZL)[1], step = base - P(LEAD[0] + BW / 2, LEAD[1] + BW / 2, ZL + BH)[1];
  const left = P(LEAD[0], LEAD[1] + BW + 10, 0)[0], right = P(FOLL[0] + BW + 10, FOLL[1], 0)[0];
  function setLead(n) {
    const now = performance.now();
    if (n !== lead.n) {
      fill(lead, n, now);
      mark();
      // a follower that is already behind keeps its turn: a moving pointer never starves it
      if (want === null) due = now + lag;
      want = n;
    }
    say();
    B.wake();
  }

  bag.add(pointer(stage, {
    move: ([sx, sy]) => {
      over = sx > left && sx < right && sy < base + 40;
      if (!over) { setLead(5); want = null; fill(foll, 3, performance.now()); say(); return; }
      setLead(Math.max(1, Math.min(MAX, Math.round((base - sy) / step))));
    },
    leave: () => { over = false; setLead(5); want = null; fill(foll, 3, performance.now()); say(); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return { set: (v) => { lag = v; }, destroy: bag.dispose };
}

hairline({
  name: "echo-stacks",
  means: "The leader stack gets each new block first, and the follower copies it a moment later. Raise the pointer to add blocks and watch it lag.",
  rules: [2, 4, 5, 8],
  range: [300, 700, 1400],
  tour: [[150, 120], [170, 60], [190, 190], null],
  mount,
});
