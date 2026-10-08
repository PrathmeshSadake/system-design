/**
 * Two buildings: two towns, each a round patch of ground with an office
 * building on it, windows in rows, a door, a unit on the roof. Visitors, little
 * figures on the road, walk from the front to the building that is serving. At rest
 * town A serves and town B waits ready with its lights on; A is the bright
 * mark. The pointer over a building cuts its power: its windows go dark and
 * the visitors turn to the other town, the nearest to the door first, and the
 * other building takes the bright. The slider is that stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, lerp, prism, proj, rings, rrect, poly,
  tween, tset, tval, tdone, disposer, mk, place, pointer, put, register, solid, circ, seg,
} = HL;

const BS = 34, BH = 52, PR = 31, PT = 5, N = 6, SC = 1.55;
const O = [138, 138];
const TOWNS = [
  { name: "A", c: [22, 112], door: "x" },
  { name: "B", c: [112, 22], door: "y" },
];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, SC);
  const pts = [[O[0], O[1], 0]];
  for (const t of TOWNS) pts.push([t.c[0] - PR, t.c[1], 0], [t.c[0] + PR, t.c[1], 0], [t.c[0], t.c[1] - PR, 0], [t.c[0], t.c[1] + PR, 0], [t.c[0] - BS / 2, t.c[1] - BS / 2, PT + BH + 7]);
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // Each town's door, where its road ends.
  for (const t of TOWNS) t.d = t.door === "x" ? [t.c[0] + BS / 2 + 3, t.c[1]] : [t.c[0], t.c[1] + BS / 2 + 3];
  for (const t of TOWNS) mk("path", { class: "dash nf", d: seg(P(O[0], O[1], 0), P(t.d[0], t.d[1], 0)) }, g);

  for (const t of TOWNS) {
    const [cx, cy] = t.c, disc = circ(PR, 28).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy })), inner = circ(PR - 1.8, 28).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
    put(solid(g), prism(P, front, disc, inner, 0, PT));
    const [br, bi] = rings(cx - BS / 2, cy - BS / 2, cx + BS / 2, cy + BS / 2, 3, 1.4);
    t.body = solid(g);
    put(t.body, prism(P, front, br, bi, PT, PT + BH));
    const [ur, ui] = rings(cx - 10, cy - 12, cx + 4, cy - 2, 2, 0.8);
    put(solid(g), prism(P, front, ur, ui, PT + BH, PT + BH + 7));
    // Windows on both faces the viewer sees; the door on the face towards the road.
    const onX = (u, z) => P(cx + BS / 2, cy - BS / 2 + u, z), onY = (u, z) => P(cx - BS / 2 + u, cy + BS / 2, z);
    t.windows = [];
    for (const [face, isDoor] of [[onX, t.door === "x"], [onY, t.door === "y"]]) {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        if (isDoor && r === 0 && c === 1) continue;
        const el = mk("circle", { r: 2.1, class: "dot m" }, g);
        place(el, face(8 + c * 9, PT + 12 + r * 13));
        t.windows.push(el);
      }
      if (isDoor) mk("path", { class: "nf", d: poly(rrect(BS / 2 - 5, PT, BS / 2 + 5, PT + 15, 2, 3).map((q) => face(q.u, q.v))) }, g);
    }
    t.hit = P(cx, cy, PT + BH / 2);
  }

  const walkers = [];
  const crowd = mk("g", {}, g);
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, crowd), body = solid(grp), head = mk("path", { class: "sil" }, grp);
    walkers.push({ grp, body, head, p: (i + 0.6) / N, m: tween(0), drawn: NaN, key: 0 });
  }
  const R = 2.9 * SC, ring = [];
  for (let k = 0; k < 16; k++) ring.push([R * Math.cos((k / 16) * 2 * Math.PI), R * Math.sin((k / 16) * 2 * Math.PI)]);
  const route = (t, p) => [lerp(O[0], t.d[0], p), lerp(O[1], t.d[1], p)];

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const w of walkers) {
      const m = tval(w.m, now);
      if (!tdone(w.m, now)) moving = true;
      if (m === w.drawn) continue;
      w.drawn = m;
      const a = route(TOWNS[0], w.p), b = route(TOWNS[1], w.p), x = lerp(a[0], b[0], m), y = lerp(a[1], b[1], m);
      const [r, i] = rings(x - 2.8, y - 2.8, x + 2.8, y + 2.8, 2.8, 0.9), c = P(x, y, 12.5);
      put(w.body, prism(P, front, r, i, 0, 9));
      w.head.setAttribute("d", poly(ring.map(([u, v]) => [c[0] + u, c[1] + v])));
      w.key = x + y;
    }
    // Far to near, so a visitor crossing in front of another covers it.
    walkers.slice().sort((p, q) => p.key - q.key).forEach((w) => crowd.append(w.grp));
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  /** a: the town whose power is cut, or -1 for rest. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), serving = a === 0 ? 1 : 0;
    act = a;
    TOWNS.forEach((t, k) => {
      t.body.sil.classList.toggle("hi", k === serving);
      for (const el of t.windows) el.setAttribute("class", k === a ? "dot off" : "dot m");
    });
    walkers.forEach((w, i) => tset(w.m, serving, now, (N - 1 - i) * stag));
    read.textContent = a < 0 ? "rest" : `town ${TOWNS[serving].name} · serving`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      // Picked by each building's resting middle; nothing in the drawing moves under it.
      let best = -1, bd = 46 * 46;
      TOWNS.forEach((t, k) => { const d2 = (p[0] - t.hit[0]) ** 2 + (p[1] - t.hit[1]) ** 2; if (d2 < bd) { bd = d2; best = k; } });
      setActive(best);
    },
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { stag = clamp(v, 0, 200); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "two-buildings",
  means: "Two towns, two buildings. Point at one to cut its power: its lights go out and the visitors turn to the other town, which keeps serving.",
  rules: [1, 2, 4, 10],
  range: [0, 60, 120],
  tour: [[101, 138], [200, 240], [299, 138], null],
  mount,
});
