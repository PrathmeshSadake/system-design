/**
 * Rush hours: one day as a row of 24 pillars on a long plinth, one pillar an
 * hour, each as tall as the asks per second that hour brings. The night is
 * flat, the morning rises, and the hour after school towers over the rest. A
 * dashed guide behind the row stands at the day's average, so the rush shows
 * how far the peak climbs above it. The pointer picks an hour: its pillar
 * lifts off the plinth and its neighbours lift a little less, staggered
 * outwards. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, seg,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

/** Asks per second for each hour of the day; they average about 100. */
const RATE = [10, 6, 4, 4, 4, 8, 30, 80, 110, 90, 80, 90, 110, 120, 180, 300, 240, 210, 200, 190, 170, 110, 40, 20];
const N = 24, CELL = 10, FOOT = 7.6, Y0 = 1.2, PB = 6, K = 0.29, LIFT = 26, PEAK = 15;
const FALL = [1, 0.62, 0.36, 0.16];
const AVG = 3 + 100 * K;
const X1 = N * CELL;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 1.42);
  const HMAX = 3 + 300 * K;
  fit(C, [[-5, -5, -PB], [X1 + 5, 14, -PB], [X1 + 5, -5, -PB], [-5, 14, -PB], [PEAK * CELL, Y0, HMAX + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const [pr, pi] = rings(-5, -5, X1 + 5, 14, 5, 1.6);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));
  // The day's average, a guide standing behind the row: short hours leave it showing, busy ones hide it.
  mk("path", { class: "dash", d: seg(P(0, Y0, AVG), P(X1, Y0, AVG)) }, g);

  const cols = RATE.map((r, i) => {
    const x0 = i * CELL + (CELL - FOOT) / 2;
    const [ring, inner] = rings(x0, Y0, x0 + FOOT, Y0 + FOOT, 2, 0.8);
    return { r, h: 3 + r * K, ring, inner, el: solid(g), z: tween(0), drawn: NaN };
  });
  const mid = (i) => [i * CELL + CELL / 2, Y0 + FOOT / 2];

  function draw(c, z) {
    if (z === c.drawn) return;
    c.drawn = z;
    put(c.el, prism(P, front, c.ring, c.inner, z, z + c.h));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const c of cols) { draw(c, tval(c.z, now)); if (!tdone(c.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // The hit test reads the rest pose only: each hour's column on screen, from its foot to its lifted top.
  const base = cols.map((c, i) => P(mid(i)[0], mid(i)[1], 0));
  const tops = cols.map((c, i) => P(mid(i)[0], mid(i)[1], c.h + LIFT)[1]);
  function hit([x, y]) {
    let a = 0;
    base.forEach((b, i) => { if (Math.abs(b[0] - x) < Math.abs(base[a][0] - x)) a = i; });
    if (Math.abs(base[a][0] - x) > CELL) return -1;
    return y > tops[a] - 16 && y < base[a][1] + 18 ? a : -1;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : PEAK;
    act = a;
    cols.forEach((c, i) => {
      const d = Math.abs(i - from);
      tset(c.z, a < 0 ? 0 : LIFT * (FALL[d] ?? 0), now, d * stag);
      c.el.sil.classList.toggle("hi", i === (a < 0 ? PEAK : a));
    });
    read.textContent = a < 0 ? "rest" : `${a}h · ${RATE[a]}/s`;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { stag = clamp(v, 0, 120); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rush-hours",
  means: "A day as 24 pillars, one per hour, as tall as the asks per second. Point at an hour: after school, it shoots far past the dashed average.",
  rules: [1, 2, 5, 10],
  range: [0, 40, 80],
  tour: [[164, 160], [235, 110], [295, 205], null],
  mount,
});
