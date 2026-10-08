/**
 * Diary belt: a long conveyor belt carrying eight note plates that never leave
 * it. Two ribbon bookmarks stand behind the belt at different notes: two
 * readers, each at its own place. The pointer picks a note; it lifts to be
 * read and its neighbours lift a little less, staggered outwards, while the
 * nearer bookmark slides over to it. The other bookmark stays where it was.
 * At rest the newest note hovers over the end of the belt, just arriving, and
 * is the bright mark. The slider is how high a read note lifts.
 */
const {
  Cam, clamp, facing, fillet, fit, hull, open, poly, prism, proj, rings, rrect, run, seg, unproj,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 8, PITCH = 24, NW = 18, NY0 = 7, NY1 = 34, BX0 = -5, BX1 = N * PITCH, BW = 41;
const ZB = 14, ZT = 26, NT = 1.6, HOVER = 12, REST = [1, 5], RW = 15, RH = 46, RY = -3, RK = 1.4;
const FALL = [1, 0.4, 0.15];
const V = [0.612, 0.5]; // the direction to the camera, in (x, z)
const cx = (i) => i * PITCH + 3 + NW / 2;

/** A belt lying along x: a stadium profile in (x, z), carried across y from y0 to y1. */
function belt(P, x0, x1, z0, z1, y0, y1, b) {
  const r = (z1 - z0) / 2, at = (ring, y) => ring.map((q) => P(q.u, y, q.v));
  const prof = rrect(x0, z0, x1, z1, r, 6), inner = rrect(x0 + b, z0 + b, x1 - b, z1 - b, r - b, 6);
  return {
    sil: poly(hull(at(prof, y0).concat(at(prof, y1)))),
    crease: open(at(run(inner, (q) => q.nu * V[0] + q.nv * V[1] > 0), y1)),
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let L = value;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[BX0, 0, 0], [BX1, BW, 0], [BX1, 0, ZT + 18], [BX0, RY, ZB + RH], [BX0, BW, 0], [BX1, RY, ZT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // Bookmarks first: they stand behind the belt, which covers their feet.
  const shape = fillet([[0, 0], [RW, 0], [RW, RH], [RW / 2, RH - 8], [0, RH]], [1, 1, 1.2, 1.6, 1.2]);
  const marks = REST.map((j) => {
    const grp = mk("g", {}, g);
    return { back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp), x: tween(cx(j)), goal: cx(j), drawn: NaN };
  });
  for (const x of [14, BX1 - 22]) {
    const [r, i] = rings(x, 15, x + 9, 26, 2.5, 0.8);
    put(solid(g), prism(P, front, r, i, 0, ZB + 2));
  }
  put(solid(g), belt(P, BX0, BX1, ZB, ZT, 0, BW, 1.4));
  mk("path", { class: "nf lo", d: seg(P(BX0 + 8, BW, ZT - 3), P(BX1 - 8, BW, ZT - 3)) }, g);

  const notes = [];
  for (let i = 0; i < N; i++) {
    const x0 = i * PITCH + 3, [ring, inner] = rings(x0, NY0, x0 + NW, NY1, 2.2, 0.8);
    const el = solid(g), lines = mk("path", { class: "nf lo" }, el.g);
    const h0 = i === N - 1 ? HOVER : 0;
    notes.push({ x0, ring, inner, el, lines, h0, z: tween(h0), drawn: NaN });
  }
  const restMark = N - 1;

  function drawNote(n, h) {
    if (h === n.drawn) return;
    n.drawn = h;
    const z = ZT + h;
    put(n.el, prism(P, front, n.ring, n.inner, z, z + NT));
    n.lines.setAttribute("d", [13, 19, 25].map((y) => seg(P(n.x0 + 4, y, z + NT), P(n.x0 + NW - 4, y, z + NT))).join(""));
  }
  function drawMark(m, x) {
    if (x === m.drawn) return;
    m.drawn = x;
    const at = (dy) => poly(shape.map((p) => P(x - RW / 2 + p[0], RY + dy, ZB + p[1])));
    m.back.setAttribute("d", at(-RK));
    m.face.setAttribute("d", at(0));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const n of notes) { drawNote(n, tval(n.z, now)); if (!tdone(n.z, now)) moving = true; }
    for (const m of marks) { drawMark(m, tval(m.x, now)); if (!tdone(m.x, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : restMark;
    act = a;
    notes.forEach((n, i) => {
      const d = Math.abs(i - from), h = a < 0 ? n.h0 : L * (FALL[d] ?? 0);
      tset(n.z, h, now, d * 45);
      n.el.sil.classList.toggle("hi", a < 0 ? i === restMark : i === a);
    });
    if (a < 0) marks.forEach((m, k) => { m.goal = cx(REST[k]); tset(m.x, m.goal, now, 0); });
    else {
      // The nearer bookmark, judged by where each is going, never by where it is drawn.
      const m = marks.reduce((p, q) => (Math.abs(q.goal - cx(a)) < Math.abs(p.goal - cx(a)) ? q : p));
      m.goal = cx(a);
      tset(m.x, m.goal, now, 0);
    }
    read.textContent = a < 0 ? "rest" : `offset ${a}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      const [x, y] = unproj(C, p[0], p[1], ZT);
      setActive(y > -18 && y < BW + 14 && x > BX0 && x < BX1 ? clamp(Math.floor((x - 0.5) / PITCH), 0, N - 1) : -1);
    },
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  setActive(-1);

  return {
    set: (v) => { L = v; if (act >= 0) { const a = act; act = -2; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "diary-belt",
  means: "Notes stay on the belt after they are read. Each reader keeps its own bookmark, and the nearer one slides to the note you point at.",
  rules: [1, 2, 5, 10],
  range: [5, 10, 16],
  tour: [[161, 151], [278, 209], [220, 180], null],
  mount,
});
