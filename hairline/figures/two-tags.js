/**
 * Two tags: a shelf of three cubbies. The middle one is being relabelled: under
 * its opening hang the old name tag and the new one, each with a row of three
 * dots for the name written on it. The pointer's x scrubs the six releases of
 * expand and contract: the new tag is added blank, then written, then filled
 * in; then reads switch over (the tag being read stands out, bright); then the
 * old one stops being written (its dots fade), and last it is peeled off and
 * falls to the floor. At rest both tags hang, the old one still read. The
 * slider is how far the tag being read stands out.
 */
const {
  Cam, facing, fit, open, poly, prism, proj, rad, rings, rrect, clamp, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

const W = 100, D = 28, H = 44, TZ = 4, TH = 12, TK = 0.9;
const OPEN = [[5, 28], [34, 66], [72, 95]], OZ = [19, 41];
const OLD = [33, 49], NEW = [51, 67];
/** Each step: [old tag's dots on, new tag's dots on, which tag is read (0 old, 1 new), old tag peeled]. */
const STEP = [null, [3, 0, 0, 0], [3, 1, 0, 0], [3, 3, 0, 0], [3, 3, 1, 0], [0, 3, 1, 0], [0, 3, 1, 1]];
const REST = 2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pop = value;
  const C = Cam(45, 0.5, 2.6);
  fit(C, [[0, 0, 0], [W, 0, 0], [0, D + 14, 0], [W, D + 14, 0], [0, 0, H]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const onFace = (ring, y) => poly(ring.map((q) => P(q.u, y, q.v)));

  const [sr, si] = rings(0, 0, W, D, 4, 1.4);
  put(solid(g), prism(P, front, sr, si, 0, H));
  for (const [x0, x1] of OPEN) {
    mk("path", { d: onFace(rrect(x0, OZ[0], x1, OZ[1], 3, 4), D), class: "nf" }, g);
    // looking in: the far wall's left and bottom edges, as much of them as the opening shows
    const dep = 7, a = x0 + 1.2, b = OZ[0] + 1.2;
    mk("path", { d: open([P(a, D, b), P(a, D - dep, b), P(x1 - 1.2 - dep, D - dep, b)]) + open([P(a, D - dep, b), P(a, D - dep, OZ[1] - 1.2 - 0.82 * dep)]), class: "nf lo" }, g);
  }

  /** A tag: its back, its face and its three dots, posed by where its bottom edge sits and how far it has tipped forward. */
  const tag = ([x0, x1]) => {
    const tg = mk("g", {}, g);
    return { x0, x1, g: tg, back: mk("path", { class: "lo" }, tg), face: mk("path", { class: "sil" }, tg),
      dots: [0, 1, 2].map(() => mk("circle", { r: 1.1, class: "dot off" }, tg)), out: tween(0), peel: tween(0), drawn: "" };
  };
  const tags = [tag(OLD), tag(NEW)], shape = (t) => rrect(t.x0, 0, t.x1, TH, 2, 4);

  function drawTag(t, o, p) {
    const key = o.toFixed(3) + "," + p.toFixed(3);
    if (key === t.drawn) return;
    t.drawn = key;
    // standing: bottom edge at (D + gap, TZ); peeled: tipped forward 90 degrees and lying on the floor in front
    const hy = D + 0.5 + o * pop + p * 3, hz = TZ * (1 - p) + 0.2 * p, th = rad(90 * p);
    const at = (u, v, d) => P(u, hy + v * Math.sin(th) - d * Math.cos(th), hz + v * Math.cos(th) + d * Math.sin(th));
    t.back.setAttribute("d", poly(shape(t).map((q) => at(q.u, q.v, TK))));
    t.face.setAttribute("d", poly(shape(t).map((q) => at(q.u, q.v, 0))));
    const cx = (t.x0 + t.x1) / 2;
    t.dots.forEach((el, k) => place(el, at(cx + (k - 1) * 3.4, TH / 2, 0)));
  }

  const B = register(stage, (_dt, now) => {
    let m = false;
    for (const t of tags) { drawTag(t, tval(t.out, now), tval(t.peel, now)); if (!tdone(t.out, now) || !tdone(t.peel, now)) m = true; }
    return m;
  });
  bag.add(B.unregister);

  // Hit test on the shelf's front face, which never moves: x along it is the step.
  function step([sx, sy]) {
    const [x, y] = unproj(C, sx, sy, 20);
    if (x < -10 || x > W + 10 || y < -30 || y > D + 30) return -1;
    return clamp(Math.floor((x / W) * 6) + 1, 1, 6);
  }

  let act = null;
  function choose(s) {
    if (s === act) return;
    const now = performance.now(), [od, nd, rd, pl] = STEP[s < 0 ? REST : s];
    act = s;
    tags.forEach((t, i) => {
      const reads = rd === i && !(i === 0 && pl);
      tset(t.out, reads ? 1 : 0, now, i === 0 ? 0 : 60);
      t.face.classList.toggle("hi", reads);
      t.dots.forEach((el, k) => el.setAttribute("class", k < (i ? nd : od) ? (reads ? "dot" : "dot m") : "dot off"));
    });
    tset(tags[0].peel, pl, now, 0);
    read.textContent = s < 0 ? "rest" : `step ${s}`;
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(step(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pop = v; tags.forEach((t) => { t.drawn = ""; }); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "two-tags",
  means: "Relabel a cubby in six safe steps: stick the new tag on, use both, switch to the new one, then peel the old one off. Slide to step through.",
  rules: [1, 4, 5, 8],
  range: [2, 4, 6],
  tour: [[110, 138], [202, 184], [270, 218], null],
  mount,
});
