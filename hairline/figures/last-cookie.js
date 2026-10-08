/**
 * The last cookie: one cookie, chips on top, on a plate on a table, and two
 * arms reaching in from either side: Ann's from the left, Ben's from the
 * right, each a sleeve and a mitten with a thumb. The pointer picks whose hand
 * gets there first. That hand checks and takes in one step: it closes over
 * the cookie and lifts it. The other hand arrives a moment later and stops
 * over an empty plate. At rest the cookie is bright. The slider is the gap
 * between the two hands, in ms; even at no gap only one gets it.
 */
const {
  Cam, facing, fit, proj, prism, rings, rrect, unproj,
  tween, tset, tval, tdone, mk, place, pointer, put, register, disposer, solid,
} = HL;

const HANDS = [{ name: "Ann", ax: 0 }, { name: "Ben", ax: 1 }];
const WIN = 15, LOSE = 7, PR = 24, CR = 10;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gap = value;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-104, -40, -6], [40, -40, -6], [40, 40, -6], [-40, 40, -6], [-40, -104, -6], [0, 0, 30]], 200, 172);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // the table: a round top on a thick edge
  const tr = rrect(-44, -44, 44, 44, 44, 14), ti = rrect(-42, -42, 42, 42, 42, 14);
  put(solid(g), prism(P, front, tr, ti, -6, 0));
  const pr = rrect(-PR, -PR, PR, PR, PR, 14), pi = rrect(-PR + 4, -PR + 4, PR - 4, PR - 4, PR - 4, 14);
  const plate = solid(g);
  put(plate, prism(P, front, pr, pi, 0, 2.5));

  // the cookie, with its chips
  const cg = mk("g", {}, g), cookie = solid(cg);
  const chips = [[-4, -3], [3, -4], [1, 4], [-3, 3.5], [5, 1.5]].map(() => mk("circle", { r: 1.6, class: "dot m" }, cg));
  const lift = tween(0), slide = { x: tween(0), y: tween(0) };
  let cDrawn = "";
  function drawCookie(z, x, y) {
    const k = z.toFixed(2) + x.toFixed(2) + y.toFixed(2);
    if (k === cDrawn) return;
    cDrawn = k;
    const [r, ri] = rings(x - CR, y - CR, x + CR, y + CR, CR, 1.4);
    put(cookie, prism(P, front, r, ri, 2.5 + z, 7 + z));
    [[-4, -3], [3, -4], [1, 4], [-3, 3.5], [5, 1.5]].forEach(([dx, dy], j) => place(chips[j], P(x + dx, y + dy, 7 + z)));
  }

  // the arms: a sleeve and a mitten with a thumb, laid along x for Ann and along y for Ben
  const arms = HANDS.map((h, i) => {
    const grp = mk("g", {}, g);
    return { ...h, i, grp, sleeve: solid(grp), mitt: solid(grp), thumb: solid(grp), reach: tween(0), drawn: NaN };
  });
  /** Builds a footprint along the arm's own axis: u runs toward the plate, v across. */
  const foot = (a, u0, u1, v0, v1, r, b) => (a.ax ? rings(v0, u0, v1, u1, r, b) : rings(u0, v0, u1, v1, r, b));
  function drawArm(a, off) {
    if (off === a.drawn) return;
    a.drawn = off;
    const [s, si] = foot(a, -104 + off, -38 + off, -6, 6, 5.5, 1.4);
    put(a.sleeve, prism(P, front, s, si, 12, 23));
    const [m, mi] = foot(a, -40 + off, -17 + off, -9, 9, 7, 1.6);
    put(a.mitt, prism(P, front, m, mi, 10, 21));
    const [t, ti2] = foot(a, -33 + off, -24 + off, 7, 13, 3, 0.8);
    put(a.thumb, prism(P, front, t, ti2, 13, 19));
  }

  const B = register(stage, (_dt, now) => {
    arms.forEach((a) => drawArm(a, tval(a.reach, now)));
    drawCookie(tval(lift, now), tval(slide.x, now), tval(slide.y, now));
    return arms.some((a) => !tdone(a.reach, now)) || !tdone(lift, now) || !tdone(slide.x, now) || !tdone(slide.y, now);
  });
  bag.add(B.unregister);

  let act = -1;
  function choose(a) {
    if (a === act) return;
    const now = performance.now();
    act = a;
    arms.forEach((arm) => {
      const first = arm.i === a;
      tset(arm.reach, a < 0 ? 0 : first ? WIN : LOSE, now, a < 0 || first ? 0 : gap);
      [arm.sleeve, arm.mitt, arm.thumb].forEach((s) => s.sil.classList.toggle("hi", first));
    });
    // the winner's hand closes over the cookie and lifts it, as it lands; the loser's hand finds the plate bare
    const dx = a === 0 ? -3 : 0, dy = a === 1 ? -3 : 0;
    tset(lift, a < 0 ? 0 : 11, now, a < 0 ? 0 : 380);
    tset(slide.x, dx, now, a < 0 ? 0 : 380); tset(slide.y, dy, now, a < 0 ? 0 : 380);
    if (a >= 0) g.append(arms[a].grp);
    g.append(cg);
    cookie.sil.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : `${arms[a].name} · got it`;
    B.wake();
  }
  cookie.sil.classList.add("hi");

  /** The arm nearest the pointer, read on the plane of the sleeves in their rest pose: Ann's along y = 0, Ben's along x = 0. */
  function hit(p) {
    const [x, y] = unproj(C, p[0], p[1], 16);
    const dAnn = x < -10 ? Math.abs(y) : Infinity, dBen = y < -10 ? Math.abs(x) : Infinity;
    if (Math.min(dAnn, dBen) > 22) return -1;
    return dAnn < dBen ? 0 : 1;
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gap = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "last-cookie",
  means: "One cookie, two hands. Pick who reaches first. Checking and taking is one step, so that hand gets it and the other finds the plate bare.",
  rules: [1, 2, 4, 8],
  range: [0, 140, 320],
  tour: [[115, 106], [285, 106], [115, 106], null],
  mount,
});
