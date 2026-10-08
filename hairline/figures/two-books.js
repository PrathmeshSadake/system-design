/**
 * Two books: a small spiral notebook (the cache) and a big open book (the
 * database) on a desk, with a pen standing in a cup. Where the pointer sits between them picks a
 * write policy, and the pen writes the new line where that policy says:
 * near the notebook, write-back (the notebook now, the book later, so its line
 * is still dashed); between them, write-through (both, the book a moment
 * after); near the book, write-around (only the book, and the notebook's old
 * copy of that line is rubbed out). The new line takes the bright stroke. The
 * slider is how much later the book's line comes, in ms.
 */
const {
  Cam, clamp, facing, fit, hull, lerp, open, poly, prism, proj, ringAt, rings, rrect, run, tdone, tset, tval, tween,
  disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const NB = [0, 32, 32, 56], BK = [40, -6, 96, 34], NBZ = 4, BKZ = 8, CUP = [18, 10];
const POLICY = ["write-back", "write-through", "write-around"];
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lag = value;
  const C = Cam(45, 0.5, 2.35);
  fit(C, [[-6, -12, -3], [102, -12, -3], [102, 62, -3], [-6, 62, -3], [16, 44, NBZ + 34]], 200, 172);
  const P = proj(C), front = facing(C), g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, r, b, z0, z1) => { const s = solid(g); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };
  const line = (x0, x1, y, z, cls) => mk("path", { d: open([P(x0, y, z), P(x1, y, z)]), class: cls }, g);

  box(-6, -12, 102, 62, 7, 2.2, -3, 0);
  // the book: a cover, two page blocks with the spine between, lines on both pages
  box(BK[0], BK[1], BK[2], BK[3], 2.5, 1, 0, 1.6);
  box(BK[0] + 2, BK[1] + 2, 67.4, BK[3] - 2, 2, 0.9, 1.6, BKZ);
  box(68.6, BK[1] + 2, BK[2] - 2, BK[3] - 2, 2, 0.9, 1.6, BKZ);
  for (let r = 0; r < 5; r++) line(46, 63, 2 + r * 5.5, BKZ, "nf lo");
  for (let r = 0; r < 3; r++) line(72, 89 - (r % 2) * 5, 2 + r * 5.5, BKZ, "nf lo");
  // the notebook: a thin pad with a spiral of dots along its far edge, two old lines
  box(NB[0], NB[1], NB[2], NB[3], 2.5, 1, 0, NBZ);
  for (let k = 0; k < 7; k++) place(flatDot(g, C, 0.7, "dot off"), P(4 + k * 4, NB[1] + 2.6, NBZ));
  line(5, 26, 39, NBZ, "nf lo");
  const old = { el: line(5, 23, 43.5, NBZ, "nf lo"), len: tween(1), x0: 5, x1: 23, y: 43.5, z: NBZ };

  // the new line in each book: it grows from its left end as it is written
  const fresh = [
    { el: line(5, 5, 48, NBZ, "nf"), len: tween(0), x0: 5, x1: 21, y: 48, z: NBZ },
    { el: line(72, 72, 2 + 3 * 5.5, BKZ, "nf"), len: tween(0), x0: 72, x1: 90, y: 2 + 3 * 5.5, z: BKZ },
  ];
  // a pen cup at the back of the desk: far half, the pen's slot, near half
  const cup = rrect(CUP[0] - 5, CUP[1] - 5, CUP[0] + 5, CUP[1] + 5, 5, 8), rim = rrect(CUP[0] - 3.8, CUP[1] - 3.8, CUP[0] + 3.8, CUP[1] + 3.8, 3.8, 8);
  mk("path", { d: poly(hull(ringAt(P, cup, 0).concat(ringAt(P, cup, 12)))), class: "sil" }, g);
  mk("path", { d: poly(ringAt(P, rim, 12)), class: "nf" }, g);
  const inCup = mk("g", {}, g), rF = LR(ringAt(P, run(rim, front), 12)), cT = LR(ringAt(P, run(cup, front), 12)), cB = LR(ringAt(P, run(cup, front), 0));
  mk("path", { d: poly([...rF, cT[cT.length - 1], ...cB.slice().reverse(), cT[0]]), class: "fo" }, g);
  mk("path", { d: open(rF), class: "nf" }, g);
  mk("path", { d: open([cT[0], ...cB, cT[cT.length - 1]]), class: "nf sil" }, g);
  // the pen: an upright barrel with a nib and a cap; it lives in the cup, or above everything when it writes
  const top = mk("g", {}, g);
  const pen = { x: tween(CUP[0]), y: tween(CUP[1]), z: tween(4), parts: [solid(inCup), solid(inCup), solid(inCup)], drawn: "" };
  const penHome = () => pen.parts.forEach((p) => inCup.append(p.g)), penOut = () => pen.parts.forEach((p) => top.append(p.g));
  const strokes = [old, ...fresh];

  function drawPen(x, y, z) {
    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
    if (key === pen.drawn) return;
    pen.drawn = key;
    const [a, ai] = rings(x - 0.9, y - 0.9, x + 0.9, y + 0.9, 0.9, 0.4), [b, bi] = rings(x - 2.2, y - 2.2, x + 2.2, y + 2.2, 2.2, 0.7), [c, ci] = rings(x - 2.6, y - 2.6, x + 2.6, y + 2.6, 2.6, 0.8);
    put(pen.parts[0], prism(P, front, a, ai, z, z + 3.5));
    put(pen.parts[1], prism(P, front, b, bi, z + 3.5, z + 24));
    put(pen.parts[2], prism(P, front, c, ci, z + 24, z + 30));
  }

  let act = null;
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const s of strokes) {
      const f = clamp(tval(s.len, now), 0, 1);
      if (f !== s.drawn) { s.drawn = f; s.el.setAttribute("d", f < 0.02 ? "" : open([P(s.x0, s.y, s.z), P(lerp(s.x0, s.x1, f), s.y, s.z)])); }
      if (!tdone(s.len, now)) moving = true;
    }
    drawPen(tval(pen.x, now), tval(pen.y, now), tval(pen.z, now));
    if (!tdone(pen.x, now) || !tdone(pen.y, now) || !tdone(pen.z, now)) moving = true;
    else if (act === -1) penHome();
    return moving;
  });
  bag.add(B.unregister);

  // The books never move: the pointer's place between their centres on screen picks the policy.
  const a = P((NB[0] + NB[2]) / 2, (NB[1] + NB[3]) / 2, 0), b = P((BK[0] + BK[2]) / 2, (BK[1] + BK[3]) / 2, 0);
  function hit([sx, sy]) {
    const t = (sx - a[0]) / (b[0] - a[0]);
    if (t < -0.6 || t > 1.6 || sy < Math.min(a[1], b[1]) - 110 || sy > Math.max(a[1], b[1]) + 60) return -1;
    return t < 0.33 ? 0 : t < 0.67 ? 1 : 2;
  }

  function choose(k) {
    if (k === act) return;
    act = k;
    const now = performance.now();
    const toNb = k === 0 || k === 1, toBk = k >= 0;
    tset(fresh[0].len, toNb ? 1 : 0, now, 0);
    tset(fresh[1].len, toBk ? 1 : 0, now, k === 2 ? 0 : lag);
    tset(old.len, k === 2 ? 0 : 1, now, 0);
    fresh[0].el.setAttribute("class", toNb ? "nf hi" : "nf");
    fresh[1].el.setAttribute("class", k === 0 ? "nf dash" : k > 0 ? "nf hi" : "nf");
    // the pen goes to the page it writes on last; at rest it stands on the desk
    if (k >= 0) penOut();
    const [px, py, pz] = k < 0 ? [CUP[0], CUP[1], 4] : k === 0 ? [21, 48, NBZ + 1] : [90, 2 + 3 * 5.5, BKZ + 1];
    tset(pen.x, px, now, 0); tset(pen.y, py, now, 0); tset(pen.z, pz, now, 0);
    pen.parts[1].sil.classList.toggle("hi", k < 0);
    read.textContent = k < 0 ? "rest" : POLICY[k];
    B.wake();
  }
  choose(-1);

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "two-books",
  means: "A small notebook (the cache) and a big book (the database). Move the pointer between them to choose which one the pen writes in.",
  rules: [1, 4, 5, 8],
  range: [100, 300, 600],
  tour: [[115, 156], [183, 174], [252, 166], null],
  mount,
});
