/**
 * Three podiums: three small podiums in a row, one per shard, each with its
 * own top three players standing on it, a player's height being its score.
 * Behind them one big podium holds the true top three, picked from the best of
 * the small ones. The pointer picks a shard: its players hop, and then so do
 * the ones of them that made the big podium, if any. The slider is the hop.
 */
const {
  Cam, circ, facing, fit, prism, proj, rings, unproj,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

// the shards stand in one screen row at the front; the big podium towers behind the middle one
const SC = [[40, 120], [80, 80], [120, 40]], SD = 18, SW = 15, SH = [8, 12, 5];
// each shard's players by place [2nd, 1st, 3rd], as scores (heights)
const SCORES = [[9, 14, 6], [8, 11, 5], [13, 16, 7]];
const BC = [24, 24], BD = 28, BW = 26, BH = [16, 26, 10];
const X0 = -24, Y0 = -6, X1 = 154, Y1 = 140;
// the big podium's places [2nd, 1st, 3rd], each as [shard, slot] of where it came from
const TOP = [[0, 1], [2, 1], [2, 0]];
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let hop = value;
  const C = Cam(45, 0.5, 1.58);
  fit(C, [[X0, Y0, -5], [X1, Y1, -5], [X1, Y0, -5], [X0, Y1, -5], [SC[0][0], SC[0][1], 12 + 16 + 16], [SC[2][0], SC[2][1], 12 + 16 + 16], [BC[0], BC[1], 26 + 16 + 16]], 200, 166);
  const P = proj(C), front = facing(C);
  const box = (el, x0, y0, x1, y1, z0, z1, r, b) => { const [a, c] = rings(x0, y0, x1, y1, r, b); put(el, prism(P, front, a, c, z0, z1)); };
  const g = mk("g", {}, svg);
  box(solid(g), X0, Y0, X1, Y1, -5, 0, 12, 2.2);

  /** A podium of three steps, back to front, each with its player: returns the step solids and the players. */
  function podium(x0, y0, w, d, hs, scores, r) {
    const steps = [], players = [];
    hs.forEach((h, k) => {
      const el = solid(g);
      box(el, x0 + k * w + 0.4, y0, x0 + (k + 1) * w - 0.4, y0 + d, 0, h, 3, 1.2);
      steps.push(el);
      players.push({ el: solid(g), x: x0 + (k + 0.5) * w, y: y0 + d / 2, base: h, s: scores[k], r, z: tween(0), drawn: NaN, k });
    });
    return { steps, players };
  }
  const big = podium(BC[0] - 1.5 * BW, BC[1] - BD / 2, BW, BD, BH, TOP.map(([i, k]) => SCORES[i][k]), 6.6);
  const shards = SC.map(([x, y], i) => podium(x - 1.5 * SW, y - SD / 2, SW, SD, SH, SCORES[i], 5));
  const all = shards.flatMap((s) => s.players).concat(big.players);

  function drawPlayer(p, now) {
    const z = tval(p.z, now);
    if (z === p.drawn) return;
    p.drawn = z;
    put(p.el, prism(P, front, at(circ(p.r, 14), p.x, p.y), at(circ(p.r - 1.4, 14), p.x, p.y), p.base + z, p.base + z + p.s));
  }
  const B = register(stage, (_dt, now) => {
    let m = false;
    all.forEach((p) => { drawPlayer(p, now); if (!tdone(p.z, now)) m = true; });
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    // the first place hops first, then its neighbours; the big podium's copies follow
    const order = (k) => (k === 1 ? 0 : 1);
    shards.forEach((s, i) => {
      s.steps.forEach((el) => el.sil.classList.toggle("hi", i === a));
      s.players.forEach((p) => { tset(p.z, i === a ? hop : 0, now, order(p.k) * 45); p.el.sil.classList.toggle("hi", i === a); });
    });
    big.steps.forEach((el) => el.sil.classList.toggle("hi", a === null));
    big.players.forEach((p, k) => tset(p.z, TOP[k][0] === a ? hop : 0, now, 140 + order(k) * 45));
    const n = TOP.filter(([i]) => i === a).length;
    read.textContent = a === null ? "rest" : `shard ${a + 1} · ${n} won`;
    B.wake();
  }

  /** The shard under the pointer, read on the ground, which never moves; null off the back row. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], 0);
    // along the front row, by screen column; the big podium behind it is not a shard
    if (x + y < 118) return null;
    let best = 0;
    const col = (i) => Math.abs(x - y - (SC[i][0] - SC[i][1]));
    SC.forEach((_, i) => { if (col(i) < col(best)) best = i; });
    return col(best) < 40 ? best : null;
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { hop = v; const a = act; act = -2; choose(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "three-podiums",
  means: "Three small podiums, one per shard, and one big podium for the true top three. Point at a shard to see which of its players made it.",
  rules: [1, 2, 4, 5],
  range: [6, 10, 16],
  tour: [[113, 180], [202, 180], [292, 180], null],
  mount,
});
