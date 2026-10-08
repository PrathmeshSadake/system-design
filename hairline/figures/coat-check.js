/**
 * Coat check: four coats on a rail, and a counter beside them with the tags
 * handed in. A coat's buttons are its number, and its tag has as many holes.
 * One tag was handed in twice: both copies carry the same holes. The pointer
 * picks a tag; it lifts, and its coat swings forward while the coats around
 * it lean away, staggered outwards. Either copy of the twice-given tag brings
 * out the very same coat, never a second one. The slider is the stagger.
 *
 * The pattern: one of many, as Riffle, with coats hung from the top, and a
 * hit test on the tags' rest centres.
 */
const {
  Cam, fillet, fit, facing, open, poly, proj, prism, rad, rings, seg,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const N = 4, G = 15, HZ = 72, X0 = 0, REST = [-8, -5, -10, -6], BACK = -14, FWD = 18, LIFT = 6;
const NAMES = ["B2", "A7", "C5", "D1"], TAGS = [1, 3, 0, 1, 2], CX0 = 48, CX1 = 66, CZ = 22;
const LIT = 1;
/** A coat in its own plane: u across, d down from the hook. Shoulders sloping off a hanger, a body, a hem. */
const SHAPE = fillet([[11, 4], [19, 4], [28, 8], [31, 15], [30, 48], [0, 48], [-1, 15], [2, 8]], [1.5, 1.5, 4, 3, 2, 2, 3, 4]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const Y1 = (N - 1) * G;
  const C = Cam(45, 0.5, 1.82);
  fit(C, [[-4, -26, 0], [CX1 + 2, Y1 + 28, 0], [CX1 + 2, -26, 0], [-4, Y1 + 28, 0], [X0 + 15, -20, HZ + 4]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, z0, z1, r = 2, b = 0.8, parent = g) => { const [o, i] = rings(x0, y0, x1, y1, r, b); const s = solid(parent); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const post = (y) => { box(X0 + 7, y - 6, X0 + 23, y + 6, 0, 3, 3, 1); box(X0 + 13, y - 2, X0 + 17, y + 2, 3, HZ + 3, 2, 0.6); };

  // the back post and the rail
  post(-20);
  box(X0 + 13, -20, X0 + 17, Y1 + 20, HZ, HZ + 3, 1.5, 0.5);

  const coats = [];
  for (let k = 0; k < N; k++) {
    const grp = mk("g", {}, g);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    const hook = mk("path", { class: "nf" }, grp), lines = mk("path", { class: "nf lo" }, grp);
    const buttons = [];
    for (let j = 0; j <= k; j++) buttons.push(mk("circle", { r: 1.6, class: "dot m" }, grp));
    coats.push({ back, face, hook, lines, buttons, a: tween(REST[k]) });
  }

  // the front post, then the counter and the tags on it
  post(Y1 + 20);
  box(CX0, -12, CX1, Y1 + 26, 0, CZ, 4, 1.4);
  const tags = TAGS.map((c, i) => {
    const y = -6 + i * 15, grp = mk("g", {}, g), s = solid(grp), holes = [];
    for (let j = 0; j <= c; j++) holes.push(mk("circle", { r: 1.2, class: "dot m" }, grp));
    return { c, y, s, holes, z: tween(0), drawn: NaN };
  });

  /** Coat k swung th degrees forward from straight down: its paths, and where its buttons sit. */
  function drawCoat(k, th) {
    const cd = coats[k], yk = k * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (dy) => ([u, d]) => P(X0 + u, yk + dy + d * s, HZ - d * c);
    cd.back.setAttribute("d", poly(SHAPE.map(w(-1.6))));
    cd.face.setAttribute("d", poly(SHAPE.map(w(0))));
    const p = w(0);
    cd.hook.setAttribute("d", open([p([15, 4]), p([15, 0.5]), p([17.5, -1.5]), p([20, 0.5])]));
    cd.lines.setAttribute("d", open([p([11, 4]), p([15, 14]), p([19, 4])]) + seg(p([15, 14]), p([15, 48])));
    cd.buttons.forEach((el, j) => place(el, p([18, 19 + j * 7])));
  }
  function drawTag(t, z) {
    if (z === t.drawn) return;
    t.drawn = z;
    const [o, i] = rings(CX0 + 4, t.y, CX0 + 14, t.y + 10, 2, 0.8);
    put(t.s, prism(P, front, o, i, CZ + z, CZ + z + 1.6));
    t.holes.forEach((el, j) => place(el, P(CX0 + 9, t.y + 5 + (j - t.c / 2) * 2.4, CZ + z + 1.6)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    coats.forEach((cd, k) => { drawCoat(k, tval(cd.a, now)); if (!tdone(cd.a, now)) moving = true; });
    for (const t of tags) { drawTag(t, tval(t.z, now)); if (!tdone(t.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // hit: the tags' rest centres, which never move
  const centres = tags.map((t) => P(CX0 + 9, t.y + 5, CZ));
  function hit([x, y]) {
    let best = -1, bd = 22;
    centres.forEach((c, i) => { const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  let act = -2;
  function setActive(i) {
    if (i === act) return;
    const now = performance.now(), prev = act >= 0 ? TAGS[act] : LIT;
    act = i;
    const a = i < 0 ? -1 : TAGS[i], from = a >= 0 ? a : prev;
    coats.forEach((cd, k) => {
      tset(cd.a, a < 0 ? REST[k] : k < a ? BACK : k > a ? FWD : 0, now, Math.abs(k - from) * stag);
      cd.face.classList.toggle("hi", a < 0 ? k === LIT : k === a);
    });
    tags.forEach((t, j) => tset(t.z, j === i ? LIFT : 0, now, 0));
    const same = i > 0 && TAGS.slice(0, i).includes(a);
    read.textContent = i < 0 ? "rest" : `tag ${NAMES[a]}${same ? " · same" : ""}`;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "coat-check",
  means: "A coat check. One tag was handed in twice, and both copies bring out the same coat, never a second one. Point at a tag on the counter.",
  rules: [1, 2, 4, 10],
  range: [0, 40, 90],
  tour: [[264, 183], [235, 197], [206, 212], null],
  mount,
});
