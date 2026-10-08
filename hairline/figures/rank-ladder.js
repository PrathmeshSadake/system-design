/**
 * Rank ladder: a standing ladder whose rungs are places, first at the top.
 * Each rung holds one player's token, and a token's height is its score, so
 * the ladder is always in order: tallest at the top. The pointer gives points
 * to the token it is over: it grows, swings out and climbs past the ones above
 * it, and they slide down a rung each, the nearest first. Nobody sorts the
 * whole ladder. The slider is how many places the points are worth.
 */
const {
  Cam, circ, facing, fit, prism, proj, rings, clamp,
  tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid,
} = HL;

const NAMES = ["Ana", "Ben", "Cy", "Mia", "Leo", "Zoe"], SCORE = [90, 76, 64, 56, 42, 30];
const N = 6, GAP = 24, W = 62, R = 8.5, RAIL = 16 + N * GAP;
const rungZ = (r) => 14 + (N - 1 - r) * GAP, tall = (s) => s * 0.14;
const ORD = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let climb = value;
  const C = Cam(45, 0.5, 1.36);
  fit(C, [[-16, -18, -5], [W + 16, 18, -5], [W + 16, -18, -5], [-16, 18, -5], [W / 2, 0, RAIL + 4], [W / 2, 22, rungZ(1)]], 200, 166);
  const P = proj(C), front = facing(C);
  const box = (el, x0, y0, x1, y1, z0, z1, r, b) => { const [a, c] = rings(x0, y0, x1, y1, r, b); put(el, prism(P, front, a, c, z0, z1)); };
  const g = mk("g", {}, svg);

  // The foot, the far rail, the rungs from the bottom up, the tokens each just after the rung it
  // stands on (so the rung above covers it), then the near rail.
  box(solid(g), -16, -18, W + 16, 18, -5, 0, 8, 2);
  box(solid(g), -6, -4, 0, 4, 0, RAIL, 2.5, 0.9);
  const rungs = [];
  for (let r = N - 1; r >= 0; r--) { rungs[r] = solid(g); box(rungs[r], -1, -4, W + 1, 4, rungZ(r), rungZ(r) + 3, 2, 0.8); }
  const tokens = NAMES.map((name, k) => ({ k, name, el: solid(g), slot: tween(k), h: tween(tall(SCORE[k])), from: k, to: k, drawn: "", anchor: null }));
  const rail = solid(g);
  box(rail, W, -4, W + 6, 4, 0, RAIL, 2.5, 0.9);

  function drawToken(t, now) {
    const s = tval(t.slot, now), h = tval(t.h, now);
    const p = t.to === t.from ? 1 : clamp((s - t.from) / (t.to - t.from), 0, 1);
    // a climber swings out toward the viewer to pass the ones above it
    const y = t.to < t.from ? Math.sin(Math.PI * p) * 20 : 0;
    const key = s + "," + h + "," + y;
    if (key === t.drawn) return;
    t.drawn = key;
    const z = 14 + (N - 1 - s) * GAP + 3;
    put(t.el, prism(P, front, at(circ(R, 16), W / 2, y), at(circ(R - 1.5, 16), W / 2, y), z, z + h));
  }
  const B = register(stage, (_dt, now) => {
    let m = false;
    tokens.forEach((t) => { drawToken(t, now); if (!tdone(t.slot, now) || !tdone(t.h, now)) m = true; });
    // a climber swung out is in front of every rung it passes, the near rail still over it
    tokens.forEach((t) => {
      const out = t.to < t.from && !tdone(t.slot, now), anchor = out ? rail : rungs[clamp(Math.ceil(tval(t.slot, now) - 0.03), 0, N - 1)];
      if (anchor === t.anchor) return;
      t.anchor = anchor;
      if (out) rail.g.before(t.el.g); else anchor.g.after(t.el.g);
    });
    return m;
  });
  bag.add(B.unregister);

  let act = -2;
  /** Gives points to the token resting on rung a (null puts the ladder back). */
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now(), dest = a === null ? -1 : Math.max(0, a - climb);
    tokens.forEach((t) => {
      let slot = t.k, score = SCORE[t.k];
      if (a !== null && t.k === a) { slot = dest; score = dest === 0 ? SCORE[0] + 12 : (SCORE[dest] + SCORE[dest - 1]) / 2; }
      else if (a !== null && t.k >= dest && t.k < a) slot = t.k + 1;
      t.from = tval(t.slot, now); t.to = slot;
      tset(t.slot, slot, now, a === null ? 0 : Math.abs(t.k - a) * 45);
      tset(t.h, tall(score), now, 0);
      t.el.sil.classList.toggle("hi", a === null ? t.k === 0 : t.k === a);
    });
    read.textContent = a === null ? "rest" : `${NAMES[a]} · ${ORD[dest]}`;
    B.wake();
  }

  /** The rung under the pointer, from where each token rests, which never moves; null off the ladder. */
  function hit([x, y]) {
    let best = null, bd = 1e9;
    for (let r = 0; r < N; r++) {
      const c = P(W / 2, 0, rungZ(r) + 3 + tall(SCORE[r]) / 2), d = Math.abs(y - c[1]);
      if (Math.abs(x - c[0]) < 70 && d < bd) { bd = d; best = r; }
    }
    return bd < GAP ? best : null;
  }

  choose(null);
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { climb = v; const a = act; act = -2; choose(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rank-ladder",
  means: "A ladder of places, tallest score on top. Point at a token to give it points: it grows and climbs, and the ones it passes slide down.",
  rules: [1, 2, 5, 8],
  range: [1, 2, 3],
  tour: [[200, 173], [200, 215], [200, 125], null],
  mount,
});
