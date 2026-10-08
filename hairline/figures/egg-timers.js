/**
 * Egg timers: five hourglasses in a ring, each with a different amount of
 * sand left on top: each follower's own random wait for the leader's
 * heartbeat. The pointer's x is time without a heartbeat (a spring on it):
 * all the sand runs down together, and the timer that empties first stands up
 * on the 700ms curve as the new leader and takes the bright edge; the others
 * stop, because its heartbeat has reached them. The slider is how high it
 * stands.
 */
const {
  Cam, circ, clamp, facing, fit, hull, lerp, poly, prism, proj, rad, ringAt,
  spring, stepS, tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 5, RING = 50, SAND = [0.62, 0.3, 0.95, 0.5, 0.8], RUN = 0.46, Z0 = 3, NECK = 19, Z1 = 35, RB = 8.6;
const WIN = SAND.indexOf(Math.min(...SAND)), FIRST = Math.min(...SAND);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;
  const C = Cam(45, 0.5, 2.05);
  fit(C, [[-68, -68, -5], [68, 68, -5], [68, -68, -5], [-68, 68, -5], [-RING, -RING * 0.4, Z1 + 3], [RING * 0.7, RING * 0.7, Z1 + 3 + 20]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const disc = (r, x, y) => circ(r, 24).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

  put(solid(g), prism(P, front, circ(68, 56), circ(66, 56), -5, 0));
  const timers = Array.from({ length: N }, (_, i) => {
    const a = rad(117 - i * 72);
    return { i, x: RING * Math.cos(a), y: RING * Math.sin(a), up: tween(0), drawn: "" };
  });
  timers.slice().sort((a, b) => a.x + a.y - (b.x + b.y)).forEach((t) => {
    const grp = mk("g", {}, g);
    t.foot = solid(grp);
    t.low = mk("path", {}, grp);
    t.high = mk("path", {}, grp); t.highTop = mk("path", { class: "nf lo" }, grp);
    t.glass = mk("path", { class: "nf" }, grp);
    t.cap = solid(grp);
  });

  /** Timer t with f of its sand still on top, lifted by z. */
  function draw(t, f, z) {
    const key = f.toFixed(3) + "," + z.toFixed(2);
    if (key === t.drawn) return;
    t.drawn = key;
    const { x, y } = t, R = (r) => disc(r, x, y);
    put(t.foot, prism(P, front, R(10.5), R(9), 0, z + Z0));
    put(t.cap, prism(P, front, R(10.5), R(9), z + Z1, z + Z1 + 3));
    const bulb = (a, ra, b, rb) => poly(hull(ringAt(P, R(ra), z + a).concat(ringAt(P, R(rb), z + b))));
    t.glass.setAttribute("d", bulb(Z0, RB, NECK, 1.8) + bulb(NECK, 1.8, Z1, RB));
    // sand on top: from the neck up to its level; sand below: a mound that grows as the top empties
    const ht = (Z1 - NECK - 3) * f, rt = lerp(1.6, RB - 1.2, ht / (Z1 - NECK));
    t.high.setAttribute("d", f > 0.02 ? bulb(NECK + 0.4, 1.2, NECK + ht, rt) : "");
    t.highTop.setAttribute("d", f > 0.02 ? poly(ringAt(P, R(rt), z + NECK + ht)) : "");
    const hb = 2 + 9 * (1 - f);
    t.low.setAttribute("d", bulb(Z0 + 0.3, RB - 1.4, Z0 + hb, 1.5));
  }

  const s = spring(0, { eps: 0.001 });
  const B = register(stage, (dt, now) => {
    let m = stepS(s, dt);
    // after the first timer empties, its heartbeat stops the others where they are
    const run2 = clamp(s.x, 0, FIRST);
    for (const t of timers) {
      draw(t, clamp(SAND[t.i] - run2, 0, 1), tval(t.up, now));
      if (!tdone(t.up, now)) m = true;
    }
    return m;
  });
  bag.add(B.unregister);

  // the hit test: the pointer's x across the plinth's rest outline, which never moves, is time
  const xl = P(-68, 68, 0)[0], xr = P(68, -68, 0)[0];
  let won = null;
  function aim(p) {
    const on = !!p && p[0] > xl - 10 && p[0] < xr + 10;
    s.t = on ? clamp((p[0] - xl) / (xr - xl), 0, 1) * RUN : 0;
    const w = on && s.t >= FIRST;
    if (w !== won) {
      won = w;
      tset(timers[WIN].up, w ? lift : 0, performance.now(), 0);
    }
    timers.forEach((t) => t.cap.sil.classList.toggle("hi", t.i === WIN));
    read.textContent = !on ? "rest" : w ? `node ${WIN + 1} · term 4` : `wait · ${150 + Math.round(s.t * 300)}ms`;
    B.wake();
  }

  aim(null);
  bag.add(pointer(stage, { move: (p) => aim(p), leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (won) tset(timers[WIN].up, v, performance.now(), 0); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "egg-timers",
  means: "Five egg timers, each with its own amount of sand. Slide right to let time pass: the first to run out stands up as the new leader.",
  rules: [1, 3, 5, 8],
  range: [8, 14, 20],
  tour: [[120, 171], [220, 171], [316, 171], null],
  mount,
});
