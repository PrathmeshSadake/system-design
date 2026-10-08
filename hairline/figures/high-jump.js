/**
 * High jump: a stand of two uprights in front of a landing mat, holding three
 * crossbars on pegs. The lowest bar is the promise made to customers (the SLA),
 * the middle one the team's own goal (the SLO), and the highest the score
 * actually measured (the SLI). The pointer picks a bar: it takes the bright
 * edge and the other bars slide away from it along the uprights, staggered
 * outwards, so it stands clear. At rest the goal is bright. The slider is the gap.
 */
const {
  Cam, facing, fit, prism, proj, rings, rrect, poly, unproj,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const NAMES = ["promise 99.5", "goal 99.9", "score 99.95"];
const H = [18, 35, 49], BT = 2.6, POST = 80, L = 0, R = 100, GOAL = 1;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gap = value;
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-8, -66, 0], [108, -66, 0], [-8, 8, 0], [108, 8, 0], [L, 0, POST + 2]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1) => {
    const s = solid(parent), [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };

  // The landing mat behind the stand: a deep cushion with a piped top.
  box(g, -6, -66, R + 6, -20, 9, 2.2, 0, 15);
  mk("path", { d: poly(rrect(-1, -61, R + 1, -25, 6, 6).map((q) => P(q.u, q.v, 15))), class: "nf lo" }, g);

  /** An upright: a wide foot and a slim post. */
  const upright = (x) => { box(g, x - 7, -7, x + 7, 7, 3.5, 1.2, 0, 2.5); box(g, x - 2, -2, x + 2, 2, 1.8, 0.7, 2.5, POST); };
  upright(L);
  const pegs = mk("g", {}, g), barsG = mk("g", {}, g);
  upright(R);

  const bars = H.map((h, i) => ({
    h, i, z: tween(h), drawn: NaN,
    pl: solid(pegs), pr: solid(pegs), bar: solid(barsG),
    rp: [rings(L + 2, -2.2, L + 6, 2.2, 1.2, 0.6), rings(R - 6, -2.2, R - 2, 2.2, 1.2, 0.6)],
    rb: rings(L + 3, -1.5, R - 3, 1.5, 1.5, 0.6),
  }));

  function draw(b, z) {
    if (z === b.drawn) return;
    b.drawn = z;
    put(b.pl, prism(P, front, b.rp[0][0], b.rp[0][1], z - 2.4, z));
    put(b.pr, prism(P, front, b.rp[1][0], b.rp[1][1], z - 2.4, z));
    put(b.bar, prism(P, front, b.rb[0], b.rb[1], z, z + BT));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const b of bars) { draw(b, tval(b.z, now)); if (!tdone(b.z, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on each bar's resting top: project the pointer onto that bar's height and take the bar it lands nearest.
  function hit([sx, sy]) {
    let best = -1, bd = 7;
    H.forEach((h, i) => {
      const [x, y] = unproj(C, sx, sy, h + BT);
      if (x < L - 4 || x > R + 4) return;
      if (Math.abs(y) < bd) { bd = Math.abs(y); best = i; }
    });
    return best;
  }

  let act = null;
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    bars.forEach((b, i) => {
      const off = a < 0 ? 0 : Math.sign(i - a) * gap * Math.abs(i - a);
      tset(b.z, b.h + off, now, Math.abs(i - (from === null ? GOAL : from)) * 50);
      b.bar.sil.classList.toggle("hi", a < 0 ? i === GOAL : i === a);
    });
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gap = v; const a = act; act = null; choose(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "high-jump",
  means: "Three bars on one stand: the promise lowest, the goal above it, the real score on top. Point at a bar and the others slide away from it.",
  rules: [1, 2, 4, 5],
  range: [3, 6, 9],
  tour: [[164, 192], [176, 151], [152, 160], null],
  mount,
});
